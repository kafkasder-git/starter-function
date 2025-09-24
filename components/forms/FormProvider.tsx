import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { FormState, FormValidationSchema, ValidationError } from '../../types/validation';
import { useFormValidation } from '../../hooks/useFormValidation';

interface FormContextType {
  formState: FormState;
  schema: FormValidationSchema;
  validateForm: () => Promise<{ isValid: boolean; errors: ValidationError[] }>;
  validateField: (
    fieldName: string,
    value: any,
  ) => Promise<{ isValid: boolean; errors: ValidationError[] }>;
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
  initialValues,
  validateOnChange = true,
  validateOnBlur = true,
  debounceMs = 300,
  onSubmit,
  onValidationChange,
  className,
  onSubmitCapture,
  ...props
}: FormProviderProps) {
  const formValidation = useFormValidation({
    schema,
    initialValues,
    validateOnChange,
    validateOnBlur,
    debounceMs,
    onSubmit,
    onValidationChange,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onSubmitCapture) {
      onSubmitCapture(e);
    }

    return await formValidation.submitForm();
  };

  const contextValue: FormContextType = {
    formState: formValidation.formState,
    schema,
    validateForm: formValidation.validateForm,
    validateField: formValidation.validateField,
    setFieldValue: formValidation.setFieldValue,
    setFieldTouched: formValidation.setFieldTouched,
    resetForm: formValidation.resetForm,
    submitForm: formValidation.submitForm,
    getFieldValues: formValidation.getFieldValues,
    getFieldProps: formValidation.getFieldProps,
    isValid: formValidation.isValid,
    isSubmitting: formValidation.isSubmitting,
    isDirty: formValidation.isDirty,
    errors: formValidation.errors,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className} noValidate {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export function useForm(): FormContextType {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
}

// Field component that automatically connects to the form
interface FieldProps {
  name: string;
  children: (props: any) => ReactNode;
}

export function Field({ name, children }: FieldProps) {
  const { getFieldProps } = useForm();
  const fieldProps = getFieldProps(name);

  return <>{children(fieldProps)}</>;
}

// Error summary component
interface FormErrorSummaryProps {
  className?: string;
  showWarnings?: boolean;
}

export function FormErrorSummary({ className, showWarnings = false }: FormErrorSummaryProps) {
  const { errors, formState } = useForm();

  if (errors.length === 0 && (!showWarnings || formState.warnings.length === 0)) {
    return null;
  }

  return (
    <div className={className}>
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-red-800 mb-2">Aşağıdaki hataları düzeltin:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <span>•</span>
                <span>{error.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showWarnings && formState.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-medium text-amber-800 mb-2">Uyarılar:</h3>
          <ul className="text-sm text-amber-700 space-y-1">
            {formState.warnings.map((warning, index) => (
              <li key={index} className="flex items-center gap-2">
                <span>•</span>
                <span>{warning.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Submit button component
interface FormSubmitButtonProps {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  loadingText?: string;
}

export function FormSubmitButton({
  children,
  className,
  disabled,
  variant = 'default',
  size = 'default',
  loadingText = 'Kaydediliyor...',
  ...props
}: FormSubmitButtonProps) {
  const { isSubmitting, isValid } = useForm();

  return (
    <button
      type="submit"
      disabled={disabled || isSubmitting || !isValid}
      className={className}
      {...props}
    >
      {isSubmitting ? loadingText : children}
    </button>
  );
}
