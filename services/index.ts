/**
 * @fileoverview Services Index - Centralized service exports
 * @description Export all services for easy importing throughout the application
 */

import emailSMSService from './emailSMSService';
import nativeFeaturesService from './nativeFeaturesService';
import userManagementService from './userManagementService';
import donationsService from './donationsService';
import { beneficiariesService } from './beneficiariesService';
import kumbaraService from './kumbaraService';
import notificationService from './notificationService';
import fileStorageService from './fileStorageService';
import monitoring from './monitoringService';
import exportService from './exportService';
import performanceMonitoringService from './performanceMonitoringService';
import { enhancedAppwrite } from './enhancedAppwriteService';
import { authService } from '../lib/auth/authService';
import { storageService } from '../lib/storage/storageService';
import { functionsService } from '../lib/functions/functionsService';
import { serviceManager } from '../lib/services/serviceManager';

// New services
import eventsService from './eventsService';
import legalConsultationsService from './legalConsultationsService';
import queryOptimizationService from './queryOptimizationService';
import indexManagementService from './indexManagementService';
import connectionPoolingService from './connectionPoolingService';
import { githubActionsErrorAnalyzer } from './githubActions/errorAnalyzer';
import { githubActionsErrorParser } from './githubActions/errorParser';

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
export { default as donationsService } from './donationsService';
export { beneficiariesService } from './beneficiariesService';
export { default as kumbaraService } from './kumbaraService';

// Support services
export { default as reportsService } from './reportingService';
export { default as statsService } from './safeStatsService';
export { default as intelligentStatsService } from './intelligentStatsService';

// New services
export { default as eventsService } from './eventsService';
export { default as legalConsultationsService } from './legalConsultationsService';
export { default as queryOptimizationService } from './queryOptimizationService';
export { default as indexManagementService } from './indexManagementService';
export { default as connectionPoolingService } from './connectionPoolingService';
export { githubActionsErrorAnalyzer } from './githubActions/errorAnalyzer';
export { githubActionsErrorParser } from './githubActions/errorParser';

// =============================================================================
// APPWRITE SERVICES
// =============================================================================

// Enhanced Appwrite service - Recommended way to interact with Appwrite
// See documentation: c:/Users/isaha/Desktop/panel/docs/services/ENHANCED_APPWRITE_SERVICE.md

export { enhancedAppwrite } from './enhancedAppwriteService';

// Core Appwrite services
export { authService, AuthService } from '../lib/auth/authService';
export { storageService, StorageService } from '../lib/storage/storageService';
export { functionsService, FunctionsService } from '../lib/functions/functionsService';
export { serviceManager, ServiceManager } from '../lib/services/serviceManager';

// Service convenience functions - Use storageService directly
// export { ... } from '../lib/storage/storageService';

export {
  executeFunction,
  executeFunctionWithJson,
  getExecutionResult,
  listFunctions,
  getFunction,
  testFunctions,
  waitForExecution,
} from '../lib/functions/functionsService';

// =============================================================================
// COMMUNICATION SERVICES
// =============================================================================

// Email/SMS notification service
export { default as emailSMSService } from './emailSMSService';

// In-app notifications
export { default as notificationService } from './notificationService';

// =============================================================================
// FILE MANAGEMENT
// =============================================================================

// File storage service
export {
  fileStorageService,
  type FileUploadOptions,
  type FileListOptions,
  type FileListResult,
} from './fileStorageService';

// =============================================================================
// PERFORMANCE SERVICES
// =============================================================================

// =============================================================================
// CACHING
// =============================================================================

// Note: For caching needs, use React Query (@tanstack/react-query)
// React Query is already installed but not yet configured.
// See: https://tanstack.com/query/latest/docs/react/overview
//
// To set up React Query:
// 1. Create QueryClient in main.tsx or App.tsx
// 2. Wrap app with QueryClientProvider
// 3. Use useQuery/useMutation hooks in components

// Performance monitoring service
export { default as performanceMonitoringService } from './performanceMonitoringService';

// =============================================================================
// UTILITY SERVICES
// =============================================================================

// AI services removed

// Monitoring and analytics
export { default as monitoring } from './monitoringService';

// Export service
export { default as exportService } from './exportService';

// Error tracking removed

// =============================================================================
// NATIVE FEATURES
// =============================================================================

// Native device features
export { default as nativeFeaturesService } from './nativeFeaturesService';

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

export type {
  // Appwrite service types
  AppwriteResponse,
  AppwriteQueryOptions,
  ConnectionStatus,
  BatchOperationResult,
} from './enhancedAppwriteService';

// =============================================================================
// SERVICE FACTORIES
// =============================================================================

// Service factory for creating service instances with configuration
export const createServices = () => {
  // Return configured service instances
  return {
    // Core Appwrite services
    auth: authService,
    storage: storageService,
    functions: functionsService,
    serviceManager: serviceManager,

    // Business logic services
    userManagement: userManagementService,
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

    // Performance
    performanceMonitoring: performanceMonitoringService,

    // Native features
    native: nativeFeaturesService,

    // Enhanced Appwrite
    enhancedAppwrite: enhancedAppwrite,
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
    // Core Appwrite services
    { name: 'auth', service: authService, method: 'initialize' },
    { name: 'storage', service: storageService, method: 'testStorage' },
    { name: 'functions', service: functionsService, method: 'testFunctions' },

    // Business logic services
    { name: 'userManagement', service: userManagementService, method: 'getUsers' },
    { name: 'donations', service: donationsService, method: 'getDonations' },
    { name: 'beneficiaries', service: beneficiariesService, method: 'getBeneficiaries' },
    { name: 'emailSMS', service: emailSMSService, method: 'testConfiguration' },
    { name: 'files', service: fileStorageService, method: 'testStorage' },
    { name: 'monitoring', service: monitoring, method: 'trackEvent' },
    {
      name: 'performanceMonitoring',
      service: performanceMonitoringService,
      method: 'getActiveAlerts',
    },
  ];

  for (const { name, service, method } of servicesToCheck) {
    const startTime = Date.now();

    try {
      const serviceObj = service as unknown as ServiceWithMethod;
      const methodFunc = serviceObj[method];

      // Call a lightweight method to test service health
      if (method === 'trackEvent' && typeof methodFunc === 'function') {
        methodFunc('health_check', { service: name });
      } else if ((method === 'testConfiguration' || method === 'testStorage') && typeof methodFunc === 'function') {
        await methodFunc();
      } else if (typeof methodFunc === 'function') {
        // For data services, just check if method exists and call it
        await methodFunc();
      }

      health.services[name] = {
        status: 'healthy',
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      health.services[name] = {
        status: 'unhealthy',
        error: errorMessage,
        responseTime: Date.now() - startTime,
      };
    }
  }

  return health;
};

export default services;
