/**
 * @fileoverview Secure Storage Module - Encrypted localStorage wrapper
 *
 * This module provides encrypted storage for sensitive data using AES encryption.
 * It should be used for storing sensitive information like tokens, user data, etc.
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import CryptoJS from 'crypto-js';
import { logger } from './logging/logger';

/**
 * Get encryption key from environment or generate a session key
 */
const getEncryptionKey = (): string => {
  // Try to get from environment first
  const envKey = import.meta.env.VITE_ENCRYPTION_KEY;

  if (envKey) {
    return envKey;
  }

  // Generate a session key if not in environment
  // This will be different each session, which is more secure for sensitive data
  let sessionKey = sessionStorage.getItem('__session_key');

  if (!sessionKey) {
    sessionKey = CryptoJS.lib.WordArray.random(32).toString();
    sessionStorage.setItem('__session_key', sessionKey);
  }

  return sessionKey;
};

/**
 * Secure Storage Interface
 */
export interface SecureStorageOptions {
  encrypt?: boolean;
  expiresIn?: number; // milliseconds
}

interface StorageItem<T> {
  value: T;
  encrypted: boolean;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Secure Storage Service
 *
 * Provides encrypted storage operations with automatic expiration
 */
export const secureStorage = {
  /**
   * Set an item in secure storage
   */
  setItem: <T>(key: string, value: T, options: SecureStorageOptions = {}): void => {
    try {
      const { encrypt = true, expiresIn } = options;

      const item: StorageItem<T> = {
        value,
        encrypted: encrypt,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
      };

      let dataToStore = JSON.stringify(item);

      if (encrypt) {
        const encryptionKey = getEncryptionKey();
        dataToStore = CryptoJS.AES.encrypt(dataToStore, encryptionKey).toString();
      }

      localStorage.setItem(key, dataToStore);
    } catch (error) {
      logger.error('SecureStorage: Failed to set item', { key, error });
      throw new Error('Failed to store data securely');
    }
  },

  /**
   * Get an item from secure storage
   */
  getItem: <T>(key: string): T | null => {
    try {
      const storedData = localStorage.getItem(key);

      if (!storedData) {
        return null;
      }

      let parsedData: StorageItem<T>;

      try {
        // Try to parse as JSON first (unencrypted data)
        parsedData = JSON.parse(storedData) as StorageItem<T>;
      } catch {
        // If parsing fails, assume it's encrypted
        try {
          const encryptionKey = getEncryptionKey();
          const decrypted = CryptoJS.AES.decrypt(storedData, encryptionKey);
          const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);

          if (!decryptedString) {
            logger.warn('SecureStorage: Failed to decrypt data', { key });
            return null;
          }

          parsedData = JSON.parse(decryptedString) as StorageItem<T>;
        } catch (decryptError) {
          logger.error('SecureStorage: Failed to decrypt item', { key, error: decryptError });
          return null;
        }
      }

      // Check expiration
      if (parsedData.expiresAt && Date.now() > parsedData.expiresAt) {
        logger.debug('SecureStorage: Item expired', { key });
        localStorage.removeItem(key);
        return null;
      }

      return parsedData.value;
    } catch (error) {
      logger.error('SecureStorage: Failed to get item', { key, error });
      return null;
    }
  },

  /**
   * Remove an item from secure storage
   */
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      logger.error('SecureStorage: Failed to remove item', { key, error });
    }
  },

  /**
   * Clear all items from secure storage
   */
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      logger.error('SecureStorage: Failed to clear storage', { error });
    }
  },

  /**
   * Check if an item exists and is not expired
   */
  hasItem: (key: string): boolean => {
    return secureStorage.getItem(key) !== null;
  },

  /**
   * Get all keys in secure storage
   */
  keys: (): string[] => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      logger.error('SecureStorage: Failed to get keys', { error });
      return [];
    }
  },
};

/**
 * Specific secure storage for sensitive data
 */
export const sensitiveStorage = {
  /**
   * Store authentication token
   */
  setAuthToken: (token: string, expiresIn?: number): void => {
    secureStorage.setItem('auth_token', token, {
      encrypt: true,
      expiresIn: expiresIn || 24 * 60 * 60 * 1000, // 24 hours default
    });
  },

  /**
   * Get authentication token
   */
  getAuthToken: (): string | null => {
    return secureStorage.getItem<string>('auth_token');
  },

  /**
   * Remove authentication token
   */
  removeAuthToken: (): void => {
    secureStorage.removeItem('auth_token');
  },

  /**
   * Store CSRF token
   */
  setCSRFToken: (token: string): void => {
    secureStorage.setItem('csrf_token', token, {
      encrypt: true,
      expiresIn: 60 * 60 * 1000, // 1 hour
    });
  },

  /**
   * Get CSRF token
   */
  getCSRFToken: (): string | null => {
    return secureStorage.getItem<string>('csrf_token');
  },

  /**
   * Store user session data
   */
  setUserSession: (userData: Record<string, unknown>): void => {
    secureStorage.setItem('user_session', userData, {
      encrypt: true,
      expiresIn: 24 * 60 * 60 * 1000, // 24 hours
    });
  },

  /**
   * Get user session data
   */
  getUserSession: (): Record<string, unknown> | null => {
    return secureStorage.getItem<Record<string, unknown>>('user_session');
  },

  /**
   * Clear all sensitive data
   */
  clearAll: (): void => {
    secureStorage.removeItem('auth_token');
    secureStorage.removeItem('csrf_token');
    secureStorage.removeItem('user_session');
  },
};

/**
 * Migration utility to encrypt existing unencrypted data
 */
export const migrateToSecureStorage = (keys: string[]): void => {
  logger.info('SecureStorage: Starting migration', { keys });

  keys.forEach((key) => {
    try {
      const existingData = localStorage.getItem(key);

      if (existingData) {
        // Try to parse as JSON
        try {
          const parsed = JSON.parse(existingData);

          // Re-store with encryption
          secureStorage.setItem(key, parsed, { encrypt: true });

          logger.debug('SecureStorage: Migrated key', { key });
        } catch {
          // If not JSON, store as string
          secureStorage.setItem(key, existingData, { encrypt: true });
        }
      }
    } catch (error) {
      logger.error('SecureStorage: Failed to migrate key', { key, error });
    }
  });

  logger.info('SecureStorage: Migration completed');
};

export default secureStorage;
