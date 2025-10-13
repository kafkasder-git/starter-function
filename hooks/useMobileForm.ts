/**
 * @fileoverview useMobileForm Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAdvancedMobile } from './useAdvancedMobile';
import { usePerformanceOptimization } from './usePerformanceOptimization';
import type { UseMobileFormOptions } from '../types/form';

// Re-export types for backward compatibility
export type { UseMobileFormOptions } from '../types/form';

/**
 * Unified mobile form hook - combines viewport handling, keyboard detection,
 * and mobile-specific optimizations
 *
 * @param {UseMobileFormOptions} options - Hook configuration options
 * @returns Comprehensive mobile form utilities
 */
export function useMobileForm(options: UseMobileFormOptions = {}) {
  const {
    preventZoom = true,
    adjustViewport = true,
    optimizeKeyboard = true,
    enableHapticFeedback = true,
    enableKeyboardDetection = true,
  } = options;

  const { deviceInfo, triggerHapticFeedback, optimizedSettings } = useAdvancedMobile();
  const { requestFrame } = usePerformanceOptimization();

  // Keyboard detection state
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const initialViewportHeightRef = useRef<number>(0);

  // Virtual keyboard detection using Visual Viewport API
  useEffect(() => {
    if (!deviceInfo.isMobile || !enableKeyboardDetection) return;

    // Store initial viewport height
    initialViewportHeightRef.current = window.visualViewport?.height ?? window.innerHeight;

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height ?? window.innerHeight;
      const heightDiff = initialViewportHeightRef.current - currentHeight;

      requestFrame(() => {
        setKeyboardHeight(Math.max(0, heightDiff));
        setIsKeyboardOpen(heightDiff > 150); // Keyboard is likely open if height diff > 150px
      });
    };

    // Use Visual Viewport API if available (more accurate for keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    }

    // Fallback to window resize
    window.addEventListener('resize', handleViewportChange);
    return () => {
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [deviceInfo.isMobile, enableKeyboardDetection, requestFrame]);

  /**
   * Prevent zoom on input focus (mobile Safari)
   */
  const preventZoomHandler = useCallback(() => {
    if (!deviceInfo.isMobile || !preventZoom) return;

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const originalContent = viewport.getAttribute('content');
      const preventZoomContent = `${originalContent}, user-scalable=no`;

      viewport.setAttribute('content', preventZoomContent);

      // Restore original viewport after delay
      setTimeout(() => {
        viewport.setAttribute('content', originalContent ?? '');
      }, 1000);
    }
  }, [deviceInfo.isMobile, preventZoom]);

  /**
   * Adjust viewport for keyboard - adds padding to prevent content cutoff
   */
  const adjustViewportForKeyboard = useCallback(() => {
    if (!deviceInfo.isMobile || !adjustViewport) return;

    // Add keyboard padding to prevent content cutoff
    requestFrame(() => {
      document.body.style.paddingBottom = '300px';

      // Restore after keyboard closes
      setTimeout(() => {
        document.body.style.paddingBottom = '';
      }, 500);
    });
  }, [deviceInfo.isMobile, adjustViewport, requestFrame]);

  /**
   * Enable form optimizations - attach focus listeners to inputs
   */
  const enableFormOptimizations = useCallback(() => {
    if (!deviceInfo.isMobile || !optimizeKeyboard) return;

    // Optimize input behavior for mobile
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        adjustViewportForKeyboard();
        preventZoomHandler();
      });
    });
  }, [deviceInfo.isMobile, optimizeKeyboard, adjustViewportForKeyboard, preventZoomHandler]);

  /**
   * Optimize input focus with mobile-specific enhancements
   * - Prevents iOS zoom
   * - Scrolls into view
   * - Triggers haptic feedback
   */
  const optimizeInputFocus = useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement) => {
      if (!deviceInfo.isMobile) return;

      requestFrame(() => {
        // Prevent zoom on iOS by ensuring font-size is at least 16px
        if (deviceInfo.isIOS) {
          const originalFontSize = element.style.fontSize;
          element.style.fontSize = '16px';

          // Restore original font size after blur
          const handleBlur = () => {
            element.style.fontSize = originalFontSize;
            element.removeEventListener('blur', handleBlur);
          };
          element.addEventListener('blur', handleBlur);
        }

        // Scroll into view with keyboard compensation
        if (isKeyboardOpen) {
          setTimeout(() => {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest',
            });
          }, 100);
        }

        // Haptic feedback
        if (enableHapticFeedback) {
          triggerHapticFeedback('light');
        }
      });
    },
    [
      deviceInfo.isMobile,
      deviceInfo.isIOS,
      isKeyboardOpen,
      enableHapticFeedback,
      triggerHapticFeedback,
      requestFrame,
    ]
  );

  /**
   * Get optimized input props for mobile forms
   * Provides comprehensive mobile-optimized attributes for input elements
   */
  const optimizeInputProps = useCallback(
    (
      type:
        | 'text'
        | 'email'
        | 'tel'
        | 'number'
        | 'decimal'
        | 'search'
        | 'url'
        | 'password'
        | 'textarea' = 'text'
    ) => {
      const baseProps: any = {
        className: deviceInfo.isMobile ? 'text-base' : '', // Prevent iOS zoom
      };

      if (!deviceInfo.isMobile) return baseProps;

      // Mobile-specific optimizations
      baseProps.autoComplete = 'on';
      baseProps.autoCorrect = type === 'text' || type === 'textarea' ? 'on' : 'off';
      baseProps.autoCapitalize =
        type === 'email' || type === 'url' || type === 'password' ? 'none' : 'sentences';
      baseProps.spellCheck = type === 'text' || type === 'textarea';

      // iOS-specific: prevent zoom
      if (deviceInfo.isIOS) {
        baseProps.style = { fontSize: '16px' };
      }

      // Enhanced input mode and type optimization
      switch (type) {
        case 'email':
          baseProps.inputMode = 'email';
          baseProps.type = 'email';
          baseProps.autoCapitalize = 'none';
          baseProps.autoCorrect = 'off';
          break;
        case 'tel':
          baseProps.inputMode = 'tel';
          baseProps.type = 'tel';
          baseProps.autoCapitalize = 'none';
          break;
        case 'number':
          baseProps.inputMode = 'numeric';
          baseProps.type = 'number';
          baseProps.pattern = '[0-9]*';
          break;
        case 'decimal':
          baseProps.inputMode = 'decimal';
          baseProps.type = 'number';
          baseProps.step = 'any';
          break;
        case 'search':
          baseProps.inputMode = 'search';
          baseProps.type = 'search';
          break;
        case 'url':
          baseProps.inputMode = 'url';
          baseProps.type = 'url';
          baseProps.autoCapitalize = 'none';
          baseProps.autoCorrect = 'off';
          break;
        case 'password':
          baseProps.type = 'password';
          baseProps.autoComplete = 'current-password';
          baseProps.autoCapitalize = 'none';
          baseProps.autoCorrect = 'off';
          break;
        case 'text':
          baseProps.type = 'text';
          break;
        case 'textarea':
          baseProps.rows = 3;
          break;
        default:
          baseProps.inputMode = 'text';
          baseProps.type = 'text';
      }

      return baseProps;
    },
    [deviceInfo.isMobile, deviceInfo.isIOS]
  );

  return {
    // Core functions
    preventZoom: preventZoomHandler,
    adjustViewportForKeyboard,
    enableFormOptimizations,
    optimizeInputFocus,
    optimizeInputProps,

    // Keyboard detection state
    keyboardHeight,
    isKeyboardOpen,

    // Device info (from useAdvancedMobile)
    isMobile: deviceInfo.isMobile,
    isIOS: deviceInfo.isIOS,
    isAndroid: deviceInfo.isAndroid,
    isTablet: deviceInfo.isTablet,

    // Utilities
    triggerHapticFeedback,

    // Performance settings
    shouldReduceAnimations: !optimizedSettings.enableAnimations,
    animationDuration: optimizedSettings.animationDuration,
  };
}
