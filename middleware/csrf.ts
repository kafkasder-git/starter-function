import type { NextRequest } from 'next/server';
import crypto from 'crypto';

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
  return crypto.randomBytes(32).toString('hex');
}

// Extract user ID from JWT token
function getUserIdFromToken(authHeader: string): string | null {
  try {
    if (!authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || null;
  } catch (error) {
    return null;
  }
}

// Generate CSRF token for a user
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
export async function validateCSRF(request: NextRequest): Promise<boolean> {
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
      console.warn('CSRF token missing from request');
      return false;
    }

    // Get user ID from auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.warn('Authorization header missing for CSRF validation');
      return false;
    }

    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      console.warn('Invalid auth token for CSRF validation');
      return false;
    }

    // Validate token
    const tokenEntry = tokenStore.get(csrfToken);
    if (!tokenEntry) {
      console.warn('CSRF token not found in store');
      return false;
    }

    // Check if token is expired
    if (Date.now() > tokenEntry.expiresAt) {
      tokenStore.delete(csrfToken);
      console.warn('CSRF token expired');
      return false;
    }

    // Check if token belongs to the user
    if (tokenEntry.userId !== userId) {
      console.warn('CSRF token does not belong to user');
      return false;
    }

    return true;
  } catch (error) {
    console.error('CSRF validation error:', error);
    return false;
  }
}

// Validate CSRF token with additional security checks
export async function validateCSRFStrict(request: NextRequest): Promise<boolean> {
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
      console.warn('Origin header does not match host');
      return false;
    }
  }

  // 2. Check Referer header for additional validation
  const referer = request.headers.get('referer');
  if (referer && host) {
    const refererUrl = new URL(referer);
    if (refererUrl.host !== host) {
      console.warn('Referer header does not match host');
      return false;
    }
  }

  return true;
}

// Refresh CSRF token (extend expiry)
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
export function revokeCSRFToken(token: string): void {
  tokenStore.delete(token);
}

// Revoke all CSRF tokens for a user
export function revokeUserCSRFTokens(userId: string): void {
  for (const [token, entry] of tokenStore.store.entries()) {
    if (entry.userId === userId) {
      tokenStore.delete(token);
    }
  }
}

// Get CSRF token info
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

// Cleanup function for graceful shutdown
export function cleanup(): void {
  tokenStore.destroy();
}

// CSRF middleware for API routes
export function withCSRF(handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>) {
  return async (request: NextRequest, ...args: unknown[]) => {
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
export function withCSRFStrict(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<Response>,
) {
  return async (request: NextRequest, ...args: unknown[]) => {
    const isValid = await validateCSRFStrict(request);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'CSRF token validation failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return handler(request, ...args);
  };
}
