/**
 * @fileoverview LazyComponents Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { lazy, Suspense } from 'react';
import { SkeletonLoader } from './LoadingSpinner';

import { logger } from '../lib/logging/logger';
// 🚀 LAZY LOADING OPTIMIZATION
// Heavy components için performance optimization

// Large Pages - Lazy loaded
// Demo component removed

export const BeneficiaryDetailPageComprehensive = lazy(() =>
  import('./pages/BeneficiaryDetailPageComprehensive').then((m) => ({
    default: m.BeneficiaryDetailPageComprehensive,
  })),
);

// SecurityManagementPage ve UserManagementPage kaldırıldı - eksik dosyalar

export const MeetingsPage = lazy(() =>
  import('./pages/MeetingsPage').then((m) => ({ default: m.MeetingsPage })),
);

// Analytics Components - Removed (components deleted)
// Workflow Components - Removed (components deleted)

// Chart Components - Heavy rendering
export const InteractiveChart = lazy(() =>
  import('./ui/InteractiveChart').then((m) => ({ default: m.InteractiveChart })),
);

// Beneficiary Components - Core components only
// BeneficiaryOptimized removed - unused component

// Heavy Pages - Additional lazy loading
export const BulkDataImportPage = lazy(() =>
  import('./pages/BulkDataImportPage').then((m) => ({ default: m.BulkDataImportPage })),
);

export const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));

export const UserManagementPageReal = lazy(() =>
  import('./pages/UserManagementPageReal').then((m) => ({ default: m.UserManagementPageReal })),
);

// Yeni eklenen sayfalar - performans optimizasyonu
export const DonationsPage = lazy(() =>
  import('./pages/DonationsPage').then((m) => ({ default: m.DonationsPage })),
);

export const MembersPage = lazy(() =>
  import('./pages/MembersPage').then((m) => ({ default: m.MembersPage })),
);

export const BeneficiariesPageEnhanced = lazy(() =>
  import('./pages/BeneficiariesPageEnhanced').then((m) => ({
    default: m.BeneficiariesPageEnhanced,
  })),
);

export const FinanceIncomePage = lazy(() =>
  import('./pages/FinanceIncomePage').then((m) => ({ default: m.FinanceIncomePage })),
);

export const EventsPage = lazy(() =>
  import('./pages/EventsPage').then((m) => ({ default: m.EventsPage })),
);

export const TasksPage = lazy(() =>
  import('./pages/TasksPage').then((m) => ({ default: m.TasksPage })),
);

// New PWA Components - Lazy load for better initial performance
export const PushNotificationManager = lazy(() =>
  import('./notifications/PushNotificationManager').then((m) => ({ default: m.default })),
);

export const BackgroundSyncManager = lazy(() =>
  import('./sync/BackgroundSyncManager').then((m) => ({ default: m.default })),
);

// Native features demo removed

// Analytics Components - Removed (components deleted)
// Reporting Components - Removed (components deleted)

// Wrapper component with loading fallback
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export const LazyWrapper = ({
  children,
  fallback = <SkeletonLoader variant="dashboard" />,
  className,
}: LazyWrapperProps) => (
  <div className={className}>
    <Suspense fallback={fallback}>{children}</Suspense>
  </div>
);

// Specific wrappers for different component types
export const LazyPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyWrapper fallback={<SkeletonLoader variant="dashboard" />}>{children}</LazyWrapper>
);

export const LazyCardWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyWrapper fallback={<SkeletonLoader variant="cards" />}>{children}</LazyWrapper>
);

export const LazyDashboardWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyWrapper fallback={<SkeletonLoader variant="dashboard" />}>{children}</LazyWrapper>
);

export const LazyTableWrapper = ({ children }: { children: React.ReactNode }) => (
  <LazyWrapper fallback={<SkeletonLoader variant="table" />}>{children}</LazyWrapper>
);

// Performance optimized chart wrapper
export const LazyChartWrapper = ({
  children,
  height = 300,
}: {
  children: React.ReactNode;
  height?: number;
}) => (
  <div style={{ height }}>
    <Suspense
      fallback={
        <div className="animate-pulse bg-gray-200 rounded-lg" style={{ height }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Grafik yükleniyor...</div>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  </div>
);

// Hook for conditional lazy loading
export const useLazyLoading = (condition = true) => {
  return {
    shouldLazyLoad: condition,
    LazyWrapper: condition
      ? LazyWrapper
      : ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
};

// Performance monitoring for lazy components
export const withLazyPerformance = <P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName: string,
) => {
  const WrappedComponent = (props: P) => {
    React.useEffect(() => {
      const startTime = performance.now();

      return () => {
        const loadTime = performance.now() - startTime;
        logger.info(`[Lazy Loading] ${componentName} loaded in ${loadTime.toFixed(2)}ms`);

        // Send to analytics in production
        if (process.env.NODE_ENV === 'production') {
          // Analytics tracking code here
        }
      };
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withLazyPerformance(${componentName})`;
  return WrappedComponent;
};

// Gelişmiş lazy loading hook'u
export const useAdvancedLazyLoading = () => {
  const [loadedComponents, setLoadedComponents] = React.useState<Set<string>>(new Set());
  const [loadingComponents, setLoadingComponents] = React.useState<Set<string>>(new Set());

  const preloadComponent = React.useCallback(
    (componentName: string, importFn: () => Promise<any>) => {
      if (loadedComponents.has(componentName) || loadingComponents.has(componentName)) {
        return Promise.resolve();
      }

      setLoadingComponents((prev) => new Set(prev).add(componentName));

      return importFn()
        .then(() => {
          setLoadedComponents((prev) => new Set(prev).add(componentName));
          setLoadingComponents((prev) => {
            const newSet = new Set(prev);
            newSet.delete(componentName);
            return newSet;
          });
        })
        .catch((error) => {
          logger.error(`Failed to preload ${componentName}:`, error);
          setLoadingComponents((prev) => {
            const newSet = new Set(prev);
            newSet.delete(componentName);
            return newSet;
          });
        });
    },
    [loadedComponents, loadingComponents],
  );

  const isComponentLoaded = React.useCallback(
    (componentName: string) => {
      return loadedComponents.has(componentName);
    },
    [loadedComponents],
  );

  const isComponentLoading = React.useCallback(
    (componentName: string) => {
      return loadingComponents.has(componentName);
    },
    [loadingComponents],
  );

  return {
    preloadComponent,
    isComponentLoaded,
    isComponentLoading,
    loadedComponents: Array.from(loadedComponents),
    loadingComponents: Array.from(loadingComponents),
  };
};

// Intersection Observer ile otomatik lazy loading
export const useIntersectionLazyLoading = (threshold = 0.1) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return { ref, isIntersecting };
};
