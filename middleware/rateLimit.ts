import type { NextRequest } from 'next/server';

// In-memory rate limiting store (in production, use Redis)
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
      5 * 60 * 1000,
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
  keyGenerator?: (request: NextRequest) => string;
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
function getClientId(request: NextRequest): string {
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
export async function rateLimit(request: NextRequest): Promise<RateLimitResult> {
  const url = new URL(request.url);
  const path = url.pathname;
  const config = getConfig(path);

  const clientId = config.keyGenerator ? config.keyGenerator(request) : getClientId(request);
  const key = `${path}:${clientId}`;

  const now = Date.now();
  const windowStart = now - config.windowMs;

  let entry = store.get(key);

  // Initialize or reset if window has passed
  if (!entry || now > entry.resetTime) {
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
export function createRateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<RateLimitResult> => {
    const clientId = config.keyGenerator ? config.keyGenerator(request) : getClientId(request);
    const url = new URL(request.url);
    const key = `custom:${url.pathname}:${clientId}`;

    const now = Date.now();
    let entry = store.get(key);

    if (!entry || now > entry.resetTime) {
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
export function cleanup(): void {
  store.destroy();
}

// Export rate limit configurations for external use
export type { RateLimitConfig };
export { defaultConfigs };
