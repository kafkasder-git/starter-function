/**
 * @fileoverview Debug Appwrite Configuration
 * @description Utility to debug Appwrite configuration issues
 */

import { environment } from './environment';
import { logger } from './logging/logger';

/**
 * Debug Appwrite configuration
 */
export function debugAppwriteConfig() {
  const config = {
    endpoint: environment.appwrite.endpoint,
    projectId: environment.appwrite.projectId,
    projectName: environment.appwrite.projectName,
    databaseId: environment.appwrite.databaseId,
  };

  logger.info('Appwrite Configuration Debug:', config);

  // Check for common issues
  const issues: string[] = [];

  if (!config.endpoint.startsWith('http')) {
    issues.push('Invalid endpoint URL');
  }

  if (!config.projectId || config.projectId.length < 10) {
    issues.push('Invalid or missing project ID');
  }

  if (!config.databaseId || config.databaseId.length < 10) {
    issues.push('Invalid or missing database ID');
  }

  if (issues.length > 0) {
    logger.warn('Appwrite Configuration Issues:', issues);
  } else {
    logger.info('Appwrite configuration looks good');
  }

  return {
    config,
    issues,
    isValid: issues.length === 0,
  };
}

/**
 * Log current environment variables
 */
export function debugEnvironmentVariables() {
  const envVars = {
    VITE_APPWRITE_ENDPOINT: import.meta.env.VITE_APPWRITE_ENDPOINT,
    VITE_APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    VITE_APPWRITE_PROJECT_NAME: import.meta.env.VITE_APPWRITE_PROJECT_NAME,
    VITE_APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  };

  logger.info('Environment Variables:', envVars);
  return envVars;
}

export default debugAppwriteConfig;
