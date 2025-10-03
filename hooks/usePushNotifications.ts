/**
 * Push Notifications Hook
 * React hook for managing push notifications
 */

import { useCallback, useEffect, useState } from 'react';
import { pushNotificationService, type NotificationPayload } from '../services/pushNotificationService';

import { logger } from '../lib/logging/logger';
/**
 * UsePushNotificationsReturn Interface
 * 
 * @interface UsePushNotificationsReturn
 */
export interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  showNotification: (payload: NotificationPayload) => Promise<void>;
  sendToUser: (userId: string, payload: NotificationPayload) => Promise<boolean>;
  broadcast: (payload: NotificationPayload) => Promise<boolean>;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize service on mount
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if push notifications are supported
        const supported =
          'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
        setIsSupported(supported);

        if (!supported) {
          setError('Push notifications are not supported in this browser');
          return;
        }

        // Initialize service
        const initialized = await pushNotificationService.initialize();
        setIsSubscribed(pushNotificationService.isSubscribed());
        setPermission(pushNotificationService.getPermissionStatus());

        logger.info('Push notification service initialized:', initialized);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize push notifications');
        logger.error('Push notification initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeService();

    // Listen for permission changes
    const handlePermissionChange = () => {
      setPermission(Notification.permission);
    };

    // Check if permission change event is supported
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'notifications' as PermissionName })
        .then((permissionStatus) => {
          permissionStatus.addEventListener('change', handlePermissionChange);
          return () => {
            permissionStatus.removeEventListener('change', handlePermissionChange);
          };
        });
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await pushNotificationService.subscribe();
      setIsSubscribed(success);
      setPermission(pushNotificationService.getPermissionStatus());

      if (!success) {
        setError('Failed to subscribe to push notifications');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to subscribe';
      setError(errorMessage);
      logger.error('Push notification subscription error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const success = await pushNotificationService.unsubscribe();
      setIsSubscribed(!success);

      if (!success) {
        setError('Failed to unsubscribe from push notifications');
      }

      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unsubscribe';
      setError(errorMessage);
      logger.error('Push notification unsubscription error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Show local notification
  const showNotification = useCallback(async (payload: NotificationPayload): Promise<void> => {
    try {
      setError(null);
      await pushNotificationService.showNotification(payload);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to show notification';
      setError(errorMessage);
      logger.error('Show notification error:', err);
      throw err;
    }
  }, []);

  // Send notification to specific user
  const sendToUser = useCallback(
    async (userId: string, payload: NotificationPayload): Promise<boolean> => {
      try {
        setError(null);
        return await pushNotificationService.sendNotificationToUser(userId, payload);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send notification';
        setError(errorMessage);
        logger.error('Send notification error:', err);
        return false;
      }
    },
    [],
  );

  // Broadcast notification to all users
  const broadcast = useCallback(async (payload: NotificationPayload): Promise<boolean> => {
    try {
      setError(null);
      return await pushNotificationService.broadcastNotification(payload);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to broadcast notification';
      setError(errorMessage);
      logger.error('Broadcast notification error:', err);
      return false;
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    showNotification,
    sendToUser,
    broadcast,
  };
};

export default usePushNotifications;
