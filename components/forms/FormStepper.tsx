/**
 * @fileoverview FormStepper Component - Multi-step form with progress indication
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../ui/utils';
import { Button } from '../ui/button';

export interface FormStep {
  /** Step label */
  label: string;
  /** Optional step description */
  description?: string;
  /** Optional step icon */
  icon?: React.ReactNode;
  /** Whether this step is optional */
  optional?: boolean;
}

export interface FormStepperProps {
  /** Array of step definitions */
  steps: FormStep[];
  /** Current active step index (0-based) */
  currentStep: number;
  /** Callback when step is clicked/changed */
  onStepChange?: (stepIndex: number) => void;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Whether to show step numbers */
  showStepNumbers?: boolean;
  /** Whether steps are clickable for navigation */
  clickable?: boolean;
  /** Step validation states */
  stepStates?: ('pending' | 'current' | 'completed' | 'error')[];
  /** Additional CSS classes */
  className?: string;
  /** Whether the stepper is disabled */
  disabled?: boolean;
}

export const FormStepper = React.forwardRef<HTMLDivElement, FormStepperProps>(
  ({
    steps,
    currentStep,
    onStepChange,
    orientation = 'horizontal',
    showStepNumbers = true,
    clickable = true,
    stepStates,
    className,
    disabled = false,
    ...props
  }, ref) => {
    // Generate step states if not provided
    const getStepState = (index: number): 'pending' | 'current' | 'completed' | 'error' => {
      if (stepStates?.[index]) {
        return stepStates[index];
      }
      
      if (index < currentStep) return 'completed';
      if (index === currentStep) return 'current';
      return 'pending';
    };

    const handleStepClick = (stepIndex: number) => {
      if (disabled || !clickable) return;
      
      // Only allow navigation to completed steps or current step
      const stepState = getStepState(stepIndex);
      if (stepState === 'completed' || stepState === 'current') {
        onStepChange?.(stepIndex);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent, stepIndex: number) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleStepClick(stepIndex);
      }
      
      // Arrow key navigation
      if (orientation === 'horizontal') {
        if (event.key === 'ArrowLeft' && stepIndex > 0) {
          event.preventDefault();
          handleStepClick(stepIndex - 1);
        } else if (event.key === 'ArrowRight' && stepIndex < steps.length - 1) {
          event.preventDefault();
          handleStepClick(stepIndex + 1);
        }
      } else {
        if (event.key === 'ArrowUp' && stepIndex > 0) {
          event.preventDefault();
          handleStepClick(stepIndex - 1);
        } else if (event.key === 'ArrowDown' && stepIndex < steps.length - 1) {
          event.preventDefault();
          handleStepClick(stepIndex + 1);
        }
      }
    };

    const renderStepIndicator = (step: FormStep, index: number) => {
      const stepState = getStepState(index);
      const isClickable = clickable && !disabled && (stepState === 'completed' || stepState === 'current');

      return (
        <div
          key={index}
          className={cn(
            'flex items-center',
            orientation === 'vertical' ? 'flex-col' : 'flex-row',
            orientation === 'horizontal' && index < steps.length - 1 && 'flex-1'
          )}
        >
          {/* Step Circle */}
          <div
            className={cn(
              'relative flex items-center',
              orientation === 'vertical' ? 'flex-col' : 'flex-row'
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => { handleStepClick(index); }}
              onKeyDown={(e) => { handleKeyDown(e, index); }}
              disabled={!isClickable}
              aria-current={stepState === 'current' ? 'step' : undefined}
              aria-label={`Step ${index + 1}: ${step.label}${step.optional ? ' (optional)' : ''}`}
              className={cn(
                'relative w-10 h-10 rounded-full border-2 transition-all duration-200',
                'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring',
                stepState === 'pending' && 'border-muted bg-background text-muted-foreground',
                stepState === 'current' && 'border-primary bg-primary text-primary-foreground',
                stepState === 'completed' && 'border-success bg-success text-success-foreground',
                stepState === 'error' && 'border-destructive bg-destructive text-destructive-foreground',
                isClickable && 'hover:scale-105 cursor-pointer',
                !isClickable && 'cursor-not-allowed'
              )}
            >
              {stepState === 'completed' ? (
                <Check className="w-5 h-5" />
              ) : stepState === 'error' ? (
                <AlertCircle className="w-5 h-5" />
              ) : step.icon ? (
                <span className="w-5 h-5 flex items-center justify-center">
                  {step.icon}
                </span>
              ) : showStepNumbers ? (
                <span className="text-sm font-medium">{index + 1}</span>
              ) : null}
            </Button>

            {/* Step Label and Description */}
            <div
              className={cn(
                'text-center',
                orientation === 'vertical' ? 'mt-2 max-w-32' : 'ml-3 text-left'
              )}
            >
              <div
                className={cn(
                  'text-sm font-medium transition-colors',
                  stepState === 'current' && 'text-primary',
                  stepState === 'completed' && 'text-success',
                  stepState === 'error' && 'text-destructive',
                  stepState === 'pending' && 'text-muted-foreground'
                )}
              >
                {step.label}
                {step.optional && (
                  <span className="text-xs text-muted-foreground ml-1">(optional)</span>
                )}
              </div>
              {step.description && (
                <div className="text-xs text-muted-foreground mt-1">
                  {step.description}
                </div>
              )}
            </div>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'transition-colors duration-200',
                orientation === 'horizontal' 
                  ? 'flex-1 h-0.5 mx-4 mt-5' 
                  : 'w-0.5 h-8 my-2 ml-5',
                getStepState(index) === 'completed' ? 'bg-success' : 'bg-muted'
              )}
            />
          )}
        </div>
      );
    };

    return (
      <div
        ref={ref}
        className={cn(
          'w-full',
          orientation === 'horizontal' ? 'flex items-start' : 'flex flex-col',
          disabled && 'opacity-60 pointer-events-none',
          className
        )}
        role="tablist"
        aria-orientation={orientation}
        {...props}
      >
        {steps.map((step, index) => renderStepIndicator(step, index))}
      </div>
    );
  }
);

FormStepper.displayName = 'FormStepper';

// Progress indicator component for showing completion percentage
export interface FormStepperProgressProps {
  /** Total number of steps */
  totalSteps: number;
  /** Current step index (0-based) */
  currentStep: number;
  /** Additional CSS classes */
  className?: string;
}

export const FormStepperProgress = React.forwardRef<HTMLDivElement, FormStepperProgressProps>(
  ({ totalSteps, currentStep, className, ...props }, ref) => {
    const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

    return (
      <div
        ref={ref}
        className={cn('w-full bg-muted rounded-full h-2', className)}
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
        aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
        {...props}
      >
        <motion.div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </div>
    );
  }
);

FormStepperProgress.displayName = 'FormStepperProgress';