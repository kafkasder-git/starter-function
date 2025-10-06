/**
 * @fileoverview usePerformanceEnhanced Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// 🚀 ENHANCED PERFORMANCE MONITORING HOOK
// Comprehensive performance tracking and optimization

import { useCallback, useEffect, useRef, useState } from 'react';

import { logger } from '../lib/logging/logger';
/**
 * PerformanceMetrics Interface
 * 
 * @interface PerformanceMetrics
 */
export interface PerformanceMetrics {
  readonly renderTime: number;
  readonly memoryUsage: number;
  readonly componentMounts: number;
  readonly reRenders: number;
  readonly lastRenderTime: number;
  readonly averageRenderTime: number;
  readonly peakMemoryUsage: number;
}

/**
 * PerformanceThresholds Interface
 * 
 * @interface PerformanceThresholds
 */
export interface PerformanceThresholds {
  readonly maxRenderTime: number;
  readonly maxMemoryUsage: number;
  readonly maxReRenders: number;
}

interface PerformanceEntry {
  readonly timestamp: number;
  readonly renderTime: number;
  readonly memoryUsage: number;
}

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  maxRenderTime: 16, // 16ms for 60fps
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  maxReRenders: 5,
};

/**
 * Enhanced performance monitoring hook
 * Tracks component performance metrics and provides optimization insights
 */
/**
 * usePerformanceEnhanced function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function usePerformanceEnhanced(
  componentName: string,
  thresholds: Partial<PerformanceThresholds> = {},
) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentMounts: 0,
    reRenders: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    peakMemoryUsage: 0,
  });

  const renderStartTime = useRef<number>(0);
  const performanceHistory = useRef<PerformanceEntry[]>([]);
  const mountCount = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const isFirstRender = useRef<boolean>(true);

  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };

  // Get memory usage (if available)
  const getMemoryUsage = useCallback((): number => {
    if ('memory' in performance) {
      const {memory} = (performance as any);
      return memory.usedJSHeapSize ?? 0;
    }
    return 0;
  }, []);

  // Start performance measurement
  const startMeasurement = useCallback(() => {
    renderStartTime.current = performance.now();
  }, []);

  // End performance measurement and update metrics
  const endMeasurement = useCallback(() => {
    const renderTime = performance.now() - renderStartTime.current;
    const memoryUsage = getMemoryUsage();

    renderCount.current += 1;

    // Add to history (keep last 100 entries)
    const entry: PerformanceEntry = {
      timestamp: Date.now(),
      renderTime,
      memoryUsage,
    };

    performanceHistory.current.push(entry);
    if (performanceHistory.current.length > 100) {
      performanceHistory.current.shift();
    }

    // Calculate metrics
    const history = performanceHistory.current;
    const averageRenderTime =
      history.length > 0
        ? history.reduce((sum, entry) => sum + entry.renderTime, 0) / history.length
        : 0;

    const peakMemoryUsage = Math.max(metrics.peakMemoryUsage, memoryUsage);

    setMetrics({
      renderTime,
      memoryUsage,
      componentMounts: mountCount.current,
      reRenders: renderCount.current - 1, // Subtract initial render
      lastRenderTime: renderTime,
      averageRenderTime,
      peakMemoryUsage,
    });

    // Performance warnings in development
    if (import.meta.env.DEV) {
      if (renderTime > finalThresholds.maxRenderTime) {
        logger.warn(
          `⚡ Performance Warning: ${componentName} render time (${renderTime.toFixed(2)}ms) ` +
            `exceeds threshold (${finalThresholds.maxRenderTime}ms)`,
        );
      }

      if (memoryUsage > finalThresholds.maxMemoryUsage) {
        logger.warn(
          `🧠 Memory Warning: ${componentName} memory usage (${(memoryUsage / 1024 / 1024).toFixed(2)}MB) ` +
            `exceeds threshold (${(finalThresholds.maxMemoryUsage / 1024 / 1024).toFixed(2)}MB)`,
        );
      }

      if (renderCount.current > finalThresholds.maxReRenders + 1) {
        logger.warn(
          `🔄 Re-render Warning: ${componentName} has re-rendered ${renderCount.current} times ` +
            `(threshold: ${finalThresholds.maxReRenders})`,
        );
      }
    }
  }, [componentName, finalThresholds, getMemoryUsage, metrics.peakMemoryUsage]);

  // Component mount/unmount tracking
  useEffect(() => {
    if (isFirstRender.current) {
      mountCount.current += 1;
      isFirstRender.current = false;
    }

    return () => {
      // Component unmount cleanup
      if (import.meta.env.DEV) {
        logger.info(`📊 Performance Summary for ${componentName}:`, {
          totalRenders: renderCount.current,
          averageRenderTime: `${metrics.averageRenderTime.toFixed(2)  }ms`,
          peakMemoryUsage: `${(metrics.peakMemoryUsage / 1024 / 1024).toFixed(2)  }MB`,
          mountCount: mountCount.current,
        });
      }
    };
  }, []);

  // Performance measurement effect
  useEffect(() => {
    startMeasurement();

    // Use setTimeout to measure after paint
    const timeoutId = setTimeout(() => {
      endMeasurement();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  });

  // Get performance insights
  const getInsights = useCallback(() => {
    const insights: string[] = [];

    if (metrics.averageRenderTime > finalThresholds.maxRenderTime) {
      insights.push('Consider memoizing expensive calculations with useMemo');
      insights.push('Check if components can be wrapped with React.memo');
    }

    if (metrics.reRenders > finalThresholds.maxReRenders) {
      insights.push('High re-render count - check dependency arrays in hooks');
      insights.push('Consider using useCallback for function props');
    }

    if (metrics.peakMemoryUsage > finalThresholds.maxMemoryUsage) {
      insights.push('High memory usage - check for memory leaks');
      insights.push('Consider lazy loading or virtualization for large datasets');
    }

    return insights;
  }, [metrics, finalThresholds]);

  // Clear performance history
  const clearHistory = useCallback(() => {
    performanceHistory.current = [];
    renderCount.current = 0;
    mountCount.current = 0;
    setMetrics({
      renderTime: 0,
      memoryUsage: 0,
      componentMounts: 0,
      reRenders: 0,
      lastRenderTime: 0,
      averageRenderTime: 0,
      peakMemoryUsage: 0,
    });
  }, []);

  // Check if performance is within acceptable limits
  const isPerformanceGood = useCallback(() => {
    return (
      metrics.averageRenderTime <= finalThresholds.maxRenderTime &&
      metrics.peakMemoryUsage <= finalThresholds.maxMemoryUsage &&
      metrics.reRenders <= finalThresholds.maxReRenders
    );
  }, [metrics, finalThresholds]);

  return {
    metrics,
    thresholds: finalThresholds,
    getInsights,
    clearHistory,
    isPerformanceGood,

    // For manual measurement
    startMeasurement,
    endMeasurement,
  };
}

/**
 * Hook for measuring specific operations
 */
/**
 * useOperationTimer function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useOperationTimer() {
  const [measurements, setMeasurements] = useState<Record<string, number>>({});
  const timers = useRef<Record<string, number>>({});

  const startTimer = useCallback((operationName: string) => {
    timers.current[operationName] = performance.now();
  }, []);

  const endTimer = useCallback((operationName: string) => {
    const startTime = timers.current[operationName];
    if (startTime) {
      const duration = performance.now() - startTime;
      setMeasurements((prev) => ({
        ...prev,
        [operationName]: duration,
      }));
      delete timers.current[operationName];

      if (import.meta.env.DEV) {
        logger.info(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
      }

      return duration;
    }
    return 0;
  }, []);

  const measureAsync = useCallback(
    async <T>(operationName: string, operation: () => Promise<T>): Promise<T> => {
      startTimer(operationName);
      try {
        const result = await operation();
        return result;
      } finally {
        endTimer(operationName);
      }
    },
    [startTimer, endTimer],
  );

  const measureSync = useCallback(
    <T>(operationName: string, operation: () => T): T => {
      startTimer(operationName);
      try {
        const result = operation();
        return result;
      } finally {
        endTimer(operationName);
      }
    },
    [startTimer, endTimer],
  );

  return {
    measurements,
    startTimer,
    endTimer,
    measureAsync,
    measureSync,
  };
}

/**
 * Hook for monitoring bundle size and chunk loading
 */
/**
 * useBundleMetrics function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useBundleMetrics() {
  const [bundleMetrics, setBundleMetrics] = useState({
    loadedChunks: 0,
    totalBundleSize: 0,
    chunkLoadTimes: {} as Record<string, number>,
  });

  useEffect(() => {
    // Monitor chunk loading if webpack is available
    if (typeof window !== 'undefined' && (window as any).__webpack_require__) {
      const webpack = (window as any).__webpack_require__;

      // Track loaded chunks
      const originalEnsure = webpack.e;
      webpack.e = function (chunkId: string) {
        const startTime = performance.now();

        return originalEnsure.call(this, chunkId).then((result: any) => {
          const loadTime = performance.now() - startTime;

          setBundleMetrics((prev) => ({
            loadedChunks: prev.loadedChunks + 1,
            totalBundleSize: prev.totalBundleSize,
            chunkLoadTimes: {
              ...prev.chunkLoadTimes,
              [chunkId]: loadTime,
            },
          }));

          // Chunk loading performance tracking (removed logger.info)

          return result;
        });
      };
    }

    // Monitor resource loading
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          setBundleMetrics((prev) => ({
            ...prev,
            totalBundleSize: prev.totalBundleSize + (entry as any).transferSize ?? 0,
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });

    return () => {
      observer.disconnect();
    };
  }, []);

  return bundleMetrics;
}

export default usePerformanceEnhanced;
