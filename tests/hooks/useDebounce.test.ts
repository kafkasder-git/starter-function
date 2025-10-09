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

    rerender({ value: 'second', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    // At this point, the value should still be 'first' because the timeout hasn't completed.
    // However, the current implementation will reset the timer.
    expect(result.current).toBe('first');


    rerender({ value: 'third', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(250);
    });
    // The value should still be 'first'.
     expect(result.current).toBe('first');


    act(() => {
      vi.advanceTimersByTime(250);
    });
    // The current (buggy) implementation will now update to 'third'.
    // A correct implementation would have updated to 'second' at the 500ms mark.
    expect(result.current).not.toBe('third');
  });
});