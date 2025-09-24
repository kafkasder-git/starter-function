import { useState, useEffect } from 'react';

/**
 * Safe mobile detection hook that handles SSR and errors gracefully
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
        console.error('Error checking mobile:', error);
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
