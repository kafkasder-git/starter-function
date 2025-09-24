import { useState, useRef, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from './ui/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canPull, setCanPull] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);

  // Check if we're at the top and can pull
  const checkCanPull = useCallback(() => {
    if (!containerRef.current || disabled) return false;
    const element = containerRef.current;
    return element.scrollTop <= 0;
  }, [disabled]);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!checkCanPull()) return;

      startYRef.current = e.touches[0].clientY;
      isScrollingRef.current = false;
      setCanPull(true);
    },
    [checkCanPull],
  );

  // Handle touch move
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!canPull || disabled) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startYRef.current;

      // Only allow pulling down
      if (deltaY > 0) {
        e.preventDefault();

        // Calculate pull distance with diminishing returns
        const distance = Math.min(deltaY * 0.5, threshold * 1.5);
        setPullDistance(distance);

        // Set pulling state when distance is significant
        if (distance > 10) {
          setIsPulling(true);
          isScrollingRef.current = true;
        }
      }
    },
    [canPull, disabled, threshold],
  );

  // Handle touch end
  const handleTouchEnd = useCallback(async () => {
    if (!canPull || disabled) return;

    setCanPull(false);

    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    isScrollingRef.current = false;
  }, [canPull, disabled, pullDistance, threshold, isRefreshing, onRefresh]);

  // Attach event listeners
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Calculate progress
  const progress = Math.min(pullDistance / threshold, 1);
  const isTriggered = pullDistance >= threshold;

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto touch-pan-y', className)}
      style={{
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Pull Indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{
              opacity: 1,
              y: Math.max(-60 + pullDistance * 0.3, -60),
            }}
            exit={{ opacity: 0, y: -60 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full p-4 shadow-lg"
            style={{
              transform: `translateX(-50%) translateY(${Math.max(-60 + pullDistance * 0.3, -60)}px)`,
            }}
          >
            <motion.div
              animate={{
                rotate: isRefreshing ? 360 : progress * 360,
                scale: isTriggered ? 1.1 : 0.8 + progress * 0.3,
              }}
              transition={{
                rotate: {
                  duration: isRefreshing ? 1 : 0,
                  repeat: isRefreshing ? Infinity : 0,
                  ease: isRefreshing ? 'linear' : 'easeOut',
                },
                scale: { duration: 0.2 },
              }}
              className={cn(
                'transition-colors duration-200',
                isTriggered ? 'text-primary' : 'text-slate-400',
              )}
            >
              <RefreshCw className="w-6 h-6" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Bar */}
      <AnimatePresence>
        {isPulling && !isRefreshing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-1 bg-slate-100 z-40"
          >
            <motion.div
              className={cn(
                'h-full transition-colors duration-200',
                isTriggered ? 'bg-primary' : 'bg-slate-300',
              )}
              style={{ width: `${progress * 100}%` }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        animate={{
          y: isPulling || isRefreshing ? pullDistance * 0.3 : 0,
        }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
