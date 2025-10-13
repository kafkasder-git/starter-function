/**
 * @fileoverview testSecrets Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../logging/logger';
/**
 * Test ortamı için güvenli secret üretimi
 * Production'da environment variables kullanılmalı
 */

/**
 * Güvenli test CSRF token'i üret
 */
/**
 * generateTestCSRFToken function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function generateTestCSRFToken(): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test tokens cannot be used in production');
  }

  return `test-csrf-token-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Güvenli test secret üret
 */
/**
 * generateTestSecret function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function generateTestSecret(prefix = 'test'): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test secrets cannot be used in production');
  }

  return `${prefix}-secret-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Environment variable kontrolü ile secret al
 */
/**
 * getSecureSecret function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function getSecureSecret(key: string, fallback?: string): string {
  const value = process.env[key];

  if (value) {
    return value;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  if (fallback) {
    logger.warn(`Warning: Using fallback for ${key}. Set environment variable for security.`);
    return fallback;
  }

  return generateTestSecret(key.toLowerCase().replace(/_/g, '-'));
}
