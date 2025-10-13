/**
 * @fileoverview usePerformance Hook - Simplified performance monitoring
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 *
 * @description
 * Consolidated performance monitoring hook focusing on Core Web Vitals.
 * Tracks essential metrics: LCP, FID, CLS, memory usage, and render time.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { logger } from '../lib/logging/logger';
import type {
  PerformanceRating,
  PerformanceMetrics,
  PerformanceThresholds,
} from '../types/performance';

// Re-export types for backward compatibility
export type { PerformanceRating, PerformanceMetrics } from '../types/performance';

// Google Core Web Vitals thresholds
const THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, poor: 4000 },
  fid: { good: 100, poor: 300 },
  cls: { good: 0.1, poor: 0.25 },
  memoryUsage: { good: 60, poor: 80 },
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Calculate overall performance score (0-100)
 */
function calculateScore(metrics: Omit<PerformanceMetrics, 'score' | 'rating'>): number {
  const lcpScore = Math.max(0, 100 - (metrics.lcp / THRESHOLDS.lcp.poor) * 100);
  const fidScore = Math.max(0, 100 - (metrics.fid / THRESHOLDS.fid.poor) * 100);
  const clsScore = Math.max(0, 100 - (metrics.cls / THRESHOLDS.cls.poor) * 100);
  const memoryScore = Math.max(0, 100 - metrics.memoryUsage);
  const renderScore = Math.max(0, 100 - (metrics.renderTime / 100) * 100);

  // Weighted average (Core Web Vitals are more important)
  return Math.round(
    lcpScore * 0.3 + fidScore * 0.25 + clsScore * 0.25 + memoryScore * 0.1 + renderScore * 0.1
  );
}

/**
 * Get overall rating from score
 */
function getRatingFromScore(score: number): PerformanceRating {
  if (score >= 75) return 'good';
  if (score >= 50) return 'needs-improvement';
  return 'poor';
}

/**
 * Get memory usage percentage
 */
function getMemoryUsage(): number {
  if ('memory' in performance) {
    const { memory } = performance as any;
    if (memory?.usedJSHeapSize && memory.jsHeapSizeLimit) {
      return (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    }
  }
  return 0;
}

/**
 * Get one-time performance snapshot (no hook needed)
 * Uses modern PerformanceObserver API instead of deprecated getEntriesByType
 */
export function getPerformanceSnapshot(): PerformanceMetrics {
  const metrics = {
    lcp: 0,
    fid: 0,
    cls: 0,
    memoryUsage: getMemoryUsage(),
    renderTime: 0,
    score: 0,
    rating: 'good' as PerformanceRating,
  };

  // Skip deprecated API calls to avoid console warnings
  // Performance metrics will be collected via PerformanceObserver in the hook
  // This function now only returns basic metrics without deprecated API calls

  // Calculate score and rating
  metrics.score = calculateScore(metrics);
  metrics.rating = getRatingFromScore(metrics.score);

  return metrics;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * Hook for monitoring Core Web Vitals and performance metrics
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { metrics, isSupported } = usePerformance();
 *
 *   return (
 *     <div>
 *       Performance Score: {metrics.score} ({metrics.rating})
 *     </div>
 *   );
 * }
 * ```
 */
export function usePerformance() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: 0,
    fid: 0,
    cls: 0,
    memoryUsage: 0,
    renderTime: 0,
    score: 0,
    rating: 'good',
  });
  const [isSupported, setIsSupported] = useState(true);
  const renderStartTime = useRef(performance.now());
  const renderTimes = useRef<number[]>([]);

  // Track component render time
  const trackRenderTime = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    renderTimes.current.push(renderTime);

    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    // Calculate average render time
    const avgRenderTime =
      renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;

    return avgRenderTime;
  }, []);

  // Update metrics
  const updateMetrics = useCallback(() => {
    try {
      const snapshot = getPerformanceSnapshot();
      const avgRenderTime = trackRenderTime();

      setMetrics({
        ...snapshot,
        renderTime: avgRenderTime,
        memoryUsage: getMemoryUsage(),
      });

      // Log performance issues
      if (snapshot.rating === 'poor') {
        logger.warn('Poor performance detected', {
          score: snapshot.score,
          lcp: snapshot.lcp,
          fid: snapshot.fid,
          cls: snapshot.cls,
        });
      }
    } catch (error) {
      logger.error('Failed to update performance metrics', error);
    }

    renderStartTime.current = performance.now();
  }, [trackRenderTime]);

  // Setup PerformanceObserver for Core Web Vitals
  useEffect(() => {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported');
      setIsSupported(false);
      return;
    }

    const observers: PerformanceObserver[] = [];

    try {
      // Observe LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          updateMetrics();
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observers.push(lcpObserver);

      // Observe FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          updateMetrics();
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observers.push(fidObserver);

      // Observe CLS
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          updateMetrics();
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observers.push(clsObserver);
    } catch (error) {
      logger.error('Failed to setup PerformanceObserver', error);
      setIsSupported(false);
    }

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);

    // Initial update
    updateMetrics();

    return () => {
      observers.forEach((observer) => {
        observer.disconnect();
      });
      clearInterval(interval);
    };
  }, [updateMetrics]);

  return {
    metrics,
    isSupported,
    refresh: updateMetrics,
  };
}

export default usePerformance;
