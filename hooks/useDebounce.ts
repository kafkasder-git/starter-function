/**
 * @fileoverview useDebounce Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect, useRef } from 'react';

// Debounce hook for search and input optimization
/**
 * useDebounce function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for scroll and resize events
/**
 * useThrottle function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
      return undefined;
    }
    const timer = setTimeout(() => {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return throttledValue;
}

// Optimized search hook
/**
 * useSearch function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useSearch<T>(
  items: T[],
  searchFields: (keyof T)[],
  searchTerm: string,
  debounceMs = 300
) {
  const debouncedSearchTerm = useDebounce(searchTerm.toLowerCase(), debounceMs);

  const filteredItems = items.filter((item) => {
    if (!debouncedSearchTerm) return true;

    return searchFields.some((field) => {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(debouncedSearchTerm);
      }
      if (typeof fieldValue === 'number') {
        return fieldValue.toString().includes(debouncedSearchTerm);
      }
      return false;
    });
  });

  return {
    filteredItems,
    isSearching: searchTerm !== debouncedSearchTerm,
    searchTerm: debouncedSearchTerm,
  };
}

// Intersection Observer hook for lazy loading
/**
 * useIntersectionObserver function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isVisible;
}

// Virtual scrolling hook for large lists
/**
 * useVirtualScroll function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useVirtualScroll<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan = 5
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length - 1, startIndex + visibleItemsCount + overscan * 2);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    setScrollTop,
  };
}

export default useDebounce;
