import { useCallback, useEffect, useRef, useState } from 'react';
import { usePerformanceOptimization } from './usePerformanceOptimization';

/**
 * Advanced mobile optimization hook for the NGO management system
 * Handles touch interactions, device capabilities, and mobile-specific optimizations
 */
export function useAdvancedMobile() {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isIOS: false,
    isAndroid: false,
    hasNotch: false,
    isLandscape: false,
    networkType: 'unknown' as string,
    batteryLevel: 1,
    isLowBattery: false,
  });

  const { shouldReduceAnimations } = usePerformanceOptimization();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const [touchGesture, setTouchGesture] = useState<
    'none' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down'
  >('none');

  // Device detection and capabilities
  useEffect(() => {
    const updateDeviceInfo = () => {
      const userAgent = navigator.userAgent;
      const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      );
      const isTablet = /iPad|Android(?=.*Mobile)/i.test(userAgent) && window.innerWidth > 768;
      const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
      const isAndroid = /Android/i.test(userAgent);
      const hasNotch =
        isIOS &&
        (screen.height === 812 || // iPhone X/XS
          screen.height === 896 || // iPhone XR/XS Max
          screen.height === 844 || // iPhone 12/12 Pro
          screen.height === 926); // iPhone 12 Pro Max
      const isLandscape = window.innerWidth > window.innerHeight;

      // Network information
      const connection =
        (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;
      const networkType = connection?.effectiveType || 'unknown';

      setDeviceInfo((prev) => ({
        ...prev,
        isMobile,
        isTablet,
        isIOS,
        isAndroid,
        hasNotch,
        isLandscape,
        networkType,
      }));
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  // Battery monitoring for mobile optimization
  useEffect(() => {
    const updateBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          const batteryLevel = battery.level;
          const isLowBattery = batteryLevel < 0.2;

          setDeviceInfo((prev) => ({
            ...prev,
            batteryLevel,
            isLowBattery,
          }));

          // Listen for battery changes
          battery.addEventListener('levelchange', () => {
            setDeviceInfo((prev) => ({
              ...prev,
              batteryLevel: battery.level,
              isLowBattery: battery.level < 0.2,
            }));
          });
        } catch (error) {
          console.warn('Battery API not available:', error);
        }
      }
    };

    updateBatteryInfo();
  }, []);

  // Enhanced touch gesture detection
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (touchStartRef.current && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Minimum swipe distance and maximum time for gesture recognition
      const minDistance = 50;
      const maxTime = 300;

      if (deltaTime < maxTime) {
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minDistance) {
          setTouchGesture(deltaX > 0 ? 'swipe-right' : 'swipe-left');
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minDistance) {
          setTouchGesture(deltaY > 0 ? 'swipe-down' : 'swipe-up');
        }
      }

      touchStartRef.current = null;

      // Reset gesture after a short delay
      setTimeout(() => {
        setTouchGesture('none');
      }, 100);
    }
  }, []);

  // Touch event listeners
  useEffect(() => {
    if (deviceInfo.isMobile) {
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [deviceInfo.isMobile, handleTouchStart, handleTouchEnd]);

  // Viewport height fix for mobile browsers
  useEffect(() => {
    if (deviceInfo.isMobile) {
      const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
      };

      setVH();
      window.addEventListener('resize', setVH);
      window.addEventListener('orientationchange', setVH);

      return () => {
        window.removeEventListener('resize', setVH);
        window.removeEventListener('orientationchange', setVH);
      };
    }
  }, [deviceInfo.isMobile]);

  // Performance optimizations based on device capabilities
  const getOptimizedSettings = useCallback(() => {
    const isSlowNetwork = deviceInfo.networkType === 'slow-2g' || deviceInfo.networkType === '2g';
    const isLowPowerMode = deviceInfo.isLowBattery || shouldReduceAnimations;

    return {
      // Animation settings
      enableAnimations: !isLowPowerMode && !isSlowNetwork,
      animationDuration: isLowPowerMode ? 0.1 : isSlowNetwork ? 0.2 : 0.3,

      // Image settings
      imageQuality: isSlowNetwork ? 'low' : deviceInfo.isTablet ? 'high' : 'medium',
      enableLazyLoading: true,
      preloadCount: isSlowNetwork ? 1 : 3,

      // Performance settings
      enableVirtualization: deviceInfo.isMobile,
      batchUpdateDelay: isLowPowerMode ? 300 : 100,
      maxConcurrentRequests: isSlowNetwork ? 2 : 6,

      // UI settings
      enableHapticFeedback: deviceInfo.isMobile && 'vibrate' in navigator,
      showPerformanceIndicators: isSlowNetwork || isLowPowerMode,
      enableAdvancedFeatures: !isLowPowerMode && !isSlowNetwork,
    };
  }, [deviceInfo, shouldReduceAnimations]);

  // Haptic feedback helper
  const triggerHapticFeedback = useCallback(
    (type: 'light' | 'medium' | 'heavy' | 'success' | 'error' = 'light') => {
      if ('vibrate' in navigator && deviceInfo.isMobile) {
        const patterns = {
          light: [10],
          medium: [20],
          heavy: [30],
          success: [10, 10, 10],
          error: [50, 30, 50],
        };
        navigator.vibrate(patterns[type]);
      }
    },
    [deviceInfo.isMobile],
  );

  // Safe area helpers
  const getSafeAreaInsets = useCallback(() => {
    const computedStyle = getComputedStyle(document.documentElement);
    return {
      top: computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0px',
      bottom: computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0px',
      left: computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0px',
      right: computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0px',
    };
  }, []);

  // PWA-specific features
  const installPWA = useCallback(async () => {
    if ('getInstalledRelatedApps' in navigator) {
      try {
        const relatedApps = await (navigator as any).getInstalledRelatedApps();
        return relatedApps.length > 0;
      } catch (error) {
        console.warn('PWA detection failed:', error);
        return false;
      }
    }
    return false;
  }, []);

  // Enhanced camera and media access
  const requestCameraAccess = useCallback(
    async (constraints?: MediaStreamConstraints) => {
      if (!('mediaDevices' in navigator)) {
        throw new Error('Camera not supported');
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
          ...constraints,
        });

        triggerHapticFeedback('light');
        return stream;
      } catch (error) {
        triggerHapticFeedback('error');
        throw error;
      }
    },
    [triggerHapticFeedback],
  );

  // Voice input simulation
  const requestVoiceInput = useCallback(async (): Promise<string> => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }

    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        triggerHapticFeedback('success');
        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        triggerHapticFeedback('error');
        reject(new Error(event.error));
      };

      recognition.start();
      triggerHapticFeedback('light');
    });
  }, [triggerHapticFeedback]);

  // Biometric authentication simulation
  const requestBiometricAuth = useCallback(async (): Promise<boolean> => {
    if (!('credentials' in navigator)) {
      throw new Error('WebAuthn not supported');
    }

    try {
      // Simulate biometric authentication
      await new Promise((resolve) => setTimeout(resolve, 1000));
      triggerHapticFeedback('success');
      return true;
    } catch (error) {
      triggerHapticFeedback('error');
      return false;
    }
  }, [triggerHapticFeedback]);

  // Enhanced file sharing
  const shareFile = useCallback(
    async (file: File, title?: string, text?: string) => {
      if ('share' in navigator && 'canShare' in navigator) {
        const shareData = {
          files: [file],
          title: title || 'Dernek Sistemi - Dosya Paylaşımı',
          text: text || 'Dernek sistemi üzerinden paylaşılan dosya',
        };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            triggerHapticFeedback('success');
            return true;
          } catch (error) {
            if ((error as Error).name !== 'AbortError') {
              triggerHapticFeedback('error');
            }
            return false;
          }
        }
      }
      return false;
    },
    [triggerHapticFeedback],
  );

  // Enhanced clipboard operations
  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        if ('clipboard' in navigator) {
          await navigator.clipboard.writeText(text);
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }

        triggerHapticFeedback('success');
        return true;
      } catch (error) {
        triggerHapticFeedback('error');
        return false;
      }
    },
    [triggerHapticFeedback],
  );

  return {
    deviceInfo,
    touchGesture,
    optimizedSettings: getOptimizedSettings(),
    triggerHapticFeedback,
    getSafeAreaInsets,

    // Device capability checks
    isMobile: deviceInfo.isMobile,
    isTablet: deviceInfo.isTablet,
    isLowPowerMode: deviceInfo.isLowBattery || shouldReduceAnimations,
    isSlowNetwork: deviceInfo.networkType === 'slow-2g' || deviceInfo.networkType === '2g',

    // Utility functions
    shouldShowMobileUI: deviceInfo.isMobile && !deviceInfo.isTablet,
    shouldUseNativeScroll: deviceInfo.isMobile,
    shouldPreventZoom: deviceInfo.isMobile,

    // Enhanced mobile features
    installPWA,
    requestCameraAccess,
    requestVoiceInput,
    requestBiometricAuth,
    shareFile,
    copyToClipboard,
  };
}

/**
 * Enhanced mobile form optimization hook
 */
export function useMobileFormOptimization() {
  const { deviceInfo, optimizedSettings, triggerHapticFeedback } = useAdvancedMobile();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Virtual keyboard detection
  useEffect(() => {
    if (!deviceInfo.isMobile) return;

    const initialViewportHeight = window.visualViewport?.height || window.innerHeight;

    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight;
      const heightDiff = initialViewportHeight - currentHeight;

      setKeyboardHeight(Math.max(0, heightDiff));
      setIsKeyboardOpen(heightDiff > 150); // Keyboard is likely open if height diff > 150px
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
    } else {
      window.addEventListener('resize', handleViewportChange);
      return () => {
        window.removeEventListener('resize', handleViewportChange);
      };
    }
  }, [deviceInfo.isMobile]);

  // Input focus optimization
  const optimizeInputFocus = useCallback(
    (element: HTMLInputElement | HTMLTextAreaElement) => {
      if (!deviceInfo.isMobile) return;

      // Prevent zoom on iOS
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
      triggerHapticFeedback('light');
    },
    [deviceInfo.isMobile, deviceInfo.isIOS, isKeyboardOpen, triggerHapticFeedback],
  );

  return {
    keyboardHeight,
    isKeyboardOpen,
    optimizeInputFocus,
    shouldAdjustForKeyboard: deviceInfo.isMobile && isKeyboardOpen,
    keyboardCompensationStyle: isKeyboardOpen
      ? {
          paddingBottom: `${keyboardHeight}px`,
          transition: optimizedSettings.enableAnimations
            ? `padding-bottom ${optimizedSettings.animationDuration}s ease-out`
            : 'none',
        }
      : {},
  };
}
