/**
 * @fileoverview Query Optimization Service
 * @description Service for optimizing database queries and performance monitoring
 */

import { logger } from '@/lib/logging/logger';
import type { Models } from 'appwrite';

export interface QueryPerformanceMetrics {
  queryId: string;
  collection: string;
  operation: 'list' | 'get' | 'create' | 'update' | 'delete';
  duration: number;
  timestamp: string;
  parameters: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  resultCount?: number;
}

export interface QueryOptimization {
  queryId: string;
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  category: 'index' | 'filter' | 'limit' | 'select';
  description: string;
}

export interface PerformanceReport {
  totalQueries: number;
  averageDuration: number;
  slowQueries: QueryPerformanceMetrics[];
  optimizations: QueryOptimization[];
  recommendations: string[];
}

class QueryOptimizationService {
  private static instance: QueryOptimizationService;
  private metrics: QueryPerformanceMetrics[] = [];
  private maxMetricsHistory = 1000;

  public static getInstance(): QueryOptimizationService {
    if (!QueryOptimizationService.instance) {
      QueryOptimizationService.instance = new QueryOptimizationService();
    }
    return QueryOptimizationService.instance;
  }

  private constructor() {
    logger.info('QueryOptimizationService initialized');
  }

  /**
   * Track query performance
   */
  async trackQuery(
    collection: string,
    operation: QueryPerformanceMetrics['operation'],
    parameters: Record<string, any>,
    startTime: number,
    success: boolean,
    errorMessage?: string,
    resultCount?: number
  ): Promise<void> {
    const duration = Date.now() - startTime;
    
    const metric: QueryPerformanceMetrics = {
      queryId: this.generateQueryId(collection, operation, parameters),
      collection,
      operation,
      duration,
      timestamp: new Date().toISOString(),
      parameters,
      success,
      errorMessage,
      resultCount
    };

    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics = this.metrics.slice(-this.maxMetricsHistory);
    }

    // Log slow queries
    if (duration > 1000) {
      logger.warn(`Slow query detected: ${collection}.${operation} took ${duration}ms`, {
        parameters,
        duration,
        success
      });
    }
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): PerformanceReport {
    const recentMetrics = this.metrics.filter(
      m => Date.now() - new Date(m.timestamp).getTime() < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    const totalQueries = recentMetrics.length;
    const averageDuration = totalQueries > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) / totalQueries 
      : 0;

    const slowQueries = recentMetrics
      .filter(m => m.duration > 1000)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const optimizations = this.generateOptimizations(recentMetrics);
    const recommendations = this.generateRecommendations(recentMetrics, optimizations);

    return {
      totalQueries,
      averageDuration,
      slowQueries,
      optimizations,
      recommendations
    };
  }

  /**
   * Analyze query patterns
   */
  analyzeQueryPatterns(): {
    mostUsedCollections: Array<{ collection: string; count: number }>;
    slowestOperations: Array<{ operation: string; averageDuration: number }>;
    commonFilters: Array<{ filter: string; count: number }>;
  } {
    const collectionUsage = new Map<string, number>();
    const operationDurations = new Map<string, { total: number; count: number }>();
    const filterUsage = new Map<string, number>();

    this.metrics.forEach(metric => {
      // Collection usage
      collectionUsage.set(metric.collection, (collectionUsage.get(metric.collection) || 0) + 1);

      // Operation durations
      const opKey = `${metric.collection}.${metric.operation}`;
      const current = operationDurations.get(opKey) || { total: 0, count: 0 };
      operationDurations.set(opKey, {
        total: current.total + metric.duration,
        count: current.count + 1
      });

      // Filter usage
      Object.keys(metric.parameters).forEach(key => {
        if (key.startsWith('filter') || key.includes('equal') || key.includes('range')) {
          filterUsage.set(key, (filterUsage.get(key) || 0) + 1);
        }
      });
    });

    return {
      mostUsedCollections: Array.from(collectionUsage.entries())
        .map(([collection, count]) => ({ collection, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),

      slowestOperations: Array.from(operationDurations.entries())
        .map(([operation, data]) => ({
          operation,
          averageDuration: data.total / data.count
        }))
        .sort((a, b) => b.averageDuration - a.averageDuration)
        .slice(0, 10),

      commonFilters: Array.from(filterUsage.entries())
        .map(([filter, count]) => ({ filter, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    };
  }

  /**
   * Generate query optimizations
   */
  private generateOptimizations(metrics: QueryPerformanceMetrics[]): QueryOptimization[] {
    const optimizations: QueryOptimization[] = [];

    // Analyze slow queries
    const slowQueries = metrics.filter(m => m.duration > 1000);
    
    slowQueries.forEach(metric => {
      // Check for missing limits
      if (metric.operation === 'list' && !metric.parameters.limit) {
        optimizations.push({
          queryId: metric.queryId,
          suggestion: 'Add limit parameter to list query',
          impact: 'high',
          category: 'limit',
          description: `Query on ${metric.collection} without limit took ${metric.duration}ms`
        });
      }

      // Check for complex filters
      const filterCount = Object.keys(metric.parameters).filter(k => 
        k.includes('equal') || k.includes('range') || k.includes('search')
      ).length;

      if (filterCount > 3) {
        optimizations.push({
          queryId: metric.queryId,
          suggestion: 'Consider adding database index for multiple filters',
          impact: 'medium',
          category: 'index',
          description: `Query with ${filterCount} filters took ${metric.duration}ms`
        });
      }
    });

    return optimizations;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(
    metrics: QueryPerformanceMetrics[], 
    optimizations: QueryOptimization[]
  ): string[] {
    const recommendations: string[] = [];

    const averageDuration = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length 
      : 0;

    if (averageDuration > 500) {
      recommendations.push('Consider implementing query caching for frequently accessed data');
    }

    const slowQueryCount = metrics.filter(m => m.duration > 1000).length;
    if (slowQueryCount > metrics.length * 0.1) {
      recommendations.push('More than 10% of queries are slow - consider database optimization');
    }

    const errorRate = metrics.filter(m => !m.success).length / metrics.length;
    if (errorRate > 0.05) {
      recommendations.push('High error rate detected - review error handling and data validation');
    }

    const highImpactOptimizations = optimizations.filter(o => o.impact === 'high').length;
    if (highImpactOptimizations > 0) {
      recommendations.push(`${highImpactOptimizations} high-impact optimizations available`);
    }

    return recommendations;
  }

  /**
   * Generate unique query ID
   */
  private generateQueryId(collection: string, operation: string, parameters: Record<string, any>): string {
    const paramString = Object.keys(parameters)
      .sort()
      .map(key => `${key}=${parameters[key]}`)
      .join('&');
    
    return `${collection}.${operation}.${this.hashString(paramString)}`;
  }

  /**
   * Simple hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.metrics = [];
    logger.info('Query optimization metrics cleared');
  }

  /**
   * Get metrics for specific collection
   */
  getCollectionMetrics(collection: string): QueryPerformanceMetrics[] {
    return this.metrics.filter(m => m.collection === collection);
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

// Export singleton instance
export const queryOptimizationService = QueryOptimizationService.getInstance();
export default queryOptimizationService;
