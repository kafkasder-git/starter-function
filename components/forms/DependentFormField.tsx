/**
 * @fileoverview DependentFormField Component - FormField with conditional rendering support
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FormField, type FormFieldProps } from './FormField';
import { useFormContext } from './FormProvider';

export interface DependentFormFieldProps extends FormFieldProps {
  /** Field name this field depends on */
  dependsOn?: string | string[];
  /** Function to determine if field should be shown */
  showWhen?: (dependentValues: any) => boolean;
  /** Function to determine if field should be enabled */
  enableWhen?: (dependentValues: any) => boolean;
  /** Function to determine if field should be required */
  requireWhen?: (dependentValues: any) => boolean;
  /** Animation duration for show/hide transitions */
  animationDuration?: number;
}

export const DependentFormField = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  DependentFormFieldProps
>(
  (
    {
      dependsOn,
      showWhen,
      enableWhen,
      requireWhen,
      animationDuration = 0.3,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const formContext = useFormContext();

    // Get dependent field values
    const dependentValues = useMemo(() => {
      if (!dependsOn || !formContext) return {};

      const dependencies = Array.isArray(dependsOn) ? dependsOn : [dependsOn];
      const values: Record<string, any> = {};

      dependencies.forEach((fieldName) => {
        values[fieldName] = formContext.formState.values[fieldName];
      });

      // If single dependency, return the value directly
      if (!Array.isArray(dependsOn)) {
        return values[dependsOn];
      }

      return values;
    }, [dependsOn, formContext]);

    // Determine field state based on dependencies
    const shouldShow = useMemo(() => {
      if (!showWhen) return true;
      return showWhen(dependentValues);
    }, [showWhen, dependentValues]);

    const shouldEnable = useMemo(() => {
      if (!enableWhen) return !disabled;
      return enableWhen(dependentValues) && !disabled;
    }, [enableWhen, dependentValues, disabled]);

    const shouldRequire = useMemo(() => {
      if (!requireWhen) return required;
      return requireWhen(dependentValues) || required;
    }, [requireWhen, dependentValues, required]);

    // Don't render if field should not be shown
    if (!shouldShow) {
      return null;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={`${props.name}-${shouldShow}`}
          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
          animate={{ 
            opacity: 1, 
            height: 'auto', 
            marginBottom: 'var(--space-4)' 
          }}
          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
          transition={{ 
            duration: animationDuration,
            ease: 'easeInOut',
            opacity: { duration: animationDuration * 0.6 }
          }}
          style={{ overflow: 'hidden' }}
        >
          <FormField
            {...props}
            ref={ref}
            disabled={!shouldEnable}
            required={shouldRequire}
          />
        </motion.div>
      </AnimatePresence>
    );
  }
);

DependentFormField.displayName = 'DependentFormField';

// Hook for managing field dependencies
export interface UseFieldDependenciesOptions {
  /** Form values object */
  values: Record<string, any>;
  /** Dependency rules */
  dependencies: Record<string, {
    dependsOn: string | string[];
    showWhen?: (dependentValues: any) => boolean;
    enableWhen?: (dependentValues: any) => boolean;
    requireWhen?: (dependentValues: any) => boolean;
  }>;
}

export interface FieldState {
  visible: boolean;
  enabled: boolean;
  required: boolean;
}

export function useFieldDependencies({
  values,
  dependencies
}: UseFieldDependenciesOptions): Record<string, FieldState> {
  return useMemo(() => {
    const fieldStates: Record<string, FieldState> = {};

    Object.entries(dependencies).forEach(([fieldName, config]) => {
      const { dependsOn, showWhen, enableWhen, requireWhen } = config;
      
      // Get dependent values
      const dependentValues = Array.isArray(dependsOn)
        ? dependsOn.reduce((acc, dep) => {
            acc[dep] = values[dep];
            return acc;
          }, {} as Record<string, any>)
        : values[dependsOn];

      // Calculate field state
      fieldStates[fieldName] = {
        visible: showWhen ? showWhen(dependentValues) : true,
        enabled: enableWhen ? enableWhen(dependentValues) : true,
        required: requireWhen ? requireWhen(dependentValues) : false,
      };
    });

    return fieldStates;
  }, [values, dependencies]);
}

// Common dependency conditions
export const DependencyConditions = {
  /** Show when dependent field has any value */
  hasValue: (value: any) => value !== undefined && value !== null && value !== '',
  
  /** Show when dependent field equals specific value */
  equals: (expectedValue: any) => (value: any) => value === expectedValue,
  
  /** Show when dependent field is one of the specified values */
  oneOf: (expectedValues: any[]) => (value: any) => expectedValues.includes(value),
  
  /** Show when dependent field does not equal specific value */
  notEquals: (expectedValue: any) => (value: any) => value !== expectedValue,
  
  /** Show when dependent field is not one of the specified values */
  notOneOf: (expectedValues: any[]) => (value: any) => !expectedValues.includes(value),
  
  /** Show when dependent field is greater than value */
  greaterThan: (threshold: number) => (value: any) => Number(value) > threshold,
  
  /** Show when dependent field is less than value */
  lessThan: (threshold: number) => (value: any) => Number(value) < threshold,
  
  /** Show when dependent field matches regex pattern */
  matches: (pattern: RegExp) => (value: any) => pattern.test(String(value)),
  
  /** Show when multiple conditions are met (AND) */
  and: (...conditions: ((value: any) => boolean)[]) => (value: any) =>
    conditions.every(condition => condition(value)),
  
  /** Show when any condition is met (OR) */
  or: (...conditions: ((value: any) => boolean)[]) => (value: any) =>
    conditions.some(condition => condition(value)),
  
  /** Show when condition is not met (NOT) */
  not: (condition: (value: any) => boolean) => (value: any) => !condition(value),
};