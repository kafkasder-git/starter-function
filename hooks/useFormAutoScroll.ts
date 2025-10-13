/**
 * @fileoverview Form Auto-Scroll Hook - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useEffect, useRef } from 'react';
import type { UseFormReturn } from 'react-hook-form';

/**
 * Options for auto-scroll behavior
 */
export interface UseFormAutoScrollOptions {
  /** Scroll behavior (default: 'smooth') */
  behavior?: ScrollBehavior;
  /** Block position (default: 'center') */
  block?: ScrollLogicalPosition;
  /** Enable/disable auto-scroll (default: true) */
  enabled?: boolean;
  /** Additional offset in pixels (default: 0) */
  offset?: number;
}

/**
 * Hook to automatically scroll to the first error field on form submission
 *
 * @param form - React Hook Form instance
 * @param options - Auto-scroll options
 */
export function useFormAutoScroll<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options?: UseFormAutoScrollOptions
) {
  const {
    behavior = 'smooth',
    block = 'center',
    enabled = true,
    offset = 0,
  } = options || {};

  const prevSubmitCountRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const { submitCount, errors } = form.formState;

    // Only scroll if submit count increased and there are errors
    if (submitCount > prevSubmitCountRef.current && Object.keys(errors).length > 0) {
      // Small delay to ensure error messages are rendered
      setTimeout(() => {
        const firstErrorFieldName = Object.keys(errors)[0];

        if (!firstErrorFieldName) {
          return;
        }

        // Try multiple selector strategies to find the field
        let element: HTMLElement | null = null;

        // Strategy 1: Find by data-field-name attribute
        element = document.querySelector(`[data-field-name="${firstErrorFieldName}"]`);

        // Strategy 2: Find by name attribute
        if (!element) {
          element = document.querySelector(`[name="${firstErrorFieldName}"]`);
        }

        // Strategy 3: Find by id
        if (!element) {
          element = document.getElementById(firstErrorFieldName);
        }

        // Strategy 4: Handle nested field names (e.g., 'user.email')
        if (!element && firstErrorFieldName.includes('.')) {
          const parts = firstErrorFieldName.split('.');
          const parentFieldName = parts[0];

          // Try to find parent container
          element = document.querySelector(`[data-field-name="${parentFieldName}"]`);
        }

        if (element) {
          // Scroll element into view
          element.scrollIntoView({
            behavior,
            block,
          });

          // Apply additional offset if specified
          if (offset !== 0) {
            window.scrollBy(0, -offset);
          }

          // Try to focus the input element if it's focusable
          const inputElement = element.querySelector('input, textarea, select');
          if (inputElement && typeof inputElement.focus === 'function') {
            // Small delay to ensure scroll is complete
            setTimeout(() => {
              inputElement.focus();
            }, 100);
          }
        }
      }, 100);
    }

    // Update previous submit count
    prevSubmitCountRef.current = submitCount;
  }, [form.formState, behavior, block, enabled, offset]);
}

