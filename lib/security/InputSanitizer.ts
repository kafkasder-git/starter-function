/**
 * Comprehensive Input Sanitization and Security System
 * Protects against XSS, SQL Injection, and other security threats
 *
 * @deprecated This file is being refactored. Use individual modules from lib/security/ instead.
 *
 * @version 2.0.0
 */

import { XSSProtection } from './xss';
import { SQLInjectionProtection } from './sqlInjection';
import { CSRFProtection } from './csrf';
import { RateLimiter } from './rateLimit';
import { SecurityHeaders } from './headers';

// XSS Protection - now imported from './xss'
export { XSSProtection } from './xss';

// SQL Injection Protection - now imported from './sqlInjection'
export { SQLInjectionProtection } from './sqlInjection';

// CSRF Protection - now imported from './csrf'
export { CSRFProtection } from './csrf';

// Rate Limiter - now imported from './rateLimit'
export { RateLimiter } from './rateLimit';

// Input Sanitizer
/**
 * InputSanitizer Service
 * High-level wrapper for convenience
 *
 * @deprecated Consider using specific sanitization functions from './sanitization' module
 *
 * @class InputSanitizer
 */
export class InputSanitizer {
  static sanitize(
    input: unknown,
    type: 'text' | 'html' | 'sql' | 'email' | 'phone' | 'url' | 'filepath' = 'text',
  ): string {
    if (input === null || input === undefined) return '';

    const stringInput = typeof input === 'string' ? input : String(input);

    switch (type) {
      case 'html':
        return XSSProtection.sanitizeHTML(stringInput);
      case 'sql':
        return SQLInjectionProtection.sanitize(stringInput);
      case 'email':
        return this.sanitizeEmail(stringInput);
      case 'phone':
        return this.sanitizePhone(stringInput);
      case 'url':
        return this.sanitizeURL(stringInput);
      case 'filepath':
        return this.sanitizeFilePath(stringInput);
      default:
        return this.sanitizeText(stringInput);
    }
  }

  static sanitizeText(input: string): string {
    return XSSProtection.sanitizeText(input);
  }

  static sanitizeEmail(input: string): string {
    return input
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9.@_-]/g, '');
  }

  static sanitizePhone(input: string): string {
    return input.replace(/[^\d+]/g, '').slice(0, 15); // Maximum length for international numbers
  }

  static sanitizeURL(input: string): string {
    return XSSProtection.sanitizeURL(input);
  }

  static sanitizeFilePath(input: string): string {
    return input
      .replace(/\.\./g, '') // Remove parent directory references
      .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
      .replace(/^[./\\]+|[./\\]+$/g, '') // Remove leading/trailing dots and slashes
      .trim();
  }

  static sanitizeUserInput(input: string, type = 'text'): string {
    switch (type) {
      case 'email':
        return this.sanitizeEmail(input);
      case 'phone':
        return this.sanitizePhone(input);
      case 'tcKimlik':
        return input.replace(/[^\d]/g, '').slice(0, 11);
      case 'iban':
        return input.replace(/[^\dA-Z]/gi, '').toUpperCase();
      default:
        return this.sanitizeText(input);
    }
  }

  static sanitizeFormData(formData: Record<string, unknown>): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [key, value] of Object.entries(formData)) {
      if (value === null || value === undefined) {
        result[key] = '';
      } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
        result[key] = this.sanitizeFormData(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        result[key] = value.map((item) => {
          if (typeof item === 'object' && item !== null) {
            return this.sanitizeFormData(item);
          }
          if (typeof item === 'string') {
            return this.sanitizeText(item);
          }
          return item;
        });
      } else if (typeof value === 'string') {
        // Determine field type based on key name
        if (key.toLowerCase().includes('email')) {
          result[key] = this.sanitizeEmail(value);
        } else if (key.toLowerCase().includes('phone')) {
          result[key] = this.sanitizePhone(value);
        } else if (key.toLowerCase().includes('url')) {
          result[key] = this.sanitizeURL(value);
        } else {
          result[key] = this.sanitizeText(value);
        }
      } else {
        result[key] = String(value);
      }
    }

    return result;
  }
}

// Security Headers - now imported from './headers'
export { SecurityHeaders } from './headers';
