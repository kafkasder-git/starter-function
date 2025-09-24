/**
 * Security Utilities for Kafkasder Management Panel
 * Provides security validation, sanitization, and protection mechanisms
 */

import DOMPurify from 'dompurify';

// Security configuration
export const SECURITY_CONFIG = {
  MAX_INPUT_LENGTH: 10000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

/**
 * Input sanitization utilities
 */
export const SecurityUtils = {
  /**
   * Sanitize HTML content
   */
  sanitizeHTML: (input: string): string => {
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(input, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
        ALLOWED_ATTR: [],
      });
    }
    return input.replace(/<[^>]*>/g, '');
  },

  /**
   * Sanitize user input
   */
  sanitizeInput: (input: string): string => {
    return input
      .replace(/[<>'"&]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .trim();
  },

  /**
   * Validate file upload
   */
  validateFile: (file: File): { isValid: boolean; error?: string } => {
    if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
      return { isValid: false, error: 'Dosya boyutu çok büyük' };
    }

    if (!SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Desteklenmeyen dosya türü' };
    }

    return { isValid: true };
  },

  /**
   * Generate secure random string
   */
  generateSecureToken: (length: number = 32): string => {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Validate CSRF token
   */
  validateCSRFToken: (token: string, sessionToken: string): boolean => {
    return token === sessionToken && token.length > 0;
  },

  /**
   * Check for XSS patterns
   */
  detectXSS: (input: string): boolean => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Validate email format
   */
  validateEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  /**
   * Validate Turkish phone number
   */
  validateTurkishPhone: (phone: string): boolean => {
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Validate TC Kimlik No
   */
  validateTCKimlik: (tcNo: string): boolean => {
    if (!/^[1-9][0-9]{10}$/.test(tcNo)) return false;

    const digits = tcNo.split('').map(Number);
    const sum1 = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const sum2 = digits[1] + digits[3] + digits[5] + digits[7];

    return (sum1 * 7 - sum2) % 10 === digits[9];
  },

  /**
   * Rate limiting check
   */
  checkRateLimit: (identifier: string): boolean => {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    const requests = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Remove old requests
    const validRequests = requests.filter((time: number) => 
      now - time < SECURITY_CONFIG.RATE_LIMIT_WINDOW
    );

    if (validRequests.length >= SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }

    validRequests.push(now);
    localStorage.setItem(key, JSON.stringify(validRequests));
    return true;
  },

  /**
   * Session security check
   */
  checkSessionSecurity: (): boolean => {
    const lastActivity = localStorage.getItem('last_activity');
    if (!lastActivity) return false;

    const now = Date.now();
    const timeSinceActivity = now - parseInt(lastActivity);

    return timeSinceActivity < SECURITY_CONFIG.SESSION_TIMEOUT;
  },

  /**
   * Update session activity
   */
  updateSessionActivity: (): void => {
    localStorage.setItem('last_activity', Date.now().toString());
  },
};

// Export default
export default SecurityUtils;
