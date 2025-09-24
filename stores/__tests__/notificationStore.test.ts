import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useNotificationStore } from '../notificationStore';
import { act } from '@testing-library/react';

// Hold initial state
const initialState = useNotificationStore.getState();

describe('notificationStore', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useNotificationStore.setState(initialState);
    });
  });

  afterEach(() => {
    act(() => {
      useNotificationStore.getState().clearAllNotifications();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useNotificationStore.getState();
      expect(state.notifications).toEqual([]);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('Adding Notifications', () => {
    it('should add a notification and update unread count', () => {
      const notificationData = {
        userId: 'user-1',
        title: 'Test Notification',
        message: 'This is a test message.',
        type: 'info' as const,
        category: 'general' as const,
        priority: 'medium' as const,
        source: 'system' as const,
        persistent: false,
      };

      act(() => {
        useNotificationStore.getState().addNotification(notificationData);
      });

      const state = useNotificationStore.getState();
      expect(state.notifications).toHaveLength(1);
      expect(state.unreadCount).toBe(1);
      expect(state.notifications[0]).toMatchObject({
        ...notificationData,
        read: false,
      });
      expect(state.notifications[0].id).toBeDefined();
      expect(state.notifications[0].createdAt).toBeDefined();
    });
  });

  describe('Marking as Read', () => {
    it('should mark a notification as read and update unread count', () => {
      const notificationData = {
        userId: 'user-1',
        title: 'Unread Notification',
        message: 'This should be marked as read.',
        type: 'info' as const,
        category: 'general' as const,
        priority: 'medium' as const,
        source: 'system' as const,
        persistent: false,
      };

      act(() => {
        useNotificationStore.getState().addNotification(notificationData);
      });

      const notificationId = useNotificationStore.getState().notifications[0].id;

      act(() => {
        useNotificationStore.getState().markAsRead(notificationId);
      });

      const state = useNotificationStore.getState();
      expect(state.notifications[0].read).toBe(true);
      expect(state.notifications[0].readAt).toBeDefined();
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('Mark All as Read', () => {
    it('should mark all notifications as read and reset unread count', () => {
      const notifications = [
        {
          userId: 'user-1',
          title: 'First',
          message: 'msg',
          type: 'info' as const,
          category: 'general' as const,
          priority: 'low' as const,
          source: 'system' as const,
          persistent: false,
        },
        {
          userId: 'user-1',
          title: 'Second',
          message: 'msg',
          type: 'info' as const,
          category: 'general' as const,
          priority: 'low' as const,
          source: 'system' as const,
          persistent: false,
        },
      ];

      act(() => {
        notifications.forEach((n) => useNotificationStore.getState().addNotification(n));
      });

      expect(useNotificationStore.getState().unreadCount).toBe(2);

      act(() => {
        useNotificationStore.getState().markAllAsRead();
      });

      const state = useNotificationStore.getState();
      expect(state.notifications.every((n) => n.read)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('Removing Notifications', () => {
    it('should remove a notification and update unread count', () => {
      const notificationData = {
        userId: 'user-1',
        title: 'To Be Removed',
        message: 'This will be removed.',
        type: 'info' as const,
        category: 'general' as const,
        priority: 'medium' as const,
        source: 'system' as const,
        persistent: false,
      };

      act(() => {
        useNotificationStore.getState().addNotification(notificationData);
      });

      const notificationId = useNotificationStore.getState().notifications[0].id;
      expect(useNotificationStore.getState().notifications).toHaveLength(1);

      act(() => {
        useNotificationStore.getState().removeNotification(notificationId);
      });

      const state = useNotificationStore.getState();
      expect(state.notifications).toHaveLength(0);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe('Clearing All Notifications', () => {
    it('should clear all notifications and reset unread count', () => {
      const notifications = [
        {
          userId: 'user-1',
          title: 'First',
          message: 'msg',
          type: 'info' as const,
          category: 'general' as const,
          priority: 'low' as const,
          source: 'system' as const,
          persistent: false,
        },
        {
          userId: 'user-1',
          title: 'Second',
          message: 'msg',
          type: 'info' as const,
          category: 'general' as const,
          priority: 'low' as const,
          source: 'system' as const,
          persistent: false,
        },
      ];

      act(() => {
        notifications.forEach((n) => useNotificationStore.getState().addNotification(n));
      });

      expect(useNotificationStore.getState().notifications).toHaveLength(2);

      act(() => {
        useNotificationStore.getState().clearAllNotifications();
      });

      const state = useNotificationStore.getState();
      expect(state.notifications).toHaveLength(0);
      expect(state.unreadCount).toBe(0);
    });
  });
});
