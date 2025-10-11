/**
 * @fileoverview FormProvider Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { createContext, useContext, type ReactNode } from 'react';

import { logger } from '../../lib/logging/logger';
interface ValidationError {
  field: string;
  message: string;
}

interface FormState {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

type FormValidationSchema = Record<string, {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => string | boolean;
  }>;

interface FormContextType {
  formState: FormState;
  schema: FormValidationSchema;
  validateForm: () => Promise<{ isValid: boolean; errors: ValidationError[] }>;
  validateField: (fieldName: string, value: any) => Promise<{ isValid: boolean; errors: ValidationError[] }>;
  setFieldValue: (fieldName: string, value: any) => void;
  setFieldTouched: (fieldName: string, touched?: boolean) => void;
  resetForm: () => void;
  submitForm: () => Promise<{ isValid: boolean; errors: ValidationError[] }>;
  getFieldValues: () => Record<string, any>;
  getFieldProps: (fieldName: string) => any;
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  errors: ValidationError[];
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
  children: ReactNode;
  schema: FormValidationSchema;
  initialValues?: Record<string, any>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
  onSubmit?: (values: Record<string, any>) => Promise<void> | void;
  onValidationChange?: (isValid: boolean, errors: ValidationError[]) => void;
  className?: string;
  onSubmitCapture?: (e: React.FormEvent) => void;
}

export function FormProvider({
  children,
  schema,
  initialValues = {},
  validateOnChange = true,
  validateOnBlur = true,
  onSubmit,
  onValidationChange,
  className,
  onSubmitCapture,
  ...props
}: FormProviderProps) {
  // Simple form state management
  const formState: FormState = {
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
  };

  const validateField = async (fieldName: string, value: any): Promise<{ isValid: boolean; errors: ValidationError[] }> => {
    const fieldSchema = schema[fieldName];
    if (!fieldSchema) {
      return { isValid: true, errors: [] };
    }

    const errors: ValidationError[] = [];

    if (fieldSchema.required && (!value || value === '')) {
      errors.push({ field: fieldName, message: `${fieldName} is required` });
    }

    if (fieldSchema.minLength && value && value.length < fieldSchema.minLength) {
      errors.push({ field: fieldName, message: `${fieldName} must be at least ${fieldSchema.minLength} characters` });
    }

    if (fieldSchema.maxLength && value && value.length > fieldSchema.maxLength) {
      errors.push({ field: fieldName, message: `${fieldName} must be no more than ${fieldSchema.maxLength} characters` });
    }

    if (fieldSchema.pattern && value && !fieldSchema.pattern.test(value)) {
      errors.push({ field: fieldName, message: `${fieldName} format is invalid` });
    }

    if (fieldSchema.custom) {
      const customResult = fieldSchema.custom(value);
      if (customResult !== true) {
        errors.push({ field: fieldName, message: typeof customResult === 'string' ? customResult : `${fieldName} is invalid` });
      }
    }

    return { isValid: errors.length === 0, errors };
  };

  const validateForm = async (): Promise<{ isValid: boolean; errors: ValidationError[] }> => {
    const allErrors: ValidationError[] = [];

    for (const [fieldName, value] of Object.entries(formState.values)) {
      const fieldResult = await validateField(fieldName, value);
      allErrors.push(...fieldResult.errors);
    }

    return { isValid: allErrors.length === 0, errors: allErrors };
  };

  const setFieldValue = (fieldName: string, value: any) => {
    formState.values[fieldName] = value;
    formState.isDirty = true;
    
    if (validateOnChange) {
      validateField(fieldName, value).then(result => {
        if (result.errors.length > 0) {
          formState.errors[fieldName] = result.errors[0]?.message || 'Validation error';
        } else {
          delete formState.errors[fieldName];
        }
        formState.isValid = Object.keys(formState.errors).length === 0;
        onValidationChange?.(formState.isValid, result.errors);
      });
    }
  };

  const setFieldTouched = (fieldName: string, touched = true) => {
    formState.touched[fieldName] = touched;
    
    if (validateOnBlur && touched) {
      validateField(fieldName, formState.values[fieldName]).then(result => {
        if (result.errors.length > 0) {
          formState.errors[fieldName] = result.errors[0]?.message || 'Validation error';
        } else {
          delete formState.errors[fieldName];
        }
        formState.isValid = Object.keys(formState.errors).length === 0;
        onValidationChange?.(formState.isValid, result.errors);
      });
    }
  };

  const resetForm = () => {
    formState.values = { ...initialValues };
    formState.errors = {};
    formState.touched = {};
    formState.isSubmitting = false;
    formState.isValid = true;
    formState.isDirty = false;
  };

  const submitForm = async (): Promise<{ isValid: boolean; errors: ValidationError[] }> => {
    formState.isSubmitting = true;
    
    const validationResult = await validateForm();
    
    if (validationResult.isValid && onSubmit) {
      try {
        await onSubmit(formState.values);
      } catch (error) {
        logger.error('Form submission error:', error);
      }
    }
    
    formState.isSubmitting = false;
    return validationResult;
  };

  const getFieldValues = () => formState.values;

  const getFieldProps = (fieldName: string) => ({
    value: formState.values[fieldName] || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setFieldValue(fieldName, e.target.value); },
    onBlur: () => { setFieldTouched(fieldName, true); },
    error: formState.errors[fieldName],
    touched: formState.touched[fieldName],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSubmitCapture) {
      onSubmitCapture(e);
    }

    return await submitForm();
  };

  const contextValue: FormContextType = {
    formState,
    schema,
    validateForm,
    validateField,
    setFieldValue,
    setFieldTouched,
    resetForm,
    submitForm,
    getFieldValues,
    getFieldProps,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    isDirty: formState.isDirty,
    errors: Object.entries(formState.errors).map(([field, message]) => ({ field, message })),
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
}

// Export additional form components for compatibility
export const useForm = useFormContext;
export const Field = ({ name, ...props }: any) => <input name={name} {...props} />;
export const FormErrorSummary = ({ errors }: any) => (
  <div>
    {Object.entries(errors).map(([field, error]) => (
      <div key={field}>{field}: {String(error)}</div>
    ))}
  </div>
);
export const FormSubmitButton = ({ children, ...props }: any) => (
  <button type="submit" {...props}>{children}</button>
);
