/**
 * @fileoverview API Types and Standards
 * @description Standardized types and interfaces for API communication
 */

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
  requestId?: string;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * API error response
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  requestId?: string;
}

/**
 * Request options for API calls
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean | number; // boolean or cache duration in ms
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'regex';
  value: any;
}

/**
 * Standard entity interface
 */
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Soft deletable entity
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: string;
  deletedBy?: string;
}

/**
 * Auditable entity with version tracking
 */
export interface AuditableEntity extends BaseEntity {
  version: number;
  auditLog?: AuditLogEntry[];
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  entityId: string;
  entityType: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE';
  changes?: Record<string, { from: any; to: any }>;
  userId: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
}

/**
 * Bulk operation result
 */
export interface BulkOperationResult<T = any> {
  successful: T[];
  failed: Array<{
    item: any;
    error: string;
  }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult<T = any> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
  message?: string;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  fields?: string[];
  filters?: QueryParams['filters'];
  sort?: SortConfig;
  filename?: string;
}

/**
 * Import configuration
 */
export interface ImportConfig {
  format: 'csv' | 'xlsx' | 'json';
  mapping?: Record<string, string>;
  validation?: boolean;
  updateExisting?: boolean;
}

/**
 * Import result
 */
export interface ImportResult extends BulkOperationResult {
  importId: string;
  processedAt: string;
  validationErrors?: ValidationError[];
}

/**
 * Webhook payload
 */
export interface WebhookPayload<T = any> {
  event: string;
  data: T;
  timestamp: string;
  signature?: string;
  source: string;
}

/**
 * API client configuration
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  auth?: {
    type: 'bearer' | 'basic' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
  };
}

/**
 * API rate limiting information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: Record<string, {
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    lastCheck: string;
    details?: Record<string, any>;
  }>;
  uptime: number;
}

/**
 * System metrics
 */
export interface SystemMetrics {
  timestamp: string;
  cpu: {
    usage: number;
    cores: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
  database?: {
    connections: number;
    queryTime: number;
    slowQueries: number;
  };
}

/**
 * Notification payload
 */
export interface NotificationPayload {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  read: boolean;
  userId?: string;
  channel?: 'email' | 'sms' | 'push' | 'in-app';
}

/**
 * Search result
 */
export interface SearchResult<T = any> {
  items: T[];
  total: number;
  query: string;
  facets?: Record<string, Array<{
    value: string;
    count: number;
  }>>;
  suggestions?: string[];
  took: number;
}

/**
 * API middleware function type
 */
export type ApiMiddleware = (
  request: Request,
  response: Response,
  next: () => void
) => void | Promise<void>;

/**
 * API endpoint configuration
 */
export interface ApiEndpoint {
  path: string;
  method: string;
  handler: (req: any, res: any) => Promise<any>;
  middleware?: ApiMiddleware[];
  validation?: any;
  documentation?: {
    summary: string;
    description?: string;
    parameters?: any[];
    responses?: Record<string, any>;
  };
}

/**
 * API versioning configuration
 */
export interface ApiVersion {
  version: string;
  deprecated?: boolean;
  sunsetDate?: string;
  endpoints: ApiEndpoint[];
}

/**
 * API documentation
 */
export interface ApiDocumentation {
  title: string;
  version: string;
  description: string;
  baseUrl: string;
  versions: ApiVersion[];
  schemas: Record<string, any>;
}
