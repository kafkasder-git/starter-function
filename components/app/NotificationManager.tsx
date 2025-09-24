import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useCallback } from 'react';

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  archived: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

// Notification state
export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
}

// Notification actions
export interface NotificationActions {
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'archived'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  archive: (id: string) => void;
  delete: (id: string) => void;
  handleAction: (id: string) => void;
}

// Context type
interface NotificationContextType {
  state: NotificationState;
  actions: NotificationActions;
}

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook to use notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Provider props
interface NotificationProviderProps {
  children: ReactNode;
}

// Notification Provider
export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'archived'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
      archived: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const archive = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, archived: true } : notification
      )
    );
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const handleAction = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification?.actionUrl) {
      // Handle navigation or action
      console.log('Navigating to:', notification.actionUrl);
      markAsRead(id);
    }
  }, [notifications, markAsRead]);

  const unreadCount = notifications.filter(n => !n.read && !n.archived).length;

  const state: NotificationState = {
    notifications: notifications.filter(n => !n.archived),
    unreadCount,
  };

  const actions: NotificationActions = {
    addNotification,
    markAsRead,
    markAllAsRead,
    archive,
    delete: deleteNotification,
    handleAction,
  };

  return (
    <NotificationContext.Provider value={{ state, actions }}>
      {children}
    </NotificationContext.Provider>
  );
};

// NotificationManager component for render prop pattern
interface NotificationManagerProps {
  children: (state: NotificationState, actions: NotificationActions) => ReactNode;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ children }) => {
  const { state, actions } = useNotifications();
  return <>{children(state, actions)}</>;
};

export default NotificationManager;