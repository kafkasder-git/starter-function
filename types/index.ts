/**
 * @fileoverview Types Index - Centralized type exports
 * @description Central export point for all application types
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// =============================================================================
// SERVICE LAYER TYPES
// =============================================================================

export type { PaginatedResponse, ApiResponse, ServiceResult, ValidationResult } from './services';

export { ServiceErrorCode, ServiceError, SERVICE_CONFIG } from './services';

// =============================================================================
// DOMAIN TYPES
// =============================================================================

// Authentication
export type { User, AuthState, LoginCredentials, RegisterCredentials, AuthResponse } from './auth';

// Beneficiaries
export type {
  Beneficiary,
  BeneficiaryInsert,
  BeneficiaryUpdate,
  BeneficiaryFilters,
  BeneficiaryStats,
  BeneficiaryStatus,
  BeneficiaryPriority,
  NeedType,
  FamilyStatus,
  BeneficiaryDBFields,
} from './beneficiary';

export { mapDBToBeneficiary, mapBeneficiaryToDB } from './beneficiary';

// Database
export type { Member, Donation, DonationInsert, DonationUpdate, DonationFilters } from './database';

// Kumbara
export type {
  Kumbara,
  KumbaraInsert,
  KumbaraUpdate,
  KumbaraFilters,
  KumbaraTransaction,
  UseKumbaraOptions,
  UseKumbaraReturn,
} from './kumbara';

// Search
export type {
  SearchResult,
  SearchFilters,
  SearchOptions,
  SearchConfig,
  SearchState,
  FilterValue,
  SortConfig,
  UseSearchProps,
} from './search';

// Stats
export type { StatsData, StatsFilters, TrendData } from './stats';

// Validation
export type { ValidationRule, ValidationSchema, ValidatorFunction } from './validation';

// =============================================================================
// FILE AND STORAGE TYPES
// =============================================================================

export type {
  FileMetadata,
  FileUploadOptions,
  FileUploadResult,
  FileListOptions,
  FileListResult,
  FileDownloadOptions,
  StorageConfig,
  BucketConfig,
  StorageStats,
} from './file';

// =============================================================================
// USER MANAGEMENT TYPES
// =============================================================================

export type {
  ManagedUser,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserListResponse,
  UserActivity,
  UserRole,
  PermissionLevel,
  UserStats,
} from './user';

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export type {
  Notification,
  NotificationStats,
  NotificationPayload,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  PushSubscription,
  PushNotificationConfig,
  NotificationPreferences,
} from './notification';

// =============================================================================
// PERFORMANCE TYPES
// =============================================================================

export type {
  PerformanceMetrics,
  PerformanceRating,
  PerformanceAlert,
  PerformanceReport,
  PerformanceConfig,
  PerformanceThresholds,
  MobilePerformanceMetrics,
  DeviceCapabilities,
} from './performance';

// =============================================================================
// DATA AND EXPORT TYPES
// =============================================================================

export type { ExportConfig, ExportResult, ExportFormat, DataTransformer } from './data';

// =============================================================================
// MONITORING AND ANALYTICS
// =============================================================================

export type { MonitoringEvent, ErrorLog } from './monitoring';

// =============================================================================
// REPORTING TYPES
// =============================================================================

export type { ReportConfig, ReportData, ReportFilters, ChartData, ChartConfig } from './reporting';

// =============================================================================
// FORM TYPES
// =============================================================================

export type {
  UseFormValidationOptions,
  FormValidationState,
  FormValidationActions,
  UseMobileFormOptions,
  MobileFormState,
  FormFieldType,
  FormFieldConfig,
  FormFieldProps,
  FormSubmissionState,
  FormSubmissionResult,
} from './form';

// =============================================================================
// PAGINATION TYPES
// =============================================================================

export type {
  UsePaginationProps,
  PaginationState,
  PageRange,
  PaginationActions,
  UseInfiniteScrollOptions,
  InfiniteScrollState,
  InfiniteScrollActions,
  CursorPaginationOptions,
  CursorPaginationResult,
} from './pagination';

// =============================================================================
// SUPABASE TYPES
// =============================================================================

export type {
  SupabaseResponse,
  SupabaseQueryOptions,
  ConnectionStatus,
  BatchOperationResult,
} from './supabase';
