/**
 * @fileoverview Connection Pooling Service
 * @description Service for managing database connections and connection pooling
 */

import { logger } from '@/lib/logging/logger';

export interface ConnectionMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  connectionWaitTime: number;
  averageConnectionTime: number;
  failedConnections: number;
  lastResetTime: string;
}

export interface PoolConfiguration {
  minConnections: number;
  maxConnections: number;
  idleTimeout: number;
  connectionTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export interface ConnectionEvent {
  type: 'acquired' | 'released' | 'created' | 'destroyed' | 'failed';
  connectionId: string;
  timestamp: string;
  duration?: number;
  error?: string;
}

class ConnectionPoolingService {
  private static instance: ConnectionPoolingService;
  private activeConnections = 0;
  private idleConnections = 0;
  private totalConnections = 0;
  private connectionWaitTime = 0;
  private connectionTimes: number[] = [];
  private failedConnections = 0;
  private lastResetTime = new Date().toISOString();
  private events: ConnectionEvent[] = [];
  private maxEventsHistory = 1000;

  private config: PoolConfiguration = {
    minConnections: 2,
    maxConnections: 10,
    idleTimeout: 30000, // 30 seconds
    connectionTimeout: 5000, // 5 seconds
    retryAttempts: 3,
    retryDelay: 1000 // 1 second
  };

  public static getInstance(): ConnectionPoolingService {
    if (!ConnectionPoolingService.instance) {
      ConnectionPoolingService.instance = new ConnectionPoolingService();
    }
    return ConnectionPoolingService.instance;
  }

  private constructor() {
    this.initializePool();
    logger.info('ConnectionPoolingService initialized');
  }

  /**
   * Initialize connection pool
   */
  private async initializePool(): Promise<void> {
    try {
      // Create minimum connections
      for (let i = 0; i < this.config.minConnections; i++) {
        await this.createConnection();
      }
      
      logger.info(`Initialized connection pool with ${this.config.minConnections} connections`);
    } catch (error) {
      logger.error('Failed to initialize connection pool', error);
    }
  }

  /**
   * Acquire connection from pool
   */
  async acquireConnection(): Promise<{ connectionId: string; success: boolean; error?: string }> {
    const startTime = Date.now();
    
    try {
      let connectionId: string;
      
      // Try to get idle connection first
      if (this.idleConnections > 0) {
        this.idleConnections--;
        this.activeConnections++;
        connectionId = this.generateConnectionId();
        
        this.logEvent({
          type: 'acquired',
          connectionId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        });
        
        return { connectionId, success: true };
      }
      
      // Create new connection if under limit
      if (this.totalConnections < this.config.maxConnections) {
        connectionId = await this.createConnection();
        
        this.logEvent({
          type: 'acquired',
          connectionId,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime
        });
        
        return { connectionId, success: true };
      }
      
      // Wait for available connection
      connectionId = await this.waitForConnection();
      
      this.logEvent({
        type: 'acquired',
        connectionId,
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime
      });
      
      return { connectionId, success: true };
      
    } catch (error) {
      this.failedConnections++;
      this.connectionWaitTime += Date.now() - startTime;
      
      this.logEvent({
        type: 'failed',
        connectionId: 'unknown',
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      logger.error('Failed to acquire connection', error);
      return { connectionId: '', success: false, error: 'Failed to acquire connection' };
    }
  }

  /**
   * Release connection back to pool
   */
  async releaseConnection(connectionId: string): Promise<void> {
    try {
      if (this.activeConnections > 0) {
        this.activeConnections--;
        
        // Check if we should keep the connection or destroy it
        if (this.totalConnections > this.config.minConnections) {
          this.totalConnections--;
          this.logEvent({
            type: 'destroyed',
            connectionId,
            timestamp: new Date().toISOString()
          });
        } else {
          this.idleConnections++;
          this.logEvent({
            type: 'released',
            connectionId,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (error) {
      logger.error('Failed to release connection', error);
    }
  }

  /**
   * Create new connection
   */
  private async createConnection(): Promise<string> {
    const startTime = Date.now();
    const connectionId = this.generateConnectionId();
    
    try {
      // Simulate connection creation
      await this.simulateConnectionCreation();
      
      this.activeConnections++;
      this.totalConnections++;
      
      const duration = Date.now() - startTime;
      this.connectionTimes.push(duration);
      
      // Keep only recent connection times
      if (this.connectionTimes.length > 100) {
        this.connectionTimes = this.connectionTimes.slice(-100);
      }
      
      this.logEvent({
        type: 'created',
        connectionId,
        timestamp: new Date().toISOString(),
        duration
      });
      
      logger.debug(`Created connection ${connectionId} in ${duration}ms`);
      
      return connectionId;
      
    } catch (error) {
      this.failedConnections++;
      this.logEvent({
        type: 'failed',
        connectionId,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Wait for available connection
   */
  private async waitForConnection(): Promise<string> {
    const maxWaitTime = this.config.connectionTimeout;
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      if (this.idleConnections > 0 || this.totalConnections < this.config.maxConnections) {
        return await this.acquireConnection().then(result => result.connectionId);
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Connection timeout - no available connections');
  }

  /**
   * Simulate connection creation (replace with actual implementation)
   */
  private async simulateConnectionCreation(): Promise<void> {
    // Simulate network delay
    const delay = Math.random() * 1000 + 500; // 500-1500ms
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Connection creation failed');
    }
  }

  /**
   * Get connection metrics
   */
  getMetrics(): ConnectionMetrics {
    const averageConnectionTime = this.connectionTimes.length > 0
      ? this.connectionTimes.reduce((sum, time) => sum + time, 0) / this.connectionTimes.length
      : 0;

    return {
      activeConnections: this.activeConnections,
      idleConnections: this.idleConnections,
      totalConnections: this.totalConnections,
      connectionWaitTime: this.connectionWaitTime,
      averageConnectionTime,
      failedConnections: this.failedConnections,
      lastResetTime: this.lastResetTime
    };
  }

  /**
   * Update pool configuration
   */
  updateConfiguration(newConfig: Partial<PoolConfiguration>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Adjust pool size if needed
    if (newConfig.minConnections && newConfig.minConnections > this.config.minConnections) {
      this.ensureMinimumConnections();
    }
    
    logger.info('Updated connection pool configuration', newConfig);
  }

  /**
   * Ensure minimum connections are available
   */
  private async ensureMinimumConnections(): Promise<void> {
    const needed = this.config.minConnections - this.totalConnections;
    
    for (let i = 0; i < needed; i++) {
      try {
        await this.createConnection();
      } catch (error) {
        logger.error('Failed to create minimum connection', error);
      }
    }
  }

  /**
   * Reset connection pool
   */
  async resetPool(): Promise<void> {
    try {
      // Close all connections
      this.activeConnections = 0;
      this.idleConnections = 0;
      this.totalConnections = 0;
      this.connectionWaitTime = 0;
      this.connectionTimes = [];
      this.failedConnections = 0;
      this.lastResetTime = new Date().toISOString();
      
      // Reinitialize pool
      await this.initializePool();
      
      logger.info('Connection pool reset successfully');
    } catch (error) {
      logger.error('Failed to reset connection pool', error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; issues: string[] }> {
    const issues: string[] = [];
    const metrics = this.getMetrics();
    
    // Check connection limits
    if (metrics.totalConnections >= this.config.maxConnections) {
      issues.push('Connection pool at maximum capacity');
    }
    
    // Check failure rate
    const totalAttempts = metrics.totalConnections + metrics.failedConnections;
    if (totalAttempts > 0 && metrics.failedConnections / totalAttempts > 0.1) {
      issues.push('High connection failure rate detected');
    }
    
    // Check average connection time
    if (metrics.averageConnectionTime > 2000) {
      issues.push('Slow connection creation times');
    }
    
    // Check for idle connections
    if (metrics.idleConnections === 0 && metrics.activeConnections === 0) {
      issues.push('No available connections');
    }
    
    return {
      healthy: issues.length === 0,
      issues
    };
  }

  /**
   * Get connection events
   */
  getEvents(limit?: number): ConnectionEvent[] {
    const events = [...this.events].reverse(); // Most recent first
    
    if (limit) {
      return events.slice(0, limit);
    }
    
    return events;
  }

  /**
   * Clear events history
   */
  clearEvents(): void {
    this.events = [];
    logger.info('Connection events history cleared');
  }

  /**
   * Log connection event
   */
  private logEvent(event: ConnectionEvent): void {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEventsHistory) {
      this.events = this.events.slice(-this.maxEventsHistory);
    }
  }

  /**
   * Generate unique connection ID
   */
  private generateConnectionId(): string {
    return `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export pool statistics
   */
  exportStatistics(): string {
    const stats = {
      metrics: this.getMetrics(),
      configuration: this.config,
      recentEvents: this.getEvents(50),
      exportedAt: new Date().toISOString()
    };
    
    return JSON.stringify(stats, null, 2);
  }
}

// Export singleton instance
export const connectionPoolingService = ConnectionPoolingService.getInstance();
export default connectionPoolingService;
