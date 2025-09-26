/**
 * @fileoverview Advanced Performance Service
 * @description Gelişmiş performans izleme ve optimizasyon servisi
 */

import React from 'react';
import { monitoring } from './monitoringService';
import { logger } from '../lib/logging/logger';

// Declare gtag for analytics (if available)
declare global {
  function gtag(...args: unknown[]): void;
}

// Performans metrikleri
interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte

  // Custom metrics
  componentRenderTime: number;
  apiResponseTime: number;
  bundleSize: number;
  memoryUsage: number;
  cpuUsage: number;

  // User experience
  pageLoadTime: number;
  interactionTime: number;
  errorRate: number;
  bounceRate: number;
}

// Performans raporu
interface PerformanceReport {
  timestamp: Date;
  url: string;
  userAgent: string;
  connection: string;
  metrics: PerformanceMetrics;
  recommendations: string[];
  score: number; // 0-100
}

// Performans optimizasyon önerileri
interface OptimizationSuggestion {
  type: 'critical' | 'warning' | 'info';
  category: 'performance' | 'accessibility' | 'seo' | 'best-practices';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
  code?: string;
  resources?: string[];
}

class AdvancedPerformanceService {
  private readonly metrics = new Map<string, PerformanceMetrics>();
  private readonly reports: PerformanceReport[] = [];
  private observers: PerformanceObserver[] = [];
  private isMonitoring = false;

  constructor() {
    this.initializePerformanceMonitoring();
  }

  /**
   * Performans izlemeyi başlat
   */
  private initializePerformanceMonitoring(): void {
    if (typeof window === 'undefined') return;

    try {
      // Core Web Vitals izleme
      this.observeCoreWebVitals();

      // Custom metrikler izleme
      this.observeCustomMetrics();

      // Memory kullanımı izleme
      this.observeMemoryUsage();

      // Network performansı izleme
      this.observeNetworkPerformance();

      // Component render süreleri izleme
      this.observeComponentPerformance();

      this.isMonitoring = true;
      logger.info('[Performance] Advanced monitoring initialized');
    } catch (error) {
      logger.error('[Performance] Failed to initialize monitoring:', error);
    }
  }

  /**
   * Core Web Vitals metriklerini izle
   */
  private observeCoreWebVitals(): void {
    // LCP (Largest Contentful Paint)
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.updateMetric('lcp', lastEntry.startTime);
        this.reportMetric('lcp', lastEntry.startTime);
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        logger.warn('[Performance] LCP observer not supported');
      }
    }

    // FID (First Input Delay)
    if ('PerformanceObserver' in window) {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.updateMetric('fid', entry.processingStart - entry.startTime);
          this.reportMetric('fid', entry.processingStart - entry.startTime);
        });
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        logger.warn('[Performance] FID observer not supported');
      }
    }

    // CLS (Cumulative Layout Shift)
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.updateMetric('cls', clsValue);
            this.reportMetric('cls', clsValue);
          }
        });
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (error) {
        logger.warn('[Performance] CLS observer not supported');
      }
    }
  }

  /**
   * Custom metrikleri izle
   */
  private observeCustomMetrics(): void {
    // Sayfa yükleme süresi
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;

      this.updateMetric('pageLoadTime', loadTime);
      this.reportMetric('pageLoadTime', loadTime);
    });

    // TTFB (Time to First Byte)
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation',
      )[0] as PerformanceNavigationTiming;
      const ttfb = navigation.responseStart - navigation.fetchStart;

      this.updateMetric('ttfb', ttfb);
      this.reportMetric('ttfb', ttfb);
    });

    // FCP (First Contentful Paint)
    if ('PerformanceObserver' in window) {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.updateMetric('fcp', entry.startTime);
          this.reportMetric('fcp', entry.startTime);
        });
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        logger.warn('[Performance] FCP observer not supported');
      }
    }
  }

  /**
   * Memory kullanımını izle
   */
  private observeMemoryUsage(): void {
    if ('memory' in performance) {
      const checkMemory = () => {
        const {memory} = (performance as any);
        this.updateMetric('memoryUsage', memory.usedJSHeapSize);
        this.reportMetric('memoryUsage', memory.usedJSHeapSize);
      };

      // İlk kontrol
      checkMemory();

      // Periyodik kontrol (her 30 saniyede bir)
      setInterval(checkMemory, 30000);
    }
  }

  /**
   * Network performansını izle
   */
  private observeNetworkPerformance(): void {
    if ('PerformanceObserver' in window) {
      const networkObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.entryType === 'resource') {
            const responseTime = entry.responseEnd - entry.requestStart;
            this.updateMetric('apiResponseTime', responseTime);
            this.reportMetric('apiResponseTime', responseTime);
          }
        });
      });

      try {
        networkObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(networkObserver);
      } catch (error) {
        logger.warn('[Performance] Network observer not supported');
      }
    }
  }

  /**
   * Component performansını izle
   */
  private observeComponentPerformance(): void {
    // React component render sürelerini izlemek için
    // Bu kısım React DevTools Profiler API'si ile entegre edilebilir
    if (typeof window !== 'undefined' && (window as any).React) {
      // React Profiler entegrasyonu burada yapılabilir
      logger.info('[Performance] React component monitoring available');
    }
  }

  /**
   * Metrik güncelle
   */
  private updateMetric(key: keyof PerformanceMetrics, value: number): void {
    const currentMetrics = this.metrics.get(window.location.pathname) || this.getDefaultMetrics();
    currentMetrics[key] = value;
    this.metrics.set(window.location.pathname, currentMetrics);
  }

  /**
   * Metrik raporla
   */
  private reportMetric(key: keyof PerformanceMetrics, value: number): void {
    // Monitor with tracking
    monitoring.trackEvent('performance_metric', {
      metric: key,
      value,
      url: window.location.pathname,
    });

    // Analytics'e gönder
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metric', {
        metric_name: key,
        metric_value: value,
        page_path: window.location.pathname,
      });
    }
  }

  /**
   * Varsayılan metrikler
   */
  private getDefaultMetrics(): PerformanceMetrics {
    return {
      lcp: 0,
      fid: 0,
      cls: 0,
      fcp: 0,
      ttfb: 0,
      componentRenderTime: 0,
      apiResponseTime: 0,
      bundleSize: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      pageLoadTime: 0,
      interactionTime: 0,
      errorRate: 0,
      bounceRate: 0,
    };
  }

  /**
   * Performans raporu oluştur
   */
  public generateReport(): PerformanceReport {
    const currentMetrics = this.metrics.get(window.location.pathname) || this.getDefaultMetrics();
    const score = this.calculatePerformanceScore(currentMetrics);
    const recommendations = this.generateRecommendations(currentMetrics);

    const report: PerformanceReport = {
      timestamp: new Date(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      metrics: currentMetrics,
      recommendations,
      score,
    };

    this.reports.push(report);
    return report;
  }

  /**
   * Performans skoru hesapla (0-100)
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    let score = 100;

    // LCP scoring (0-2.5s = 100, 2.5-4s = 50, >4s = 0)
    if (metrics.lcp > 4000) score -= 30;
    else if (metrics.lcp > 2500) score -= 15;

    // FID scoring (0-100ms = 100, 100-300ms = 50, >300ms = 0)
    if (metrics.fid > 300) score -= 25;
    else if (metrics.fid > 100) score -= 10;

    // CLS scoring (0-0.1 = 100, 0.1-0.25 = 50, >0.25 = 0)
    if (metrics.cls > 0.25) score -= 20;
    else if (metrics.cls > 0.1) score -= 10;

    // Page load time scoring
    if (metrics.pageLoadTime > 5000) score -= 15;
    else if (metrics.pageLoadTime > 3000) score -= 8;

    // Memory usage scoring
    if (metrics.memoryUsage > 100 * 1024 * 1024)
      score -= 10; // >100MB
    else if (metrics.memoryUsage > 50 * 1024 * 1024) score -= 5; // >50MB

    return Math.max(0, score);
  }

  /**
   * Optimizasyon önerileri oluştur
   */
  private generateRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.lcp > 2500) {
      recommendations.push(
        'Largest Contentful Paint süresini optimize edin. Görsel sıkıştırma ve lazy loading kullanın.',
      );
    }

    if (metrics.fid > 100) {
      recommendations.push(
        "First Input Delay'i azaltın. JavaScript bundle'ını optimize edin ve code splitting uygulayın.",
      );
    }

    if (metrics.cls > 0.1) {
      recommendations.push(
        "Cumulative Layout Shift'i azaltın. Görsel boyutlarını önceden tanımlayın.",
      );
    }

    if (metrics.pageLoadTime > 3000) {
      recommendations.push(
        'Sayfa yükleme süresini optimize edin. Critical CSS inline yapın ve gereksiz kaynakları kaldırın.',
      );
    }

    if (metrics.memoryUsage > 50 * 1024 * 1024) {
      recommendations.push(
        "Memory kullanımını optimize edin. Memory leak'leri kontrol edin ve garbage collection'ı iyileştirin.",
      );
    }

    if (metrics.apiResponseTime > 1000) {
      recommendations.push(
        'API yanıt sürelerini optimize edin. Caching ve database query optimizasyonu uygulayın.',
      );
    }

    return recommendations;
  }

  /**
   * Bağlantı bilgisi al
   */
  private getConnectionInfo(): string {
    if ('connection' in navigator) {
      const {connection} = (navigator as any);
      return `${connection.effectiveType ?? 'unknown'} (${connection.downlink ?? 'unknown'} Mbps)`;
    }
    return 'unknown';
  }

  /**
   * Performans optimizasyon önerileri al
   */
  public getOptimizationSuggestions(): OptimizationSuggestion[] {
    const currentMetrics = this.metrics.get(window.location.pathname) || this.getDefaultMetrics();
    const suggestions: OptimizationSuggestion[] = [];

    // LCP optimizasyonları
    if (currentMetrics.lcp > 2500) {
      suggestions.push({
        type: 'critical',
        category: 'performance',
        title: 'Largest Contentful Paint Optimizasyonu',
        description: 'LCP süresini 2.5s altına düşürün',
        impact: 'high',
        effort: 'medium',
        code: `
// Görsel optimizasyonu
<img 
  src="image.jpg" 
  loading="lazy" 
  decoding="async"
  width="800" 
  height="600"
  alt="Description"
/>

// Critical CSS inline
<style dangerouslySetInnerHTML={{__html: criticalCSS}} />
        `,
        resources: ['https://web.dev/lcp/', 'https://web.dev/optimize-lcp/'],
      });
    }

    // Bundle size optimizasyonları
    if (currentMetrics.bundleSize > 500 * 1024) {
      // >500KB
      suggestions.push({
        type: 'warning',
        category: 'performance',
        title: 'Bundle Size Optimizasyonu',
        description: 'JavaScript bundle boyutunu azaltın',
        impact: 'high',
        effort: 'high',
        code: `
// Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

// Tree shaking
import { specificFunction } from 'large-library';

import { logger } from '../lib/logging/logger';
// Bundle analyzer
npm install --save-dev webpack-bundle-analyzer
        `,
        resources: [
          'https://web.dev/reduce-javascript-payloads-with-code-splitting/',
          'https://webpack.js.org/guides/tree-shaking/',
        ],
      });
    }

    // Memory optimizasyonları
    if (currentMetrics.memoryUsage > 100 * 1024 * 1024) {
      suggestions.push({
        type: 'warning',
        category: 'performance',
        title: 'Memory Leak Kontrolü',
        description: 'Memory kullanımını optimize edin',
        impact: 'medium',
        effort: 'medium',
        code: `
// Event listener cleanup
useEffect(() => {
  const handleResize = () => {};
  window.addEventListener('resize', handleResize);
  
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []);

// WeakMap kullanımı
const cache = new WeakMap();
        `,
        resources: [
          'https://web.dev/memory-leaks/',
          'https://developer.mozilla.org/en-US/docs/Web/API/WeakMap',
        ],
      });
    }

    return suggestions;
  }

  /**
   * Performans raporlarını al
   */
  public getReports(): PerformanceReport[] {
    return [...this.reports];
  }

  /**
   * Performans metriklerini al
   */
  public getMetrics(): Map<string, PerformanceMetrics> {
    return new Map(this.metrics);
  }

  /**
   * İzlemeyi durdur
   */
  public stopMonitoring(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers = [];
    this.isMonitoring = false;
    logger.info('[Performance] Monitoring stopped');
  }

  /**
   * İzleme durumunu kontrol et
   */
  public isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Real-time performans dashboard verisi
   */
  public getDashboardData() {
    const currentMetrics = this.metrics.get(window.location.pathname) || this.getDefaultMetrics();
    const score = this.calculatePerformanceScore(currentMetrics);

    return {
      score,
      metrics: currentMetrics,
      recommendations: this.generateRecommendations(currentMetrics),
      suggestions: this.getOptimizationSuggestions(),
      isMonitoring: this.isMonitoring,
      lastUpdate: new Date(),
    };
  }
}

// Singleton instance
export const advancedPerformanceService = new AdvancedPerformanceService();

// React hook for performance monitoring
export const usePerformanceMonitoring = () => {
  const [dashboardData, setDashboardData] = React.useState(
    advancedPerformanceService.getDashboardData(),
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDashboardData(advancedPerformanceService.getDashboardData());
    }, 5000); // Her 5 saniyede güncelle

    return () => {
      clearInterval(interval);
    };
  }, []);

  return {
    ...dashboardData,
    generateReport: () => advancedPerformanceService.generateReport(),
    getOptimizationSuggestions: () => advancedPerformanceService.getOptimizationSuggestions(),
  };
};

export default advancedPerformanceService;
