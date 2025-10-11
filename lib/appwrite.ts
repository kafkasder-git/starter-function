/**
 * @fileoverview Appwrite Client Configuration
 * @description Centralized Appwrite SDK initialization and service exports
 */

import { Client, Account, Databases, Storage, Functions, Teams, ID, Query, Permission, Role } from 'appwrite';
import { environment } from './environment';
import { logger } from './logging/logger';
import { debugAppwriteConfig } from './debugAppwriteConfig';

// Validate Appwrite configuration
if (!environment.appwrite.endpoint?.startsWith('http')) {
  logger.warn('Invalid or missing VITE_APPWRITE_ENDPOINT. Appwrite features will be disabled.');
}

if (!environment.appwrite.projectId) {
  logger.warn('Missing VITE_APPWRITE_PROJECT_ID. Appwrite features will be disabled.');
}

if (!environment.appwrite.databaseId) {
  logger.warn('Missing VITE_APPWRITE_DATABASE_ID. Appwrite features will be disabled.');
}

// Helper function to check if Appwrite is properly configured
const isAppwriteConfigured = (): boolean => {
  return Boolean(
    environment.appwrite.endpoint?.startsWith('http') &&
    environment.appwrite.projectId &&
    environment.appwrite.databaseId
  );
};

// Create Appwrite client instance - Singleton pattern
let clientInstance: Client | null = null;

export const client = (() => {
  if (clientInstance) {
    return clientInstance;
  }

  // Prevent multiple instances by checking global state
  if (typeof window !== 'undefined' && (window as any).__appwriteClient) {
    return (window as any).__appwriteClient;
  }

  // Only initialize if Appwrite is properly configured
  if (!isAppwriteConfigured()) {
    logger.warn('Appwrite not configured, using mock data mode');
    return null as any;
  }

  clientInstance = new Client()
    .setEndpoint(environment.appwrite.endpoint)
    .setProject(environment.appwrite.projectId);

  // Store instance globally to prevent multiple instances
  if (typeof window !== 'undefined') {
    (window as any).__appwriteClient = clientInstance;
  }

  logger.info('Appwrite Client initialized', {
    endpoint: environment.appwrite.endpoint,
    projectId: environment.appwrite.projectId,
    databaseId: environment.appwrite.databaseId,
  });

  // Debug configuration in development
  if (environment.mode === 'development') {
    debugAppwriteConfig();
  }

  return clientInstance;
})();

// Initialize Appwrite services only if client is available
export const account = client ? new Account(client) : null;
export const databases = client ? new Databases(client) : null;
export const storage = client ? new Storage(client) : null;
export const functions = client ? new Functions(client) : null;
export const teams = client ? new Teams(client) : null;

// Export commonly used utilities
export { ID, Query, Permission, Role };

// Export the isAppwriteConfigured function
export { isAppwriteConfigured };

// Helper function to get Appwrite configuration status
export const getAppwriteStatus = () => {
  return {
    configured: isAppwriteConfigured(),
    endpoint: environment.appwrite.endpoint,
    projectId: environment.appwrite.projectId,
    databaseId: environment.appwrite.databaseId,
    hasEndpoint: Boolean(environment.appwrite.endpoint),
    hasProjectId: Boolean(environment.appwrite.projectId),
    hasDatabaseId: Boolean(environment.appwrite.databaseId),
  };
};

// Database ID constant for easy access
export const DATABASE_ID = environment.appwrite.databaseId;

export default client;


