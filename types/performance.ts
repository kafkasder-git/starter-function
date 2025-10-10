/**
 * @fileoverview Performance Types
 * @description Type definitions for performance monitoring and metrics
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// =============================================================================
// CORE WEB VITALS TYPES
// =============================================================================

/**
 * Performance rating based on Core Web Vitals thresholds
 */
export type PerformanceRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Core Web Vitals and custom performance metrics
 */
export interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift (score)
  memoryUsage: number; // Percentage (0-100)
  renderTime: number; // Average render time (ms)
  score: number; // Overall score (0-100)
  rating: PerformanceRating;
}

/**
 * Performance thresholds for ratings
 */
export interface PerformanceThresholds {
  lcp: { good: number; poor: number }; // 2.5s / 4s
  fid: { good: number; poor: number }; // 100ms / 300ms
  cls: { good: number; poor: number }; // 0.1 / 0.25
  memoryUsage: { good: number; poor: number }; // 60% / 80%
}

// =============================================================================
// ALERTS AND MONITORING
// =============================================================================

/**
 * Performance alert when metrics exceed thresholds
 */
export interface PerformanceAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
}

/**
 * Comprehensive performance report
 */
export interface PerformanceReport {
  metrics: PerformanceMetrics;
  generatedAt: string;
  alerts: PerformanceAlert[];
  summary: {
    rating: PerformanceRating;
    issues: number;
    recommendations: string[];
  };
}

// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  enableAutoReporting: boolean;
  reportInterval: number; // minutes
  alertThresholds: {
    lcp: number;
    fid: number;
    cls: number;
    memoryUsage: number;
  };
}

// =============================================================================
// MOBILE PERFORMANCE
// =============================================================================

/**
 * Mobile-specific performance metrics
 */
export interface MobilePerformanceMetrics {
  batteryLevel?: number;
  networkType?: string;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Device capabilities
 */
export interface DeviceCapabilities {
  deviceMemory?: number;
  hardwareConcurrency?: number;
  maxTouchPoints?: number;
  isMobile: boolean;
  isLowEnd: boolean;
}
