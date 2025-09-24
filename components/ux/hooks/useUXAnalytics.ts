import { useState, useEffect, useCallback } from 'react';

interface UXEvent {
  id: string;
  type: 'click' | 'navigation' | 'search' | 'feature_use' | 'error';
  component: string;
  action: string;
  metadata?: Record<string, any>;
  timestamp: string;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

interface UXAnalytics {
  totalEvents: number;
  sessions: number;
  averageSessionDuration: number;
  topFeatures: {
    feature: string;
    count: number;
  }[];
  deviceInfo: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
}

export function useUXAnalytics() {
  const [analytics, setAnalytics] = useState<UXAnalytics>({
    totalEvents: 0,
    sessions: 0,
    averageSessionDuration: 0,
    topFeatures: [],
    deviceInfo: { mobile: 0, desktop: 0, tablet: 0 },
  });

  // Track UX event
  const trackEvent = useCallback(
    (type: UXEvent['type'], component: string, action: string, metadata?: Record<string, any>) => {
      const event: UXEvent = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        component,
        action,
        metadata,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      };

      try {
        // Get existing events
        const existingEvents = JSON.parse(localStorage.getItem('ux-analytics-events') || '[]');

        // Add new event
        const updatedEvents = [...existingEvents.slice(-99), event]; // Keep last 100 events

        // Save to localStorage
        localStorage.setItem('ux-analytics-events', JSON.stringify(updatedEvents));

        // Update analytics summary
        updateAnalytics(updatedEvents);
      } catch (error) {
        console.warn('Error tracking UX event:', error);
      }
    },
    [],
  );

  // Update analytics summary
  const updateAnalytics = useCallback((events: UXEvent[]) => {
    const deviceInfo = { mobile: 0, desktop: 0, tablet: 0 };
    const featureCounts: Record<string, number> = {};

    events.forEach((event) => {
      // Count device types
      const isMobile = /Mobile|Android|iPhone|iPad/.test(event.userAgent || '');
      const isTablet = /iPad|Tablet/.test(event.userAgent || '');

      if (isTablet) {
        deviceInfo.tablet++;
      } else if (isMobile) {
        deviceInfo.mobile++;
      } else {
        deviceInfo.desktop++;
      }

      // Count feature usage
      const feature = `${event.component}.${event.action}`;
      featureCounts[feature] = (featureCounts[feature] || 0) + 1;
    });

    const topFeatures = Object.entries(featureCounts)
      .map(([feature, count]) => ({ feature, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate session info (simplified)
    const sessions = new Set(
      events.map((e) => e.timestamp.split('T')[0]), // Group by date
    ).size;

    setAnalytics({
      totalEvents: events.length,
      sessions,
      averageSessionDuration: 0, // Would need more complex tracking
      topFeatures,
      deviceInfo,
    });
  }, []);

  // Load analytics on mount
  useEffect(() => {
    try {
      const events = JSON.parse(localStorage.getItem('ux-analytics-events') || '[]');

      if (events.length > 0) {
        updateAnalytics(events);
      }
    } catch (error) {
      console.warn('Error loading UX analytics:', error);
    }
  }, [updateAnalytics]);

  // Track page views automatically
  useEffect(() => {
    trackEvent('navigation', 'app', 'page_load', {
      url: window.location.href,
      referrer: document.referrer,
    });
  }, [trackEvent]);

  // Helper functions for common tracking
  const trackClick = useCallback(
    (component: string, elementId?: string, metadata?: any) => {
      trackEvent('click', component, 'click', {
        elementId,
        ...metadata,
      });
    },
    [trackEvent],
  );

  const trackNavigation = useCallback(
    (from: string, to: string, method?: string) => {
      trackEvent('navigation', 'router', 'navigate', {
        from,
        to,
        method,
      });
    },
    [trackEvent],
  );

  const trackSearch = useCallback(
    (query: string, resultsCount: number, selectedResult?: string) => {
      trackEvent('search', 'search', 'query', {
        query,
        resultsCount,
        selectedResult,
      });
    },
    [trackEvent],
  );

  const trackFeatureUse = useCallback(
    (feature: string, action: string, metadata?: any) => {
      trackEvent('feature_use', feature, action, metadata);
    },
    [trackEvent],
  );

  const trackError = useCallback(
    (error: string, component: string, metadata?: any) => {
      trackEvent('error', component, 'error', {
        error,
        ...metadata,
      });
    },
    [trackEvent],
  );

  // Export analytics data
  const exportAnalytics = useCallback(() => {
    try {
      const events = JSON.parse(localStorage.getItem('ux-analytics-events') || '[]');

      const exportData = {
        analytics,
        events,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ux-analytics-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  }, [analytics]);

  // Clear analytics data
  const clearAnalytics = useCallback(() => {
    try {
      localStorage.removeItem('ux-analytics-events');
      setAnalytics({
        totalEvents: 0,
        sessions: 0,
        averageSessionDuration: 0,
        topFeatures: [],
        deviceInfo: { mobile: 0, desktop: 0, tablet: 0 },
      });
    } catch (error) {
      console.error('Error clearing analytics:', error);
    }
  }, []);

  return {
    analytics,
    trackEvent,
    trackClick,
    trackNavigation,
    trackSearch,
    trackFeatureUse,
    trackError,
    exportAnalytics,
    clearAnalytics,
  };
}

export default useUXAnalytics;
