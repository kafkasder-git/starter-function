/**
 * @fileoverview useInfiniteScroll Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useCallback, useRef, useEffect } from 'react';

interface UseInfiniteScrollProps {
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootMargin?: string;
}

/**
 * useInfiniteScroll function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useInfiniteScroll({
  hasMore,
  loading,
  onLoadMore,
  threshold = 1.0,
  rootMargin = '100px',
}: UseInfiniteScrollProps) {
  const [isFetching, setIsFetching] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Handle intersection
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;

      if (entry.isIntersecting && hasMore && !loading && !isFetching) {
        setIsFetching(true);
        onLoadMore();
      }
    },
    [hasMore, loading, isFetching, onLoadMore],
  );

  // Setup intersection observer
  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  // Reset fetching state when loading completes
  useEffect(() => {
    if (!loading) {
      setIsFetching(false);
    }
  }, [loading]);

  return {
    sentinelRef,
    isFetching,
  };
}

// Hook for pull-to-refresh functionality
interface UsePullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  threshold?: number;
  enabled?: boolean;
}

/**
 * usePullToRefresh function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 50,
  enabled = true,
}: UsePullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);

  const startY = useRef(0);
  const currentY = useRef(0);
  const elementRef = useRef<HTMLElement>(null);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled || !elementRef.current) return;

      // Only start pull if we're at the top of the scroll
      if (elementRef.current.scrollTop > 0) return;

      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    },
    [enabled],
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || !enabled) return;

      currentY.current = e.touches[0].clientY;
      const distance = Math.max(0, currentY.current - startY.current);

      if (distance > 0) {
        // Prevent default scrolling when pulling down
        e.preventDefault();
        setPullDistance(Math.min(distance, threshold * 2));
      }
    },
    [isPulling, enabled, threshold],
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || !enabled) return;

    setIsPulling(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setPullDistance(0);
  }, [isPulling, enabled, pullDistance, threshold, isRefreshing, onRefresh]);

  // Setup touch events
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const shouldRefresh = pullDistance >= threshold;

  return {
    elementRef,
    isRefreshing,
    isPulling,
    pullDistance,
    pullProgress,
    shouldRefresh,
  };
}
