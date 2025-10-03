import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { logger } from '../lib/logging/logger';

export interface NotificationState {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'member' | 'donation' | 'aid' | 'campaign' | 'system' | 'general';
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source: 'system' | 'user' | 'external';
  persistent: boolean;
}

interface NotificationStoreState {
  notifications: NotificationState[];
  unreadCount: number;
  showNotificationCenter: boolean;
}

interface NotificationStoreActions {
  addNotification: (
    notification: Omit<NotificationState, 'id' | 'createdAt' | 'updatedAt' | 'read'>,
  ) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  updateUnreadCount: () => void;
  setShowNotificationCenter: (show: boolean) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useNotificationStore = create<NotificationStoreState & NotificationStoreActions>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      showNotificationCenter: false,
      addNotification: (notification) => {
        const newNotification: NotificationState = {
          ...notification,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
          read: false,
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
        get().updateUnreadCount();
      },
      markAsRead: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId
              ? { ...n, read: true, readAt: new Date(), updatedAt: new Date() }
              : n,
          ),
        }));
        get().updateUnreadCount();
      },
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
            readAt: new Date(),
            updatedAt: new Date(),
          })),
        }));
        get().updateUnreadCount();
      },
      removeNotification: (notificationId) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== notificationId),
        }));
        get().updateUnreadCount();
      },
      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },
      setShowNotificationCenter: (show: boolean) => {
        set({ showNotificationCenter: show });
      },
      updateUnreadCount: () => {
        set((state) => ({
          unreadCount: state.notifications.filter((n) => !n.read).length,
        }));
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: (_state) => {
        return (hydratedState, error) => {
          if (error) {
            console.error('An error occurred during hydration:', error);
          } else if (hydratedState) {
            hydratedState.updateUnreadCount();
          }
        };
      },
    },
  ),
);

export const notificationSelectors = {
  getUnreadNotifications: (state: NotificationStoreState) =>
    state.notifications.filter((n) => !n.read),
  getNotificationsByCategory: (
    state: NotificationStoreState,
    category: NotificationState['category'],
  ) => state.notifications.filter((n) => n.category === category),
  getNotificationsByType: (state: NotificationStoreState, type: NotificationState['type']) =>
    state.notifications.filter((n) => n.type === type),
  getRecentNotifications: (state: NotificationStoreState, limit = 5) =>
    state.notifications.slice(0, limit),
  getHighPriorityNotifications: (state: NotificationStoreState) =>
    state.notifications.filter((n) => ['high', 'urgent'].includes(n.priority)),
  getUnreadCount: (state: NotificationStoreState) => state.unreadCount,
  getTotalCount: (state: NotificationStoreState) => state.notifications.length,
  startRealtimeSubscription: () => {
    logger.info('Realtime subscription started (mock)');
    return Promise.resolve();
  },
  getState: () => useNotificationStore.getState(),
};

export default useNotificationStore;
