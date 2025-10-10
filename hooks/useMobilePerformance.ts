/**
 * @fileoverview useMobilePerformance Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

import { usePerformance } from './usePerformance';

interface MobilePerformanceMetrics {
  battery: number;
  networkType: string;
  isSlow: boolean;
  renderTime: number;
  memoryUsage: number;
}

/**
 * Simplified mobile performance hook
 * Uses base performance metrics with mobile-specific additions
 */
export function useMobilePerformance(): MobilePerformanceMetrics {
  const baseMetrics = usePerformance();

  // Mobile-specific metrics
  const getBatteryLevel = (): number => {
    // Battery API is async, return default value
    // Real implementation should use useEffect
    return 1;
  };

  const getNetworkType = (): string => {
    const connection =
      (navigator as any).connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection;
    return connection?.effectiveType || '4g';
  };

  const isSlowNetwork = (): boolean => {
    const { connection } = navigator as any;
    return connection?.saveData || false;
  };

  return {
    battery: getBatteryLevel(),
    networkType: getNetworkType(),
    isSlow: isSlowNetwork(),
    renderTime: baseMetrics.renderTime,
    memoryUsage: baseMetrics.memoryUsage,
  };
}
