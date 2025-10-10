/**
 * @fileoverview Sanitization Module - Comprehensive data sanitization and XSS prevention
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization configuration options
 */
export interface SanitizeOptions {
  /**
   * Allow HTML tags
   */
  allowHTML?: boolean;
  /**
   * Allow specific tags
   */
  allowedTags?: string[];
  /**
   * Allow specific attributes
   */
  allowedAttributes?: string[];
  /**
   * Strip all tags and return plain text
   */
  stripAllTags?: boolean;
}

/**
 * Default sanitization configuration
 */
const DEFAULT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br'],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_DOM_IMPORT: false,
  FORCE_BODY: false,
};

/**
 * Strict configuration - strips all HTML
 */
const STRICT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
  KEEP_CONTENT: true,
};

/**
 * Rich text configuration - allows more tags
 */
const RICH_TEXT_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: [
    'b',
    'i',
    'em',
    'strong',
    'u',
    'p',
    'br',
    'ul',
    'ol',
    'li',
    'a',
    'span',
    'div',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'code',
    'pre',
  ],
  ALLOWED_ATTR: ['href', 'title', 'class'],
  KEEP_CONTENT: true,
};

/**
 * Sanitize a string to prevent XSS attacks
 *
 * @param dirty - The potentially unsafe string
 * @param options - Sanitization options
 * @returns Sanitized safe string
 */
export function sanitize(dirty: string | null | undefined, options: SanitizeOptions = {}): string {
  if (!dirty) return '';

  let config: DOMPurify.Config;

  if (options.stripAllTags) {
    config = STRICT_CONFIG;
  } else if (options.allowHTML) {
    config = RICH_TEXT_CONFIG;
  } else {
    config = { ...DEFAULT_CONFIG };
  }

  // Override with custom allowed tags/attributes if provided
  if (options.allowedTags) {
    config.ALLOWED_TAGS = options.allowedTags;
  }

  if (options.allowedAttributes) {
    config.ALLOWED_ATTR = options.allowedAttributes;
  }

  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize HTML for display (allows basic formatting)
 */
export function sanitizeHTML(html: string | null | undefined): string {
  return sanitize(html, { allowHTML: false });
}

/**
 * Sanitize rich text (allows more HTML tags)
 */
export function sanitizeRichText(html: string | null | undefined): string {
  return sanitize(html, { allowHTML: true });
}

/**
 * Strip all HTML tags and return plain text
 */
export function stripHTML(html: string | null | undefined): string {
  return sanitize(html, { stripAllTags: true });
}

/**
 * Sanitize user input for safe display
 */
export function sanitizeUserInput(input: string | null | undefined): string {
  if (!input) return '';

  // First strip all HTML
  const stripped = stripHTML(input);

  // Then escape special characters
  return stripped
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeURL(url: string | null | undefined): string {
  if (!url) return '';

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '';
  }

  return DOMPurify.sanitize(url, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Sanitize and validate email address
 */
export function sanitizeEmail(email: string | null | undefined): string {
  if (!email) return '';

  const sanitized = stripHTML(email).trim().toLowerCase();

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }

  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string | null | undefined): string {
  if (!phone) return '';

  // Remove all non-digit characters except + at the start
  const cleaned = phone.replace(/[^\d+]/g, '');

  return cleaned;
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string | null | undefined): string {
  if (!fileName) return '';

  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/\.\.+/g, '')
    .replace(/[<>:"|?*]/g, '')
    .replace(/\//g, '_')
    .replace(/\\/g, '_')
    .trim();
}

/**
 * Sanitize file path
 */
export function sanitizeFilePath(input: string): string {
  return input
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[<>:"|?*]/g, '') // Remove invalid filename characters
    .replace(/^[./\\]+|[./\\]+$/g, '') // Remove leading/trailing dots and slashes
    .trim();
}

/**
 * Sanitize plain text
 */
export function sanitizeText(input: string): string {
  return input
    .trim()
    .replace(/[<>"'&]/g, (char) => {
      const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
      };
      return escapeMap[char] || char;
    })
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: SanitizeOptions = {},
): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitize(value, options);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitize(item, options)
          : typeof item === 'object'
            ? sanitizeObject(item, options)
            : item,
      );
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value, options);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

/**
 * Sanitize array of objects
 */
export function sanitizeArray<T extends Record<string, any>>(
  array: T[],
  options: SanitizeOptions = {},
): T[] {
  return array.map((item) => sanitizeObject(item, options));
}

/**
 * Sanitize form data recursively
 */
export function sanitizeFormData(formData: Record<string, unknown>): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(formData)) {
    if (value === null || value === undefined) {
      result[key] = '';
    } else if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      result[key] = sanitizeFormData(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return sanitizeFormData(item);
        }
        if (typeof item === 'string') {
          return sanitizeText(item);
        }
        return item;
      });
    } else if (typeof value === 'string') {
      // Determine field type based on key name
      if (key.toLowerCase().includes('email')) {
        result[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('phone')) {
        result[key] = sanitizePhone(value);
      } else if (key.toLowerCase().includes('url')) {
        result[key] = sanitizeURL(value);
      } else {
        result[key] = sanitizeText(value);
      }
    } else {
      result[key] = String(value);
    }
  }

  return result;
}

/**
 * Create a safe HTML renderer component helper
 */
export function createSafeHTML(
  html: string | null | undefined,
  allowRich = false,
): { __html: string } {
  const sanitized = allowRich ? sanitizeRichText(html) : sanitizeHTML(html);
  return { __html: sanitized };
}

/**
 * Check if string contains potentially malicious content
 */
export function containsMaliciousContent(input: string): boolean {
  if (!input) return false;

  const maliciousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /eval\(/gi,
    /expression\(/gi,
  ];

  return maliciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * InputSanitizer class - High-level wrapper for convenience
 * @deprecated Use individual sanitization functions instead
 */
export class InputSanitizer {
  static sanitize(
    input: unknown,
    type: 'text' | 'html' | 'email' | 'phone' | 'url' | 'filepath' = 'text',
  ): string {
    if (input === null || input === undefined) return '';

    const stringInput = typeof input === 'string' ? input : String(input);

    switch (type) {
      case 'html':
        return sanitizeHTML(stringInput);
      case 'email':
        return sanitizeEmail(stringInput);
      case 'phone':
        return sanitizePhone(stringInput);
      case 'url':
        return sanitizeURL(stringInput);
      case 'filepath':
        return sanitizeFilePath(stringInput);
      default:
        return sanitizeText(stringInput);
    }
  }

  static sanitizeText(input: string): string {
    return sanitizeText(input);
  }

  static sanitizeEmail(input: string): string {
    return sanitizeEmail(input);
  }

  static sanitizePhone(input: string): string {
    return sanitizePhone(input);
  }

  static sanitizeURL(input: string): string {
    return sanitizeURL(input);
  }

  static sanitizeFilePath(input: string): string {
    return sanitizeFilePath(input);
  }

  static sanitizeUserInput(input: string, type = 'text'): string {
    switch (type) {
      case 'email':
        return sanitizeEmail(input);
      case 'phone':
        return sanitizePhone(input);
      case 'tcKimlik':
        return input.replace(/[^\d]/g, '').slice(0, 11);
      case 'iban':
        return input.replace(/[^\dA-Z]/gi, '').toUpperCase();
      default:
        return sanitizeText(input);
    }
  }

  static sanitizeFormData(formData: Record<string, unknown>): Record<string, any> {
    return sanitizeFormData(formData);
  }

  static sanitizeObject(obj: unknown): unknown {
    if (typeof obj === 'string') {
      return sanitizeText(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        const sanitizedKey = sanitizeText(key);
        sanitized[sanitizedKey] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }
}

export default {
  sanitize,
  sanitizeHTML,
  sanitizeRichText,
  stripHTML,
  sanitizeUserInput,
  sanitizeURL,
  sanitizeEmail,
  sanitizePhone,
  sanitizeFileName,
  sanitizeFilePath,
  sanitizeText,
  sanitizeObject,
  sanitizeArray,
  sanitizeFormData,
  createSafeHTML,
  containsMaliciousContent,
  InputSanitizer,
};
