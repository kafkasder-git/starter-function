import { describe, it, expect, vi, beforeEach } from 'vitest';
import { debounce, throttle, memoize } from '../performance/optimizer';

describe('Performance Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('debounce', () => {
    it('should delay function execution', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('should cancel previous calls', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('should pass arguments correctly', () => {
      const fn = vi.fn();
      const debouncedFn = debounce(fn, 100);

      debouncedFn('test', 123);
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith('test', 123);
    });
  });

  describe('throttle', () => {
    it('should limit function calls', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      throttledFn();
      throttledFn();

      expect(fn).toHaveBeenCalledOnce();
    });

    it('should allow calls after wait time', () => {
      const fn = vi.fn();
      const throttledFn = throttle(fn, 100);

      throttledFn();
      expect(fn).toHaveBeenCalledOnce();

      vi.advanceTimersByTime(100);
      throttledFn();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('memoize', () => {
    it('should cache function results', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(fn);

      const result1 = memoizedFn(5);
      const result2 = memoizedFn(5);

      expect(result1).toBe(10);
      expect(result2).toBe(10);
      expect(fn).toHaveBeenCalledOnce();
    });

    it('should call function for different arguments', () => {
      const fn = vi.fn((x: number) => x * 2);
      const memoizedFn = memoize(fn);

      memoizedFn(5);
      memoizedFn(10);

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle complex arguments', () => {
      const fn = vi.fn((obj: { x: number }) => obj.x * 2);
      const memoizedFn = memoize(fn);

      memoizedFn({ x: 5 });
      memoizedFn({ x: 5 });

      expect(fn).toHaveBeenCalledOnce();
    });
  });
});
