/**
 * @fileoverview LoadingButton Module - Stateful button with loading, success, and error states
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import * as React from 'react';
import { motion } from 'motion/react';
import { Loader2, Check, X } from 'lucide-react';
import { Button, type ButtonProps } from './button';

export interface LoadingButtonProps extends Omit<ButtonProps, 'loading'> {
  /** Current button state */
  state?: 'idle' | 'loading' | 'success' | 'error';
  /** Callback when success state completes */
  onSuccess?: () => void;
  /** Callback when error state completes */
  onError?: () => void;
  /** How long to show success state (default: 2000ms) */
  successDuration?: number;
  /** How long to show error state (default: 2000ms) */
  errorDuration?: number;
  /** Text to show in success state */
  successText?: string;
  /** Text to show in error state */
  errorText?: string;
  /** Auto-reset to idle after success/error (default: true) */
  resetOnComplete?: boolean;
}

/**
 * LoadingButton - A stateful button component with integrated loading, success, and error states
 *
 * Extends the base Button component with state management and visual feedback for async operations.
 * Automatically handles state transitions, animations, and accessibility announcements.
 *
 * @example
 * ```tsx
 * const [buttonState, setButtonState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
 *
 * const handleSubmit = async () => {
 *   setButtonState('loading');
 *   try {
 *     await submitData();
 *     setButtonState('success');
 *   } catch (error) {
 *     setButtonState('error');
 *   }
 * };
 *
 * <LoadingButton
 *   state={buttonState}
 *   onClick={handleSubmit}
 *   successText="Saved!"
 *   errorText="Failed"
 *   onSuccess={() => setButtonState('idle')}
 *   onError={() => setButtonState('idle')}
 * >
 *   Save Changes
 * </LoadingButton>
 * ```
 */
const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      state = 'idle',
      onSuccess,
      onError,
      successDuration = 2000,
      errorDuration = 2000,
      successText,
      errorText,
      resetOnComplete = true,
      variant,
      children,
      disabled,
      className,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [announcement, setAnnouncement] = React.useState('');

    // Handle state transitions and timers
    React.useEffect(() => {
      if (state === 'loading') {
        setAnnouncement('Loading');
      } else if (state === 'success') {
        setAnnouncement('Success');
        if (resetOnComplete) {
          const timer = setTimeout(() => {
            if (onSuccess) {
              onSuccess();
            }
          }, successDuration);
          return () => {
            clearTimeout(timer);
          };
        }
      } else if (state === 'error') {
        setAnnouncement('Error');
        if (resetOnComplete) {
          const timer = setTimeout(() => {
            if (onError) {
              onError();
            }
          }, errorDuration);
          return () => {
            clearTimeout(timer);
          };
        }
      } else {
        setAnnouncement('');
      }
      return undefined;
    }, [state, onSuccess, onError, successDuration, errorDuration, resetOnComplete]);

    // Determine variant based on state
    const currentVariant = React.useMemo(() => {
      if (state === 'success') return 'success';
      if (state === 'error') return 'destructive';
      return variant;
    }, [state, variant]);

    // Determine icon based on state
    const renderIcon = () => {
      switch (state) {
        case 'idle':
          return null;
        case 'loading':
          return <Loader2 className="h-4 w-4 animate-spin" />;
        case 'success':
          return <Check className="text-success-600 animate-scale-in h-4 w-4" />;
        case 'error':
          return <X className="text-error-600 h-4 w-4" />;
        default:
          return null;
      }
    };

    // Determine button text
    const buttonText = React.useMemo(() => {
      if (state === 'success' && successText) return successText;
      if (state === 'error' && errorText) return errorText;
      return children;
    }, [state, successText, errorText, children]);

    // Disable button during non-idle states
    const isDisabled = disabled || state !== 'idle';

    return (
      <>
        {/* Screen reader announcements */}
        <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        <motion.div
          initial={false}
          animate={{
            scale: state === 'success' ? [1, 1.05, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          <Button
            ref={ref}
            variant={currentVariant}
            disabled={isDisabled}
            className={className}
            onClick={onClick}
            aria-busy={state === 'loading'}
            {...props}
          >
            <span
              className={state === 'error' ? 'animate-shake' : ''}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {renderIcon()}
              {buttonText}
            </span>
          </Button>
        </motion.div>
      </>
    );
  },
);

LoadingButton.displayName = 'LoadingButton';

export { LoadingButton };
