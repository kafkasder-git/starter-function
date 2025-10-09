/**
 * @fileoverview Services Index - Centralized service exports
 * @description Export all services for easy importing throughout the application
 */

import emailSMSService from './emailSMSService';
import indexManagementService from './indexManagementService';
import nativeFeaturesService from './nativeFeaturesService';
import userManagementService from './userManagementService';
import membersService from './membersService';
import donationsService from './donationsService';
import { beneficiariesService } from './beneficiariesService';
import kumbaraService from './kumbaraService';
import notificationService from './notificationService';
import fileStorageService from './fileStorageService';
import monitoring from './monitoringService';
import exportService from './exportService';
// AI services removed
import queryOptimizationService from './queryOptimizationService';
import connectionPoolingService from './connectionPoolingService';
import cachingService from './cachingService';
import performanceMonitoringService from './performanceMonitoringService';

// =============================================================================
// CORE SERVICES
// =============================================================================

// Base service for common functionality
export { default as baseService } from './baseService';

// =============================================================================
// AUTHENTICATION & AUTHORIZATION
// =============================================================================

// Auth context and services
export { default as userManagementService } from './userManagementService';

// =============================================================================
// DATA SERVICES
// =============================================================================

// Main entity services
export { default as membersService } from './membersService';
export { default as donationsService } from './donationsService';
export { beneficiariesService } from './beneficiariesService';
export { default as kumbaraService } from './kumbaraService';

// Support services
export { default as reportsService } from './reportingService';
export { default as statsService } from './safeStatsService';
export { default as intelligentStatsService } from './intelligentStatsService';

// =============================================================================
// COMMUNICATION SERVICES
// =============================================================================

// Email/SMS notification service
export { EmailSMSService } from './emailSMSService';
export { default as emailSMSService } from './emailSMSService';

// In-app notifications
export { default as notificationService } from './notificationService';

// =============================================================================
// FILE MANAGEMENT
// =============================================================================

// File storage service
export {
  fileStorageService,
  uploadFile,
  uploadFiles,
  listFiles,
  getFileInfo,
  downloadFile,
  getFileUrl,
  deleteFile,
  copyFile,
  getStorageStats,
  testFileStorage,
  type FileUploadOptions,
  type FileListOptions,
  type FileListResult,
} from './fileStorageService';

// =============================================================================
// DATABASE OPTIMIZATION SERVICES
// =============================================================================

// Query optimization service
export {
  queryOptimizationService,
  executePreparedStatement,
  getQueryAnalytics,
  suggestIndexOptimizations,
  QueryOptimizationService,
} from './queryOptimizationService';
export { default as QueryOptimizationServiceClass } from './queryOptimizationService';

// Index management service
export {
  indexManagementService,
  getDatabaseIndexes,
  getTableIndexes,
  analyzeIndexUsage,
  suggestMissingIndexes,
  createIndex,
  dropIndex,
  rebuildIndex,
  analyzeTable,
  vacuumTable,
  getMaintenanceRecommendations,
  type DatabaseIndex,
  type IndexSuggestion,
  type IndexAnalysis,
} from './indexManagementService';

// Connection pooling service
export {
  connectionPoolingService,
  executeQuery,
  executeSupabaseQuery,
  executeRawSQL,
  getConnectionStats,
  getConnectionHealth,
  getConnectionMetrics,
  optimizeConnectionPool,
  testConnectionQuality,
  refreshConnections,
  type ConnectionStats,
  type ConnectionHealth,
  type ConnectionConfig,
  type QueryResult,
  type ConnectionMetrics,
} from './connectionPoolingService';

// Caching service
export {
  cachingService,
  cacheSet,
  cacheGet,
  cacheHas,
  cacheDelete,
  cacheClear,
  cacheClearByTags,
  getCacheStats,
  getCacheStrategies,
  getReactQueryConfig,
  getQueryOptions,
  getMutationOptions,
  getCacheOptimizationRecommendations,
  type CacheEntry,
  type CacheConfig,
  type CacheStats,
  type CacheStrategy,
  type ReactQueryConfig,
} from './cachingService';

// Performance monitoring service
export { performanceMonitoringService } from './performanceMonitoringService';
export { default as performanceMonitoringServiceDefault } from './performanceMonitoringService';

// =============================================================================
// UTILITY SERVICES
// =============================================================================

// AI services removed

// Monitoring and analytics
export { monitoring } from './monitoringService';
export { default as monitoringService } from './monitoringService';

// Export service
export { default as exportService } from './exportService';

// Error tracking removed

// =============================================================================
// NATIVE FEATURES
// =============================================================================

// Native device features
export { default as nativeFeaturesService } from './nativeFeaturesService';

// =============================================================================
// LEGACY SERVICES (TO BE REPLACED)
// =============================================================================

// These services will be replaced by the new comprehensive services above
export { ihtiyacSahipleriService } from './ihtiyacSahipleriService';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

// Re-export common types
export type {
  // Service response types
  ApiResponse,
  PaginatedResponse,
  // Data types
  Member,
  Donation,
} from '../types/database';

export type {
  // Auth types
  User,
  AuthState,
  LoginCredentials,
} from '../types/auth';

export type {
  // Beneficiary types
  Beneficiary,
} from '../types/beneficiary';

export type {
  // Kumbara types
  Kumbara,
} from '../types/kumbara';

// =============================================================================
// SERVICE FACTORIES
// =============================================================================

// Service factory for creating service instances with configuration
export const createServices = () => {
  // TODO: Use _config parameter for service configuration
  // Return configured service instances
  return {
    // Core services
    userManagement: userManagementService,
    members: membersService,
    donations: donationsService,
    beneficiaries: beneficiariesService,
    kumbara: kumbaraService,

    // Communication
    notifications: notificationService,
    emailSMS: emailSMSService,

    // File management
    files: fileStorageService,

    // Utilities
    monitoring,
    export: exportService,

    // AI services removed

    // Native features
    native: nativeFeaturesService,
  };
};

// Default service instance
export const services = createServices();

// =============================================================================
// SERVICE HEALTH CHECK
// =============================================================================

// Health check function for all services
export const checkServiceHealth = async () => {
  const health = {
    timestamp: new Date().toISOString(),
    services: {} as Record<
      string,
      { status: 'healthy' | 'unhealthy'; error?: string; responseTime?: number }
    >,
  };

  // Type-safe service method interface
  type ServiceWithMethod = Record<string, (...args: unknown[]) => unknown>;

  // Check each service
  const servicesToCheck = [
    { name: 'userManagement', service: userManagementService, method: 'getUsers' },
    { name: 'members', service: membersService, method: 'getMembers' },
    { name: 'donations', service: donationsService, method: 'getDonations' },
    { name: 'beneficiaries', service: beneficiariesService, method: 'getBeneficiaries' },
    { name: 'emailSMS', service: emailSMSService, method: 'testConfiguration' },
    { name: 'files', service: fileStorageService, method: 'testStorage' },
    { name: 'monitoring', service: monitoring, method: 'trackEvent' },
    // Database Optimization Services
    { name: 'queryOptimization', service: queryOptimizationService, method: 'getQueryAnalytics' },
    { name: 'indexManagement', service: indexManagementService, method: 'getDatabaseIndexes' },
    { name: 'connectionPooling', service: connectionPoolingService, method: 'getConnectionStats' },
    { name: 'caching', service: cachingService, method: 'getStats' },
    {
      name: 'performanceMonitoring',
      service: performanceMonitoringService,
      method: 'getActiveAlerts',
    },
  ];

  for (const { name, service, method } of servicesToCheck) {
    const startTime = Date.now();

    try {
      // Call a lightweight method to test service health
      const methodFn = (service as unknown as ServiceWithMethod)?.[method];
      if (typeof methodFn === 'function') {
        if (method === 'trackEvent') {
          methodFn('health_check', { service: name });
        } else if (method === 'testConfiguration' || method === 'testStorage') {
          await methodFn();
        } else if (method === 'getDatabaseIndexes') {
          // Call with empty string for schema to test basic functionality
          await methodFn('');
        } else {
          // For data services, just check if method exists and call it
          await methodFn();
        }
      }

      health.services[name] = {
        status: 'healthy',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      health.services[name] = {
        status: 'unhealthy',
        error: errorMessage,
        responseTime: Date.now() - startTime,
      };

      // Service health tracking removed
    }
  }

  return health;
};

export default services;
