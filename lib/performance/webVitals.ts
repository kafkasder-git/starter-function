/**
 * @fileoverview Web Vitals Performance Monitoring
 * @description Track Core Web Vitals and send to analytics
 */

import { getCLS, getFID, getFCP, getLCP, getTTFB, Metric } from 'web-vitals';
import { captureMessage, setContext } from '../monitoring/sentry';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

/**
 * Send metric to analytics
 */
function sendToAnalytics(metric: PerformanceMetric) {
  // Log in development
  if (import.meta.env.DEV) {
    // Use logger instead of console.log
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.info('📊 Web Vital:', metric);
      });
    }
  }

  // Send to Sentry
  setContext('performance', {
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
  });

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metric),
      keepalive: true,
    }).catch((error) => {
      if (typeof window !== 'undefined') {
        import('../logging/logger').then(({ logger }) => {
          logger.error('Analytics error:', error);
        });
      }
    });
  }
}

/**
 * Get rating for metric
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    CLS: [0.1, 0.25],
    FID: [100, 300],
    FCP: [1800, 3000],
    LCP: [2500, 4000],
    TTFB: [800, 1800],
  };

  const [good, poor] = thresholds[name] || [0, 0];
  
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Handle metric callback
 */
function handleMetric(metric: Metric) {
  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  sendToAnalytics(performanceMetric);

  // Alert on poor performance
  if (performanceMetric.rating === 'poor') {
    captureMessage(
      `Poor ${metric.name}: ${metric.value}`,
      'warning'
    );
  }
}

/**
 * Initialize Web Vitals tracking
 */
export function initWebVitals() {
  try {
    // Cumulative Layout Shift
    getCLS(handleMetric);
    
    // First Input Delay
    getFID(handleMetric);
    
    // First Contentful Paint
    getFCP(handleMetric);
    
    // Largest Contentful Paint
    getLCP(handleMetric);
    
    // Time to First Byte
    getTTFB(handleMetric);

    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.info('✅ Web Vitals tracking initialized');
      });
    }
  } catch (error) {
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.error('Failed to initialize Web Vitals:', error);
      });
    }
  }
}

/**
 * Get current performance metrics
 */
export function getPerformanceMetrics() {
  if (typeof window === 'undefined' || !window.performance) {
    return null;
  }

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  const paint = performance.getEntriesByType('paint');

  return {
    // Navigation timing
    dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
    tcp: navigation?.connectEnd - navigation?.connectStart,
    request: navigation?.responseStart - navigation?.requestStart,
    response: navigation?.responseEnd - navigation?.responseStart,
    dom: navigation?.domContentLoadedEventEnd - navigation?.domContentLoadedEventStart,
    load: navigation?.loadEventEnd - navigation?.loadEventStart,
    
    // Paint timing
    fcp: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime,
    
    // Memory (if available)
    memory: (performance as any).memory ? {
      used: (performance as any).memory.usedJSHeapSize,
      total: (performance as any).memory.totalJSHeapSize,
      limit: (performance as any).memory.jsHeapSizeLimit,
    } : null,
  };
}

/**
 * Monitor long tasks
 */
export function monitorLongTasks() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          if (typeof window !== 'undefined') {
            import('../logging/logger').then(({ logger }) => {
              logger.warn('⚠️ Long task detected:', {
                duration: entry.duration,
                startTime: entry.startTime,
              });
            });
          }

          captureMessage(
            `Long task: ${entry.duration}ms`,
            'warning'
          );
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.error('Failed to monitor long tasks:', error);
      });
    }
  }
}

/**
 * Monitor resource timing
 */
export function monitorResourceTiming() {
  if (typeof window === 'undefined' || !window.performance) {
    return;
  }

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const slowResources = resources.filter(resource => resource.duration > 1000);
  
  if (slowResources.length > 0) {
    if (typeof window !== 'undefined') {
      import('../logging/logger').then(({ logger }) => {
        logger.warn('⚠️ Slow resources detected:', slowResources.map(r => ({
          name: r.name,
          duration: r.duration,
          size: r.transferSize,
        })));
      });
    }
  }

  return {
    total: resources.length,
    slow: slowResources.length,
    totalSize: resources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
    totalDuration: resources.reduce((sum, r) => sum + r.duration, 0),
  };
}

/**
 * Export performance report
 */
export function exportPerformanceReport() {
  const metrics = getPerformanceMetrics();
  const resources = monitorResourceTiming();
  
  return {
    timestamp: new Date().toISOString(),
    metrics,
    resources,
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
    } : null,
  };
}

export default {
  initWebVitals,
  getPerformanceMetrics,
  monitorLongTasks,
  monitorResourceTiming,
  exportPerformanceReport,
};
