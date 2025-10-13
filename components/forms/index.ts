/**
 * @fileoverview index Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Form validation and components exports
export { FormField } from './FormField';
export { FormSection } from './FormSection';
export { FormStepper, FormStepperProgress } from './FormStepper';
export {
  DependentFormField,
  useFieldDependencies,
  DependencyConditions,
} from './DependentFormField';
export { MobileFormField, MobileFormSection, MobileFormNavigation } from './MobileFormField';
export {
  FormProvider,
  useFormContext as useForm,
  Field,
  FormErrorSummary,
  FormSubmitButton,
} from './FormProvider';
export { FormSystemExample } from './FormSystemExample';

// Hooks
export { useFormValidation } from '../../hooks/useFormValidation';

// Types
export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  FieldValidationRule,
  FormValidationSchema,
  FormFieldState,
  FormState,
} from '../../types/validation';

// Validation utilities
export { ValidationRules, FormSchemas } from '../../types/validation';
