/**
 * @fileoverview useTouchDevice Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

interface TouchDeviceState {
  isTouchDevice: boolean;
  isMobile: boolean;
  isTablet: boolean;
  screenSize: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  orientation: 'portrait' | 'landscape';
}

/**
 * useTouchDevice function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useTouchDevice(): TouchDeviceState {
  const [state, setState] = useState<TouchDeviceState>(() => {
    // Initial state on server/first render
    if (typeof window === 'undefined') {
      return {
        isTouchDevice: false,
        isMobile: false,
        isTablet: false,
        screenSize: 'md',
        orientation: 'portrait',
      };
    }

    return getDeviceState();
  });

  function getDeviceState(): TouchDeviceState {
    const isTouchDevice = 'ontouchstart' in window ?? navigator.maxTouchPoints > 0;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Determine screen size based on Tailwind breakpoints
    let screenSize: TouchDeviceState['screenSize'] = 'xs';
    if (width >= 1280) screenSize = 'xl';
    else if (width >= 1024) screenSize = 'lg';
    else if (width >= 768) screenSize = 'md';
    else if (width >= 640) screenSize = 'sm';

    // Determine device type
    const isMobile = width < 768 && isTouchDevice;
    const isTablet = width >= 768 && width < 1024 && isTouchDevice;

    // Determine orientation
    const orientation = height > width ? 'portrait' : 'landscape';

    return {
      isTouchDevice,
      isMobile,
      isTablet,
      screenSize,
      orientation,
    };
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    function handleResize() {
      // Debounce resize events
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setState(getDeviceState());
      }, 150);
    }

    function handleOrientationChange() {
      // Handle orientation changes with a delay to ensure dimensions are updated
      setTimeout(() => {
        setState(getDeviceState());
      }, 100);
    }

    // Add event listeners
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Set initial state
    setState(getDeviceState());

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return state;
}

// Additional utility hooks for common use cases
/**
 * useIsMobile function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useIsMobile(): boolean {
  const { isMobile } = useTouchDevice();
  return isMobile;
}

/**
 * useIsTablet function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useIsTablet(): boolean {
  const { isTablet } = useTouchDevice();
  return isTablet;
}

/**
 * useIsTouchDevice function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useIsTouchDevice(): boolean {
  const { isTouchDevice } = useTouchDevice();
  return isTouchDevice;
}

/**
 * useScreenSize function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useScreenSize(): TouchDeviceState['screenSize'] {
  const { screenSize } = useTouchDevice();
  return screenSize;
}
