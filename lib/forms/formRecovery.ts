/**
 * @fileoverview Form State Recovery Utility - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useEffect, useRef, useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { logger } from '../logging/logger';

/**
 * Options for form recovery functionality
 */
export interface FormRecoveryOptions {
  /** Unique storage key for this form */
  storageKey: string;
  /** Auto-save interval in milliseconds (default: 30000 = 30 seconds) */
  autoSaveInterval?: number;
  /** Fields to exclude from recovery (e.g., passwords, file uploads) */
  excludeFields?: string[];
  /** Callback when data is recovered */
  onRecover?: (data: any) => void;
  /** Callback when data is saved */
  onSave?: (data: any) => void;
  /** Whether recovery is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Stored recovery data structure
 */
export interface RecoveryData {
  /** Form field values */
  values: Record<string, any>;
  /** Timestamp when data was saved */
  timestamp: number;
  /** Form identifier */
  formId: string;
}

/**
 * Maximum age for recovery data (7 days in milliseconds)
 */
const MAX_RECOVERY_AGE = 7 * 24 * 60 * 60 * 1000;

/**
 * Get the full storage key for recovery data
 */
function getStorageKey(storageKey: string): string {
  return `form-recovery-${storageKey}`;
}

/**
 * Filter out excluded fields from form data
 */
function filterExcludedFields(
  data: Record<string, any>,
  excludeFields: string[] = []
): Record<string, any> {
  const filtered: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (!excludeFields.includes(key)) {
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Check if recovery data is valid and not too old
 */
function isValidRecoveryData(data: RecoveryData): boolean {
  const age = Date.now() - data.timestamp;
  return age < MAX_RECOVERY_AGE;
}

/**
 * Get recovery data from localStorage
 */
export function getRecoveryData(storageKey: string): RecoveryData | null {
  try {
    const key = getStorageKey(storageKey);
    const item = localStorage.getItem(key);

    if (!item) {
      return null;
    }

    const data = JSON.parse(item) as RecoveryData;

    if (!isValidRecoveryData(data)) {
      // Remove stale data
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    logger.warn(`Error reading recovery data for key "${storageKey}":`, error);
    return null;
  }
}

/**
 * Check if recovery data exists for a form
 */
export function hasRecoveryData(storageKey: string): boolean {
  return getRecoveryData(storageKey) !== null;
}

/**
 * Clear recovery data from localStorage
 */
export function clearRecoveryData(storageKey: string): void {
  try {
    const key = getStorageKey(storageKey);
    localStorage.removeItem(key);
    logger.info(`Cleared recovery data for form: ${storageKey}`);
  } catch (error) {
    logger.warn(`Error clearing recovery data for key "${storageKey}":`, error);
  }
}

/**
 * Save recovery data to localStorage
 */
function saveRecoveryData(
  storageKey: string,
  values: Record<string, any>,
  excludeFields: string[] = []
): void {
  try {
    const key = getStorageKey(storageKey);
    const filteredValues = filterExcludedFields(values, excludeFields);

    const data: RecoveryData = {
      values: filteredValues,
      timestamp: Date.now(),
      formId: storageKey,
    };

    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    // Handle quota exceeded errors gracefully
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      logger.warn(`LocalStorage quota exceeded for form: ${storageKey}`);
    } else {
      logger.warn(`Error saving recovery data for key "${storageKey}":`, error);
    }
  }
}

/**
 * Hook for form state recovery with auto-save functionality
 *
 * @param form - React Hook Form instance
 * @param options - Recovery options
 * @returns Recovery utilities
 */
export function useFormRecovery<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options: FormRecoveryOptions
) {
  const {
    storageKey,
    autoSaveInterval = 30000, // 30 seconds default
    excludeFields = [],
    onRecover,
    onSave,
    enabled = true,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasRecoveredRef = useRef(false);

  // Recover form data on mount
  useEffect(() => {
    if (!enabled || hasRecoveredRef.current) {
      return;
    }

    const recoveryData = getRecoveryData(storageKey);

    if (recoveryData) {
      try {
        // Reset form with recovered values, keeping default values
        form.reset(recoveryData.values as T, { keepDefaultValues: true });
        onRecover?.(recoveryData.values);
        logger.info(`Recovered form data for: ${storageKey}`);
      } catch (error) {
        logger.error(`Error recovering form data for "${storageKey}":`, error);
      }
    }

    hasRecoveredRef.current = true;
  }, [enabled, form, onRecover, storageKey]);

  // Auto-save form data
  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Set up auto-save interval
    intervalRef.current = setInterval(() => {
      const isDirty = form.formState.isDirty;

      if (isDirty) {
        const values = form.getValues();
        saveRecoveryData(storageKey, values as Record<string, any>, excludeFields);
        onSave?.(values);
        logger.debug(`Auto-saved form data for: ${storageKey}`);
      }
    }, autoSaveInterval);

    // Clean up interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, form, storageKey, autoSaveInterval, excludeFields, onSave]);

  // Function to manually clear recovery data
  const clearRecovery = useCallback(() => {
    clearRecoveryData(storageKey);
  }, [storageKey]);

  // Function to manually recover form data
  const recoverForm = useCallback(() => {
    const recoveryData = getRecoveryData(storageKey);

    if (recoveryData) {
      form.reset(recoveryData.values as T, { keepDefaultValues: true });
      onRecover?.(recoveryData.values);
    }
  }, [form, onRecover, storageKey]);

  // Check if recovery data exists
  const hasRecovery = hasRecoveryData(storageKey);

  return {
    hasRecoveryData: hasRecovery,
    clearRecovery,
    recoverForm,
  };
}
