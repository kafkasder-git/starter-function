// Query Optimization Service - Advanced Database Query Management

import { supabase } from '../lib/supabase';

// Types for query optimization
interface QueryMetrics {
  queryId: string;
  sql: string;
  executionTime: number;
  timestamp: number;
  parameters?: unknown[];
  cacheHit?: boolean;
}

interface QueryAnalysis {
  queryId: string;
  sql: string;
  averageExecutionTime: number;
  executionCount: number;
  lastExecuted: number;
  suggestions: string[];
  indexes: string[];
}

interface PreparedStatement {
  name: string;
  sql: string;
  parameters: string[];
  usageCount: number;
  averageExecutionTime: number;
}

interface QueryOptimizationConfig {
  cacheEnabled: boolean;
  cacheTTL: number;
  maxQueryHistory: number;
  enablePreparedStatements: boolean;
  enableQueryAnalysis: boolean;
}

export class QueryOptimizationService {
  private readonly config: QueryOptimizationConfig;
  private readonly queryHistory: QueryMetrics[] = [];
  private readonly queryAnalysis = new Map<string, QueryAnalysis>();
  private readonly preparedStatements = new Map<string, PreparedStatement>();

  constructor(config: Partial<QueryOptimizationConfig> = {}) {
    this.config = {
      cacheEnabled: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      maxQueryHistory: 1000,
      enablePreparedStatements: true,
      enableQueryAnalysis: true,
      ...config,
    };

    this.initializePreparedStatements();
  }

  /**
   * Initialize common prepared statements
   */
  private initializePreparedStatements(): void {
    if (!this.config.enablePreparedStatements) return;

    // Common queries that can benefit from prepared statements
    const commonQueries = [
      {
        name: 'get_beneficiaries_by_category',
        sql: 'SELECT * FROM beneficiaries WHERE category = $1',
        parameters: ['category'],
      },
      {
        name: 'get_donations_by_date_range',
        sql: 'SELECT * FROM donations WHERE created_at BETWEEN $1 AND $2',
        parameters: ['start_date', 'end_date'],
      },
      {
        name: 'get_members_by_status',
        sql: 'SELECT * FROM members WHERE status = $1',
        parameters: ['status'],
      },
    ];

    commonQueries.forEach((query) => {
      this.preparedStatements.set(query.name, {
        name: query.name,
        sql: query.sql,
        parameters: query.parameters,
        usageCount: 0,
        averageExecutionTime: 0,
      });
    });
  }

  /**
   * Execute a prepared statement with parameters
   */
  async executePreparedStatement(
    name: string,
    parameters: unknown[] = [],
    options: { logQuery?: boolean; analyze?: boolean } = {},
  ): Promise<unknown> {
    const startTime = Date.now();
    const statement = this.preparedStatements.get(name);

    if (!statement) {
      throw new Error(`Prepared statement not found: ${name}`);
    }

    try {
      // Replace table name placeholders if any
      let sql = statement.sql;
      if (sql.includes('{table_name}')) {
        // This is a dynamic table query - handle accordingly
        sql = sql.replace('{table_name}', parameters.shift() || 'donations');
      }

      const { data, error } = await supabase.rpc('execute_sql', {
        query: sql,
        params: parameters,
      });

      if (error) {
        throw error;
      }

      const executionTime = Date.now() - startTime;

      // Update statement metrics
      statement.usageCount++;
      statement.averageExecutionTime = 
        (statement.averageExecutionTime * (statement.usageCount - 1) + executionTime) / 
        statement.usageCount;

      // Log query if requested
      if (options.logQuery) {
        console.log(`Prepared statement ${name} executed in ${executionTime}ms`);
      }

      // Analyze query if requested
      if (options.analyze && this.config.enableQueryAnalysis) {
        await this.analyzeQuery(sql, parameters, executionTime);
      }

      return data;
    } catch (error: unknown) {
      console.error(`Error executing prepared statement ${name}:`, error);
      throw error;
    }
  }

  /**
   * Execute an optimized query with caching and analysis
   */
  async executeOptimizedQuery(
    sql: string,
    parameters: unknown[] = [],
    options: {
      usePrepared?: boolean;
      analyze?: boolean;
      cache?: boolean;
      ttl?: number;
    } = {},
  ): Promise<unknown> {
    const startTime = Date.now();
    const queryId = this.generateQueryId(sql);

    // Check cache first
    if (options.cache !== false && this.config.cacheEnabled) {
      const cached = await this.getCachedResult(queryId, parameters);
      if (cached) {
        this.logQueryMetrics({
          queryId,
          sql,
          executionTime: Date.now() - startTime,
          timestamp: Date.now(),
          parameters,
          cacheHit: true,
        });
        return cached.data;
      }
    }

    try {
      let result: unknown;

      // Try to use prepared statement if available
      if (options.usePrepared !== false) {
        const preparedName = this.findPreparedStatement(sql);
        if (preparedName) {
          result = await this.executePreparedStatement(preparedName, parameters, {
            logQuery: true,
            analyze: options.analyze,
          });
        } else {
          // Execute raw SQL
          const { data, error } = await supabase.rpc('execute_sql', {
            query: sql,
            params: parameters,
          });

          if (error) {
            throw error;
          }

          result = data;
        }
      } else {
        // Execute raw SQL
        const { data, error } = await supabase.rpc('execute_sql', {
          query: sql,
          params: parameters,
        });

        if (error) {
          throw error;
        }

        result = data;
      }

      const executionTime = Date.now() - startTime;

      // Cache result if enabled
      if (options.cache !== false && this.config.cacheEnabled) {
        await this.cacheResult(queryId, parameters, result, options.ttl);
      }

      // Log query metrics
      this.logQueryMetrics({
        queryId,
        sql,
        executionTime,
        timestamp: Date.now(),
        parameters,
        cacheHit: false,
      });

      // Analyze query if requested
      if (options.analyze && this.config.enableQueryAnalysis) {
        await this.analyzeQuery(sql, parameters, executionTime);
      }

      return result;
    } catch (error: unknown) {
      console.error(`Error executing optimized query:`, error);
      throw error;
    }
  }

  /**
   * Analyze query performance
   */
  async analyzeQuery(sql: string, parameters: unknown[], executionTime: number): Promise<void> {
    try {
      // Get query plan (if supported by Supabase)
      const { data: plan } = await supabase.rpc('explain_query', {
        query_sql: sql,
        params: parameters,
      });

      const queryId = this.generateQueryId(sql);
      const existing = this.queryAnalysis.get(queryId);

      const analysis: QueryAnalysis = existing || {
        queryId,
        sql,
        averageExecutionTime: 0,
        executionCount: 0,
        lastExecuted: Date.now(),
        suggestions: [],
        indexes: [],
      };

      // Update metrics
      analysis.executionCount++;
      analysis.averageExecutionTime = 
        (analysis.averageExecutionTime * (analysis.executionCount - 1) + executionTime) / 
        analysis.executionCount;
      analysis.lastExecuted = Date.now();

      // Analyze query plan if available
      if (plan) {
        const suggestions = this.analyzeQueryPlan(plan);
        const indexes = this.suggestIndexes(plan);
        
        analysis.suggestions = [...new Set([...analysis.suggestions, ...suggestions])];
        analysis.indexes = [...new Set([...analysis.indexes, ...indexes])];
      }

      this.queryAnalysis.set(queryId, analysis);
    } catch (error: unknown) {
      console.warn('Query analysis failed:', error);
    }
  }

  /**
   * Analyze query plan and return optimization suggestions
   */
  private analyzeQueryPlan(plan: unknown): string[] {
    const suggestions: string[] = [];
    
    // This is a simplified implementation
    // In a real application, you would parse the actual query plan
    if (typeof plan === 'object' && plan !== null) {
      const planStr = JSON.stringify(plan);
      
      if (planStr.includes('Seq Scan')) {
        suggestions.push('Consider adding an index for sequential scan operations');
      }
      
      if (planStr.includes('Nested Loop')) {
        suggestions.push('Consider optimizing nested loop joins');
      }
      
      if (planStr.includes('Hash Join')) {
        suggestions.push('Hash join detected - consider memory optimization');
      }
    }
    
    return suggestions;
  }

  /**
   * Suggest indexes based on query plan
   */
  private suggestIndexes(plan: unknown): string[] {
    const indexes: string[] = [];
    
    // This is a simplified implementation
    // In a real application, you would analyze the actual query plan
    if (typeof plan === 'object' && plan !== null) {
      const planStr = JSON.stringify(plan);
      
      // Look for common patterns that benefit from indexes
      if (planStr.includes('WHERE')) {
        indexes.push('Consider adding indexes on WHERE clause columns');
      }
      
      if (planStr.includes('ORDER BY')) {
        indexes.push('Consider adding indexes on ORDER BY columns');
      }
      
      if (planStr.includes('JOIN')) {
        indexes.push('Consider adding indexes on JOIN columns');
      }
    }
    
    return indexes;
  }

  // =============================================================================
  // CACHE MANAGEMENT
  // =============================================================================

  /**
   * Get cached result
   */
  private async getCachedResult(
    queryId: string,
    parameters: unknown[],
  ): Promise<{ data: unknown; timestamp: number } | null> {
    try {
      const cacheKey = this.generateCacheKey(queryId, parameters);
      const cached = localStorage.getItem(`query_cache_${cacheKey}`);

      if (!cached) return null;

      const parsed = JSON.parse(cached);
      const now = Date.now();

      // Check TTL
      if (now - parsed.timestamp > this.config.cacheTTL) {
        localStorage.removeItem(`query_cache_${cacheKey}`);
        return null;
      }

      return parsed;
    } catch (error: unknown) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  /**
   * Cache query result
   */
  private async cacheResult(
    queryId: string,
    parameters: unknown[],
    data: unknown,
    ttl?: number,
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(queryId, parameters);
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl: ttl ?? this.config.cacheTTL,
      };

      localStorage.setItem(`query_cache_${cacheKey}`, JSON.stringify(cacheData));
    } catch (error: unknown) {
      console.warn('Cache write error:', error);
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(queryId: string, parameters: unknown[]): string {
    const paramsHash = JSON.stringify(parameters)
      .split('')
      .reduce((a, b) => {
        a = (a << 5) - a + b.charCodeAt(0);
        return a & a;
      }, 0);
    return `${queryId}_${paramsHash}`;
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate query ID
   */
  private generateQueryId(sql: string): string {
    // Simple hash function for SQL
    let hash = 0;
    for (let i = 0; i < sql.length; i++) {
      const char = sql.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Find matching prepared statement
   */
  private findPreparedStatement(sql: string): string | null {
    for (const [name, statement] of this.preparedStatements) {
      if (sql.includes(statement.sql.split(' ')[0])) {
        return name;
      }
    }
    return null;
  }

  /**
   * Log query metrics
   */
  private logQueryMetrics(metrics: QueryMetrics): void {
    this.queryHistory.push(metrics);

    // Keep only recent queries
    if (this.queryHistory.length > this.config.maxQueryHistory) {
      this.queryHistory.shift();
    }

    // Log slow queries
    if (metrics.executionTime > 1000) {
      console.warn(`Slow query detected: ${metrics.sql} (${metrics.executionTime}ms)`);
    }
  }

  // =============================================================================
  // PUBLIC API
  // =============================================================================

  /**
   * Get query analytics
   */
  getQueryAnalytics(): {
    totalQueries: number;
    averageExecutionTime: number;
    slowQueries: QueryMetrics[];
    preparedStatements: PreparedStatement[];
    topSlowQueries: QueryMetrics[];
    queryAnalysis: QueryAnalysis[];
  } {
    const slowQueries = this.queryHistory.filter(q => q.executionTime > 1000);
    const topSlowQueries = [...this.queryHistory]
      .sort((a, b) => b.executionTime - a.executionTime)
      .slice(0, 10);

    const averageExecutionTime = this.queryHistory.length > 0
      ? this.queryHistory.reduce((sum, q) => sum + q.executionTime, 0) / this.queryHistory.length
      : 0;

    return {
      totalQueries: this.queryHistory.length,
      averageExecutionTime,
      slowQueries,
      preparedStatements: Array.from(this.preparedStatements.values()),
      topSlowQueries,
      queryAnalysis: Array.from(this.queryAnalysis.values()),
    };
  }

  /**
   * Clear query cache
   */
  clearCache(): void {
    const keys = Object.keys(localStorage).filter((key) => key.startsWith('query_cache_'));
    keys.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  /**
   * Suggest index optimizations
   */
  async suggestIndexOptimizations(): Promise<
    {
      table: string;
      column: string;
      reason: string;
      impact: 'high' | 'medium' | 'low';
    }[]
  > {
    const suggestions: {
      table: string;
      column: string;
      reason: string;
      impact: 'high' | 'medium' | 'low';
    }[] = [];

    // Analyze query history for common patterns
    const tableUsage = new Map<string, Set<string>>();
    
    this.queryHistory.forEach((query) => {
      // Simple regex to extract table names (this is basic - in production use a proper SQL parser)
      const tableMatches = query.sql.match(/FROM\s+(\w+)/gi);
      if (tableMatches) {
        tableMatches.forEach((match) => {
          const tableName = match.replace(/FROM\s+/i, '');
          if (!tableUsage.has(tableName)) {
            tableUsage.set(tableName, new Set());
          }
          
          // Extract column names from WHERE clauses
          const whereMatches = query.sql.match(/WHERE\s+(\w+)/gi);
          if (whereMatches) {
            whereMatches.forEach((whereMatch) => {
              const columnName = whereMatch.replace(/WHERE\s+/i, '');
              tableUsage.get(tableName)?.add(columnName);
            });
          }
        });
      }
    });

    // Generate suggestions based on usage patterns
    tableUsage.forEach((columns, table) => {
      columns.forEach((column) => {
        suggestions.push({
          table,
          column,
          reason: `Frequently used in WHERE clauses`,
          impact: 'medium',
        });
      });
    });

    return suggestions;
  }
}

// Export singleton instance
export const queryOptimizationService = new QueryOptimizationService();

// Export individual methods for convenience
export const executePreparedStatement = (name: string, parameters?: unknown[], options?: unknown) =>
  queryOptimizationService.executePreparedStatement(name, parameters, options);

export const getQueryAnalytics = () => queryOptimizationService.getQueryAnalytics();
export const suggestIndexOptimizations = () => queryOptimizationService.suggestIndexOptimizations();

export default QueryOptimizationService;
