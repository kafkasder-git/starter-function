// Monitoring service with required methods
export const monitoring = {
  trackEvent: (event: string | Record<string, unknown>, data?: Record<string, unknown>) => {
    if (typeof event === 'string') {
      console.log('Event tracked:', event, data);
    } else {
      console.log('Event tracked:', event);
    }
  },
  trackError: (error: string, data?: Record<string, unknown>) => {
    console.error('Error tracked:', error, data);
  },
  trackApiCall: (endpoint: string, method: string, duration: number, status: number, data?: Record<string, unknown>) => {
    console.log('API call tracked:', { endpoint, method, duration, status, data });
  },
  trackFeatureUsage: (feature: string, action: string, data?: Record<string, unknown>) => {
    console.log('Feature usage tracked:', { feature, action, data });
  },
};

const monitoringService = {
  trackEvent: monitoring.trackEvent,
  trackError: monitoring.trackError,
  trackApiCall: monitoring.trackApiCall,
  trackFeatureUsage: monitoring.trackFeatureUsage,
};

export default monitoringService;
