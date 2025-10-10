/**
 * @fileoverview Form Types
 * @description Type definitions for form handling and validation
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ValidationSchema, ValidationResult } from './validation';

// =============================================================================
// FORM VALIDATION
// =============================================================================

/**
 * Form validation options
 */
export interface UseFormValidationOptions<T> {
  schema: ValidationSchema;
  initialValues: T;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

/**
 * Form validation state
 */
export interface FormValidationState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

/**
 * Form validation actions
 */
export interface FormValidationActions<T> {
  setValue: (field: keyof T, value: string | number | boolean) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  setTouched: (field: keyof T, touched?: boolean) => void;
  setFieldError: (field: keyof T, error?: string) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => ValidationResult;
  reset: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  handleBlur: (field: keyof T) => void;
  handleChange: (field: keyof T, value: string | number | boolean) => void;
}

// =============================================================================
// MOBILE FORM
// =============================================================================

/**
 * Mobile form options
 */
export interface UseMobileFormOptions {
  preventZoom?: boolean;
  adjustViewport?: boolean;
  optimizeKeyboard?: boolean;
  enableHapticFeedback?: boolean;
  enableKeyboardDetection?: boolean;
}

/**
 * Mobile form state
 */
export interface MobileFormState {
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  viewportHeight: number;
  orientation: 'portrait' | 'landscape';
}

// =============================================================================
// FORM FIELD TYPES
// =============================================================================

/**
 * Form field type
 */
export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'file';

/**
 * Form field configuration
 */
export interface FormFieldConfig {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  autoComplete?: string;
  pattern?: string;
  min?: number | string;
  max?: number | string;
  step?: number;
  maxLength?: number;
  minLength?: number;
  options?: Array<{ value: string; label: string }>;
  helpText?: string;
  errorMessage?: string;
}

/**
 * Form field props
 */
export interface FormFieldProps extends FormFieldConfig {
  value: string | number | boolean;
  error?: string;
  touched?: boolean;
  onChange: (value: string | number | boolean) => void;
  onBlur: () => void;
}

// =============================================================================
// FORM SUBMISSION
// =============================================================================

/**
 * Form submission state
 */
export interface FormSubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: string;
  submitCount: number;
}

/**
 * Form submission result
 */
export interface FormSubmissionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  validationErrors?: Record<string, string>;
}
