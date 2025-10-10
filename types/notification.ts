/**
 * @fileoverview Notification Types
 * @description Type definitions for notification system
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

/**
 * Notification type/severity
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Notification category
 */
export type NotificationCategory = 'system' | 'donation' | 'member' | 'aid' | 'finance';

/**
 * Notification priority
 */
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

// =============================================================================
// NOTIFICATION ENTITY
// =============================================================================

/**
 * Notification data structure
 */
export interface Notification {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority?: NotificationPriority;
  metadata?: Record<string, unknown>;
  actionUrl?: string;
  actionLabel?: string;
}

// =============================================================================
// NOTIFICATION STATISTICS
// =============================================================================

/**
 * Notification statistics
 */
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byCategory: Record<NotificationCategory, number>;
  recent: Notification[];
}

// =============================================================================
// PUSH NOTIFICATIONS
// =============================================================================

/**
 * Push notification payload
 */
export interface NotificationPayload {
  title: string;
  body?: string;
  icon?: string;
  url?: string;
  data?: Record<string, unknown>;
}

/**
 * Push notification subscription
 */
export interface PushSubscription {
  endpoint: string;
  userId: string;
  deviceId: string;
  createdAt: Date;
  lastUsedAt?: Date;
}

/**
 * Push notification configuration
 */
export interface PushNotificationConfig {
  enabled: boolean;
  vapidPublicKey?: string;
  allowedOrigins: string[];
  retryAttempts: number;
  retryDelay: number;
}

// =============================================================================
// NOTIFICATION PREFERENCES
// =============================================================================

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: Partial<Record<NotificationCategory, boolean>>;
  priorities: Partial<Record<NotificationPriority, boolean>>;
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}
