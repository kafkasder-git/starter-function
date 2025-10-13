/**
 * @fileoverview React hook for auto-updating relative time display
 * @description Provides automatically updating relative time strings in Turkish
 *
 * This hook formats dates as relative time (e.g., "2 saat önce") and automatically
 * updates the display at appropriate intervals based on how recent the date is.
 *
 * Performance optimizations:
 * - Calculates optimal update interval based on date recency
 * - Cleans up intervals on unmount or date change
 * - Can be disabled for static/old dates
 *
 * @example
 * // Auto-updating relative time
 * const relativeTime = useRelativeTime(activity.timestamp);
 * // Returns: "2 saat önce" and updates to "3 saat önce" automatically
 *
 * // Disabled auto-updates for old dates
 * const staticTime = useRelativeTime(oldDate, { enabled: false });
 * // Returns: "3 ay önce" without auto-updates
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect, useRef } from 'react';
import { formatRelativeTime, getRelativeTimeUpdateInterval } from '../lib/utils/dateFormatter';

export interface UseRelativeTimeOptions {
  /**
   * Enable auto-updates (default: true)
   * Set to false for static/old dates that don't need real-time updates
   */
  enabled?: boolean;

  /**
   * Custom update interval in milliseconds
   * If not specified, interval is calculated automatically based on date recency
   */
  updateInterval?: number | null;
}

/**
 * React hook for auto-updating relative time display
 *
 * @param date - Date to format (Date object, ISO string, or timestamp)
 * @param options - Configuration options
 * @returns Formatted relative time string in Turkish that auto-updates
 *
 * @example
 * // Basic usage with auto-updates
 * const relativeTime = useRelativeTime(new Date(Date.now() - 3600000));
 * // Returns: "1 saat önce"
 *
 * // Disable auto-updates for performance
 * const staticTime = useRelativeTime(veryOldDate, { enabled: false });
 *
 * // Custom update interval (every 5 seconds)
 * const customTime = useRelativeTime(recentDate, { updateInterval: 5000 });
 */
export function useRelativeTime(
  date: Date | string | number,
  options?: UseRelativeTimeOptions
): string {
  // Format initial time
  const [relativeTime, setRelativeTime] = useState<string>(() => formatRelativeTime(date));

  // Store interval ID for cleanup
  const intervalIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Format immediately when date changes
    setRelativeTime(formatRelativeTime(date));

    // Check if auto-updates are enabled
    const enabled = options?.enabled ?? true;
    if (!enabled) {
      return;
    }

    // Calculate update interval
    const interval =
      options?.updateInterval !== undefined
        ? options.updateInterval
        : getRelativeTimeUpdateInterval(date);

    // If interval is null, date is too old for auto-updates
    if (interval === null) {
      return;
    }

    // Set up auto-update interval
    intervalIdRef.current = setInterval(() => {
      setRelativeTime(formatRelativeTime(date));
    }, interval);

    // Cleanup on unmount or date change
    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [date, options?.enabled, options?.updateInterval]);

  return relativeTime;
}
