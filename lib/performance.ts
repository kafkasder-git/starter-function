/**
 * Performance Optimization Utilities for Kafkasder Management Panel
 * Provides performance monitoring, optimization helpers, and bundle analysis
 */

import { logger } from './logging/logger';

// Performance metrics interface
export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  apiResponseTime: number;
  userInteractionTime: number;
}

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  LOAD_TIME: 3000, // 3 seconds
  RENDER_TIME: 100, // 100ms
  API_RESPONSE_TIME: 2000, // 2 seconds
  MEMORY_USAGE: 50 * 1024 * 1024, // 50MB
  BUNDLE_SIZE: 1024 * 1024, // 1MB
} as const;

/**
 * Performance Monitor class
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor | undefined;
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];
  private readonly maxMetrics = 100;

  private constructor() {
    this.initializeObservers();
  }

  public static getInstance(): PerformanceMonitor {
    PerformanceMonitor.instance ??= new PerformanceMonitor();
    return PerformanceMonitor.instance;
  }

  /**
   * Initialize performance observers
   */
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Navigation timing observer
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              this.recordNavigationMetrics(entry as PerformanceNavigationTiming);
            }
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (error) {
        // Navigation timing observer not supported
        logger.warn('Navigation timing observer not supported:', error);
      }

      // Resource timing observer
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'resource') {
              this.recordResourceMetrics(entry as PerformanceResourceTiming);
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (error) {
        // Resource timing observer not supported
        logger.warn('Resource timing observer not supported:', error);
      }

      // Long task observer
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'longtask') {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              this.recordLongTask(entry as PerformanceEntry);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        // Long task observer not supported
        logger.warn('Long task observer not supported:', error);
      }
    }
  }

  /**
   * Record navigation metrics
   */
  private recordNavigationMetrics(entry: PerformanceNavigationTiming): void {
    const loadTime = entry.loadEventEnd - entry.fetchStart;
    const renderTime = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;

    this.addMetric({
      loadTime,
      renderTime,
      memoryUsage: this.getMemoryUsage(),
      bundleSize: this.estimateBundleSize(),
      apiResponseTime: 0,
      userInteractionTime: 0,
    });

    // Log performance warnings
    if (loadTime > PERFORMANCE_THRESHOLDS.LOAD_TIME) {
      logger.warn(`⚠️ Slow page load: ${loadTime}ms (threshold: ${PERFORMANCE_THRESHOLDS.LOAD_TIME}ms)`);
    }

    if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME) {
      logger.warn(`⚠️ Slow render: ${renderTime}ms (threshold: ${PERFORMANCE_THRESHOLDS.RENDER_TIME}ms)`);
    }
  }

  /**
   * Record resource metrics
   */
  private recordResourceMetrics(entry: PerformanceResourceTiming): void {
    const responseTime = entry.responseEnd - entry.requestStart;
    
    if (responseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) {
      logger.warn(`⚠️ Slow resource load: ${entry.name} - ${responseTime}ms`);
    }
  }

  /**
   * Record long task
   */
  private recordLongTask(entry: PerformanceEntry): void {
    logger.warn(`⚠️ Long task detected: ${entry.duration}ms`);
    
    // Report to analytics if available
    if (typeof window !== 'undefined' && 'gtag' in window) {
      const { gtag } = window as { gtag: (event: string, action: string, params: Record<string, unknown>) => void };
      gtag('event', 'long_task', {
        duration: entry.duration,
        start_time: entry.startTime,
      });
    }
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const { memory } = performance as { memory: { usedJSHeapSize: number } };
      return memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Estimate bundle size
   */
  private estimateBundleSize(): number {
    if (typeof window === 'undefined') return 0;

    let totalSize = 0;
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.includes('node_modules')) {
        // Rough estimation based on script count
        totalSize += 100 * 1024; // 100KB per script estimate
      }
    });

    return totalSize;
  }

  /**
   * Add performance metric
   */
  private addMetric(metric: PerformanceMetrics): void {
    this.metrics.unshift(metric);
    
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get average metrics
   */
  public getAverageMetrics(): Partial<PerformanceMetrics> {
    if (this.metrics.length === 0) return {};

    const totals = this.metrics.reduce(
      (acc, metric) => ({
        loadTime: acc.loadTime + metric.loadTime,
        renderTime: acc.renderTime + metric.renderTime,
        memoryUsage: acc.memoryUsage + metric.memoryUsage,
        bundleSize: acc.bundleSize + metric.bundleSize,
        apiResponseTime: acc.apiResponseTime + metric.apiResponseTime,
        userInteractionTime: acc.userInteractionTime + metric.userInteractionTime,
      }),
      {
        loadTime: 0,
        renderTime: 0,
        memoryUsage: 0,
        bundleSize: 0,
        apiResponseTime: 0,
        userInteractionTime: 0,
      }
    );

    const count = this.metrics.length;
    return {
      loadTime: totals.loadTime / count,
      renderTime: totals.renderTime / count,
      memoryUsage: totals.memoryUsage / count,
      bundleSize: totals.bundleSize / count,
      apiResponseTime: totals.apiResponseTime / count,
      userInteractionTime: totals.userInteractionTime / count,
    };
  }

  /**
   * Get performance score
   */
  public getPerformanceScore(): number {
    const averages = this.getAverageMetrics();
    let score = 100;

    // Deduct points for poor performance
    if (averages.loadTime && averages.loadTime > PERFORMANCE_THRESHOLDS.LOAD_TIME) {
      score -= 20;
    }
    if (averages.renderTime && averages.renderTime > PERFORMANCE_THRESHOLDS.RENDER_TIME) {
      score -= 15;
    }
    if (averages.memoryUsage && averages.memoryUsage > PERFORMANCE_THRESHOLDS.MEMORY_USAGE) {
      score -= 10;
    }
    if (averages.bundleSize && averages.bundleSize > PERFORMANCE_THRESHOLDS.BUNDLE_SIZE) {
      score -= 15;
    }
    if (averages.apiResponseTime && averages.apiResponseTime > PERFORMANCE_THRESHOLDS.API_RESPONSE_TIME) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  /**
   * Cleanup observers
   */
  public cleanup(): void {
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers = [];
  }
}

/**
 * Performance optimization utilities
 */
export const PerformanceUtils = {
  /**
   * Debounce function for performance
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function for performance
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Lazy load images
   */
  lazyLoadImages(): void {
    if (typeof window === 'undefined') return;

    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.setAttribute('src', img.dataset['src'] ?? '');
          img.removeAttribute('data-src');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => {
      imageObserver.observe(img);
    });
  },

  /**
   * Preload critical resources
   */
  preloadResource(href: string, as: string): void {
    if (typeof document === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  /**
   * Measure function execution time
   */
  measureTime<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    logger.debug(`${label}: ${end - start}ms`);
    return result;
  },

  /**
   * Measure async function execution time
   */
  async measureAsyncTime<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    logger.debug(`${label}: ${end - start}ms`);
    return result;
  },

  /**
   * Check if device is low-end
   */
  isLowEndDevice(): boolean {
    if (typeof navigator === 'undefined') return false;

    // Check hardware concurrency
    const cores = navigator.hardwareConcurrency || 1;
    if (cores < 4) return true;

    // Check memory (if available)
    if ('memory' in performance) {
      const { memory } = performance as { memory: { jsHeapSizeLimit: number } };
      if (memory.jsHeapSizeLimit < 2 * 1024 * 1024 * 1024) { // 2GB
        return true;
      }
    }

    // Check connection (if available)
    if ('connection' in navigator) {
      const { connection } = navigator as { connection: { effectiveType: string } };
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return true;
      }
    }

    return false;
  },

  /**
   * Optimize for low-end devices
   */
  optimizeForLowEnd(): void {
    if (!this.isLowEndDevice()) return;

    // Reduce animation complexity
    document.documentElement.style.setProperty('--animation-duration', '0.1s');
    
    // Disable expensive features
    const expensiveElements = document.querySelectorAll('[data-expensive]');
    expensiveElements.forEach(el => {
      (el as HTMLElement).style.display = 'none';
    });

    logger.info('🔧 Optimized for low-end device');
  },

  /**
   * Bundle size analyzer
   */
  analyzeBundleSize(): void {
    if (typeof window === 'undefined') return;

    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    logger.debug('📦 Bundle Analysis');
    logger.debug(`Scripts: ${scripts.length}`);
    logger.debug(`Stylesheets: ${stylesheets.length}`);
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        logger.debug(`Script: ${src}`);
      }
    });
    
    stylesheets.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        logger.debug(`Stylesheet: ${href}`);
      }
    });
  },
};

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Default export
export default PerformanceMonitor;
