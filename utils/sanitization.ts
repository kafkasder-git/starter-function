/**
 * @fileoverview sanitization Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// Input sanitization utilities (deprecated - use lib/security/InputSanitizer instead)
class InputSanitizer {
  // Sanitize HTML content to prevent XSS
  static sanitizeHTML(input: unknown): string {
    // Handle null, undefined, and non-string types
    if (input == null) {
      return '';
    }

    // Don't sanitize if input is an Error object
    if (input instanceof Error) {
      return '';
    }

    // Convert to string safely
    let stringInput: string;
    try {
      stringInput = typeof input === 'string' ? input : JSON.stringify(input);
    } catch {
      return '';
    }

    return DOMPurify.sanitize(stringInput, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
      KEEP_CONTENT: true,
    });
  }

  // Sanitize plain text input
  static sanitizeText(input: unknown): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .trim()
      .replace(/[<>"'&]/g, (char) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;',
        };
        return entities[char] ?? char;
      })
      .split('')
      .filter((char) => {
        const code = char.charCodeAt(0);
        return code !== 0 && !(code >= 1 && code <= 31) && code !== 127;
      })
      .join(''); // Remove control characters including null bytes
  }

  // Sanitize SQL input to prevent SQL injection
  static sanitizeSQL(input: unknown): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[';"\\]/g, '') // Remove dangerous SQL characters
      .replace(/--/g, '') // Remove SQL comments
      .replace(/\/\*/g, '') // Remove SQL block comments start
      .replace(/\*\//g, '') // Remove SQL block comments end
      .replace(/\bUNION\b/gi, '') // Remove UNION keyword
      .replace(/\bSELECT\b/gi, '') // Remove SELECT keyword
      .replace(/\bINSERT\b/gi, '') // Remove INSERT keyword
      .replace(/\bUPDATE\b/gi, '') // Remove UPDATE keyword
      .replace(/\bDELETE\b/gi, '') // Remove DELETE keyword
      .replace(/\bDROP\b/gi, '') // Remove DROP keyword
      .replace(/\bCREATE\b/gi, '') // Remove CREATE keyword
      .replace(/\bALTER\b/gi, '') // Remove ALTER keyword
      .trim();
  }

  // Sanitize file path to prevent directory traversal
  static sanitizeFilePath(input: unknown): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/\.\./g, '') // Remove parent directory references
      .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
      .replace(/^[./\\]+/, '') // Remove leading dots and slashes
      .replace(/[./\\]+$/, '') // Remove trailing dots and slashes
      .trim();
  }

  // Sanitize email input
  static sanitizeEmail(input: unknown): string {
    if (typeof input !== 'string') {
      return '';
    }

    return (validator.normalizeEmail(input.trim().toLowerCase()) as string | null) ?? '';
  }

  // Sanitize phone number
  static sanitizePhone(input: unknown): string {
    if (typeof input !== 'string') {
      return '';
    }

    return input
      .replace(/[^0-9+\-\s()]/g, '') // Keep only numbers and common phone characters
      .trim();
  }

  // Sanitize URL
  static sanitizeURL(input: unknown): string {
    if (typeof input !== 'string') {
      return '';
    }

    try {
      const url = new URL(input.trim());

      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(url.protocol)) {
        return '';
      }

      return url.toString();
    } catch {
      return '';
    }
  }

  // Sanitize numeric input
  static sanitize(input: unknown): number | null {
    if (typeof input === 'number' && !isNaN(input)) {
      return input;
    }

    if (typeof input === 'string') {
      const num = parseFloat(input.trim());
      return isNaN(num) ? null : num;
    }

    return null;
  }

  // Sanitize integer input
  static sanitizeInteger(input: unknown): number | null {
    if (typeof input === 'number' && Number.isInteger(input)) {
      return input;
    }

    if (typeof input === 'string') {
      const num = parseInt(input.trim(), 10);
      return isNaN(num) ? null : num;
    }

    return null;
  }

  // Sanitize boolean input
  static sanitizeBoolean(input: unknown): boolean | null {
    if (typeof input === 'boolean') {
      return input;
    }

    if (typeof input === 'string') {
      const lower = input.trim().toLowerCase();
      if (['true', '1', 'yes', 'on'].includes(lower)) {
        return true;
      }
      if (['false', '0', 'no', 'off'].includes(lower)) {
        return false;
      }
    }

    if (typeof input === 'number') {
      return input !== 0;
    }

    return null;
  }

  // Sanitize date input
  static sanitizeDate(input: unknown): Date | null {
    if (input instanceof Date && !isNaN(input.getTime())) {
      return input;
    }

    if (typeof input === 'string' || typeof input === 'number') {
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }

    return null;
  }

  // Sanitize array input
  static sanitizeArray(input: unknown, itemSanitizer?: (item: unknown) => unknown): unknown[] {
    if (!Array.isArray(input)) {
      return [];
    }

    if (itemSanitizer) {
      return input.map(itemSanitizer).filter((item) => item !== null && item !== undefined);
    }

    return input.filter((item) => item !== null && item !== undefined);
  }

  // Sanitize object input
  static sanitizeObject(
    input: unknown,
    schema?: Record<string, (value: unknown) => unknown>,
  ): Record<string, unknown> {
    if (input == null ?? typeof input !== 'object' || Array.isArray(input)) {
      return {};
    }

    const sanitized: Record<string, unknown> = {};
    const objInput = input as Record<string, unknown>;

    if (schema) {
      for (const [key, sanitizer] of Object.entries(schema)) {
        if (key in objInput) {
          const sanitizedValue = sanitizer(objInput[key]);
          if (sanitizedValue !== null && sanitizedValue !== undefined) {
            sanitized[key] = sanitizedValue;
          }
        }
      }
    } else {
      for (const [key, value] of Object.entries(objInput)) {
        const sanitizedKey = this.sanitizeText(key);
        if (sanitizedKey && typeof value === 'string') {
          sanitized[sanitizedKey] = this.sanitizeText(value);
        } else if (sanitizedKey) {
          sanitized[sanitizedKey] = value;
        }
      }
    }

    return sanitized;
  }
}


// Main sanitization function
/**
 * sanitizeInput function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function sanitizeInput(input: unknown, type = 'text'): unknown {
  switch (type) {
    case 'html':
      return InputSanitizer.sanitizeHTML(input);
    case 'text':
      return InputSanitizer.sanitizeText(input);
    case 'sql':
      return InputSanitizer.sanitizeSQL(input);
    case 'email':
      return InputSanitizer.sanitizeEmail(input);
    case 'phone':
      return InputSanitizer.sanitizePhone(input);
    case 'url':
      return InputSanitizer.sanitizeURL(input);
    case 'number':
      return InputSanitizer.sanitize(input);
    case 'integer':
      return InputSanitizer.sanitizeInteger(input);
    case 'boolean':
      return InputSanitizer.sanitizeBoolean(input);
    case 'date':
      return InputSanitizer.sanitizeDate(input);
    case 'filepath':
      return InputSanitizer.sanitizeFilePath(input);
    default:
      return InputSanitizer.sanitizeText(input);
  }
}

// Export sanitizer and validator classes (deprecated - use lib/security/InputSanitizer instead)
// export { InputSanitizer, InputValidator };
