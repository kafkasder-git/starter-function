/**
 * @fileoverview performanceMonitoringService Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 *
 * @description
 * Real performance monitoring service using Core Web Vitals.
 * Provides performance reports, alerts, and historical metrics.
 */

import { getPerformanceSnapshot } from '../hooks/usePerformance';
import type {
  PerformanceMetrics,
  PerformanceRating,
  PerformanceAlert,
  PerformanceReport,
  PerformanceConfig,
} from '../types/performance';

// Re-export types for backward compatibility
export type {
  PerformanceMetrics,
  PerformanceRating,
  PerformanceAlert,
  PerformanceReport,
  PerformanceConfig,
} from '../types/performance';

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

const metricsHistory: PerformanceMetrics[] = [];
const MAX_HISTORY = 100;
const activeAlerts: PerformanceAlert[] = [];

let config: PerformanceConfig = {
  enableAutoReporting: true,
  reportInterval: 5,
  alertThresholds: {
    lcp: 4000, // 4s
    fid: 300, // 300ms
    cls: 0.25,
    memoryUsage: 80, // 80%
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate alerts based on current metrics
 */
function generateAlerts(metrics: PerformanceMetrics): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];
  const timestamp = new Date();

  // LCP alert
  if (metrics.lcp > config.alertThresholds.lcp) {
    alerts.push({
      id: `lcp-${Date.now()}`,
      severity: metrics.lcp > 6000 ? 'critical' : 'high',
      message: `Largest Contentful Paint (${Math.round(metrics.lcp)}ms) exceeds threshold`,
      metric: 'lcp',
      value: metrics.lcp,
      threshold: config.alertThresholds.lcp,
      timestamp,
    });
  }

  // FID alert
  if (metrics.fid > config.alertThresholds.fid) {
    alerts.push({
      id: `fid-${Date.now()}`,
      severity: metrics.fid > 500 ? 'critical' : 'high',
      message: `First Input Delay (${Math.round(metrics.fid)}ms) exceeds threshold`,
      metric: 'fid',
      value: metrics.fid,
      threshold: config.alertThresholds.fid,
      timestamp,
    });
  }

  // CLS alert
  if (metrics.cls > config.alertThresholds.cls) {
    alerts.push({
      id: `cls-${Date.now()}`,
      severity: metrics.cls > 0.5 ? 'critical' : 'high',
      message: `Cumulative Layout Shift (${metrics.cls.toFixed(3)}) exceeds threshold`,
      metric: 'cls',
      value: metrics.cls,
      threshold: config.alertThresholds.cls,
      timestamp,
    });
  }

  // Memory alert
  if (metrics.memoryUsage > config.alertThresholds.memoryUsage) {
    alerts.push({
      id: `memory-${Date.now()}`,
      severity: metrics.memoryUsage > 90 ? 'critical' : 'medium',
      message: `Memory usage (${Math.round(metrics.memoryUsage)}%) exceeds threshold`,
      metric: 'memoryUsage',
      value: metrics.memoryUsage,
      threshold: config.alertThresholds.memoryUsage,
      timestamp,
    });
  }

  return alerts;
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(metrics: PerformanceMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.lcp > 2500) {
    recommendations.push('Optimize image loading and reduce server response times to improve LCP');
  }

  if (metrics.fid > 100) {
    recommendations.push('Reduce JavaScript execution time to improve First Input Delay');
  }

  if (metrics.cls > 0.1) {
    recommendations.push(
      'Add size attributes to images and reserve space for dynamic content to reduce CLS',
    );
  }

  if (metrics.memoryUsage > 60) {
    recommendations.push(
      'Consider reducing memory usage by optimizing component re-renders and data structures',
    );
  }

  if (metrics.renderTime > 16) {
    recommendations.push('Optimize component render performance to maintain 60 FPS');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance is good! Keep monitoring metrics regularly.');
  }

  return recommendations;
}

/**
 * Store metrics in history
 */
function storeMetrics(metrics: PerformanceMetrics): void {
  metricsHistory.push(metrics);

  // Keep only last MAX_HISTORY entries
  if (metricsHistory.length > MAX_HISTORY) {
    metricsHistory.shift();
  }
}

// =============================================================================
// SERVICE IMPLEMENTATION
// =============================================================================

export const performanceMonitoringService = {
  /**
   * Get current performance report
   */
  getPerformanceReport: async (): Promise<PerformanceReport> => {
    const metrics = getPerformanceSnapshot();
    const alerts = generateAlerts(metrics);
    const recommendations = generateRecommendations(metrics);

    // Store metrics in history
    storeMetrics(metrics);

    return {
      metrics,
      generatedAt: new Date().toISOString(),
      alerts,
      summary: {
        rating: metrics.rating,
        issues: alerts.length,
        recommendations,
      },
    };
  },

  /**
   * Get active performance alerts
   */
  getActiveAlerts: async (): Promise<PerformanceAlert[]> => {
    const metrics = getPerformanceSnapshot();
    const alerts = generateAlerts(metrics);

    // Update active alerts list
    activeAlerts.length = 0;
    activeAlerts.push(...alerts);

    return alerts;
  },

  /**
   * Get historical metrics
   */
  getMetricsHistory: async (): Promise<PerformanceMetrics[]> => {
    return [...metricsHistory];
  },

  /**
   * Export performance data
   */
  exportPerformanceData: async (): Promise<{ url: string; data: unknown }> => {
    const report = await performanceMonitoringService.getPerformanceReport();
    const exportData = {
      report,
      history: metricsHistory,
      config,
      exportedAt: new Date().toISOString(),
    };

    // In a real implementation, this would create a downloadable file
    return {
      url: '/download/performance.json',
      data: exportData,
    };
  },

  /**
   * Update performance monitoring configuration
   */
  updatePerformanceConfig: async (newConfig: Partial<PerformanceConfig>): Promise<boolean> => {
    config = {
      ...config,
      ...newConfig,
    };
    return true;
  },

  /**
   * Get current configuration
   */
  getConfig: (): PerformanceConfig => {
    return { ...config };
  },

  /**
   * Clear metrics history
   */
  clearHistory: (): void => {
    metricsHistory.length = 0;
  },
};

// =============================================================================
// CONVENIENCE EXPORTS
// =============================================================================

export const getPerformanceReport = performanceMonitoringService.getPerformanceReport;
export const getActiveAlerts = performanceMonitoringService.getActiveAlerts;
export const getMetricsHistory = performanceMonitoringService.getMetricsHistory;
export const exportPerformanceData = performanceMonitoringService.exportPerformanceData;
export const updatePerformanceConfig = performanceMonitoringService.updatePerformanceConfig;

export default performanceMonitoringService;
