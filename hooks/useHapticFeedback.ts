/**
 * @fileoverview useHapticFeedback Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback } from 'react';

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

interface HapticPattern {
  light: number[];
  medium: number[];
  heavy: number[];
  success: number[];
  warning: number[];
  error: number[];
}

const HAPTIC_PATTERNS: HapticPattern = {
  light: [10],
  medium: [20],
  heavy: [50],
  success: [10, 10, 10],
  warning: [30, 10, 30],
  error: [50, 50, 50],
};

export function useHapticFeedback() {
  const triggerHaptic = useCallback((type: HapticType = 'medium') => {
    // Check if device supports vibration
    if (!('vibrate' in navigator)) {
      return;
    }

    // Check if user prefers reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(pattern);
  }, []);

  const triggerSuccess = useCallback(() => { triggerHaptic('success'); }, [triggerHaptic]);
  const triggerWarning = useCallback(() => { triggerHaptic('warning'); }, [triggerHaptic]);
  const triggerError = useCallback(() => { triggerHaptic('error'); }, [triggerHaptic]);
  const triggerLight = useCallback(() => { triggerHaptic('light'); }, [triggerHaptic]);
  const triggerMedium = useCallback(() => { triggerHaptic('medium'); }, [triggerHaptic]);
  const triggerHeavy = useCallback(() => { triggerHaptic('heavy'); }, [triggerHaptic]);

  return {
    triggerHaptic,
    triggerSuccess,
    triggerWarning,
    triggerError,
    triggerLight,
    triggerMedium,
    triggerHeavy,
  };
}
