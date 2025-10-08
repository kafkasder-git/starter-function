/**
 * @fileoverview Sanitization Module - Data sanitization and XSS prevention
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
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
    'b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li',
    'a', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote', 'code', 'pre'
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
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: SanitizeOptions = {}
): T {
  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      sanitized[key] = value;
    } else if (typeof value === 'string') {
      sanitized[key] = sanitize(value, options);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string'
          ? sanitize(item, options)
          : typeof item === 'object'
          ? sanitizeObject(item, options)
          : item
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
  options: SanitizeOptions = {}
): T[] {
  return array.map(item => sanitizeObject(item, options));
}

/**
 * Create a safe HTML renderer component helper
 */
export function createSafeHTML(html: string | null | undefined, allowRich = false): { __html: string } {
  const sanitized = allowRich ? sanitizeRichText(html) : sanitizeHTML(html);
  return { __html: sanitized };
}

/**
 * Validate and sanitize email address
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
  
  return maliciousPatterns.some(pattern => pattern.test(input));
}

export default {
  sanitize,
  sanitizeHTML,
  sanitizeRichText,
  stripHTML,
  sanitizeUserInput,
  sanitizeURL,
  sanitizeObject,
  sanitizeArray,
  createSafeHTML,
  sanitizeEmail,
  sanitizePhone,
  sanitizeFileName,
  containsMaliciousContent,
};

