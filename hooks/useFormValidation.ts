/**
 * @fileoverview useFormValidation Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback, useState } from 'react';
import { logger } from '../lib/logging/logger';
import { validateField, validateForm, type ValidationResult } from '../lib/security/validation';
import type {
  UseFormValidationOptions,
  FormValidationState,
  FormValidationActions,
} from '../types/form';

// Re-export types for backward compatibility
export type {
  UseFormValidationOptions,
  FormValidationState,
  FormValidationActions,
} from '../types/form';

/**
 * useFormValidation function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useFormValidation<T extends Record<string, string | number | boolean>>({
  schema,
  initialValues,
  onSubmit,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormValidationOptions<T>): FormValidationState<T> & FormValidationActions<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [touched, setTouchedState] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  // Calculate overall form validity
  const isValid = Object.keys(schema).every((field) => {
    const fieldSchema = schema[field];
    const value = values[field];

    // If field is required and empty, form is invalid
    if (fieldSchema.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return false;
    }

    // If field has errors, form is invalid
    return !errors[field];
  });

  const setValue = useCallback(
    (field: keyof T, value: string | number | boolean) => {
      setValuesState((prev) => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' }));
      }

      // Validate on change if enabled
      if (validateOnChange) {
        validateSingleField(field, value);
      }
    },
    [errors, validateOnChange]
  );

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setTouched = useCallback((field: keyof T, touchedValue = true) => {
    setTouchedState((prev) => ({ ...prev, [field]: touchedValue }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error?: string) => {
    setErrors((prev) => ({ ...prev, [field]: error ?? '' }));
  }, []);

  const validateSingleField = useCallback(
    (field: keyof T, value: string | number | boolean): boolean => {
      const fieldSchema = schema[field as string];
      if (!fieldSchema) return true;

      let sanitizedValue = value;

      // Sanitize input if specified
      if (fieldSchema.sanitize && typeof value === 'string') {
        sanitizedValue = fieldSchema.sanitize(value);
      }

      // Required validation
      if (fieldSchema.required) {
        const result = validateField.required(sanitizedValue as string | number, field as string);
        if (!result.isValid) {
          setError(field, result.error!);
          return false;
        }
      }

      // Skip other validations if value is empty and not required
      if (!sanitizedValue && !fieldSchema.required) {
        setFieldError(field);
        return true;
      }

      // Min length validation
      if (fieldSchema.minLength && typeof sanitizedValue === 'string') {
        const result = validateField.minLength(
          sanitizedValue,
          fieldSchema.minLength,
          field as string
        );
        if (!result.isValid) {
          setError(field, result.error!);
          return false;
        }
      }

      // Max length validation
      if (fieldSchema.maxLength && typeof sanitizedValue === 'string') {
        const result = validateField.maxLength(
          sanitizedValue,
          fieldSchema.maxLength,
          field as string
        );
        if (!result.isValid) {
          setError(field, result.error!);
          return false;
        }
      }

      // Pattern validation
      if (fieldSchema.pattern && typeof sanitizedValue === 'string') {
        if (!fieldSchema.pattern.test(sanitizedValue)) {
          setError(field, `${field as string} formatı geçersiz`);
          return false;
        }
      }

      // Custom validation
      if (fieldSchema.custom) {
        const result = fieldSchema.custom(sanitizedValue);
        if (!result.isValid) {
          setError(field, result.error);
          return false;
        }
      }

      // Clear error if validation passes
      setFieldError(field);
      return true;
    },
    [schema, setError, setFieldError]
  );

  const validateFieldAction = useCallback(
    (field: keyof T): boolean => {
      return validateSingleField(field, values[field]);
    },
    [validateSingleField, values]
  );

  const validateFormAction = useCallback((): ValidationResult => {
    const result = validateForm(values, schema);

    // Update errors state
    const newErrors = {} as Record<keyof T, string>;
    result.errors.forEach((error, index) => {
      const field = Object.keys(schema)[index] as keyof T;
      newErrors[field] = error;
    });

    setErrors(newErrors);
    return result;
  }, [values, schema]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouchedState({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
    setSubmitCount(0);
  }, [initialValues]);

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      setIsSubmitting(true);
      setSubmitCount((prev) => prev + 1);

      // Mark all fields as touched
      const allTouched = {} as Record<keyof T, boolean>;
      Object.keys(schema).forEach((field) => {
        allTouched[field as keyof T] = true;
      });
      setTouchedState(allTouched);

      // Validate form
      const validationResult = validateFormAction();

      if (!validationResult.isValid) {
        setIsSubmitting(false);
        return;
      }

      try {
        // Sanitize all values before submission
        const sanitizedValues = {} as T;
        Object.keys(values).forEach((key) => {
          const fieldKey = key as keyof T;
          const value = values[fieldKey];
          const fieldSchema = schema[fieldKey as string];

          if (fieldSchema?.sanitize && typeof value === 'string') {
            sanitizedValues[fieldKey] = fieldSchema.sanitize(value) as T[keyof T];
          } else {
            sanitizedValues[fieldKey] = value;
          }
        });

        if (onSubmit) {
          await onSubmit(sanitizedValues);
        }
      } catch (error) {
        logger.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateFormAction, onSubmit, values, schema]
  );

  const handleBlur = useCallback(
    (field: keyof T) => {
      setTouched(field, true);

      if (validateOnBlur) {
        validateSingleField(field, values[field]);
      }
    },
    [setTouched, validateOnBlur, validateSingleField, values]
  );

  const handleChange = useCallback(
    (field: keyof T, value: string | number | boolean) => {
      setValue(field, value);
    },
    [setValue]
  );

  return {
    // State
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    submitCount,

    // Actions
    setValue,
    setValues,
    setError,
    setTouched,
    setFieldError,
    validateField: validateFieldAction,
    validateForm: validateFormAction,
    reset,
    handleSubmit,
    handleBlur,
    handleChange,
  };
}
