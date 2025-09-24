import { useCallback, useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  renderTime: number;
  networkLatency: number;
  errorCount: number;
  timestamp: number;
}

interface UsePerformanceMonitoringOptions {
  interval?: number;
  enableFPSMonitoring?: boolean;
  enableMemoryMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  onAlert?: (metric: string, value: number, threshold: number) => void;
}

const PERFORMANCE_THRESHOLDS = {
  fps: 30,
  memoryUsage: 80,
  renderTime: 16,
  networkLatency: 1000,
  errorCount: 5,
};

export function usePerformanceMonitoring({
  interval = 5000,
  enableFPSMonitoring = true,
  enableMemoryMonitoring = true,
  enableNetworkMonitoring = true,
  onAlert,
}: UsePerformanceMonitoringOptions = {}) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    renderTime: 0,
    networkLatency: 0,
    errorCount: 0,
    timestamp: Date.now(),
  });

  const [isMonitoring, setIsMonitoring] = useState(false);
  const [history, setHistory] = useState<PerformanceMetrics[]>([]);

  const fpsCounterRef = useRef<{ frames: number; lastTime: number }>({
    frames: 0,
    lastTime: performance.now(),
  });
  const errorCountRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // FPS Monitoring
  const measureFPS = useCallback(() => {
    if (!enableFPSMonitoring) return;

    const measure = () => {
      fpsCounterRef.current.frames++;
      const currentTime = performance.now();
      const elapsed = currentTime - fpsCounterRef.current.lastTime;

      if (elapsed >= 1000) {
        const fps = Math.round((fpsCounterRef.current.frames * 1000) / elapsed);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = currentTime;

        setMetrics((prev) => ({ ...prev, fps }));

        // Check threshold
        if (fps < PERFORMANCE_THRESHOLDS.fps) {
          onAlert?.('fps', fps, PERFORMANCE_THRESHOLDS.fps);
        }
      }

      if (isMonitoring) {
        requestAnimationFrame(measure);
      }
    };

    if (isMonitoring) {
      requestAnimationFrame(measure);
    }
  }, [isMonitoring, enableFPSMonitoring, onAlert]);

  // Memory Monitoring
  const measureMemory = useCallback(() => {
    if (!enableMemoryMonitoring) return;

    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usagePercent = Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);

      setMetrics((prev) => ({ ...prev, memoryUsage: usagePercent }));

      // Check threshold
      if (usagePercent > PERFORMANCE_THRESHOLDS.memoryUsage) {
        onAlert?.('memory', usagePercent, PERFORMANCE_THRESHOLDS.memoryUsage);
      }
    }
  }, [enableMemoryMonitoring, onAlert]);

  // Network Latency Monitoring
  const measureNetworkLatency = useCallback(async () => {
    if (!enableNetworkMonitoring) return;

    const startTime = performance.now();

    try {
      await fetch('/favicon.svg', {
        method: 'HEAD',
        cache: 'no-cache',
      });

      const latency = Math.round(performance.now() - startTime);
      setMetrics((prev) => ({ ...prev, networkLatency: latency }));

      // Check threshold
      if (latency > PERFORMANCE_THRESHOLDS.networkLatency) {
        onAlert?.('network', latency, PERFORMANCE_THRESHOLDS.networkLatency);
      }
    } catch (error) {
      console.warn('Network latency measurement failed:', error);
      setMetrics((prev) => ({ ...prev, networkLatency: -1 }));
    }
  }, [enableNetworkMonitoring, onAlert]);

  // Render Time Monitoring
  const measureRenderTime = useCallback(() => {
    const renderStart = performance.now();

    requestAnimationFrame(() => {
      const renderTime = Math.round(performance.now() - renderStart);
      setMetrics((prev) => ({ ...prev, renderTime }));

      // Check threshold
      if (renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
        onAlert?.('render', renderTime, PERFORMANCE_THRESHOLDS.renderTime);
      }
    });
  }, [onAlert]);

  // Error Monitoring
  useEffect(() => {
    const handleError = () => {
      errorCountRef.current++;
      setMetrics((prev) => ({ ...prev, errorCount: errorCountRef.current }));

      // Check threshold
      if (errorCountRef.current > PERFORMANCE_THRESHOLDS.errorCount) {
        onAlert?.('errors', errorCountRef.current, PERFORMANCE_THRESHOLDS.errorCount);
      }
    };

    const handleUnhandledRejection = () => {
      errorCountRef.current++;
      setMetrics((prev) => ({ ...prev, errorCount: errorCountRef.current }));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onAlert]);

  // Core Web Vitals
  const measureCoreWebVitals = useCallback(() => {
    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      setMetrics((prev) => ({ ...prev, loadTime: Math.round(lastEntry.startTime) }));
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Type guard to ensure we have the correct entry type
        if ('processingStart' in entry) {
          const eventEntry = entry as PerformanceEventTiming;
          const fid = eventEntry.processingStart - eventEntry.startTime;
          console.log('First Input Delay:', fid);
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      let cumulativeScore = 0;
      list.getEntries().forEach((entry) => {
        // Type guard for LayoutShift entry
        if (entry.entryType === 'layout-shift') {
          const layoutShiftEntry = entry as any; // Use any for layout-shift entries as the interface may not be available
          if (!layoutShiftEntry.hadRecentInput) {
            cumulativeScore += layoutShiftEntry.value || 0;
          }
        }
      });
      console.log('Cumulative Layout Shift:', cumulativeScore);
    }).observe({ entryTypes: ['layout-shift'] });
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    measureCoreWebVitals();
  }, [measureCoreWebVitals]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Main monitoring loop
  useEffect(() => {
    if (!isMonitoring) return;

    intervalRef.current = setInterval(() => {
      measureMemory();
      measureNetworkLatency();
      measureRenderTime();

      // Update history
      setHistory((prev) => {
        const newMetrics = { ...metrics, timestamp: Date.now() };
        const newHistory = [...prev, newMetrics];
        return newHistory.slice(-50); // Keep last 50 measurements
      });
    }, interval);

    measureFPS();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isMonitoring,
    interval,
    measureFPS,
    measureMemory,
    measureNetworkLatency,
    measureRenderTime,
    metrics,
  ]);

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    const recentMetrics = history.slice(-10);
    if (recentMetrics.length === 0) return null;

    const avgFPS = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
    const avgMemory =
      recentMetrics.reduce((sum, m) => sum + m.memoryUsage, 0) / recentMetrics.length;
    const avgLatency =
      recentMetrics.reduce((sum, m) => sum + m.networkLatency, 0) / recentMetrics.length;
    const avgRenderTime =
      recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) / recentMetrics.length;

    return {
      averages: {
        fps: Math.round(avgFPS),
        memory: Math.round(avgMemory),
        latency: Math.round(avgLatency),
        renderTime: Math.round(avgRenderTime),
      },
      trends: {
        fps: recentMetrics[recentMetrics.length - 1]?.fps > avgFPS ? 'up' : 'down',
        memory: recentMetrics[recentMetrics.length - 1]?.memoryUsage < avgMemory ? 'up' : 'down',
        latency:
          recentMetrics[recentMetrics.length - 1]?.networkLatency < avgLatency ? 'up' : 'down',
      },
    };
  }, [history]);

  // Reset monitoring data
  const resetMonitoring = useCallback(() => {
    setHistory([]);
    errorCountRef.current = 0;
    setMetrics({
      fps: 60,
      memoryUsage: 0,
      loadTime: 0,
      renderTime: 0,
      networkLatency: 0,
      errorCount: 0,
      timestamp: Date.now(),
    });
  }, []);

  // Get performance status
  const getPerformanceStatus = useCallback(() => {
    const issues = [];

    if (metrics.fps < PERFORMANCE_THRESHOLDS.fps) issues.push('Düşük FPS');
    if (metrics.memoryUsage > PERFORMANCE_THRESHOLDS.memoryUsage) issues.push('Yüksek Memory');
    if (metrics.networkLatency > PERFORMANCE_THRESHOLDS.networkLatency)
      issues.push('Yavaş Network');
    if (metrics.renderTime > PERFORMANCE_THRESHOLDS.renderTime) issues.push('Yavaş Render');

    return {
      status: issues.length === 0 ? 'excellent' : issues.length < 2 ? 'good' : 'poor',
      issues,
    };
  }, [metrics]);

  const performanceStatus = getPerformanceStatus();

  return {
    metrics,
    history,
    isMonitoring,
    performanceStatus,
    summary: getPerformanceSummary(),
    startMonitoring,
    stopMonitoring,
    resetMonitoring,
    toggleMonitoring: () => {
      isMonitoring ? stopMonitoring() : startMonitoring();
    },
  };
}
