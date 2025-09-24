import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Performance optimization hook for the NGO management system
 * Handles memory management, debouncing, and efficient re-renders
 */
export function usePerformanceOptimization() {
  const rafId = useRef<number | null>(null);
  const mounted = useRef(true);
  const [isLowMemory, setIsLowMemory] = useState(false);

  // Memory monitoring for mobile devices
  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memInfo = (performance as any).memory;
        const memoryRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        setIsLowMemory(memoryRatio > 0.8);
      }
    };

    // Check memory every 30 seconds
    const interval = setInterval(checkMemory, 30000);
    checkMemory();

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Optimized RAF function
  const requestFrame = useCallback((callback: () => void) => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
    }
    rafId.current = requestAnimationFrame(() => {
      if (mounted.current) {
        callback();
      }
    });
  }, []);

  // Memory cleanup on unmount
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  // Low memory mode optimizations
  const shouldReduceAnimations =
    isLowMemory || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    isLowMemory,
    shouldReduceAnimations,
    requestFrame,
    mounted,
  };
}

/**
 * Optimized state management hook with debouncing
 */
export function useOptimizedState<T>(
  initialValue: T,
  debounceMs = 100,
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setOptimizedValue = useCallback(
    (newValue: T) => {
      setValue(newValue);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setDebouncedValue(newValue);
      }, debounceMs);
    },
    [debounceMs],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setOptimizedValue, debouncedValue];
}

/**
 * Component visibility optimization hook
 */
export function useVisibilityOptimization(elementRef: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !('IntersectionObserver' in window)) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      },
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [elementRef]);

  return isVisible;
}

/**
 * Bundle size optimization helper
 */
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T } | T>,
  fallback?: React.ComponentType,
) => {
  return React.lazy(async () => {
    try {
      const module = await importFn();
      return {
        default: 'default' in module ? module.default : module,
      };
    } catch (error) {
      console.warn('Component lazy loading failed:', error);
      return {
        default:
          fallback || ((() => React.createElement('div', { children: 'Yükleme hatası' })) as T),
      };
    }
  });
};
