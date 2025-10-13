/**
 * @fileoverview FormField Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { forwardRef, useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Switch } from '../ui/switch';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { helperTextVariants } from '../../lib/design-system/variants';
import type { ValidationError, ValidationWarning } from '../../types/validation';

/**
 * FormFieldProps Interface
 *
 * @interface FormFieldProps
 */
export interface FormFieldProps {
  id: string;
  name: string;
  label?: string;
  placeholder?: string;
  type?:
    | 'text'
    | 'email'
    | 'password'
    | 'tel'
    | 'number'
    | 'date'
    | 'datetime-local'
    | 'time'
    | 'url'
    | 'search';
  variant?: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'switch' | 'file';
  value?: any;
  defaultValue?: any;
  options?: { value: string; label: string; disabled?: boolean }[];
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;
  autoComplete?: string;
  rows?: number;
  className?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  description?: string;
  helperText?: string;
  helperTextVariant?: 'default' | 'error' | 'success' | 'warning';
  tooltip?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
  touched?: boolean;
  dirty?: boolean;
  isValidating?: boolean;
  showValidationIcon?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
  inputSize?: 'sm' | 'md' | 'lg';
  onChange?: (value: any) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  children?: ReactNode;
  // New async validation props
  asyncValidator?: (value: any) => Promise<ValidationError[] | null>;
  validationDelay?: number;
  onValidationStart?: () => void;
  onValidationComplete?: (errors: ValidationError[] | null) => void;
}

export const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, FormFieldProps>(
  (
    {
      id,
      name,
      label,
      placeholder,
      type = 'text',
      variant = 'input',
      value,
      options,
      required,
      disabled,
      readOnly,
      autoFocus,
      autoComplete,
      rows = 3,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      description,
      helperText,
      helperTextVariant,
      prefix,
      suffix,
      errors = [],
      warnings = [],
      touched = false,
      isValidating = false,
      showValidationIcon = true,
      inputSize = 'md',
      onChange,
      onBlur,
      onFocus,
      children,
      // New async validation props
      asyncValidator,
      validationDelay = 500,
      onValidationStart,
      onValidationComplete,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [asyncErrors, setAsyncErrors] = useState<ValidationError[]>([]);
    const [isAsyncValidating, setIsAsyncValidating] = useState(false);

    // Debounce the value for async validation
    const debouncedValue = useDebounce(value, validationDelay);

    // Async validation effect
    // Runs on non-empty values, or on empty values when required is true
    useEffect(() => {
      if (!asyncValidator || disabled || readOnly) {
        return;
      }

      // Skip validation if value is empty and field is not required
      if (!debouncedValue && !required) {
        return;
      }

      const runAsyncValidation = async () => {
        setIsAsyncValidating(true);
        onValidationStart?.();

        try {
          const validationErrors = await asyncValidator(debouncedValue);
          setAsyncErrors(validationErrors || []);
          onValidationComplete?.(validationErrors);
        } catch {
          // console.error('Async validation error:', error);
          setAsyncErrors([
            {
              field: name,
              message: 'Validation failed. Please try again.',
              code: 'ASYNC_VALIDATION_ERROR',
              severity: 'error',
            },
          ]);
          onValidationComplete?.([
            {
              field: name,
              message: 'Validation failed. Please try again.',
              code: 'ASYNC_VALIDATION_ERROR',
              severity: 'error',
            },
          ]);
        } finally {
          setIsAsyncValidating(false);
        }
      };

      runAsyncValidation();
    }, [
      debouncedValue,
      asyncValidator,
      name,
      disabled,
      readOnly,
      required,
      onValidationStart,
      onValidationComplete,
    ]);

    // Clear async errors when value changes (before debounce)
    useEffect(() => {
      if (asyncErrors.length > 0) {
        setAsyncErrors([]);
      }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    // Combine sync and async errors
    const allErrors = [...errors, ...asyncErrors];
    const hasError = allErrors.length > 0;
    const hasWarning = warnings.length > 0 && !hasError;
    const isCurrentlyValidating = isValidating || isAsyncValidating;
    const isValid = touched && !hasError && !isCurrentlyValidating && value;

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    const handleChange = (newValue: any) => {
      onChange?.(newValue);
    };

    const renderValidationIcon = () => {
      if (!showValidationIcon) return null;

      if (isCurrentlyValidating) {
        return <Loader2 className="w-4 h-4 text-info-500 animate-spin" />;
      }

      if (hasError) {
        return <AlertCircle className="w-4 h-4 text-error-500" />;
      }

      if (isValid) {
        return <CheckCircle className="w-4 h-4 text-success-500" />;
      }

      return null;
    };

    const renderInput = () => {
      const baseInputProps = {
        id,
        name,
        placeholder,
        disabled,
        readOnly,
        autoFocus,
        autoComplete,
        value: value ?? '',
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          handleChange(e.target.value);
        },
        onFocus: handleFocus,
        onBlur: handleBlur,
        className: cn(
          'transition-all duration-200',
          hasError && 'border-error-300 focus:border-error-400 focus:ring-error-200',
          hasWarning && 'border-warning-300 focus:border-warning-400 focus:ring-warning-200',
          isValid && 'border-success-300 focus:border-success-400 focus:ring-success-200',
          disabled && 'opacity-50 cursor-not-allowed',
          inputClassName
        ),
        'aria-invalid': hasError,
        'aria-describedby': hasError ? `${id}-error` : undefined,
        ...props,
      };

      switch (variant) {
        case 'textarea':
          return (
            <Textarea
              {...baseInputProps}
              rows={rows}
              ref={ref as React.RefObject<HTMLTextAreaElement>}
            />
          );

        case 'select':
          return (
            <Select value={value ?? ''} onValueChange={handleChange} disabled={disabled}>
              <SelectTrigger
                className={cn(
                  'transition-all duration-200',
                  hasError && 'border-error-300 focus:border-error-400 focus:ring-error-200',
                  hasWarning &&
                    'border-warning-300 focus:border-warning-400 focus:ring-warning-200',
                  isValid && 'border-success-300 focus:border-success-400 focus:ring-success-200',
                  inputClassName
                )}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options?.map((option) => (
                  <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'checkbox':
          return (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={id}
                name={name}
                checked={Boolean(value)}
                onCheckedChange={handleChange}
                disabled={disabled}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={cn(
                  hasError && 'border-error-300 data-[state=checked]:bg-error-500',
                  inputClassName
                )}
              />
              {label && (
                <Label
                  htmlFor={id}
                  className={cn(
                    'text-sm font-medium cursor-pointer',
                    disabled && 'opacity-50 cursor-not-allowed',
                    labelClassName
                  )}
                >
                  {label}
                  {required && <span className="text-error-500 ml-1">*</span>}
                </Label>
              )}
            </div>
          );

        case 'radio':
          return (
            <RadioGroup
              value={value ?? ''}
              onValueChange={handleChange}
              disabled={disabled}
              className="flex flex-col space-y-2"
            >
              {options?.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`${id}-${option.value}`}
                    disabled={option.disabled}
                    className={cn(hasError && 'border-error-300 text-error-500', inputClassName)}
                  />
                  <Label
                    htmlFor={`${id}-${option.value}`}
                    className="text-sm font-medium cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );

        case 'switch':
          return (
            <div className="flex items-center space-x-2">
              <Switch
                id={id}
                name={name}
                checked={Boolean(value)}
                onCheckedChange={handleChange}
                disabled={disabled}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={inputClassName}
              />
              {label && (
                <Label
                  htmlFor={id}
                  className={cn(
                    'text-sm font-medium cursor-pointer',
                    disabled && 'opacity-50 cursor-not-allowed',
                    labelClassName
                  )}
                >
                  {label}
                  {required && <span className="text-error-500 ml-1">*</span>}
                </Label>
              )}
            </div>
          );

        case 'file':
          return (
            <Input
              {...baseInputProps}
              type="file"
              inputSize={inputSize}
              onChange={(e) => {
                handleChange(e.target.files);
              }}
              ref={ref as React.RefObject<HTMLInputElement>}
            />
          );

        case 'input':
          return (
            <div className="relative">
              <Input
                {...baseInputProps}
                type={type === 'password' && showPassword ? 'text' : type}
                ref={ref as React.RefObject<HTMLInputElement>}
                inputSize={inputSize}
                className={cn(
                  ((prefix ?? suffix) || type === 'password' || showValidationIcon) && 'pr-10',
                  prefix && 'pl-10'
                )}
              />

              {/* Prefix */}
              {prefix && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                  {prefix}
                </div>
              )}

              {/* Password toggle, suffix, or validation icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {type === 'password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 hover:bg-transparent"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-neutral-500" />
                    )}
                  </Button>
                )}

                {suffix && <div className="text-neutral-500">{suffix}</div>}
                {renderValidationIcon()}
              </div>
            </div>
          );

        default:
          // Regular input with password toggle support
          return (
            <div className="relative">
              <Input
                {...baseInputProps}
                type={type === 'password' && showPassword ? 'text' : type}
                ref={ref as React.RefObject<HTMLInputElement>}
                inputSize={inputSize}
                className={cn(
                  ((prefix ?? suffix) || type === 'password' || showValidationIcon) && 'pr-10',
                  prefix && 'pl-10'
                )}
              />

              {/* Prefix */}
              {prefix && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500">
                  {prefix}
                </div>
              )}

              {/* Password toggle, suffix, or validation icon */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {type === 'password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-6 h-6 p-0 hover:bg-transparent"
                    onClick={() => {
                      setShowPassword(!showPassword);
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 text-neutral-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-neutral-500" />
                    )}
                  </Button>
                )}

                {suffix && <div className="text-neutral-500">{suffix}</div>}
                {renderValidationIcon()}
              </div>
            </div>
          );
      }
    };

    return (
      <div className={cn('space-y-2', containerClassName)} data-field-name={name}>
        {/* Label */}
        {label && variant !== 'checkbox' && variant !== 'switch' && (
          <Label
            htmlFor={id}
            className={cn(
              'text-sm font-medium text-neutral-700 block',
              required && "after:content-['*'] after:text-error-500 after:ml-1",
              disabled && 'opacity-50',
              labelClassName
            )}
          >
            {label}
          </Label>
        )}

        {/* Input */}
        <div className="relative">
          {renderInput()}

          {/* Focus ring animation */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'absolute inset-0 rounded-md pointer-events-none',
                  hasError
                    ? 'ring-2 ring-error-200'
                    : hasWarning
                      ? 'ring-2 ring-warning-200'
                      : 'ring-2 ring-info-200'
                )}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Helper Text */}
        {helperText && (
          <p
            className={helperTextVariants({
              variant:
                helperTextVariant || (hasError ? 'error' : hasWarning ? 'warning' : 'default'),
            })}
          >
            {helperText}
          </p>
        )}

        {/* Description */}
        {description && <p className="text-sm text-neutral-600">{description}</p>}

        {/* Validation Messages */}
        <AnimatePresence mode="wait">
          {hasError && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className={cn('space-y-1', errorClassName)}
            >
              {allErrors.map((error, index) => (
                <div
                  key={index}
                  id={`${id}-error`}
                  className="flex items-center gap-2 text-sm text-error-600"
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error.message}</span>
                </div>
              ))}
            </motion.div>
          )}

          {hasWarning && (
            <motion.div
              key="warning"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-warning-600">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{warning.message}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Children (for additional content) */}
        {children}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
