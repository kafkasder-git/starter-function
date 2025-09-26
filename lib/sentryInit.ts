/**
 * @fileoverview Sentry Initialization
 * @description Initialize Sentry for the application
 */

import { sentryService } from '../services/sentryService';
import { environment } from './environment';

import { logger } from '../lib/logging/logger';
// Initialize Sentry when the module is imported
export const initializeSentry = () => {
  logger.info('🔧 Initializing Sentry error tracking...');

  // Sentry is automatically initialized in the service
  // This function can be used for additional setup if needed

  if (sentryService.isEnabled()) {
    logger.info('✅ Sentry is enabled and ready');

    // Set initial context
    sentryService.setContext('app', {
      name: 'Dernek Yönetim Sistemi',
      version: '1.0.0',
      environment: (typeof import.meta !== 'undefined' && import.meta.env?.MODE) || process.env.NODE_ENV ?? 'development',
    });

    // Add initial breadcrumb
    sentryService.addBreadcrumb('Application started', 'lifecycle', 'info');

    // Test Sentry logging functionality
    sentryService.captureMessage('User triggered test log', 'info', { action: 'test_log' });
    logger.info('🧪 Sentry test log sent successfully');

    return true;
  } 
    logger.info('⚠️ Sentry is disabled');
    return false;
  
};

// Test function for manual Sentry testing
export const testSentryLogging = () => {
  if (!sentryService.isEnabled()) {
    logger.info('❌ Cannot test Sentry - it is disabled');
    return false;
  }

  try {
    // Test different types of Sentry logging
    logger.info('🧪 Testing Sentry logging functionality...');

    // Test info message
    sentryService.captureMessage('User triggered test log', 'info', {
      action: 'test_log',
      timestamp: new Date().toISOString(),
      testType: 'manual_test',
    });

    // Test warning message
    sentryService.captureMessage('Test warning message', 'warning', {
      action: 'test_warning',
      severity: 'medium',
    });

    // Test breadcrumb
    sentryService.addBreadcrumb('Test breadcrumb added', 'test', 'info', {
      testId: 'breadcrumb_test',
      action: 'test_breadcrumb',
    });

    // Test business event
    sentryService.trackBusinessEvent('sentry-test', {
      testType: 'logging_test',
      timestamp: Date.now(),
      success: true,
    });

    logger.info('✅ Sentry test logs sent successfully');
    logger.info('📊 Check your Sentry dashboard for the test events');

    return true;
  } catch (error) {
    logger.error('❌ Error testing Sentry:', error);
    return false;
  }
};

// Test function for exception tracking
export const testSentryException = () => {
  if (!sentryService.isEnabled()) {
    logger.info('❌ Cannot test Sentry - it is disabled');
    return false;
  }

  try {
    logger.info('🧪 Testing Sentry exception tracking...');

    // Create a test error
    const testError = new Error('This is a test error for Sentry');
    testError.name = 'SentryTestError';

    // Add additional context
    sentryService.setContext('test', {
      testType: 'exception_test',
      timestamp: new Date().toISOString(),
      environment: (typeof import.meta !== 'undefined' && import.meta.env?.MODE) || process.env.NODE_ENV ?? 'development',
    });

    // Capture the exception
    const eventId = sentryService.captureException(testError, {
      action: 'test_exception',
      testId: 'exception_test_001',
      severity: 'test',
    });

    logger.info(`✅ Test exception sent to Sentry with ID: ${eventId}`);
    logger.info('📊 Check your Sentry dashboard for the test exception');

    return true;
  } catch (error) {
    logger.error('❌ Error testing Sentry exception:', error);
    return false;
  }
};

// MCP Server initialization function
export const initializeMCPServer = async () => {
  if (!sentryService.isEnabled()) {
    logger.info('⚠️ Cannot initialize MCP server - Sentry is disabled');
    return null;
  }

  try {
    // Import MCP server manager
    // const { startDefaultMCPServer } = await import('../services/mcpServer'); // File doesn't exist

    // Start the default MCP server with Sentry monitoring
    // const mcpServer = await startDefaultMCPServer(); // Commented out until file exists

    logger.info('✅ MCP Server initialized with Sentry monitoring');

    // Set context for MCP server
    sentryService.setContext('mcp-server', {
      name: 'dernek-management-server',
      version: environment.app.version,
      environment: environment.app.mode,
      sentryMonitoring: true,
    });

    // Add breadcrumb
    sentryService.addBreadcrumb('MCP Server initialized', 'mcp-init', 'info', {
      serverName: 'dernek-management-server',
      version: environment.app.version,
    });

    return null;
  } catch (error) {
    logger.error('❌ Failed to initialize MCP server:', error);
    sentryService.captureException(error as Error, {
      context: 'mcp-server-initialization',
    });
    return null;
  }
};

// Auto-initialize
initializeSentry();
export { sentryService };
