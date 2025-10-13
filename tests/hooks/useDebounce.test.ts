import { renderHook, act } from '@testing-library/react';
import { useThrottle } from '../../hooks/useDebounce';

describe('useThrottle', () => {
  vi.useFakeTimers();

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should update the value after the delay', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    });

    rerender({ value: 'updated', delay: 500 });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('should throttle the updates', () => {
    const { result, rerender } = renderHook(({ value, delay }) => useThrottle(value, delay), {
      initialProps: { value: 'first', delay: 500 },
    });

    expect(result.current).toBe('first');

    // Update to second value
    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    // Should still be 'first' because throttle delay hasn't passed
    expect(result.current).toBe('first');

    // Update to third value
    rerender({ value: 'third', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    // Should still be 'first' because throttle delay hasn't passed
    expect(result.current).toBe('first');

    // Complete the throttle delay
    act(() => {
      vi.advanceTimersByTime(250);
    });
    // Should now update to 'third' (the last value)
    expect(result.current).toBe('third');
  });
});