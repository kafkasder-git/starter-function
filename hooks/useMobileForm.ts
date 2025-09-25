import { useCallback } from 'react';
import { useAdvancedMobile } from './useAdvancedMobile';

interface UseMobileFormOptions {
  preventZoom?: boolean;
  adjustViewport?: boolean;
  optimizeKeyboard?: boolean;
}

export function useMobileForm(options: UseMobileFormOptions = {}) {
  const { deviceInfo } = useAdvancedMobile();
  const { preventZoom = true, adjustViewport = true, optimizeKeyboard = true } = options;

  // Prevent zoom on input focus (mobile)
  const preventZoomHandler = useCallback(() => {
    if (!deviceInfo.isMobile || !preventZoom) return;

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const originalContent = viewport.getAttribute('content');
      const preventZoomContent = `${originalContent  }, user-scalable=no`;

      viewport.setAttribute('content', preventZoomContent);

      // Restore original viewport after delay
      setTimeout(() => {
        viewport.setAttribute('content', originalContent || '');
      }, 1000);
    }
  }, [deviceInfo.isMobile, preventZoom]);

  // Adjust viewport for keyboard
  const adjustViewportForKeyboard = useCallback(() => {
    if (!deviceInfo.isMobile || !adjustViewport) return;

    // Add keyboard padding to prevent content cutoff
    document.body.style.paddingBottom = '300px';

    // Restore after keyboard closes
    setTimeout(() => {
      document.body.style.paddingBottom = '';
    }, 500);
  }, [deviceInfo.isMobile, adjustViewport]);

  // Enable form optimizations
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

  return {
    adjustViewportForKeyboard,
    preventZoom: preventZoomHandler,
    enableFormOptimizations,
  };
}
