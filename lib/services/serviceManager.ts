/**
 * @fileoverview Service Manager
 * @description Centralized service management and health monitoring
 */

import { authService, AuthService } from '../auth/authService';
import { storageService, StorageService } from '../storage/storageService';
import { functionsService, FunctionsService } from '../functions/functionsService';
import { db, collections } from '../database';
import { account, databases, storage, functions } from '../appwrite';
import { logger } from '../logging/logger';
import { environment } from '../environment';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  error?: string;
  lastChecked: string;
  details?: Record<string, any>;
}

export interface ServiceManagerConfig {
  enableHealthChecks: boolean;
  healthCheckInterval: number;
  timeout: number;
  retryAttempts: number;
}

export interface ServiceStatus {
  auth: ServiceHealth;
  database: ServiceHealth;
  storage: ServiceHealth;
  functions: ServiceHealth;
  overall: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
}

/**
 * Service Manager Class
 */
export class ServiceManager {
  private static instance: ServiceManager;
  private config: ServiceManagerConfig;
  private healthCheckInterval?: NodeJS.Timeout;
  private lastHealthCheck: ServiceStatus | null = null;

  private constructor(config: Partial<ServiceManagerConfig> = {}) {
    this.config = {
      enableHealthChecks: true,
      healthCheckInterval: 60000, // 1 minute
      timeout: 10000, // 10 seconds
      retryAttempts: 3,
      ...config,
    };
  }

  static getInstance(config?: Partial<ServiceManagerConfig>): ServiceManager {
    if (!ServiceManager.instance) {
      ServiceManager.instance = new ServiceManager(config);
    }
    return ServiceManager.instance;
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    try {
      logger.info('Initializing service manager');

      // Initialize authentication service
      await authService.initialize();

      // Start health checks if enabled
      if (this.config.enableHealthChecks) {
        this.startHealthChecks();
      }

      logger.info('Service manager initialized successfully');
    } catch (error: any) {
      logger.error('Service manager initialization failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all service instances
   */
  getServices() {
    return {
      auth: authService,
      storage: storageService,
      functions: functionsService,
      database: db,
    };
  }

  /**
   * Check health of a specific service
   */
  async checkServiceHealth(serviceName: string): Promise<ServiceHealth> {
    const startTime = Date.now();
    
    try {
      let health: ServiceHealth = {
        name: serviceName,
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
      };

      switch (serviceName) {
        case 'auth':
          health = await this.checkAuthHealth(startTime);
          break;
        case 'database':
          health = await this.checkDatabaseHealth(startTime);
          break;
        case 'storage':
          health = await this.checkStorageHealth(startTime);
          break;
        case 'functions':
          health = await this.checkFunctionsHealth(startTime);
          break;
        default:
          health = {
            name: serviceName,
            status: 'unhealthy',
            error: 'Unknown service',
            lastChecked: new Date().toISOString(),
          };
      }

      return health;
    } catch (error: any) {
      return {
        name: serviceName,
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check authentication service health
   */
  private async checkAuthHealth(startTime: number): Promise<ServiceHealth> {
    try {
      // Try to get current account (this will fail if not authenticated, but that's ok)
      await account.get();
      
      return {
        name: 'auth',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: {
          configured: true,
          hasSession: authService.isAuthenticated(),
        },
      };
    } catch (error: any) {
      // If it's an authentication error, that's expected when not logged in
      if (error.type === 'general_unauthorized_scope' || error.type === 'user_session_not_found') {
        return {
          name: 'auth',
          status: 'healthy',
          responseTime: Date.now() - startTime,
          lastChecked: new Date().toISOString(),
          details: {
            configured: true,
            hasSession: false,
            message: 'Service is working, no active session',
          },
        };
      }

      return {
        name: 'auth',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check database service health
   */
  private async checkDatabaseHealth(startTime: number): Promise<ServiceHealth> {
    try {
      // Try to list a collection (this will work even if collection is empty)
      const { error } = await db.list(collections.USER_PROFILES, []);
      
      if (error && !error.message.includes('collection') && !error.message.includes('not found')) {
        throw error;
      }

      return {
        name: 'database',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: {
          configured: true,
          endpoint: environment.appwrite.endpoint,
          projectId: environment.appwrite.projectId,
          databaseId: environment.appwrite.databaseId,
        },
      };
    } catch (error: any) {
      return {
        name: 'database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check storage service health
   */
  private async checkStorageHealth(startTime: number): Promise<ServiceHealth> {
    try {
      // Try to list buckets
      await storage.listBuckets();
      
      return {
        name: 'storage',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: {
          configured: true,
        },
      };
    } catch (error: any) {
      return {
        name: 'storage',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check functions service health
   */
  private async checkFunctionsHealth(startTime: number): Promise<ServiceHealth> {
    try {
      // Try to list functions
      await functions.list();
      
      return {
        name: 'functions',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        details: {
          configured: true,
        },
      };
    } catch (error: any) {
      return {
        name: 'functions',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  /**
   * Check health of all services
   */
  async checkAllServicesHealth(): Promise<ServiceStatus> {
    logger.info('Checking health of all services');

    const services = ['auth', 'database', 'storage', 'functions'];
    const healthChecks = await Promise.all(
      services.map(service => this.checkServiceHealth(service))
    );

    const serviceHealth = healthChecks.reduce((acc, health) => {
      acc[health.name as keyof Omit<ServiceStatus, 'overall' | 'timestamp'>] = health;
      return acc;
    }, {} as Omit<ServiceStatus, 'overall' | 'timestamp'>);

    // Determine overall status
    const unhealthyCount = healthChecks.filter(h => h.status === 'unhealthy').length;
    const degradedCount = healthChecks.filter(h => h.status === 'degraded').length;
    
    let overall: 'healthy' | 'unhealthy' | 'degraded' = 'healthy';
    if (unhealthyCount > 0) {
      overall = 'unhealthy';
    } else if (degradedCount > 0) {
      overall = 'degraded';
    }

    const status: ServiceStatus = {
      ...serviceHealth,
      overall,
      timestamp: new Date().toISOString(),
    };

    this.lastHealthCheck = status;
    
    logger.info('Service health check completed', { 
      overall, 
      unhealthy: unhealthyCount, 
      degraded: degradedCount 
    });

    return status;
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.checkAllServicesHealth();
      } catch (error: any) {
        logger.error('Health check failed', { error: error.message });
      }
    }, this.config.healthCheckInterval);

    logger.info('Health checks started', { 
      interval: this.config.healthCheckInterval 
    });
  }

  /**
   * Stop periodic health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      logger.info('Health checks stopped');
    }
  }

  /**
   * Get last health check results
   */
  getLastHealthCheck(): ServiceStatus | null {
    return this.lastHealthCheck;
  }

  /**
   * Get service configuration
   */
  getConfig(): ServiceManagerConfig {
    return { ...this.config };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<ServiceManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart health checks if interval changed
    if (newConfig.healthCheckInterval && this.healthCheckInterval) {
      this.startHealthChecks();
    }
    
    logger.info('Service configuration updated', { config: this.config });
  }

  /**
   * Test all services
   */
  async testAllServices(): Promise<{
    success: boolean;
    results: Record<string, { success: boolean; error?: string }>;
  }> {
    logger.info('Testing all services');

    const results: Record<string, { success: boolean; error?: string }> = {};

    // Test authentication
    try {
      await authService.initialize();
      results.auth = { success: true };
    } catch (error: any) {
      results.auth = { success: false, error: error.message };
    }

    // Test database
    try {
      await db.list(collections.USER_PROFILES, []);
      results.database = { success: true };
    } catch (error: any) {
      results.database = { success: false, error: error.message };
    }

    // Test storage
    try {
      await storageService.testStorage();
      results.storage = { success: true };
    } catch (error: any) {
      results.storage = { success: false, error: error.message };
    }

    // Test functions
    try {
      await functionsService.testFunctions();
      results.functions = { success: true };
    } catch (error: any) {
      results.functions = { success: false, error: error.message };
    }

    const success = Object.values(results).every(result => result.success);
    
    logger.info('Service testing completed', { 
      success, 
      results: Object.keys(results).length 
    });

    return { success, results };
  }

  /**
   * Get service statistics
   */
  async getServiceStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    try {
      // Get storage stats
      const storageStats = await storageService.getStorageStats();
      if (storageStats.success) {
        stats.storage = storageStats.data;
      }
    } catch (error) {
      logger.warn('Failed to get storage stats', { error: (error as Error).message });
    }

    try {
      // Get function stats
      const functionStats = await functionsService.getFunctionStats();
      if (functionStats.success) {
        stats.functions = functionStats.data;
      }
    } catch (error) {
      logger.warn('Failed to get function stats', { error: (error as Error).message });
    }

    return stats;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopHealthChecks();
    logger.info('Service manager cleaned up');
  }
}

// Export singleton instance
export const serviceManager = ServiceManager.getInstance();

export default serviceManager;
