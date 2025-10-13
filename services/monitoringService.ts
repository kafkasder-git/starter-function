/**
 * @fileoverview Monitoring Service - Application monitoring and analytics
 *
 * This service handles general application monitoring, event tracking, and analytics.
 *
 * For security monitoring:
 * - Use Supabase audit_logs table for audit trails
 * - Use Appwrite Analytics for security metrics
 * - Use lib/security/ module for security features
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../lib/logging/logger';
// Monitoring service with required methods
export const monitoring = {
  trackEvent: (event: string | Record<string, unknown>, data?: Record<string, unknown>) => {
    if (typeof event === 'string') {
      logger.info('Event tracked:', event, data);
    } else {
      logger.info('Event tracked:', event);
    }
  },
  trackError: (error: string, data?: Record<string, unknown>) => {
    logger.error('Error tracked:', error, data);
  },
  trackApiCall: (
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    data?: Record<string, unknown>
  ) => {
    logger.info('API call tracked:', { endpoint, method, duration, status, data });
  },
  trackFeatureUsage: (feature: string, action: string, data?: Record<string, unknown>) => {
    logger.info('Feature usage tracked:', { feature, action, data });
  },
  trackSecurityEvent: async (eventType: string, details: Record<string, unknown>) => {
    logger.info('Security event tracked:', { eventType, details });
    // TODO: Write to Supabase audit_logs table if needed
    // This is a placeholder for future security event tracking
  },
};

const monitoringService = {
  trackEvent: monitoring.trackEvent,
  trackError: monitoring.trackError,
  trackApiCall: monitoring.trackApiCall,
  trackFeatureUsage: monitoring.trackFeatureUsage,
  trackSecurityEvent: monitoring.trackSecurityEvent,
};

export default monitoringService;
