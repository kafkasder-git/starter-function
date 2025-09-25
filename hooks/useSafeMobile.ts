/**
 * @fileoverview useSafeMobile Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';

import { logger } from '../lib/logging/logger';
/**
 * Safe mobile detection hook that handles SSR and errors gracefully
 */
/**
 * useSafeMobile function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useSafeMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkMobile = () => {
      if (!mounted) return;

      try {
        const width = window.innerWidth;
        setIsMobile(width < 768);
      } catch (error) {
        logger.error('Error checking mobile:', error);
        // Default to mobile for safety
        setIsMobile(true);
      }
    };

    // Initial check
    checkMobile();

    // Listen for resize events
    const handleResize = () => {
      if (mounted) {
        checkMobile();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      mounted = false;
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}
