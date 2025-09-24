// Service Configuration and Common Types

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export type ServiceResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; error: string };

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export enum ServiceErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class ServiceError extends Error {
  constructor(
    public code: ServiceErrorCode,
    message: string,
    public context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const SERVICE_CONFIG = {
  DEFAULT_DELAY_MS: 300,
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  MAX_SEARCH_RESULTS: 50,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  MAX_FORECAST_MONTHS: 24,
  MIN_FORECAST_MONTHS: 1,
  FORECAST_CONFIDENCE_DECAY: 0.1,
  FORECAST_MIN_CONFIDENCE: 0.3,
  FORECAST_BOUNDS_MULTIPLIER: { lower: 0.8, upper: 1.2 },
  TREND_THRESHOLD: 0.01,

  // Data processing constants
  MAX_DATA_SAMPLE_SIZE: 1000,
  OUTLIER_IQR_MULTIPLIER: 1.5,
  TREND_CHANGE_THRESHOLD: 5, // percentage

  // Validation constants
  MIN_NAME_LENGTH: 2,
  NATIONAL_ID_LENGTH: 11,
  PHONE_REGEX: /^05\d{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;
