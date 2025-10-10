/**
 * @fileoverview Security Module - Centralized security exports
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 */

// Sanitization
export * from './sanitization';
export { default as Sanitization } from './sanitization';

// Validation
export * from './validation';
export { validateField, validateForm, VALIDATION_SCHEMAS, VALIDATION_PATTERNS } from './validation';

// CSRF Protection
export { CSRFTokenManager, generateCSRFToken, validateCSRFToken, CSRFProtection } from './csrf';

// Rate Limiting
export { RateLimiter, DEFAULT_RATE_LIMITS, type RateLimitConfig } from './rateLimit';

// XSS Protection
export { XSSProtection, detectXSS, xssProtection } from './xss';

// SQL Injection Prevention
export { SQLInjectionPrevention, SQLInjectionProtection } from './sqlInjection';

// Security Headers
export { SecurityHeaders, getCSPHeader, getSecurityHeaders, addSecurityHeaders } from './headers';

// API Security Core (keeping existing exports)
export * from './apiSecurity';
export * from './apiSecurityMiddleware';
export * from './securityConfigManager';

// Re-export from apiSecurity for backward compatibility
export { APIVersionManager, DEFAULT_SECURITY_CONFIG } from './apiSecurity';

export {
  APISecurityMiddleware,
  apiSecurityMiddleware,
  createSecurityContext,
  SecureEndpoint,
} from './apiSecurityMiddleware';

export { SecurityConfigManager, securityConfigManager } from './securityConfigManager';

// Types
export type { APISecurityConfig, SecurityContext, SecurityResult } from './apiSecurity';

export type { ValidationResult, FieldValidationResult, ValidationSchema } from './validation';

export type { SanitizeOptions } from './sanitization';
