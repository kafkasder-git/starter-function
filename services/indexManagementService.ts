/**
 * @fileoverview Index Management Service
 * @description Service for managing database indexes and optimizing query performance
 */

import { db } from '@/lib/database';
import { logger } from '@/lib/logging/logger';

export interface IndexDefinition {
  id: string;
  collection: string;
  type: 'key' | 'fulltext' | 'unique' | 'array';
  attributes: string[];
  orders?: string[];
  description?: string;
  createdAt: string;
  isActive: boolean;
}

export interface IndexPerformanceMetrics {
  indexId: string;
  collection: string;
  usageCount: number;
  averageQueryTime: number;
  lastUsed: string;
  effectiveness: 'low' | 'medium' | 'high';
}

export interface IndexRecommendation {
  collection: string;
  attributes: string[];
  type: 'key' | 'fulltext' | 'unique' | 'array';
  reason: string;
  impact: 'low' | 'medium' | 'high';
  priority: number;
}

class IndexManagementService {
  private static instance: IndexManagementService;
  private indexDefinitions: Map<string, IndexDefinition> = new Map();
  private performanceMetrics: Map<string, IndexPerformanceMetrics> = new Map();

  public static getInstance(): IndexManagementService {
    if (!IndexManagementService.instance) {
      IndexManagementService.instance = new IndexManagementService();
    }
    return IndexManagementService.instance;
  }

  private constructor() {
    this.loadIndexDefinitions();
    logger.info('IndexManagementService initialized');
  }

  /**
   * Create database index
   */
  async createIndex(
    collection: string,
    type: IndexDefinition['type'],
    attributes: string[],
    orders?: string[]
  ): Promise<{ success: boolean; error?: string; indexId?: string }> {
    try {
      const indexId = `${collection}_${attributes.join('_')}_${type}`;
      
      // Check if index already exists
      if (this.indexDefinitions.has(indexId)) {
        return { success: false, error: 'Index already exists' };
      }

      // In a real implementation, this would create the actual index in Appwrite
      // For now, we'll simulate the process
      const indexDef: IndexDefinition = {
        id: indexId,
        collection,
        type,
        attributes,
        orders,
        description: `${type} index on ${attributes.join(', ')}`,
        createdAt: new Date().toISOString(),
        isActive: true
      };

      this.indexDefinitions.set(indexId, indexDef);

      // Initialize performance metrics
      this.performanceMetrics.set(indexId, {
        indexId,
        collection,
        usageCount: 0,
        averageQueryTime: 0,
        lastUsed: new Date().toISOString(),
        effectiveness: 'medium'
      });

      logger.info(`Created ${type} index on ${collection}`, { attributes, orders });
      
      return { success: true, indexId };

    } catch (error) {
      logger.error('Failed to create index', error);
      return { success: false, error: 'Failed to create index' };
    }
  }

  /**
   * Get all indexes for a collection
   */
  getCollectionIndexes(collection: string): IndexDefinition[] {
    return Array.from(this.indexDefinitions.values())
      .filter(index => index.collection === collection);
  }

  /**
   * Get index performance metrics
   */
  getIndexPerformanceMetrics(collection?: string): IndexPerformanceMetrics[] {
    const metrics = Array.from(this.performanceMetrics.values());
    
    if (collection) {
      return metrics.filter(m => m.collection === collection);
    }
    
    return metrics;
  }

  /**
   * Analyze query patterns and recommend indexes
   */
  analyzeAndRecommendIndexes(queryPatterns: Array<{
    collection: string;
    filters: Record<string, any>;
    orderBy?: string[];
    frequency: number;
    averageDuration: number;
  }>): IndexRecommendation[] {
    const recommendations: IndexRecommendation[] = [];
    const collectionPatterns = new Map<string, typeof queryPatterns>();

    // Group patterns by collection
    queryPatterns.forEach(pattern => {
      const existing = collectionPatterns.get(pattern.collection) || [];
      existing.push(pattern);
      collectionPatterns.set(pattern.collection, existing);
    });

    // Analyze each collection
    collectionPatterns.forEach((patterns, collection) => {
      const existingIndexes = this.getCollectionIndexes(collection);
      
      // Find common filter combinations
      const filterCombinations = this.findCommonFilterCombinations(patterns);
      
      filterCombinations.forEach(({ filters, frequency, averageDuration }) => {
        const filterAttrs = Object.keys(filters);
        
        // Check if index already exists
        const existingIndex = existingIndexes.find(index => 
          this.arraysEqual(index.attributes.sort(), filterAttrs.sort())
        );

        if (!existingIndex && filterAttrs.length > 0) {
          const impact = this.calculateIndexImpact(frequency, averageDuration);
          
          recommendations.push({
            collection,
            attributes: filterAttrs,
            type: this.determineIndexType(filters),
            reason: `Used in ${frequency} queries with ${averageDuration}ms average duration`,
            impact,
            priority: this.calculatePriority(frequency, averageDuration, impact)
          });
        }
      });

      // Find common sort patterns
      const sortPatterns = this.findCommonSortPatterns(patterns);
      
      sortPatterns.forEach(({ orderBy, frequency }) => {
        const existingIndex = existingIndexes.find(index => 
          this.arraysEqual(index.orders || [], orderBy)
        );

        if (!existingIndex && orderBy.length > 0) {
          recommendations.push({
            collection,
            attributes: orderBy,
            type: 'key',
            reason: `Sort pattern used in ${frequency} queries`,
            impact: 'medium',
            priority: frequency * 0.5
          });
        }
      });
    });

    // Sort by priority
    return recommendations.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update index performance metrics
   */
  updateIndexUsage(indexId: string, queryTime: number): void {
    const metrics = this.performanceMetrics.get(indexId);
    
    if (metrics) {
      metrics.usageCount += 1;
      metrics.averageQueryTime = 
        (metrics.averageQueryTime * (metrics.usageCount - 1) + queryTime) / metrics.usageCount;
      metrics.lastUsed = new Date().toISOString();
      
      // Update effectiveness based on performance
      if (metrics.averageQueryTime < 100) {
        metrics.effectiveness = 'high';
      } else if (metrics.averageQueryTime < 500) {
        metrics.effectiveness = 'medium';
      } else {
        metrics.effectiveness = 'low';
      }
    }
  }

  /**
   * Remove unused indexes
   */
  async removeUnusedIndexes(maxAgeDays: number = 30): Promise<string[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxAgeDays);
    
    const unusedIndexes: string[] = [];
    
    this.performanceMetrics.forEach((metrics, indexId) => {
      const lastUsed = new Date(metrics.lastUsed);
      
      if (lastUsed < cutoffDate && metrics.usageCount < 10) {
        unusedIndexes.push(indexId);
      }
    });

    // Remove from tracking (in real implementation, would remove from database)
    unusedIndexes.forEach(indexId => {
      this.indexDefinitions.delete(indexId);
      this.performanceMetrics.delete(indexId);
    });

    logger.info(`Removed ${unusedIndexes.length} unused indexes`);
    return unusedIndexes;
  }

  /**
   * Find common filter combinations
   */
  private findCommonFilterCombinations(patterns: any[]): Array<{
    filters: Record<string, any>;
    frequency: number;
    averageDuration: number;
  }> {
    const combinations = new Map<string, { count: number; totalDuration: number }>();

    patterns.forEach(pattern => {
      const filterKeys = Object.keys(pattern.filters).sort();
      const key = filterKeys.join(',');
      
      if (filterKeys.length > 0) {
        const existing = combinations.get(key) || { count: 0, totalDuration: 0 };
        combinations.set(key, {
          count: existing.count + pattern.frequency,
          totalDuration: existing.totalDuration + (pattern.averageDuration * pattern.frequency)
        });
      }
    });

    return Array.from(combinations.entries()).map(([key, data]) => ({
      filters: Object.fromEntries(key.split(',').map(k => [k, 'any'])),
      frequency: data.count,
      averageDuration: data.totalDuration / data.count
    }));
  }

  /**
   * Find common sort patterns
   */
  private findCommonSortPatterns(patterns: any[]): Array<{
    orderBy: string[];
    frequency: number;
  }> {
    const sortPatterns = new Map<string, number>();

    patterns.forEach(pattern => {
      if (pattern.orderBy && pattern.orderBy.length > 0) {
        const key = pattern.orderBy.join(',');
        sortPatterns.set(key, (sortPatterns.get(key) || 0) + pattern.frequency);
      }
    });

    return Array.from(sortPatterns.entries()).map(([key, frequency]) => ({
      orderBy: key.split(','),
      frequency
    }));
  }

  /**
   * Calculate index impact
   */
  private calculateIndexImpact(frequency: number, averageDuration: number): 'low' | 'medium' | 'high' {
    const score = frequency * (averageDuration / 1000);
    
    if (score > 100) return 'high';
    if (score > 20) return 'medium';
    return 'low';
  }

  /**
   * Determine appropriate index type
   */
  private determineIndexType(filters: Record<string, any>): IndexDefinition['type'] {
    const values = Object.values(filters);
    
    // If any filter contains text search patterns
    if (values.some(v => typeof v === 'string' && v.includes('*'))) {
      return 'fulltext';
    }
    
    // If filters are likely to be unique
    if (Object.keys(filters).length === 1) {
      return 'unique';
    }
    
    // Default to key index
    return 'key';
  }

  /**
   * Calculate recommendation priority
   */
  private calculatePriority(frequency: number, averageDuration: number, impact: string): number {
    const impactMultiplier = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
    return frequency * (averageDuration / 100) * impactMultiplier;
  }

  /**
   * Check if two arrays are equal
   */
  private arraysEqual(a: any[], b: any[]): boolean {
    if (a.length !== b.length) return false;
    
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    
    return sortedA.every((val, index) => val === sortedB[index]);
  }

  /**
   * Load existing index definitions
   */
  private loadIndexDefinitions(): void {
    // In a real implementation, this would load from the database
    // For now, we'll initialize with some common indexes
    const commonIndexes: Omit<IndexDefinition, 'id'>[] = [
      {
        collection: 'users',
        type: 'unique',
        attributes: ['email'],
        description: 'Unique index on user email',
        createdAt: new Date().toISOString(),
        isActive: true
      },
      {
        collection: 'beneficiaries',
        type: 'key',
        attributes: ['status', 'created_at'],
        description: 'Index for beneficiary queries by status and creation date',
        createdAt: new Date().toISOString(),
        isActive: true
      }
    ];

    commonIndexes.forEach(indexDef => {
      const id = `${indexDef.collection}_${indexDef.attributes.join('_')}_${indexDef.type}`;
      this.indexDefinitions.set(id, { ...indexDef, id });
    });
  }

  /**
   * Export index configuration
   */
  exportIndexConfiguration(): string {
    const config = {
      indexes: Array.from(this.indexDefinitions.values()),
      metrics: Array.from(this.performanceMetrics.values()),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(config, null, 2);
  }
}

// Export singleton instance
export const indexManagementService = IndexManagementService.getInstance();
export default indexManagementService;
