/**
 * @fileoverview Kibo UI Input Component
 * Modern, accessible input component with enhanced features
 * 
 * @author Kibo UI Team
 * @version 2.0.0
 */

import * as React from 'react';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.ComponentProps<'input'> {
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  clearable?: boolean;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  helperText?: string;
  errorText?: string;
  successText?: string;
  warningText?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  onClear?: () => void;
  inputSize?: 'sm' | 'md' | 'lg';
  id?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    prefixIcon,
    suffixIcon,
    clearable = false,
    loading = false,
    error = false,
    success = false,
    warning = false,
    helperText,
    errorText,
    successText,
    warningText,
    maxLength,
    showCharacterCount = false,
    onClear,
    value,
    onChange,
    inputSize = 'md',
    id,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || '');
    const isPassword = type === 'password';
    const hasValue = Boolean(inputValue);
    const canClear = clearable && hasValue && !props.disabled;
    const currentLength = String(inputValue).length;
    const isOverLimit = maxLength ? currentLength > maxLength : false;

    // Generate unique IDs for aria-describedby
    const internalId = React.useId();
    const inputId = id || internalId;
    const errorId = `${inputId}-error-text`;
    const warningId = `${inputId}-warning-text`;
    const successId = `${inputId}-success-text`;
    const helperId = `${inputId}-helper-text`;
    const charCountId = `${inputId}-character-count`;

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    }, [onChange]);

    const handleClear = React.useCallback(() => {
      setInputValue('');
      onClear?.();
      // Trigger onChange with empty value
      const syntheticEvent = {
        target: { value: '' },
        currentTarget: { value: '' }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange?.(syntheticEvent);
    }, [onClear, onChange]);

    const togglePasswordVisibility = React.useCallback(() => {
      setShowPassword(!showPassword);
    }, [showPassword]);

    const inputType = isPassword && showPassword ? 'text' : type;

    // Size variants
    const sizeClasses = {
      sm: 'h-8 px-2.5 py-1 text-xs',
      md: 'h-10 px-3 py-2 text-base md:text-sm',
      lg: 'h-12 px-4 py-3 text-base',
    };

    const iconSizeClasses = {
      sm: 'h-3.5 w-3.5',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const prefixPaddingClasses = {
      sm: 'pl-8',
      md: 'pl-10',
      lg: 'pl-12',
    };

    const suffixPaddingClasses = {
      sm: 'pr-8',
      md: 'pr-10',
      lg: 'pr-12',
    };

    return (
      <div className="relative w-full">
        <div className="relative">
          {prefixIcon && (
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
              inputSize === 'sm' ? 'left-2.5' : inputSize === 'lg' ? 'left-4' : 'left-3'
            )}>
              <div className={iconSizeClasses[inputSize]}>
                {prefixIcon}
              </div>
            </div>
          )}

          <input
            type={inputType}
            id={inputId}
            data-slot="input"
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary-500 selection:text-white dark:bg-input/30 border-input flex w-full min-w-0 rounded-lg border bg-white transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
              'focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-2 focus-visible:ring-offset-2',
              'hover:border-ring/60',
              sizeClasses[inputSize],
              prefixIcon && prefixPaddingClasses[inputSize],
              (suffixIcon || canClear || loading || isPassword) && suffixPaddingClasses[inputSize],
              error && 'border-error-600 focus-visible:ring-error-500/20 focus-visible:border-error-600',
              success && 'border-success-600 focus-visible:ring-success-500/20 focus-visible:border-success-600',
              warning && !error && 'border-warning-600 focus-visible:ring-warning-500/20 focus-visible:border-warning-600',
              isOverLimit && 'border-error-600',
              className,
            )}
            ref={ref}
            value={inputValue}
            onChange={handleChange}
            maxLength={maxLength}
            aria-invalid={error || isOverLimit}
            aria-describedby={
              error && errorText ? errorId :
              warning && warningText ? warningId :
              success && successText ? successId :
              helperText ? helperId :
              showCharacterCount && maxLength ? charCountId :
              undefined
            }
            aria-label={props['aria-label'] || (isPassword ? 'Password input' : undefined)}
            {...props}
          />

          <div className={cn(
            "absolute top-1/2 -translate-y-1/2 flex items-center gap-1",
            inputSize === 'sm' ? 'right-2.5' : inputSize === 'lg' ? 'right-4' : 'right-3'
          )}>
            {loading && (
              <Loader2 className={cn("animate-spin text-muted-foreground", iconSizeClasses[inputSize])} />
            )}

            {!loading && isPassword && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className={iconSizeClasses[inputSize]} /> : <Eye className={iconSizeClasses[inputSize]} />}
              </button>
            )}

            {!loading && !isPassword && canClear && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label="Clear input"
              >
                <X className={iconSizeClasses[inputSize]} />
              </button>
            )}

            {!loading && !isPassword && !canClear && suffixIcon && (
              <div className={cn("text-muted-foreground", iconSizeClasses[inputSize])}>
                {suffixIcon}
              </div>
            )}
          </div>
        </div>

        {/* Helper Text / Error Text / Warning Text / Success Text */}
        {(helperText || errorText || warningText || successText || (showCharacterCount && maxLength)) && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {error && errorText && (
                <span id={errorId} className="text-error-600" role="alert">
                  {errorText}
                </span>
              )}
              {!error && warning && warningText && (
                <span id={warningId} className="text-warning-600" role="alert">
                  {warningText}
                </span>
              )}
              {!error && !warning && success && successText && (
                <span id={successId} className="text-success-600">
                  {successText}
                </span>
              )}
              {!error && !warning && !success && helperText && (
                <span id={helperId} className="text-muted-foreground">
                  {helperText}
                </span>
              )}
            </div>

            {showCharacterCount && maxLength && (
              <span
                id={charCountId}
                className={cn(
                  "text-muted-foreground",
                  isOverLimit && "text-error-600"
                )}
                aria-live="polite"
              >
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

// Memoized Input for performance optimization
export const MemoizedInput = React.memo(Input, (prevProps, nextProps) => {
  return (
    prevProps.type === nextProps.type &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.success === nextProps.success &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.value === nextProps.value &&
    prevProps.className === nextProps.className
  );
});

export { Input };
