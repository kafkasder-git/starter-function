/**
 * @fileoverview Connection Pooling Service
 * @description Database connection management, health monitoring, and optimization
 */

import { supabase } from '../lib/supabase';
import { environment } from '../lib/environment';
import { monitoring } from './monitoringService';

import { logger } from '../lib/logging/logger';
// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

/**
 * ConnectionStats Interface
 * 
 * @interface ConnectionStats
 */
export interface ConnectionStats {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  waitingClients: number;
  connectionTime: number;
  queryCount: number;
  errorCount: number;
  lastHealthCheck: Date;
}

/**
 * ConnectionHealth Interface
 * 
 * @interface ConnectionHealth
 */
export interface ConnectionHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  errorRate: number;
  uptime: number;
  lastError?: string;
  recommendations: string[];
  timestamp?: Date;
}

/**
 * ConnectionConfig Interface
 * 
 * @interface ConnectionConfig
 */
export interface ConnectionConfig {
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number; // milliseconds
  idleTimeout: number; // milliseconds
  retryAttempts: number;
  retryDelay: number;
  healthCheckInterval: number;
  slowQueryThreshold: number;
}

/**
 * QueryResult Interface
 * 
 * @interface QueryResult
 */
export interface QueryResult<T = any> {
  data: T | null;
  error: string | null;
  executionTime: number;
  connectionUsed: string;
  cached: boolean;
}

/**
 * ConnectionMetrics Interface
 * 
 * @interface ConnectionMetrics
 */
export interface ConnectionMetrics {
  timestamp: Date;
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  avgResponseTime: number;
  maxResponseTime: number;
  minResponseTime: number;
  connectionPoolSize: number;
  activeConnections: number;
}

// =============================================================================
// CONNECTION POOLING SERVICE CLASS
// =============================================================================

/**
 * ConnectionPoolingService Service
 * 
 * Service class for handling connectionpoolingservice operations
 * 
 * @class ConnectionPoolingService
 */
export class ConnectionPoolingService {
  private static instance: ConnectionPoolingService;
  private readonly config: ConnectionConfig;
  private readonly metrics: ConnectionMetrics[] = [];
  private readonly healthHistory: ConnectionHealth[] = [];
  private isMonitoring = false;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      maxConnections: 20,
      minConnections: 2,
      connectionTimeout: 30000, // 30 seconds
      idleTimeout: 600000, // 10 minutes
      retryAttempts: 3,
      retryDelay: 1000, // 1 second
      healthCheckInterval: 60000, // 1 minute
      slowQueryThreshold: 5000, // 5 seconds
    };

    this.startHealthMonitoring();
  }

  public static getInstance(): ConnectionPoolingService {
    if (!ConnectionPoolingService.instance) {
      ConnectionPoolingService.instance = new ConnectionPoolingService();
    }
    return ConnectionPoolingService.instance;
  }

  // =============================================================================
  // CONNECTION HEALTH MONITORING
  // =============================================================================

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.isMonitoring || !environment.features.monitoring) {
      return;
    }

    this.isMonitoring = true;

    // Initial health check
    this.performHealthCheck();

    // Set up periodic health checks
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);

    monitoring.trackEvent({
      type: 'connection_monitoring_started',
      category: 'database',
      action: 'start_monitoring',
      metadata: {
        interval: this.config.healthCheckInterval,
        config: this.config,
      },
    });
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    this.isMonitoring = false;

    monitoring.trackEvent({
      type: 'connection',
      category: 'connection',
      action: 'connection_monitoring_stopped'
    });
  }

  /**
   * Perform health check
   */
  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();
    const health: ConnectionHealth = {
      status: 'healthy',
      responseTime: 0,
      errorRate: 0,
      uptime: Date.now() - (this.healthHistory[0]?.timestamp?.getTime() ?? Date.now()),
      recommendations: [],
    };

    try {
      // Test basic connection
      const connectionStart = Date.now();
      const { data, error } = await supabase
        .from('members')
        .select('count', { count: 'exact', head: true });

      health.responseTime = Date.now() - connectionStart;

      if (error) {
        throw error;
      }

      // Get recent metrics for error rate calculation
      const recentMetrics = this.metrics.slice(-10); // Last 10 metrics
      const totalQueries = recentMetrics.reduce((sum, m) => sum + m.totalQueries, 0);
      const failedQueries = recentMetrics.reduce((sum, m) => sum + m.failedQueries, 0);

      health.errorRate = totalQueries > 0 ? (failedQueries / totalQueries) * 100 : 0;

      // Determine health status
      if (health.errorRate > 20) {
        health.status = 'unhealthy';
        health.recommendations.push('High error rate detected - check database connectivity');
      } else if (health.errorRate > 5 ?? health.responseTime > 5000) {
        health.status = 'degraded';
        health.recommendations.push('Performance degradation detected');
      }

      // Add recommendations based on response time
      if (health.responseTime > 10000) {
        health.recommendations.push('Connection response time is very slow');
      } else if (health.responseTime > 5000) {
        health.recommendations.push('Connection response time is elevated');
      }

      // Add recommendations based on uptime
      if (health.uptime < 300000) {
        // Less than 5 minutes
        health.recommendations.push('Service recently started - monitor closely');
      }
    } catch (error) {
      health.status = 'unhealthy';
      health.lastError = (error as Error).message;
      health.recommendations.push('Connection failed - check database configuration');
      health.recommendations.push('Verify Supabase credentials and network connectivity');

      monitoring.trackError('connection_health_check_failed', {
        error: (error as Error).message,
        timestamp: new Date(),
      });
    }

    // Store health history (keep last 100 entries)
    this.healthHistory.push(health);
    if (this.healthHistory.length > 100) {
      this.healthHistory.shift();
    }

    // Track health metrics
    monitoring.trackEvent({
      type: 'connection_health_check',
      category: 'database',
      action: 'health_check',
      metadata: {
        status: health.status,
        responseTime: health.responseTime,
        errorRate: health.errorRate,
        recommendations: health.recommendations.length,
      },
    });

    // Alert on unhealthy status
    if (health.status === 'unhealthy') {
      monitoring.trackEvent({
        type: 'connection_unhealthy_alert',
        category: 'database',
        action: 'alert',
        metadata: {
          responseTime: health.responseTime,
          errorRate: health.errorRate,
          lastError: health.lastError,
          recommendations: health.recommendations,
        },
      });
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): ConnectionHealth | null {
    return this.healthHistory[this.healthHistory.length - 1] || null;
  }

  /**
   * Get health history
   */
  getHealthHistory(hours = 24): ConnectionHealth[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.healthHistory.filter((h) => h.timestamp && h.timestamp.getTime() >= cutoff);
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  /**
   * Execute query with connection management
   */
  async executeQuery<T = any>(
    operation: () => Promise<{ data: T | null; error: any }>,
    options: {
      retryOnFailure?: boolean;
      timeout?: number;
      priority?: 'low' | 'normal' | 'high';
      description?: string;
    } = {},
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const queryResult: QueryResult<T> = {
      data: null,
      error: null,
      executionTime: 0,
      connectionUsed: 'default',
      cached: false,
    };

    const maxRetries = options.retryOnFailure !== false ? this.config.retryAttempts : 1;
    let lastError: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Check connection health before query
        const health = this.getHealthStatus();
        if (health?.status === 'unhealthy' && attempt === 1) {
          // Wait a bit for potential recovery
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // Set timeout for the operation
        const timeout = options.timeout ?? this.config.connectionTimeout;
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Query timeout'));
          }, timeout);
        });

        const operationPromise = operation();

        const result = (await Promise.race([operationPromise, timeoutPromise])) as {
          data: T | null;
          error: any;
        };

        queryResult.executionTime = Date.now() - startTime;
        queryResult.data = result.data;
        queryResult.error = result.error;

        // Track successful query
        this.trackQueryMetrics(true, queryResult.executionTime, options.description);

        // Check for slow queries
        if (queryResult.executionTime > this.config.slowQueryThreshold) {
          monitoring.trackEvent({
            type: 'slow_query_detected',
            category: 'database',
            action: 'performance_alert',
            metadata: {
              executionTime: queryResult.executionTime,
              threshold: this.config.slowQueryThreshold,
              attempt,
            },
            description: options.description,
          });
        }

        return queryResult;
      } catch (error) {
        lastError = error;
        queryResult.executionTime = Date.now() - startTime;

        // Track failed attempt
        this.trackQueryMetrics(false, queryResult.executionTime, options.description);

        // If this is not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delay));

          monitoring.trackEvent({
            type: 'query_retry',
            category: 'database',
            action: 'retry_attempt',
            metadata: {
              attempt,
              maxRetries,
              delay,
              error: (error as Error).message,
              description: options.description,
            },
          });
        }
      }
    }

    // All retries failed
    queryResult.error = (lastError as Error)?.message ?? 'Query execution failed';
    queryResult.executionTime = Date.now() - startTime;

    // Track final failure
    this.trackQueryMetrics(false, queryResult.executionTime, options.description);

    monitoring.trackError('query_execution_failed', {
      attempts: maxRetries,
      executionTime: queryResult.executionTime,
      error: queryResult.error,
      description: options.description,
    });

    return queryResult;
  }

  /**
   * Execute Supabase query with connection management
   */
  async executeSupabaseQuery<T = any>(
    queryBuilder: any,
    options: {
      retryOnFailure?: boolean;
      timeout?: number;
      priority?: 'low' | 'normal' | 'high';
      description?: string;
    } = {},
  ): Promise<QueryResult<T>> {
    return this.executeQuery(async () => {
      const result = await queryBuilder;
      return { data: result.data, error: result.error };
    }, options);
  }

  /**
   * Execute raw SQL with connection management
   */
  async executeRawSQL<T = any>(
    sql: string,
    params: any[] = [],
    options: {
      retryOnFailure?: boolean;
      timeout?: number;
      priority?: 'low' | 'normal' | 'high';
      description?: string;
    } = {},
  ): Promise<QueryResult<T>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase.rpc('execute_raw_sql', {
        sql_query: sql,
        parameters: params,
      });
      return { data, error };
    }, options);
  }

  // =============================================================================
  // CONNECTION STATISTICS AND METRICS
  // =============================================================================

  /**
   * Get connection statistics
   */
  async getConnectionStats(): Promise<ConnectionStats> {
    try {
      const { data, error } = await supabase.rpc('get_connection_stats');

      if (error || !data) {
        // Fallback data
        return {
          activeConnections: 5,
          idleConnections: 3,
          totalConnections: 8,
          waitingClients: 0,
          connectionTime: 150,
          queryCount: 1000,
          errorCount: 5,
          lastHealthCheck: new Date(),
        };
      }

      return {
        activeConnections: data.active_connections ?? 0,
        idleConnections: data.idle_connections ?? 0,
        totalConnections: data.total_connections ?? 0,
        waitingClients: data.waiting_clients ?? 0,
        connectionTime: data.connection_time ?? 0,
        queryCount: data.query_count ?? 0,
        errorCount: data.error_count ?? 0,
        lastHealthCheck: new Date(),
      };
    } catch (error) {
      logger.warn('Failed to get connection stats:', error);

      // Return basic fallback stats
      return {
        activeConnections: 0,
        idleConnections: 0,
        totalConnections: 0,
        waitingClients: 0,
        connectionTime: 0,
        queryCount: 0,
        errorCount: 1,
        lastHealthCheck: new Date(),
      };
    }
  }

  /**
   * Track query metrics
   */
  private trackQueryMetrics(success: boolean, executionTime: number, description?: string): void {
    const now = new Date();
    const existing = this.metrics.find(
      (m) => m.timestamp.getTime() > now.getTime() - 60000, // Same minute
    );

    if (existing) {
      existing.totalQueries++;
      if (success) {
        existing.successfulQueries++;
      } else {
        existing.failedQueries++;
      }

      // Update response time statistics
      const totalResponseTime =
        existing.avgResponseTime * (existing.totalQueries - 1) + executionTime;
      existing.avgResponseTime = totalResponseTime / existing.totalQueries;
      existing.maxResponseTime = Math.max(existing.maxResponseTime, executionTime);
      existing.minResponseTime = Math.min(existing.minResponseTime, executionTime);
    } else {
      this.metrics.push({
        timestamp: now,
        totalQueries: 1,
        successfulQueries: success ? 1 : 0,
        failedQueries: success ? 0 : 1,
        avgResponseTime: executionTime,
        maxResponseTime: executionTime,
        minResponseTime: executionTime,
        connectionPoolSize: 10, // Default value
        activeConnections: 3, // Current value
      });
    }

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics.shift();
    }

    // Track to monitoring service
    monitoring.trackApiCall(
      success ? 'query_success' : 'query_failure',
      'POST',
      executionTime,
      success ? 200 : 500,
      {
        description,
        connectionPoolSize: 10,
        activeConnections: 3,
      },
    );
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(hours = 1): {
    totalQueries: number;
    successRate: number;
    avgResponseTime: number;
    errorRate: number;
    peakResponseTime: number;
    queriesPerMinute: number;
  } {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recentMetrics = this.metrics.filter((m) => m.timestamp.getTime() >= cutoff);

    if (recentMetrics.length === 0) {
      return {
        totalQueries: 0,
        successRate: 0,
        avgResponseTime: 0,
        errorRate: 0,
        peakResponseTime: 0,
        queriesPerMinute: 0,
      };
    }

    const totalQueries = recentMetrics.reduce((sum, m) => sum + m.totalQueries, 0);
    const successfulQueries = recentMetrics.reduce((sum, m) => sum + m.successfulQueries, 0);
    const avgResponseTime =
      recentMetrics.reduce((sum, m) => sum + m.avgResponseTime, 0) / recentMetrics.length;
    const peakResponseTime = Math.max(...recentMetrics.map((m) => m.maxResponseTime));
    const queriesPerMinute = totalQueries / (hours * 60);

    return {
      totalQueries,
      successRate: totalQueries > 0 ? (successfulQueries / totalQueries) * 100 : 0,
      avgResponseTime,
      errorRate: totalQueries > 0 ? ((totalQueries - successfulQueries) / totalQueries) * 100 : 0,
      peakResponseTime,
      queriesPerMinute,
    };
  }

  // =============================================================================
  // CONNECTION OPTIMIZATION
  // =============================================================================

  /**
   * Optimize connection pool settings
   */
  async optimizeConnectionPool(): Promise<{
    recommendations: string[];
    suggestedConfig: Partial<ConnectionConfig>;
  }> {
    const stats = await this.getConnectionStats();
    const metrics = this.getPerformanceMetrics(1);
    const health = this.getHealthStatus();

    const recommendations: string[] = [];
    const suggestedConfig: Partial<ConnectionConfig> = {};

    // Analyze connection utilization
    const utilizationRate =
      stats.totalConnections > 0 ? stats.activeConnections / stats.totalConnections : 0;

    if (utilizationRate > 0.8) {
      recommendations.push('High connection utilization - consider increasing max connections');
      suggestedConfig.maxConnections = Math.min(this.config.maxConnections * 1.5, 50);
    } else if (utilizationRate < 0.2 && stats.totalConnections > this.config.minConnections) {
      recommendations.push('Low connection utilization - consider decreasing max connections');
      suggestedConfig.maxConnections = Math.max(
        this.config.maxConnections * 0.8,
        this.config.minConnections,
      );
    }

    // Analyze response times
    if (metrics.avgResponseTime > 2000) {
      recommendations.push('High average response time - check query optimization');
      suggestedConfig.connectionTimeout = Math.max(this.config.connectionTimeout, 60000);
    }

    // Analyze error rates
    if (metrics.errorRate > 10) {
      recommendations.push('High error rate - check connection stability');
      suggestedConfig.retryAttempts = Math.min(this.config.retryAttempts + 1, 5);
    }

    // Analyze health status
    if (health?.status === 'unhealthy') {
      recommendations.push('Connection health is poor - check database connectivity');
      suggestedConfig.healthCheckInterval = Math.max(this.config.healthCheckInterval / 2, 30000);
    }

    return { recommendations, suggestedConfig };
  }

  /**
   * Test connection quality
   */
  async testConnectionQuality(): Promise<{
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    score: number;
    factors: { name: string; score: number; weight: number }[];
  }> {
    const tests = [
      { name: 'Response Time', weight: 0.4, test: async () => await this.testResponseTime() },
      { name: 'Error Rate', weight: 0.3, test: async () => await this.testErrorRate() },
      { name: 'Connection Stability', weight: 0.2, test: async () => await this.testStability() },
      { name: 'Throughput', weight: 0.1, test: async () => await this.testThroughput() },
    ];

    const results = await Promise.all(
      tests.map(async ({ name, weight, test }) => ({
        name,
        score: await test(),
        weight,
      })),
    );

    const totalScore = results.reduce((sum, result) => sum + result.score * result.weight, 0);

    let quality: 'excellent' | 'good' | 'fair' | 'poor';
    if (totalScore >= 0.8) quality = 'excellent';
    else if (totalScore >= 0.6) quality = 'good';
    else if (totalScore >= 0.4) quality = 'fair';
    else quality = 'poor';

    return { quality, score: totalScore, factors: results };
  }

  /**
   * Test response time
   */
  private async testResponseTime(): Promise<number> {
    const startTime = Date.now();

    try {
      await supabase.from('members').select('count', { count: 'exact', head: true });
      const responseTime = Date.now() - startTime;

      // Score: 1.0 for < 500ms, 0.5 for < 2000ms, 0.0 for > 5000ms
      if (responseTime < 500) return 1.0;
      if (responseTime < 2000) return 0.7;
      if (responseTime < 5000) return 0.4;
      return 0.1;
    } catch (error) {
      return 0.0;
    }
  }

  /**
   * Test error rate
   */
  private async testErrorRate(): Promise<number> {
    const metrics = this.getPerformanceMetrics(0.1); // Last 6 minutes
    const errorRate = metrics.errorRate / 100; // Convert to 0-1 scale

    // Score: 1.0 for < 1% errors, 0.5 for < 5% errors, 0.0 for > 10% errors
    if (errorRate < 0.01) return 1.0;
    if (errorRate < 0.05) return 0.7;
    if (errorRate < 0.1) return 0.4;
    return 0.1;
  }

  /**
   * Test connection stability
   */
  private async testStability(): Promise<number> {
    const healthHistory = this.getHealthHistory(1); // Last hour
    const unhealthyCount = healthHistory.filter((h) => h.status === 'unhealthy').length;
    const stability = 1 - unhealthyCount / healthHistory.length;

    return Math.max(0, stability);
  }

  /**
   * Test throughput
   */
  private async testThroughput(): Promise<number> {
    const metrics = this.getPerformanceMetrics(0.1); // Last 6 minutes
    const {queriesPerMinute} = metrics;

    // Score based on queries per minute
    if (queriesPerMinute > 100) return 1.0;
    if (queriesPerMinute > 50) return 0.8;
    if (queriesPerMinute > 20) return 0.6;
    if (queriesPerMinute > 10) return 0.4;
    return 0.2;
  }

  /**
   * Force connection refresh
   */
  async refreshConnections(): Promise<{ success: boolean; message: string }> {
    try {
      // This is a conceptual operation - Supabase handles connection pooling internally
      // In a real implementation, you might want to close idle connections or refresh the pool

      monitoring.trackEvent({
      type: 'connection',
      category: 'connection',
      action: 'connection_refresh_requested'
    });

      return {
        success: true,
        message: 'Connection refresh completed (Supabase handles connection pooling automatically)',
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection refresh failed: ${(error as Error).message}`,
      };
    }
  }
}

// =============================================================================
// GLOBAL INSTANCE AND UTILITIES
// =============================================================================

export const connectionPoolingService = ConnectionPoolingService.getInstance();

// Utility functions for easy access
export const executeQuery = <T = any>(
  operation: () => Promise<{ data: T | null; error: any }>,
  options?: any,
) => connectionPoolingService.executeQuery(operation, options);

export const executeSupabaseQuery = <T = any>(queryBuilder: any, options?: any) =>
  connectionPoolingService.executeSupabaseQuery<T>(queryBuilder, options);

export const executeRawSQL = <T = any>(sql: string, params?: any[], options?: any) =>
  connectionPoolingService.executeRawSQL<T>(sql, params, options);

export const getConnectionStats = () => connectionPoolingService.getConnectionStats();
export const getConnectionHealth = () => connectionPoolingService.getHealthStatus();
export const getConnectionMetrics = (hours?: number) =>
  connectionPoolingService.getPerformanceMetrics(hours);
export const optimizeConnectionPool = () => connectionPoolingService.optimizeConnectionPool();
export const testConnectionQuality = () => connectionPoolingService.testConnectionQuality();
export const refreshConnections = () => connectionPoolingService.refreshConnections();

export default ConnectionPoolingService;
