/**
 * @fileoverview Appwrite Type Extensions
 * @description Extended types for Appwrite that are not exported from the main types
 */

// RealtimeResponse type since it's not exported from Appwrite types
export interface RealtimeResponse<T> {
  events: string[];
  channels: string[];
  timestamp: number;
  payload: T;
}

// User presence status types
export type UserPresenceStatus = 'online' | 'offline' | 'away' | 'busy';

// Extended Appwrite document with additional properties
export interface ExtendedDocument extends Record<string, any> {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

// Standard API response format
export interface StandardApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  timestamp?: string;
  metadata?: {
    total?: number;
    page?: number;
    pageSize?: number;
  };
}

// List response format for Appwrite
export interface ListResponse<T> {
  documents: T[];
  total: number;
}

// Database operation result
export interface DatabaseResult<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

// File upload result
export interface FileUploadResult {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}

// Search filters
export interface SearchFilters {
  query?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderType?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

// Pagination parameters
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

// Date range filter
export interface DateRange {
  start: Date | string;
  end: Date | string;
}

// Error types
export interface AppwriteError {
  code: number;
  message: string;
  type: string;
  version: string;
}

// Connection status
export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

// Service health status
export interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

// Batch operation result
export interface BatchOperationResult<T> {
  success: T[];
  failed: Array<{ item: T; error: string }>;
  total: number;
}

// Cache configuration
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  maxSize?: number;
  strategy?: 'lru' | 'fifo' | 'lfu';
}

// Performance metrics
export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: number;
  cpuUsage?: number;
  timestamp: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Notification preferences
export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  categories: Record<string, boolean>;
}

// User session
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: {
    userAgent: string;
    platform: string;
    ip?: string;
  };
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

// Feature flags
export interface FeatureFlags {
  [key: string]: boolean | string | number;
}

// Environment configuration
export interface EnvironmentConfig {
  apiUrl: string;
  projectId: string;
  environment: 'development' | 'staging' | 'production';
  features: FeatureFlags;
  limits: {
    maxFileSize: number;
    maxRequestsPerMinute: number;
    maxConcurrentUsers: number;
  };
}

