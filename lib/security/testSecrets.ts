/**
 * Test ortamı için güvenli secret üretimi
 * Production'da environment variables kullanılmalı
 */

/**
 * Güvenli test CSRF token'i üret
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
export function generateTestSecret(prefix = 'test'): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Test secrets cannot be used in production');
  }
  
  return `${prefix}-secret-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Environment variable kontrolü ile secret al
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
    console.warn(`Warning: Using fallback for ${key}. Set environment variable for security.`);
    return fallback;
  }
  
  return generateTestSecret(key.toLowerCase().replace(/_/g, '-'));
}