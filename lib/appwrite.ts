/**
 * @fileoverview Appwrite Client Configuration
 * @description Centralized Appwrite SDK initialization and service exports
 */

import { Client, Account, Databases, Storage, Functions, Teams, ID, Query, Permission, Role } from 'appwrite';
import { environment } from './environment';
import { logger } from './logging/logger';

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

  return clientInstance;
})();

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const teams = new Teams(client);

// Export commonly used utilities
export { ID, Query, Permission, Role };

// Helper function to check if Appwrite is properly configured
export const isAppwriteConfigured = (): boolean => {
  return Boolean(
    environment.appwrite.endpoint?.startsWith('http') &&
    environment.appwrite.projectId &&
    environment.appwrite.databaseId
  );
};

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


