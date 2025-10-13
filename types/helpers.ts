/**
 * @fileoverview Type Helper Utilities
 * @description Common TypeScript utility types and helpers
 */

/**
 * Make specific properties required
 */
export type RequireFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Make specific properties optional
 */
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Strict extract - ensures all keys exist
 */
export type StrictExtract<T, U extends T> = T extends U ? T : never;

/**
 * Non-nullable type helper
 */
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Async function type
 */
export type AsyncFunction<T = void> = (...args: any[]) => Promise<T>;

/**
 * Component props with children
 */
export type PropsWithRequiredChildren<P = unknown> = P & {
  children: React.ReactNode;
};

/**
 * Safe array access type
 */
export type SafeArray<T> = ReadonlyArray<T> | T[];

/**
 * ID types
 */
export type ID = string | number;
export type StringID = string;
export type NumericID = number;

/**
 * Pagination types
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * API Response types
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, unknown>;
}

/**
 * Form field types
 */
export type FormFieldValue = string | number | boolean | null | undefined;

export interface FormField<T = FormFieldValue> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

/**
 * Loading state types
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T = unknown, E = Error> {
  data: T | null;
  error: E | null;
  loading: boolean;
  status: LoadingState;
}

/**
 * Route params type helper
 */
export type RouteParams<T extends string> = {
  [K in T]: string;
};

/**
 * Event handler types
 */
export type ClickHandler = (event: React.MouseEvent<HTMLElement>) => void;
export type ChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

/**
 * Nullable type helper
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;
