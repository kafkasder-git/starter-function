/**
 * @fileoverview Lazy Loading Hooks and Utilities
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';
import { logger } from '../lib/logging/logger';

// Hook for conditional lazy loading
export const useLazyLoading = (condition = true) => {
  return {
    shouldLazyLoad: condition,
    LazyWrapper: condition
      ? ({ children }: { children: React.ReactNode }) => (
          <>{children}</>
        )
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

// Advanced lazy loading hook
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

// Intersection Observer for automatic lazy loading
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
