/**
 * @fileoverview Sentry Error Monitoring Integration
 * @description Centralized error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { environment } from '../environment';

/**
 * Initialize Sentry error monitoring
 */
export function initSentry() {
  // Only initialize if DSN is provided
  if (!environment.sentry?.dsn) {
    console.warn('Sentry DSN not configured. Error monitoring disabled.');
    return;
  }

  Sentry.init({
    dsn: environment.sentry.dsn,
    environment: environment.mode,
    
    // Performance Monitoring
    integrations: [
      new BrowserTracing({
        // Set sampling rate for performance monitoring
        tracePropagationTargets: [
          'localhost',
          /^https:\/\/.*\.kafkasder\.com/,
          environment.supabase.url,
        ],
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
    // We recommend adjusting this value in production
    tracesSampleRate: environment.mode === 'production' ? 0.1 : 1.0,

    // Set sample rate for error events
    sampleRate: 1.0,

    // Capture unhandled promise rejections
    autoSessionTracking: true,

    // Release tracking
    release: `kafkasder-panel@${environment.app.version}`,

    // Before send hook to filter sensitive data
    beforeSend(event, hint) {
      // Filter out sensitive information
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers;
      }

      // Filter out specific errors
      if (event.exception) {
        const error = hint.originalException;
        
        // Ignore network errors in development
        if (environment.mode === 'development' && error instanceof Error) {
          if (error.message.includes('Network') || error.message.includes('fetch')) {
            return null;
          }
        }
      }

      return event;
    },

    // Ignore specific errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      
      // Network errors
      'NetworkError',
      'Failed to fetch',
      'Load failed',
      
      // Random plugins/extensions
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      
      // Facebook errors
      'fb_xd_fragment',
      
      // ISP injected ads
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
    ],

    // Denylist for URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
      
      // Facebook flakiness
      /graph\.facebook\.com/i,
      
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
    ],
  });

  // Set user context if available
  const user = getUserContext();
  if (user) {
    Sentry.setUser(user);
  }

  console.log('✅ Sentry initialized successfully');
}

/**
 * Get user context for Sentry
 */
function getUserContext() {
  try {
    const userStr = localStorage.getItem('auth-storage');
    if (userStr) {
      const authData = JSON.parse(userStr);
      const user = authData?.state?.user;
      
      if (user) {
        return {
          id: user.id,
          email: user.email,
          username: user.full_name || user.email,
        };
      }
    }
  } catch (error) {
    console.warn('Failed to get user context for Sentry:', error);
  }
  
  return null;
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, any>) {
  if (context) {
    Sentry.setContext('additional', context);
  }
  
  Sentry.captureException(error);
}

/**
 * Capture message manually
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info') {
  Sentry.captureMessage(message, level);
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email: string; username?: string } | null) {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Set custom context
 */
export function setContext(name: string, context: Record<string, any>) {
  Sentry.setContext(name, context);
}

/**
 * Set tag
 */
export function setTag(key: string, value: string) {
  Sentry.setTag(key, value);
}

/**
 * Start transaction for performance monitoring
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op });
}

/**
 * Wrap component with Sentry error boundary
 */
export const ErrorBoundary = Sentry.ErrorBoundary;

/**
 * Profiler for React components
 */
export const Profiler = Sentry.Profiler;

/**
 * withProfiler HOC
 */
export const withProfiler = Sentry.withProfiler;

export default Sentry;
