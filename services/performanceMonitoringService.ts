/**
 * @fileoverview performanceMonitoringService Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 *
 * @description
 * Simplified performance monitoring service using Core Web Vitals.
 * Provides basic performance metrics and reports.
 */

import { getPerformanceSnapshot } from '../hooks/usePerformance';
import type { PerformanceMetrics, PerformanceReport } from '../types/performance';

// Re-export types for backward compatibility
export type {
  PerformanceMetrics,
  PerformanceRating,
  PerformanceAlert,
  PerformanceReport,
  PerformanceConfig,
} from '../types/performance';

// =============================================================================
// SIMPLIFIED SERVICE IMPLEMENTATION
// =============================================================================

/**
 * Simplified performance monitoring service
 * Uses React Query's built-in performance tracking for most features
 */
export const performanceMonitoringService = {
  /**
   * Get current performance metrics
   */
  getMetrics: () => {
    return {
      memory: (performance as any).memory?.usedJSHeapSize || 0,
      renderTime: performance.now(),
      timestamp: Date.now(),
    };
  },

  /**
   * Get Core Web Vitals
   */
  getCoreWebVitals: () => {
    const metrics = getPerformanceSnapshot();
    return {
      LCP: metrics.lcp,
      FID: metrics.fid,
      CLS: metrics.cls,
    };
  },

  /**
   * Get current performance report
   */
  getPerformanceReport: async (): Promise<PerformanceReport> => {
    const metrics = getPerformanceSnapshot();

    return {
      metrics,
      generatedAt: new Date().toISOString(),
      alerts: [],
      summary: {
        rating: metrics.rating,
        issues: 0,
        recommendations: ['Use React Query Devtools for detailed performance monitoring'],
      },
    };
  },

  /**
   * Get performance snapshot
   */
  getSnapshot: () => {
    return getPerformanceSnapshot();
  },
};

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const getPerformanceReport = performanceMonitoringService.getPerformanceReport;
export const getMetrics = performanceMonitoringService.getMetrics;
export const getCoreWebVitals = performanceMonitoringService.getCoreWebVitals;
export const getSnapshot = performanceMonitoringService.getSnapshot;

export default performanceMonitoringService;
