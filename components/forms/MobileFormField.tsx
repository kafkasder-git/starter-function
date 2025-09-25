/**
 * @fileoverview MobileFormField Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import { forwardRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, X } from 'lucide-react';
import type { FormFieldProps } from './FormField';
import { FormField } from './FormField';
import { Button } from '../ui/button';
import { cn } from '../ui/utils';
import { useIsMobile } from '../../hooks/useTouchDevice';

interface MobileFormFieldProps extends FormFieldProps {
  // Mobile-specific props
  inputMode?: 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
  pattern?: string;
  enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
  autoCorrect?: 'on' | 'off';
  spellCheck?: boolean;
  showClearButton?: boolean;
  mobileOptimizations?: boolean;
}

export const MobileFormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  MobileFormFieldProps
>(
  (
    {
      inputMode,
      pattern,
      enterKeyHint = 'next',
      autoCapitalize = 'sentences',
      autoCorrect = 'on',
      spellCheck = true,
      showClearButton = true,
      mobileOptimizations = true,
      value,
      onChange,
      className,
      inputClassName,
      ...props
    },
    ref,
  ) => {
    const isMobile = useIsMobile();
    const [isFocused, setIsFocused] = useState(false);

    // Mobile keyboard optimization
    const getMobileProps = () => {
      if (!isMobile || !mobileOptimizations) {
        return {};
      }

      const mobileProps: any = {
        enterKeyHint,
        autoCapitalize,
        autoCorrect,
        spellCheck,
      };

      // Set appropriate inputMode based on field type
      if (inputMode) {
        mobileProps.inputMode = inputMode;
      } else {
        switch (props.type) {
          case 'email':
            mobileProps.inputMode = 'email';
            break;
          case 'tel':
            mobileProps.inputMode = 'tel';
            break;
          case 'number':
            mobileProps.inputMode = 'numeric';
            break;
          case 'url':
            mobileProps.inputMode = 'url';
            break;
          case 'search':
            mobileProps.inputMode = 'search';
            break;
          default:
            mobileProps.inputMode = 'text';
        }
      }

      // Pattern for better mobile keyboard
      if (pattern) {
        mobileProps.pattern = pattern;
      } else {
        switch (props.type) {
          case 'tel':
            mobileProps.pattern = '[0-9]*';
            break;
          case 'number':
            mobileProps.pattern = '[0-9]*';
            break;
        }
      }

      return mobileProps;
    };

    // Handle clear button
    const handleClear = () => {
      if (onChange) {
        onChange('');
      }
    };

    // Handle focus for mobile optimizations
    const handleFocus = () => {
      setIsFocused(true);

      // Mobile viewport adjustment for better UX
      if (isMobile && mobileOptimizations) {
        // Scroll field into view after a small delay to allow keyboard to appear
        setTimeout(() => {
          const element = (ref && typeof ref === 'object' && 'current' in ref) ? ref.current : document.activeElement;
          if (element && 'scrollIntoView' in element) {
            (element as HTMLElement).scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }, 300);
      }

      props.onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      props.onBlur?.();
    };

    // Mobile-specific styling
    const mobileInputClassName = cn(
      // Base mobile styles
      isMobile &&
        mobileOptimizations && [
          'text-base', // Prevent zoom on iOS
          'min-h-[44px]', // Touch-friendly height
          'px-4 py-3', // Comfortable padding
          'rounded-lg', // Friendlier corners
          'border-2', // Thicker border for easier targeting
          'transition-all duration-200',
          'focus:border-primary focus:ring-2 focus:ring-primary/20',
          'active:transform active:scale-[0.99]', // Subtle press feedback
        ],
      inputClassName,
    );

    // Enhanced suffix with clear button for mobile
    const renderMobileSuffix = () => {
      const elements = [];

      // Clear button for mobile
      if (showClearButton && isMobile && value && isFocused) {
        elements.push(
          <Button
            key="clear"
            type="button"
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0 hover:bg-gray-100 rounded-full"
            onClick={handleClear}
            tabIndex={-1}
          >
            <X className="w-4 h-4 text-gray-400" />
          </Button>,
        );
      }

      // Original suffix
      if (props.suffix) {
        elements.push(
          <div key="suffix" className="text-slate-500">
            {props.suffix}
          </div>,
        );
      }

      return elements.length > 0 ? (
        <div className="flex items-center space-x-1">{elements}</div>
      ) : null;
    };

    return (
      <FormField
        {...props}
        ref={ref}
        value={value}
        onChange={onChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        inputClassName={mobileInputClassName}
        className={cn(
          // Mobile container optimizations
          isMobile &&
            mobileOptimizations && [
              'touch-manipulation', // Better touch response
            ],
          className,
        )}
        suffix={renderMobileSuffix()}
        {...getMobileProps()}
      />
    );
  },
);

MobileFormField.displayName = 'MobileFormField';

// Mobile-optimized form section
interface MobileFormSectionProps {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * MobileFormSection function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function MobileFormSection({
  title,
  description,
  children,
  className,
  collapsible = false,
  defaultExpanded = true,
}: MobileFormSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200',
        isMobile ? 'p-4 mb-4' : 'p-6 mb-6',
        className,
      )}
    >
      {title && (
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {collapsible && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsExpanded(!isExpanded);
                }}
                className="text-gray-500"
              >
                {isExpanded ? 'Gizle' : 'Göster'}
              </Button>
            )}
          </div>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
      )}

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Mobile form navigation
interface MobileFormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext?: () => void;
  onPrevious?: () => void;
  onCancel?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  cancelLabel?: string;
  isNextDisabled?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * MobileFormNavigation function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function MobileFormNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onCancel,
  nextLabel = 'İleri',
  previousLabel = 'Geri',
  cancelLabel = 'İptal',
  isNextDisabled = false,
  isLoading = false,
  className,
}: MobileFormNavigationProps) {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null; // Use regular form buttons on desktop
  }

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-bottom',
        'flex items-center justify-between gap-3',
        className,
      )}
    >
      {/* Progress indicator */}
      <div className="flex-1">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>
            Adım {currentStep} / {totalSteps}
          </span>
          <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-primary h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-2 ml-4">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-gray-600"
          >
            {cancelLabel}
          </Button>
        )}

        {onPrevious && currentStep > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onPrevious}
            disabled={isLoading}
          >
            {previousLabel}
          </Button>
        )}

        {onNext && (
          <Button
            type="button"
            onClick={onNext}
            disabled={isNextDisabled ?? isLoading}
            size="sm"
            className="min-w-[80px]"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {currentStep === totalSteps ? 'Tamamla' : nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
