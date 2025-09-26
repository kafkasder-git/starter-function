// Store exports for easy importing
export { useAuthStore, authSelectors, authStore } from './authStore';
// Mock notification store (database table not available)
export { useNotificationStore, notificationSelectors } from './notificationStore';
export { useUIStore, uiSelectors, uiStore } from './uiStore';

// Import logger for proper error handling
import { storeLogger } from '../lib/logging';

// Store types
// Mock notification types (database table not available)
export type { NotificationState } from './notificationStore';

// Store initialization hook
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuthStore } from './authStore';
import { useNotificationStore } from './notificationStore';
import { useUIStore } from './uiStore';

// Store initialization hook with improved type safety and performance
export function useStoreInitialization() {
  // Store instances with proper typing
  const authStore = useAuthStore();
  const notificationStore = useNotificationStore();
  const uiStore = useUIStore();

  // Initialization state
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Memoize initialization functions to prevent unnecessary re-renders
  const initializeAuth = useCallback(async () => {
    try {
      await authStore.initializeAuth();
      storeLogger.info('Auth store initialized');
      return true;
    } catch (err) {
      storeLogger.error('Auth store initialization failed', err instanceof Error ? err : new Error('Unknown error'));
      return false;
    }
  }, [authStore]);

  const initializeNotifications = useCallback(async () => {
    try {
      // await notificationStore.startRealtimeSubscription();
      storeLogger.info('Notification store initialized');
      return true;
    } catch (err) {
      storeLogger.error('Notification store initialization failed', err instanceof Error ? err : new Error('Unknown error'));
      return false;
    }
  }, [notificationStore]);

  const initializeUI = useCallback(async () => {
    try {
      // Check if window is defined for SSR compatibility
      if (typeof window !== 'undefined') {
        const isMobile = window.innerWidth <= 768;
        uiStore.setIsMobile(isMobile);

        // Add resize listener for mobile detection
        const handleResize = () => {
          uiStore.setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => { window.removeEventListener('resize', handleResize); };
      }
      storeLogger.info('UI store initialized');
      return true;
    } catch (err) {
      storeLogger.error('UI store initialization failed', err instanceof Error ? err : new Error('Unknown error'));
      return false;
    }
  }, [uiStore]);

  // Initialize stores on mount
  useEffect(() => {
    let mounted = true;
    let cleanup: (() => void) | undefined;

    const initialize = async () => {
      try {
        setError(null);

        // Initialize stores in sequence
        const authSuccess = await initializeAuth();
        if (!mounted || !authSuccess) return;

        const notificationSuccess = await initializeNotifications();
        if (!mounted || !notificationSuccess) return;

        const uiCleanup = await initializeUI();
        if (!mounted) {
          if (typeof uiCleanup === 'function') uiCleanup();
          return;
        }
        cleanup = typeof uiCleanup === 'function' ? uiCleanup : undefined;

        setIsInitialized(true);
        storeLogger.info('All stores initialized successfully');
      } catch (err) {
        if (!mounted) return;
        const error = err instanceof Error ? err : new Error('Store initialization failed');
        setError(error);
        storeLogger.error('Store initialization failed', error);
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (cleanup) cleanup();
    };
  }, [initializeAuth, initializeNotifications, initializeUI]);

  // Memoize store utils to prevent unnecessary re-renders
  const storeUtils = useMemo(() => ({
    resetStores: async () => {
      try {
        // Clear persisted state
        if (useAuthStore.persist?.clearStorage) {
          await useAuthStore.persist.clearStorage();
        }
        if (useUIStore.persist?.clearStorage) {
          await useUIStore.persist.clearStorage();
        }
        storeLogger.info('Store state cleared');
        return true;
      } catch (err) {
        storeLogger.error('Failed to clear store state', err instanceof Error ? err : new Error('Unknown error'));
        return false;
      }
    },
    getStoreStates: () => ({
      auth: useAuthStore.getState(),
      notification: useNotificationStore.getState(),
      ui: useUIStore.getState(),
    }),
    isHydrated: () => {
      const authHydrated = useAuthStore.persist?.hasHydrated() ?? true;
      const uiHydrated = useUIStore.persist?.hasHydrated() ?? true;
      return authHydrated && uiHydrated;
    },
  }), [authStore, notificationStore, uiStore]);

  return {
    isInitialized,
    error,
    ...storeUtils,
  };
}
