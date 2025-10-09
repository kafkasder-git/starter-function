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
  helperText?: string;
  errorText?: string;
  successText?: string;
  maxLength?: number;
  showCharacterCount?: boolean;
  onClear?: () => void;
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
    helperText,
    errorText,
    successText,
    maxLength,
    showCharacterCount = false,
    onClear,
    value,
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputValue, setInputValue] = React.useState(value || '');
    const isPassword = type === 'password';
    const hasValue = Boolean(inputValue);
    const canClear = clearable && hasValue && !props.disabled;
    const currentLength = String(inputValue).length;
    const isOverLimit = maxLength ? currentLength > maxLength : false;

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

    return (
      <div className="relative w-full">
        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {prefixIcon}
            </div>
          )}
          
          <input
            type={inputType}
            data-slot="input"
            className={cn(
              'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-10 w-full min-w-0 rounded-lg border px-3 py-2 text-base bg-input-background transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
              'focus-visible:border-ring focus-visible:ring-ring/20 focus-visible:ring-2 focus-visible:ring-offset-2',
              'hover:border-ring/60',
              prefixIcon && 'pl-10',
              (suffixIcon || canClear || loading || isPassword) && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive',
              success && 'border-success focus-visible:ring-success/20 focus-visible:border-success',
              isOverLimit && 'border-destructive',
              className,
            )}
            ref={ref}
            value={inputValue}
            onChange={handleChange}
            maxLength={maxLength}
            aria-invalid={error || isOverLimit}
            aria-describedby={
              error && errorText ? 'error-text' :
              success && successText ? 'success-text' :
              helperText ? 'helper-text' :
              showCharacterCount && maxLength ? 'character-count' :
              undefined
            }
            aria-label={props['aria-label'] || (isPassword ? 'Password input' : undefined)}
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            
            {!loading && isPassword && (
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            
            {!loading && !isPassword && canClear && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {!loading && !isPassword && !canClear && suffixIcon && (
              <div className="text-muted-foreground">
                {suffixIcon}
              </div>
            )}
          </div>
        </div>

        {/* Helper Text / Error Text / Success Text */}
        {(helperText || errorText || successText || (showCharacterCount && maxLength)) && (
          <div className="mt-1 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              {error && errorText && (
                <span id="error-text" className="text-destructive" role="alert">
                  {errorText}
                </span>
              )}
              {success && successText && (
                <span id="success-text" className="text-success">
                  {successText}
                </span>
              )}
              {!error && !success && helperText && (
                <span id="helper-text" className="text-muted-foreground">
                  {helperText}
                </span>
              )}
            </div>
            
            {showCharacterCount && maxLength && (
              <span 
                id="character-count"
                className={cn(
                  "text-muted-foreground",
                  isOverLimit && "text-destructive"
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
