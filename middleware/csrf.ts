/**
 * @fileoverview csrf Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import crypto from 'crypto';

import { logger } from '../lib/logging/logger';
// CSRF token store (in production, use Redis or database)
interface CSRFTokenEntry {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

class CSRFTokenStore {
  private readonly store = new Map<string, CSRFTokenEntry>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired tokens every 10 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      10 * 60 * 1000,
    );
  }

  set(key: string, entry: CSRFTokenEntry): void {
    this.store.set(key, entry);
  }

  get(key: string): CSRFTokenEntry | undefined {
    return this.store.get(key);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  // Add method to revoke all tokens for a user
  revokeUserTokens(userId: string): void {
    for (const [token, entry] of this.store.entries()) {
      if (entry.userId === userId) {
        this.store.delete(token);
      }
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

const tokenStore = new CSRFTokenStore();

// Generate a secure random token
function generateToken(): string {
  // Use web crypto API for compatibility
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Extract user ID from JWT token
function getUserIdFromToken(authHeader: string): string | null {
  try {
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub ?? null;
  } catch (error) {
    return null;
  }
}

// Generate CSRF token for a user
/**
 * generateCSRFToken function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function generateCSRFToken(userId: string): string {
  const token = generateToken();
  const now = Date.now();
  const expiresAt = now + 2 * 60 * 60 * 1000; // 2 hours

  const entry: CSRFTokenEntry = {
    token,
    userId,
    createdAt: now,
    expiresAt,
  };

  tokenStore.set(token, entry);
  return token;
}

// Validate CSRF token
/**
 * validateCSRF function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export async function validateCSRF(request: Request): Promise<boolean> {
  try {
    // Skip CSRF validation for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    // Get CSRF token from header or body
    let csrfToken = request.headers.get('x-csrf-token');

    if (!csrfToken) {
      // Try to get from request body
      try {
        const body = await request.clone().json();
        csrfToken = body._csrf;
      } catch (error) {
        // Body is not JSON or doesn't contain CSRF token
      }
    }

    if (!csrfToken) {
      logger.warn('CSRF token missing from request');
      return false;
    }

    // Get user ID from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      logger.warn('Authorization header missing for CSRF validation');
      return false;
    }

    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      logger.warn('Invalid auth token for CSRF validation');
      return false;
    }

    // Validate token
    const tokenEntry = tokenStore.get(csrfToken);
    if (!tokenEntry) {
      logger.warn('CSRF token not found in store');
      return false;
    }

    // Check if token is expired
    if (Date.now() > tokenEntry.expiresAt) {
      tokenStore.delete(csrfToken);
      logger.warn('CSRF token expired');
      return false;
    }

    // Check if token belongs to the user
    if (tokenEntry.userId !== userId) {
      logger.warn('CSRF token does not belong to user');
      return false;
    }

    return true;
  } catch (error) {
    logger.error('CSRF validation error:', error);
    return false;
  }
}

// Validate CSRF token with additional security checks
/**
 * validateCSRFStrict function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export async function validateCSRFStrict(request: Request): Promise<boolean> {
  const isValid = await validateCSRF(request);

  if (!isValid) {
    return false;
  }

  // Additional security checks

  // 1. Check Origin header
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (origin && host) {
    const originUrl = new URL(origin);
    if (originUrl.host !== host) {
      logger.warn('Origin header does not match host');
      return false;
    }
  }

  // 2. Check Referer header for additional validation
  const referer = request.headers.get('referer');
  if (referer && host) {
    const refererUrl = new URL(referer);
    if (refererUrl.host !== host) {
      logger.warn('Referer header does not match host');
      return false;
    }
  }

  return true;
}

// Refresh CSRF token (extend expiry)
/**
 * refreshCSRFToken function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function refreshCSRFToken(token: string): boolean {
  const entry = tokenStore.get(token);
  if (!entry) {
    return false;
  }

  // Check if token is still valid
  if (Date.now() > entry.expiresAt) {
    tokenStore.delete(token);
    return false;
  }

  // Extend expiry by 2 hours
  entry.expiresAt = Date.now() + 2 * 60 * 60 * 1000;
  tokenStore.set(token, entry);

  return true;
}

// Revoke CSRF token
/**
 * revokeCSRFToken function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function revokeCSRFToken(token: string): void {
  tokenStore.delete(token);
}

// Revoke all CSRF tokens for a user
/**
 * revokeUserCSRFTokens function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function revokeUserCSRFTokens(userId: string): void {
  tokenStore.revokeUserTokens(userId);
}

// Get CSRF token info
/**
 * getCSRFTokenInfo function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function getCSRFTokenInfo(token: string): CSRFTokenEntry | null {
  const entry = tokenStore.get(token);
  if (!entry) {
    return null;
  }

  // Check if expired
  if (Date.now() > entry.expiresAt) {
    tokenStore.delete(token);
    return null;
  }

  return entry;
}

// CSRF Protection class for testing
/**
 * CSRFProtection Service
 * 
 * Service class for handling csrfprotection operations
 * 
 * @class CSRFProtection
 */
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; userId: string; expiresAt: number }>();

  static generateToken(userId: string): string {
    const token = generateToken();
    const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours

    this.tokens.set(token, { token, userId, expiresAt });
    return token;
  }

  static validateToken(token: string, userId: string): boolean {
    const entry = this.tokens.get(token);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.tokens.delete(token);
      return false;
    }

    return entry.userId === userId;
  }

  static cleanExpiredTokens(): void {
    const now = Date.now();
    for (const [token, entry] of this.tokens.entries()) {
      if (now > entry.expiresAt) {
        this.tokens.delete(token);
      }
    }
  }

  static revokeToken(token: string): void {
    this.tokens.delete(token);
  }
}

// CSRF middleware for API routes
/**
 * withCSRF function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function withCSRF(handler: (request: Request, ...args: unknown[]) => Promise<Response>) {
  return async (request: Request, ...args: unknown[]) => {
    const isValid = await validateCSRF(request);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'CSRF token validation failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(request, ...args);
  };
}

// CSRF middleware with strict validation
/**
 * withCSRFStrict function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function withCSRFStrict(
  handler: (request: Request, ...args: unknown[]) => Promise<Response>,
) {
  return async (request: Request, ...args: unknown[]) => {
    const isValid = await validateCSRFStrict(request);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'CSRF token validation failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(request, ...args);
  };
}// In-memory rate limiting store (in production, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
  lastRequest: number;
}
class RateLimitStore {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  get(key: string): RateLimitEntry | undefined {
    return this.store.get(key);
  }

  set(key: string, entry: RateLimitEntry): void {
    this.store.set(key, entry);
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}
// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (request: Request) => string;
}
// Default configurations for different endpoints
const defaultConfigs: Record<string, RateLimitConfig> = {
  // Authentication endpoints - stricter limits
  '/api/auth/login': {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
  },
  '/api/auth/register': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour
  },
  '/api/auth/reset-password': {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 reset attempts per hour
  },

  // API endpoints - moderate limits
  '/api/members': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
  },
  '/api/donations': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
  },
  '/api/finance': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 15, // 15 requests per minute
  },

  // Admin endpoints - stricter limits
  '/api/admin': {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
  },

  // Default for all other endpoints
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
  },
};
const store = new RateLimitStore();
// Get client identifier
function getClientId(request: Request): string {
  // Try to get user ID from auth header first
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      // Extract user ID from JWT token (simplified)
      const token = authHeader.substring(7);
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.sub) {
        return `user:${payload.sub}`;
      }
    } catch (error) {
      // Fall back to IP if token parsing fails
    }
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : request.headers.get('x-real-ip') || 'unknown';

  return `ip:${ip}`;
}
// Get rate limit configuration for endpoint
function getConfig(path: string): RateLimitConfig {
  // Find the most specific matching configuration
  for (const [pattern, config] of Object.entries(defaultConfigs)) {
    if (pattern !== 'default' && path.startsWith(pattern)) {
      return config;
    }
  }

  return defaultConfigs.default;
}
// Rate limiting result
interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}
// Main rate limiting function

/**
 * rateLimit function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export async function rateLimit(request: Request): Promise<RateLimitResult> {
  const url = new URL(request.url);
  const path = url.pathname;
  const config = getConfig(path);

  const clientId = config.keyGenerator ? config.keyGenerator(request) : getClientId(request);
  const key = `${path}:${clientId}`;

  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);

  // Initialize or reset if window has passed
  if (!entry ?? now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
      lastRequest: now,
    };
  }

  // Increment request count
  entry.count++;
  entry.lastRequest = now;
  store.set(key, entry);

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const resetTime = entry.resetTime;

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((resetTime - now) / 1000);

    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      resetTime,
      retryAfter,
    };
  }

  return {
    success: true,
    limit: config.maxRequests,
    remaining,
    resetTime,
  };
}
// Rate limit middleware for specific endpoints

/**
 * createRateLimit function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function createRateLimit(config: RateLimitConfig) {
  return async (request: Request): Promise<RateLimitResult> => {
    const clientId = config.keyGenerator ? config.keyGenerator(request) : getClientId(request);
    const url = new URL(request.url);
    const key = `custom:${url.pathname}:${clientId}`;

    const now = Date.now();
    let entry = store.get(key);

    if (!entry ?? now > entry.resetTime) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs,
        lastRequest: now,
      };
    }

    entry.count++;
    entry.lastRequest = now;
    store.set(key, entry);

    const remaining = Math.max(0, config.maxRequests - entry.count);
    const resetTime = entry.resetTime;

    if (entry.count > config.maxRequests) {
      const retryAfter = Math.ceil((resetTime - now) / 1000);

      return {
        success: false,
        limit: config.maxRequests,
        remaining: 0,
        resetTime,
        retryAfter,
      };
    }

    return {
      success: true,
      limit: config.maxRequests,
      remaining,
      resetTime,
    };
  };
}
// Cleanup function for graceful shutdown

/**
 * cleanup function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function cleanup(): void {
  store.destroy();
}
// Rate Limiter class for testing

/**
 * RateLimiter Service
 * 
 * Service class for handling ratelimiter operations
 * 
 * @class RateLimiter
 */
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number; }>();

  static checkLimit(userId: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const key = userId;
    const now = Date.now();

    let entry = this.attempts.get(key);
    if (!entry ?? now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
    }

    entry.count++;
    this.attempts.set(key, entry);

    return entry.count <= maxAttempts;
  }

  static getRemainingAttempts(userId: string, maxAttempts: number = 5): number {
    const entry = this.attempts.get(userId);
    if (!entry) return maxAttempts;
    return Math.max(0, maxAttempts - entry.count);
  }

  static resetAttempts(userId: string): void {
    this.attempts.delete(userId);
  }

  static getResetTime(userId: string): number | null {
    const entry = this.attempts.get(userId);
    return entry ? entry.resetTime : null;
  }
}

