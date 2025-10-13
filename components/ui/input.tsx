/**
 * @fileoverview input Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import * as React from 'react';
import { Eye, EyeOff, X, Loader2 } from 'lucide-react';

import { cn } from './utils';

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

    React.useEffect(() => {
      if (value === undefined) {
        return;
      }
      setInputValue(value);
    }, [value]);
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

    // Size variants - standardized for consistency
    const sizeClasses = {
      sm: 'h-9 px-3 py-2 text-sm',
      md: 'h-10 px-3 py-2 text-sm',
      lg: 'h-11 px-4 py-2.5 text-base',
    };

    const iconSizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-4 w-4',
      lg: 'h-5 w-5',
    };

    const prefixPaddingClasses = {
      sm: 'pl-9',
      md: 'pl-10',
      lg: 'pl-11',
    };

    const suffixPaddingClasses = {
      sm: 'pr-9',
      md: 'pr-10',
      lg: 'pr-11',
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

// FloatingLabelInput Component
export interface FloatingLabelInputProps extends Omit<InputProps, 'placeholder'> {
  label: string;
  required?: boolean;
}

export const FloatingLabelInput = React.forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  ({
    label,
    required = false,
    className,
    id,
    error,
    success,
    warning,
    inputSize = 'md',
    value,
    onChange,
    onFocus,
    onBlur,
    ...props
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || '');
    const inputId = React.useMemo(() => id || `floating-input-${Math.random().toString(36).substr(2, 9)}`, [id]);

    const hasValue = Boolean(inputValue) || Boolean(value);
    const isFloating = isFocused || hasValue;

    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
      onChange?.(e);
    }, [onChange]);

    const handleFocus = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    }, [onFocus]);

    const handleBlur = React.useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    }, [onBlur]);

    // Size-specific classes
    const labelSizeClasses = {
      sm: {
        default: 'text-xs top-2 left-2.5',
        floating: 'text-[10px] -top-2 left-2 px-1',
      },
      md: {
        default: 'text-sm top-2.5 left-3',
        floating: 'text-xs -top-2.5 left-2.5 px-1',
      },
      lg: {
        default: 'text-base top-3.5 left-4',
        floating: 'text-sm -top-2.5 left-3 px-1',
      },
    };

    const inputPaddingClasses = {
      sm: 'pt-5 pb-1',
      md: 'pt-6 pb-2',
      lg: 'pt-7 pb-3',
    };

    return (
      <div className="relative w-full">
        <Input
          ref={ref}
          id={inputId}
          className={cn(
            inputPaddingClasses[inputSize],
            className
          )}
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          error={error}
          success={success}
          warning={warning}
          inputSize={inputSize}
          aria-labelledby={`${inputId}-label`}
          aria-required={required}
          {...props}
        />
        <label
          id={`${inputId}-label`}
          htmlFor={inputId}
          className={cn(
            'absolute pointer-events-none transition-all duration-200 ease-out bg-background',
            'text-muted-foreground',
            isFloating
              ? labelSizeClasses[inputSize].floating
              : labelSizeClasses[inputSize].default,
            isFocused && 'text-ring',
            error && 'text-error-600',
            success && !error && 'text-success-600',
            warning && !error && !success && 'text-warning-600',
            props.disabled && 'opacity-50',
          )}
        >
          {label}
          {required && <span className="text-error-500 ml-0.5" aria-hidden="true">*</span>}
        </label>
      </div>
    );
  }
);

FloatingLabelInput.displayName = 'FloatingLabelInput';

// InputAddon Component
export interface InputAddonProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  position?: 'left' | 'right';
  inputSize?: 'sm' | 'md' | 'lg';
}

export const InputAddon = React.forwardRef<HTMLDivElement, InputAddonProps>(
  ({ children, inputSize = 'md', className, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-2.5 py-1 text-xs',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-center bg-muted border border-input text-muted-foreground whitespace-nowrap',
          'first:rounded-l-lg last:rounded-r-lg',
          '[&:not(:first-child)]:border-l-0 [&:not(:last-child)]:border-r-0',
          sizeClasses[inputSize],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

InputAddon.displayName = 'InputAddon';

// InputGroup Component
export interface InputGroupProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
  inputSize?: 'sm' | 'md' | 'lg';
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ children, inputSize = 'md', className, ...props }, ref) => {
    // Clone children and pass inputSize prop to Input and InputAddon components
    const childrenWithProps = React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        const isFirst = index === 0;
        const isLast = index === React.Children.count(children) - 1;

        // Determine if child is Input component
        const isInput = child.type === Input || child.type === FloatingLabelInput;

        // Determine if child is InputAddon
        const isAddon = child.type === InputAddon;

        if (isInput) {
          return React.cloneElement(child as React.ReactElement<any>, {
            inputSize,
            className: cn(
              child.props.className,
              '[&>div>input]:rounded-none',
              isFirst && '[&>div>input]:rounded-l-lg',
              isLast && '[&>div>input]:rounded-r-lg',
              !isFirst && '[&>div>input]:border-l-0',
              !isLast && '[&>div>input]:border-r-0',
            ),
          });
        }

        if (isAddon) {
          return React.cloneElement(child as React.ReactElement<any>, {
            inputSize,
          });
        }

        return child;
      }
      return child;
    });

    return (
      <div
        ref={ref}
        className={cn('flex w-full items-stretch', className)}
        role="group"
        {...props}
      >
        {childrenWithProps}
      </div>
    );
  }
);

InputGroup.displayName = 'InputGroup';
