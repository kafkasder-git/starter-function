/**
 * @fileoverview useAdvancedMobile Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import { usePerformanceOptimization } from './usePerformanceOptimization';

interface DeviceInfo {
  isMobile: boolean;
  isTouch: boolean;
  viewport: { width: number; height: number };
  orientation: 'landscape' | 'portrait';
}

/**
 * Simplified advanced mobile hook
 * Maintains backward compatibility while reducing complexity
 */
export function useAdvancedMobile() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTouch: false,
    viewport: { width: window.innerWidth, height: window.innerHeight },
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
  });

  const { shouldOptimize } = usePerformanceOptimization();

  useEffect(() => {
    const checkMobile = () => {
      const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );
      const isTouch = 'ontouchstart' in window;
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';

      setDeviceInfo({ isMobile, isTouch, viewport, orientation });
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback(
    (type: 'light' | 'medium' | 'heavy' = 'light') => {
      if ('vibrate' in navigator && deviceInfo.isMobile) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
        };
        navigator.vibrate(patterns[type]);
      }
    },
    [deviceInfo.isMobile],
  );

  // Clipboard helper
  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if ('clipboard' in navigator) {
          await navigator.clipboard.writeText(text);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        triggerHapticFeedback('light');
        return true;
      } catch {
        return false;
      }
    },
    [triggerHapticFeedback],
  );

  return {
    // Core device info
    isMobile: deviceInfo.isMobile,
    isTouch: deviceInfo.isTouch,
    viewport: deviceInfo.viewport,
    orientation: deviceInfo.orientation,

    // Performance optimization
    shouldOptimize,

    // Utility functions
    triggerHapticFeedback,
    copyToClipboard,

    // Backward compatibility
    deviceInfo,
    isTablet: false,
    isLowPowerMode: false,
    isSlowNetwork: false,
    shouldShowMobileUI: deviceInfo.isMobile,
    shouldUseNativeScroll: deviceInfo.isMobile,
    shouldPreventZoom: deviceInfo.isMobile,
    optimizedSettings: {
      enableAnimations: !shouldOptimize,
      animationDuration: shouldOptimize ? 0.1 : 0.3,
      imageQuality: 'medium' as const,
      enableLazyLoading: true,
      enableVirtualization: deviceInfo.isMobile,
    },
    touchGesture: 'none' as const,
    getSafeAreaInsets: () => ({
      top: '0px',
      bottom: '0px',
      left: '0px',
      right: '0px',
    }),
  };
}
