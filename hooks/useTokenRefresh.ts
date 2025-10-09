/**
 * @fileoverview useTokenRefresh Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

import { logger } from '../lib/logging/logger';
// Token refresh hook for automatic session management
export const useTokenRefresh = () => {
  const { session, isAuthenticated, refreshSession, checkSessionExpiry, logout } = useAuthStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Calculate time until token expires
  const getTimeUntilExpiry = useCallback(() => {
    if (!session || !session.expires_at) return 0;
    const expiresAt = session.expires_at * 1000;
    const now = Date.now();
    return Math.max(0, expiresAt - now);
  }, [session]);

  // Calculate time until refresh should happen (10 minutes before expiry)
  const getTimeUntilRefresh = useCallback(() => {
    if (!session || !session.expires_at) return 0;
    const expiresAt = session.expires_at * 1000;
    const now = Date.now();
    const refreshTime = expiresAt - 10 * 60 * 1000; // 10 minutes before expiry
    return Math.max(0, refreshTime - now);
  }, [session]);

  // Refresh token with retry logic
  const refreshWithRetry = useCallback(
    async (retryCount = 0) => {
      if (isRefreshingRef.current) return;

      isRefreshingRef.current = true;

      try {
        await refreshSession();
        logger.info('Token refreshed successfully');
      } catch (error) {
        logger.error('Token refresh failed:', error);

        // Retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
          setTimeout(() => {
            refreshWithRetry(retryCount + 1);
          }, delay);
        } else {
          // If all retries failed, logout user
          toast.error('Oturum yenilenemedi. Lütfen tekrar giriş yapın.', {
            duration: 5000,
          });
          await logout();
        }
      } finally {
        isRefreshingRef.current = false;
      }
    },
    [refreshSession, logout],
  );

  // Schedule next refresh
  const scheduleRefresh = useCallback(() => {
    if (!isAuthenticated || !session) return;

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    const timeUntilRefresh = getTimeUntilRefresh();
    const timeUntilExpiry = getTimeUntilExpiry();

    // If token is already expired or will expire soon, refresh immediately
    if (timeUntilExpiry <= 5 * 60 * 1000) {
      // 5 minutes or less
      refreshWithRetry();
      return;
    }

    // Schedule refresh
    if (timeUntilRefresh > 0) {
      refreshTimeoutRef.current = setTimeout(() => {
        refreshWithRetry();
      }, timeUntilRefresh);

      logger.info(`Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000 / 60)} minutes`);
    }
  }, [isAuthenticated, session, getTimeUntilRefresh, getTimeUntilExpiry, refreshWithRetry]);

  // Check session expiry periodically
  const startExpiryCheck = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Check every minute
    intervalRef.current = setInterval(() => {
      checkSessionExpiry();
    }, 60 * 1000);
  }, [checkSessionExpiry]);

  // Initialize token refresh management
  useEffect(() => {
    if (isAuthenticated && session) {
      scheduleRefresh();
      startExpiryCheck();
    } else {
      // Clear timers when not authenticated
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, session, scheduleRefresh, startExpiryCheck]);

  // Handle page visibility change (refresh when page becomes visible)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated && session) {
        // Check if token needs refresh when page becomes visible
        const timeUntilExpiry = getTimeUntilExpiry();
        if (timeUntilExpiry <= 15 * 60 * 1000) {
          // 15 minutes or less
          refreshWithRetry();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, session, getTimeUntilExpiry, refreshWithRetry]);

  // Handle window focus (refresh when window gains focus)
  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated && session) {
        const timeUntilExpiry = getTimeUntilExpiry();
        if (timeUntilExpiry <= 15 * 60 * 1000) {
          // 15 minutes or less
          refreshWithRetry();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, session, getTimeUntilExpiry, refreshWithRetry]);

  return {
    timeUntilExpiry: getTimeUntilExpiry(),
    timeUntilRefresh: getTimeUntilRefresh(),
    isRefreshing: isRefreshingRef.current,
    refreshToken: refreshWithRetry,
  };
};
