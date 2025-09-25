/**
 * @fileoverview monitoringService Module - Application module
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
  trackApiCall: (endpoint: string, method: string, duration: number, status: number, data?: Record<string, unknown>) => {
    logger.info('API call tracked:', { endpoint, method, duration, status, data });
  },
  trackFeatureUsage: (feature: string, action: string, data?: Record<string, unknown>) => {
    logger.info('Feature usage tracked:', { feature, action, data });
  },
};

const monitoringService = {
  trackEvent: monitoring.trackEvent,
  trackError: monitoring.trackError,
  trackApiCall: monitoring.trackApiCall,
  trackFeatureUsage: monitoring.trackFeatureUsage,
};

export default monitoringService;
