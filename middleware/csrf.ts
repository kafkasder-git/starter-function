import { NextRequest } from 'next/server';

import { CSRFTokenManager } from '../lib/security/csrf';
import { logger } from '../lib/logging/logger';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const TOKEN_HEADER_KEYS = ['x-csrf-token', 'x-xsrf-token'];

const getHeaderToken = (request: NextRequest): string | null => {
  for (const key of TOKEN_HEADER_KEYS) {
    const value = request.headers.get(key);
    if (value) {
      return value;
    }
  }
  return null;
};

export const validateCSRF = async (request: NextRequest): Promise<boolean> => {
  if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
    return true;
  }

  const token = getHeaderToken(request);
  const csrfCookie = request.cookies.get('csrf-token') || request.cookies.get('csrf_token');
  const sessionCookie = request.cookies.get('session') || request.cookies.get('appwrite-session');

  if (!token) {
    logger.warn('CSRF validation failed: missing header token', {
      method: request.method,
      path: request.nextUrl.pathname,
    });
    return false;
  }

  if (csrfCookie && csrfCookie.value === token) {
    return true;
  }

  if (sessionCookie && CSRFTokenManager.validateToken(sessionCookie.value, token)) {
    return true;
  }

  logger.warn('CSRF validation failed: token mismatch', {
    method: request.method,
    path: request.nextUrl.pathname,
    hasCsrfCookie: Boolean(csrfCookie),
    hasSessionCookie: Boolean(sessionCookie),
  });

  return false;
};

export default validateCSRF;
