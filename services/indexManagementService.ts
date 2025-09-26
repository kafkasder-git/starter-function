/**
 * @fileoverview Index Management Service
 * @description Database index management, optimization, and maintenance
 */

import { supabase } from '../lib/supabase';
import { environment } from '../lib/environment';
import { monitoring } from './monitoringService';
import { queryOptimizationService } from './queryOptimizationService';

import { logger } from '../lib/logging/logger';
// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * DatabaseIndex Interface
 * 
 * @interface DatabaseIndex
 */
export interface DatabaseIndex {
  indexName: string;
  tableName: string;
  schemaName: string;
  columnNames: string[];
  indexType: 'btree' | 'hash' | 'gist' | 'gin' | 'spgist' | 'brin' | 'bitmap';
  isUnique: boolean;
  isPrimary: boolean;
  isClustered: boolean;
  size: number; // in bytes
  usageCount: number;
  lastUsed?: Date;
  createdAt: Date;
  definition: string;
}

/**
 * IndexSuggestion Interface
 * 
 * @interface IndexSuggestion
 */
export interface IndexSuggestion {
  table: string;
  columns: string[];
  indexType: string;
  reason: string;
  potentialBenefit: 'high' | 'medium' | 'low';
  queryPattern: string;
  estimatedSize: number;
  priority: number;
}

/**
 * IndexAnalysis Interface
 * 
 * @interface IndexAnalysis
 */
export interface IndexAnalysis {
  tableName: string;
  totalIndexes: number;
  usedIndexes: number;
  unusedIndexes: number;
  duplicateIndexes: string[];
  missingIndexes: IndexSuggestion[];
  oversizedIndexes: DatabaseIndex[];
  scanEfficiency: {
    seqScans: number;
    indexScans: number;
    bitmapScans: number;
    efficiency: number;
  };
}

/**
 * IndexMaintenance Interface
 * 
 * @interface IndexMaintenance
 */
export interface IndexMaintenance {
  operation: 'create' | 'drop' | 'rebuild' | 'analyze';
  indexName: string;
  tableName: string;
  estimatedTime: number;
  impact: 'high' | 'medium' | 'low';
  requiresLock: boolean;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}

// =============================================================================
// INDEX MANAGEMENT SERVICE CLASS
// =============================================================================

/**
 * IndexManagementService Service
 * 
 * Service class for handling indexmanagementservice operations
 * 
 * @class IndexManagementService
 */
export class IndexManagementService {
  private static instance: IndexManagementService;
  private readonly indexCache = new Map<string, DatabaseIndex[]>();
  private readonly cacheTTL = 300000; // 5 minutes
  private readonly maintenanceQueue: IndexMaintenance[] = [];

  private constructor() {
    this.initializeIndexMonitoring();
  }

  public static getInstance(): IndexManagementService {
    if (!IndexManagementService.instance) {
      IndexManagementService.instance = new IndexManagementService();
    }
    return IndexManagementService.instance;
  }

  // =============================================================================
  // INDEX DISCOVERY AND ANALYSIS
  // =============================================================================

  /**
   * Get all indexes in the database
   */
  async getDatabaseIndexes(schema = 'public'): Promise<DatabaseIndex[]> {
    const cacheKey = `indexes_${schema}`;
    const cached = this.getCachedIndexes(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const { data, error } = await supabase.rpc('get_database_indexes', {
        schema_name: schema,
      });

      if (error) {
        throw error;
      }

      const indexes: DatabaseIndex[] = data.map((row: any) => ({
        indexName: row.indexname,
        tableName: row.tablename,
        schemaName: row.schemaname,
        columnNames: row.column_names || [],
        indexType: row.index_type,
        isUnique: row.is_unique,
        isPrimary: row.is_primary,
        isClustered: row.is_clustered,
        size: row.size_bytes ?? 0,
        usageCount: row.usage_count ?? 0,
        lastUsed: row.last_used ? new Date(row.last_used) : undefined,
        createdAt: new Date(row.created_at),
        definition: row.definition ?? '',
      }));

      this.setCachedIndexes(cacheKey, indexes);

      monitoring.trackEvent({
        type: 'database_indexes_loaded',
        category: 'database',
        action: 'load_indexes',
        metadata: {
          schema,
          totalIndexes: indexes.length,
          totalSize: indexes.reduce((sum, idx) => sum + idx.size, 0),
        },
      });

      return indexes;
    } catch (error) {
      monitoring.trackApiCall('get_database_indexes', 'GET', 0, 500, {
        schema,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get indexes for a specific table
   */
  async getTableIndexes(tableName: string, schema = 'public'): Promise<DatabaseIndex[]> {
    const allIndexes = await this.getDatabaseIndexes(schema);
    return allIndexes.filter((idx) => idx.tableName === tableName);
  }

  /**
   * Analyze index usage and efficiency
   */
  async analyzeIndexUsage(tableName?: string, schema = 'public'): Promise<IndexAnalysis> {
    try {
      const indexes = tableName
        ? await this.getTableIndexes(tableName, schema)
        : await this.getDatabaseIndexes(schema);

      const tableNames = [...new Set(indexes.map((idx) => idx.tableName))];
      const analysis: IndexAnalysis = {
        tableName: tableName ?? 'all_tables',
        totalIndexes: indexes.length,
        usedIndexes: 0,
        unusedIndexes: 0,
        duplicateIndexes: [],
        missingIndexes: [],
        oversizedIndexes: [],
        scanEfficiency: {
          seqScans: 0,
          indexScans: 0,
          bitmapScans: 0,
          efficiency: 0,
        },
      };

      // Analyze usage
      analysis.usedIndexes = indexes.filter((idx) => idx.usageCount > 0).length;
      analysis.unusedIndexes = indexes.length - analysis.usedIndexes;

      // Find duplicate indexes
      analysis.duplicateIndexes = this.findDuplicateIndexes(indexes);

      // Find oversized indexes
      analysis.oversizedIndexes = indexes.filter((idx) => idx.size > 100 * 1024 * 1024); // > 100MB

      // Analyze scan efficiency for each table
      for (const table of tableNames) {
        const tableScanStats = await this.getTableScanStats(table, schema);
        analysis.scanEfficiency.seqScans += tableScanStats.seqScans;
        analysis.scanEfficiency.indexScans += tableScanStats.indexScans;
        analysis.scanEfficiency.bitmapScans += tableScanStats.bitmapScans;
      }

      // Calculate overall efficiency
      const totalScans =
        analysis.scanEfficiency.seqScans +
        analysis.scanEfficiency.indexScans +
        analysis.scanEfficiency.bitmapScans;

      analysis.scanEfficiency.efficiency =
        totalScans > 0
          ? (analysis.scanEfficiency.indexScans + analysis.scanEfficiency.bitmapScans) / totalScans
          : 0;

      // Get missing index suggestions
      analysis.missingIndexes = await this.suggestMissingIndexes(tableName, schema);

      monitoring.trackEvent({
        type: 'index_analysis_completed',
        category: 'database',
        action: 'analyze_indexes',
        metadata: {
          tableName: tableName ?? 'all',
          totalIndexes: analysis.totalIndexes,
          usedIndexes: analysis.usedIndexes,
          efficiency: analysis.scanEfficiency.efficiency,
        },
      });

      return analysis;
    } catch (error) {
      monitoring.trackApiCall('analyze_index_usage', 'GET', 0, 500, {
        tableName,
        schema,
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Get table scan statistics
   */
  private async getTableScanStats(
    tableName: string,
    schema: string,
  ): Promise<{
    seqScans: number;
    indexScans: number;
    bitmapScans: number;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_table_scan_stats', {
        table_name: tableName,
        schema_name: schema,
      });

      if (error || !data) {
        return { seqScans: 0, indexScans: 0, bitmapScans: 0 };
      }

      return {
        seqScans: data.seq_scans ?? 0,
        indexScans: data.index_scans ?? 0,
        bitmapScans: data.bitmap_scans ?? 0,
      };
    } catch (error) {
      logger.warn(`Failed to get scan stats for ${tableName}:`, error);
      return { seqScans: 0, indexScans: 0, bitmapScans: 0 };
    }
  }

  /**
   * Find duplicate indexes
   */
  private findDuplicateIndexes(indexes: DatabaseIndex[]): string[] {
    const duplicates: string[] = [];
    const seen = new Map<string, DatabaseIndex>();

    for (const index of indexes) {
      const key = `${index.tableName}:${index.columnNames.sort((a, b) => a.localeCompare(b)).join(',')}`;
      const existing = seen.get(key);

      if (existing && !existing.isPrimary && !index.isPrimary) {
        duplicates.push(`${existing.indexName} -> ${index.indexName}`);
      }

      seen.set(key, index);
    }

    return duplicates;
  }

  // =============================================================================
  // INDEX OPTIMIZATION SUGGESTIONS
  // =============================================================================

  /**
   * Suggest missing indexes based on query patterns
   */
  async suggestMissingIndexes(tableName?: string, schema = 'public'): Promise<IndexSuggestion[]> {
    const suggestions: IndexSuggestion[] = [];

    try {
      // Get query analytics from optimization service
      const analytics = queryOptimizationService.getQueryAnalytics();

      // Analyze slow queries for potential indexes
      analytics.topSlowQueries.forEach((query) => {
        const potentialIndexes = this.analyzeQueryForIndexes(query.sql, tableName);
        suggestions.push(...potentialIndexes);
      });

      // Analyze table statistics for common patterns
      const tableStats = await this.getTableStatistics(tableName, schema);
      const statBasedSuggestions = this.analyzeTableStatsForIndexes(tableStats);
      suggestions.push(...statBasedSuggestions);

      // Remove duplicates and sort by priority
      const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
      return uniqueSuggestions.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      logger.warn('Failed to generate index suggestions:', error);
      return [];
    }
  }

  /**
   * Analyze query for potential indexes
   */
  private analyzeQueryForIndexes(sql: string, targetTable?: string): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];

    try {
      // Simple SQL analysis (in production, use proper SQL parser)
      const upperSql = sql.toUpperCase();

      // WHERE clause analysis
      const whereMatch = /WHERE\s+(.+?)(?:\s+(?:GROUP|ORDER|LIMIT|$))/i.exec(sql);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        const columns = this.extractColumnsFromCondition(whereClause);

        if (columns.length > 0 && (!targetTable ?? this.queryUsesTable(sql, targetTable))) {
          suggestions.push({
            table: targetTable ?? 'unknown',
            columns,
            indexType: columns.length === 1 ? 'btree' : 'btree',
            reason: 'WHERE clause filtering',
            potentialBenefit: 'high',
            queryPattern: `SELECT ... WHERE ${  columns.join(' AND ')}`,
            estimatedSize: this.estimateIndexSize(columns.length),
            priority: 8,
          });
        }
      }

      // JOIN analysis
      const joinMatch = /JOIN\s+(\w+)\s+ON\s+(.+?)(?:\s+(?:WHERE|GROUP|ORDER|LIMIT|$))/i.exec(sql);
      if (joinMatch) {
        const joinTable = joinMatch[1];
        const joinCondition = joinMatch[2];
        const joinColumns = this.extractColumnsFromCondition(joinCondition);

        if (joinColumns.length > 0) {
          suggestions.push({
            table: joinTable,
            columns: joinColumns,
            indexType: 'btree',
            reason: 'JOIN operation',
            potentialBenefit: 'high',
            queryPattern: `JOIN ON ${  joinColumns.join(' = ')}`,
            estimatedSize: this.estimateIndexSize(joinColumns.length),
            priority: 9,
          });
        }
      }

      // ORDER BY analysis
      const orderMatch = /ORDER BY\s+(.+?)(?:\s+(?:LIMIT|$))/i.exec(sql);
      if (orderMatch) {
        const orderColumns = this.extractColumnsFromOrder(orderMatch[1]);

        if (orderColumns.length > 0) {
          suggestions.push({
            table: targetTable ?? 'unknown',
            columns: orderColumns,
            indexType: 'btree',
            reason: 'ORDER BY sorting',
            potentialBenefit: 'medium',
            queryPattern: `ORDER BY ${  orderColumns.join(', ')}`,
            estimatedSize: this.estimateIndexSize(orderColumns.length),
            priority: 6,
          });
        }
      }
    } catch (error) {
      logger.warn('Query analysis failed:', error);
    }

    return suggestions;
  }

  /**
   * Analyze table statistics for index suggestions
   */
  private analyzeTableStatsForIndexes(tableStats: any): IndexSuggestion[] {
    const suggestions: IndexSuggestion[] = [];

    // Suggest indexes for frequently updated columns (if applicable)
    if (tableStats?.mostUpdatedColumns) {
      tableStats.mostUpdatedColumns.forEach((col: string) => {
        suggestions.push({
          table: tableStats.tableName,
          columns: [col],
          indexType: 'btree',
          reason: 'High update frequency',
          potentialBenefit: 'low',
          queryPattern: 'UPDATE operations',
          estimatedSize: this.estimateIndexSize(1),
          priority: 3,
        });
      });
    }

    return suggestions;
  }

  /**
   * Extract columns from WHERE/JOIN conditions
   */
  private extractColumnsFromCondition(condition: string): string[] {
    const columns: string[] = [];
    const columnRegex = /(\w+)\s*[=<>!]+\s*[\w$]/g;
    let match;

    while ((match = columnRegex.exec(condition)) !== null) {
      if (!columns.includes(match[1])) {
        columns.push(match[1]);
      }
    }

    return columns;
  }

  /**
   * Extract columns from ORDER BY clause
   */
  private extractColumnsFromOrder(orderClause: string): string[] {
    return orderClause
      .split(',')
      .map((col) => col.trim().split(/\s+/)[0])
      .filter((col) => col && !col.includes('(')); // Remove function calls
  }

  /**
   * Check if query uses specific table
   */
  private queryUsesTable(sql: string, tableName: string): boolean {
    const fromRegex = new RegExp(`\\bFROM\\s+${tableName}\\b`, 'i');
    const joinRegex = new RegExp(`\\bJOIN\\s+${tableName}\\b`, 'i');

    return fromRegex.test(sql) || joinRegex.test(sql);
  }

  /**
   * Estimate index size
   */
  private estimateIndexSize(columnCount: number): number {
    // Rough estimation: base size + per column overhead
    return 1000 + columnCount * 200;
  }

  /**
   * Remove duplicate suggestions
   */
  private deduplicateSuggestions(suggestions: IndexSuggestion[]): IndexSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter((suggestion) => {
      const key = `${suggestion.table}:${suggestion.columns.sort((a, b) => a.localeCompare(b)).join(',')}:${suggestion.reason}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // =============================================================================
  // INDEX OPERATIONS
  // =============================================================================

  /**
   * Create new index
   */
  async createIndex(
    tableName: string,
    columnNames: string[],
    options: {
      indexName?: string;
      unique?: boolean;
      indexType?: string;
      concurrently?: boolean;
      schema?: string;
    } = {},
  ): Promise<{ success: boolean; indexName: string; error?: string }> {
    const startTime = Date.now();

    try {
      const indexName = options.indexName ?? this.generateIndexName(tableName, columnNames);
      const schema = options.schema ?? 'public';
      const concurrently = options.concurrently !== false;

      const { error } = await supabase.rpc('create_database_index', {
        schema_name: schema,
        table_name: tableName,
        index_name: indexName,
        column_names: columnNames,
        index_type: options.indexType ?? 'btree',
        is_unique: options.unique ?? false,
        concurrently,
      });

      if (error) {
        throw error;
      }

      const executionTime = Date.now() - startTime;

      // Clear cache
      this.clearIndexCache();

      monitoring.trackApiCall('create_index', 'POST', executionTime, 200, {
        tableName,
        indexName,
        columnCount: columnNames.length,
        indexType: options.indexType ?? 'btree',
      });

      return { success: true, indexName };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      monitoring.trackApiCall('create_index', 'POST', executionTime, 500, {
        tableName,
        columnNames: columnNames.join(','),
        error: (error as Error).message,
      });

      return {
        success: false,
        indexName: '',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Drop existing index
   */
  async dropIndex(
    indexName: string,
    options: {
      concurrently?: boolean;
      ifExists?: boolean;
      schema?: string;
    } = {},
  ): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();

    try {
      const schema = options.schema ?? 'public';
      const concurrently = options.concurrently !== false;
      const ifExists = options.ifExists !== false;

      const { error } = await supabase.rpc('drop_database_index', {
        schema_name: schema,
        index_name: indexName,
        concurrently,
        if_exists: ifExists,
      });

      if (error) {
        throw error;
      }

      const executionTime = Date.now() - startTime;

      // Clear cache
      this.clearIndexCache();

      monitoring.trackApiCall('drop_index', 'DELETE', executionTime, 200, {
        indexName,
        schema,
      });

      return { success: true };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      monitoring.trackApiCall('drop_index', 'DELETE', executionTime, 500, {
        indexName,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Rebuild index (for maintenance)
   */
  async rebuildIndex(
    indexName: string,
    options: {
      concurrently?: boolean;
      schema?: string;
    } = {},
  ): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();

    try {
      const schema = options.schema ?? 'public';
      const concurrently = options.concurrently !== false;

      const { error } = await supabase.rpc('rebuild_database_index', {
        schema_name: schema,
        index_name: indexName,
        concurrently,
      });

      if (error) {
        throw error;
      }

      const executionTime = Date.now() - startTime;

      monitoring.trackApiCall('rebuild_index', 'PUT', executionTime, 200, {
        indexName,
        schema,
      });

      return { success: true };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      monitoring.trackApiCall('rebuild_index', 'PUT', executionTime, 500, {
        indexName,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // =============================================================================
  // MAINTENANCE OPERATIONS
  // =============================================================================

  /**
   * Analyze table for query planner statistics
   */
  async analyzeTable(
    tableName: string,
    schema = 'public',
  ): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();

    try {
      const { error } = await supabase.rpc('analyze_database_table', {
        schema_name: schema,
        table_name: tableName,
      });

      if (error) {
        throw error;
      }

      const executionTime = Date.now() - startTime;

      monitoring.trackApiCall('analyze_table', 'POST', executionTime, 200, {
        tableName,
        schema,
      });

      return { success: true };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      monitoring.trackApiCall('analyze_table', 'POST', executionTime, 500, {
        tableName,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Vacuum table for maintenance
   */
  async vacuumTable(
    tableName: string,
    schema = 'public',
    full = false,
  ): Promise<{ success: boolean; error?: string }> {
    const startTime = Date.now();

    try {
      const { error } = await supabase.rpc('vacuum_database_table', {
        schema_name: schema,
        table_name: tableName,
        full_vacuum: full,
      });

      if (error) {
        throw error;
      }

      const executionTime = Date.now() - startTime;

      monitoring.trackApiCall('vacuum_table', 'POST', executionTime, 200, {
        tableName,
        schema,
        fullVacuum: full,
      });

      return { success: true };
    } catch (error) {
      const executionTime = Date.now() - startTime;

      monitoring.trackApiCall('vacuum_table', 'POST', executionTime, 500, {
        tableName,
        error: (error as Error).message,
      });

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate index name
   */
  private generateIndexName(tableName: string, columnNames: string[]): string {
    const columnPart = columnNames.join('_');
    const timestamp = Date.now();
    return `idx_${tableName}_${columnPart}_${timestamp}`;
  }

  /**
   * Get cached indexes
   */
  private getCachedIndexes(key: string): DatabaseIndex[] | null {
    const cached = localStorage.getItem(`index_cache_${key}`);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached);
      const now = Date.now();

      if (now - parsed.timestamp > this.cacheTTL) {
        localStorage.removeItem(`index_cache_${key}`);
        return null;
      }

      return parsed.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set cached indexes
   */
  private setCachedIndexes(key: string, indexes: DatabaseIndex[]): void {
    try {
      const cacheData = {
        data: indexes,
        timestamp: Date.now(),
      };
      localStorage.setItem(`index_cache_${key}`, JSON.stringify(cacheData));
    } catch (error) {
      logger.warn('Failed to cache indexes:', error);
    }
  }

  /**
   * Clear index cache
   */
  private clearIndexCache(): void {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith('index_cache_'));
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Get table statistics
   */
  private async getTableStatistics(tableName?: string, schema?: string): Promise<any> {
    // Mock implementation - in real app, get from database
    return {
      tableName,
      rowCount: 1000,
      mostQueriedColumns: ['id', 'created_at'],
      mostUpdatedColumns: ['updated_at', 'status'],
    };
  }

  // =============================================================================
  // MONITORING AND INITIALIZATION
  // =============================================================================

  /**
   * Initialize index monitoring
   */
  private initializeIndexMonitoring(): void {
    // Set up periodic index analysis
    if (environment.features.monitoring) {
      setInterval(
        async () => {
          try {
            await this.performIndexMaintenance();
          } catch (error) {
            logger.warn('Index maintenance failed:', error);
          }
        },
        24 * 60 * 60 * 1000,
      ); // Daily
    }

    monitoring.trackEvent({
      type: 'index_management_initialized',
      category: 'database',
      action: 'initialize',
      metadata: {
        cacheTTL: this.cacheTTL,
        monitoringEnabled: environment.features.monitoring,
      },
    });
  }

  /**
   * Perform automatic index maintenance
   */
  private async performIndexMaintenance(): Promise<void> {
    try {
      // Analyze tables for optimization opportunities
      const analysis = await this.analyzeIndexUsage();

      // Log findings
      if (analysis.unusedIndexes > 0) {
        monitoring.trackEvent({
          type: 'unused_indexes_found',
          category: 'database',
          action: 'maintenance_check',
          metadata: {
            count: analysis.unusedIndexes,
            totalIndexes: analysis.totalIndexes,
          },
        });
      }

      if (analysis.missingIndexes.length > 0) {
        monitoring.trackEvent({
          type: 'missing_indexes_suggested',
          category: 'database',
          action: 'maintenance_check',
          metadata: {
            count: analysis.missingIndexes.length,
            highPriority: analysis.missingIndexes.filter((s) => s.priority >= 8).length,
          },
        });
      }

      // Clear old cache entries
      this.clearExpiredCache();
    } catch (error) {
      logger.warn('Index maintenance failed:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  private clearExpiredCache(): void {
    const now = Date.now();
    const keys = Object.keys(localStorage);

    for (const key of keys) {
      if (key.startsWith('index_cache_') || key.startsWith('query_cache_')) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (now - parsed.timestamp > this.cacheTTL) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          // Remove corrupted cache entries
          localStorage.removeItem(key);
        }
      }
    }
  }

  /**
   * Get index maintenance recommendations
   */
  async getMaintenanceRecommendations(): Promise<{
    unusedIndexes: DatabaseIndex[];
    missingIndexes: IndexSuggestion[];
    maintenanceTasks: string[];
  }> {
    const analysis = await this.analyzeIndexUsage();
    const indexes = await this.getDatabaseIndexes();

    const unusedIndexes = indexes.filter(
      (idx) =>
        idx.usageCount === 0 &&
        !idx.isPrimary &&
        idx.createdAt < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Older than 30 days
    );

    const maintenanceTasks: string[] = [];

    if (analysis.scanEfficiency.efficiency < 0.5) {
      maintenanceTasks.push('Consider adding indexes to reduce sequential scans');
    }

    if (unusedIndexes.length > 0) {
      maintenanceTasks.push(`Consider dropping ${unusedIndexes.length} unused indexes`);
    }

    if (analysis.duplicateIndexes.length > 0) {
      maintenanceTasks.push(`Remove ${analysis.duplicateIndexes.length} duplicate indexes`);
    }

    return {
      unusedIndexes,
      missingIndexes: analysis.missingIndexes,
      maintenanceTasks,
    };
  }
}

// =============================================================================
// GLOBAL INSTANCE AND UTILITIES
// =============================================================================

export const indexManagementService = IndexManagementService.getInstance();

// Utility functions for easy access
export const getDatabaseIndexes = (schema?: string) =>
  indexManagementService.getDatabaseIndexes(schema);
export const getTableIndexes = (tableName: string, schema?: string) =>
  indexManagementService.getTableIndexes(tableName, schema);
export const analyzeIndexUsage = (tableName?: string, schema?: string) =>
  indexManagementService.analyzeIndexUsage(tableName, schema);
export const suggestMissingIndexes = (tableName?: string, schema?: string) =>
  indexManagementService.suggestMissingIndexes(tableName, schema);
export const createIndex = (tableName: string, columnNames: string[], options?: any) =>
  indexManagementService.createIndex(tableName, columnNames, options);
export const dropIndex = (indexName: string, options?: any) =>
  indexManagementService.dropIndex(indexName, options);
export const rebuildIndex = (indexName: string, options?: any) =>
  indexManagementService.rebuildIndex(indexName, options);
export const analyzeTable = (tableName: string, schema?: string) =>
  indexManagementService.analyzeTable(tableName, schema);
export const vacuumTable = (tableName: string, schema?: string, full?: boolean) =>
  indexManagementService.vacuumTable(tableName, schema, full);
export const getMaintenanceRecommendations = () =>
  indexManagementService.getMaintenanceRecommendations();

export default IndexManagementService;
