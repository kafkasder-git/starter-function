/**
 * @fileoverview Safe Navigation Hook
 * @description Hook to safely handle navigation with startTransition to prevent Suspense warnings
 */

import { useCallback } from 'react';
import { startTransition } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for safe navigation that prevents Suspense warnings
 * @returns Object with safe navigation functions
 */
export function useSafeNavigation() {
  const navigate = useNavigate();

  const safeNavigate = useCallback(
    (to: string, options?: { replace?: boolean; state?: any }) => {
      startTransition(() => {
        if (options?.replace) {
          navigate(to, { replace: true, state: options.state });
        } else {
          navigate(to, { state: options?.state });
        }
      });
    },
    [navigate]
  );

  const safeNavigateBack = useCallback(() => {
    startTransition(() => {
      navigate(-1);
    });
  }, [navigate]);

  const safeNavigateForward = useCallback(() => {
    startTransition(() => {
      navigate(1);
    });
  }, [navigate]);

  return {
    safeNavigate,
    safeNavigateBack,
    safeNavigateForward,
  };
}

export default useSafeNavigation;
