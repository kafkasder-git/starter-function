/**
 * @fileoverview useLocalStorage Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState } from 'react';

import { logger } from '../lib/logging/logger';
function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      logger.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Hook for managing user preferences
/**
 * useUserPreferences function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage('userPreferences', {
    theme: 'light',
    sidebarCollapsed: false,
    tablePageSize: 10,
    language: 'tr',
    notifications: true,
    recentSearches: [] as string[],
    lastModule: 'genel',
  });

  const addRecentSearch = (search: string) => {
    if (!search.trim()) return;

    setPreferences((prev) => ({
      ...prev,
      recentSearches: [search, ...prev.recentSearches.filter((s) => s !== search)].slice(0, 10), // Keep only last 10 searches
    }));
  };

  const clearRecentSearches = () => {
    setPreferences((prev) => ({
      ...prev,
      recentSearches: [],
    }));
  };

  const updatePreference = <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K],
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return {
    preferences,
    addRecentSearch,
    clearRecentSearches,
    updatePreference,
  };
}

// Hook for managing form drafts
/**
 * useFormDraft function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useFormDraft<T extends Record<string, unknown>>(formId: string, initialData: T) {
  const [draft, setDraft] = useLocalStorage(`formDraft_${formId}`, initialData);

  const updateDraft = (data: Partial<T>) => {
    setDraft((prev) => ({ ...prev, ...data }));
  };

  const clearDraft = () => {
    setDraft(initialData);
    localStorage.removeItem(`formDraft_${formId}`);
  };

  const hasDraft = () => {
    return JSON.stringify(draft) !== JSON.stringify(initialData);
  };

  return {
    draft,
    updateDraft,
    clearDraft,
    hasDraft,
  };
}

export default useLocalStorage;
