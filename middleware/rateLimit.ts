import { NextRequest } from 'next/server';

import { RateLimiter, DEFAULT_RATE_LIMITS } from '../lib/security/rateLimit';
import { monitoring } from '../services/monitoringService';
import { logger } from '../lib/logging/logger';

const globalLimiter = new RateLimiter(DEFAULT_RATE_LIMITS.global);
const perUserLimiter = new RateLimiter(DEFAULT_RATE_LIMITS.perUser);
const loginLimiter = new RateLimiter(DEFAULT_RATE_LIMITS.login);

const LOGIN_PATH_MATCHERS = [/\/api\/auth/i, /\/auth\//i, /login/i];

const getClientIp = (request: NextRequest): string => {
  const header = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
  if (header) {
    return header.split(',')[0]?.trim() || 'unknown';
  }
  return (request as any).ip || request.headers.get('cf-connecting-ip') || 'unknown';
};

const calculateRetryAfter = (limiter: RateLimiter, key: string): number => {
  const reset = limiter.getResetTime(key);
  return Math.max(1, Math.ceil((reset - Date.now()) / 1000));
};

const isAuthenticationRoute = (pathname: string): boolean =>
  LOGIN_PATH_MATCHERS.some((regex) => regex.test(pathname));

export const rateLimit = async (
  request: NextRequest
): Promise<{ success: boolean; retryAfter?: number }> => {
  const ip = getClientIp(request);
  const pathname = request.nextUrl.pathname;

  globalLimiter.cleanup();
  perUserLimiter.cleanup();
  loginLimiter.cleanup();

  if (!globalLimiter.isAllowed(ip)) {
    const retryAfter = calculateRetryAfter(globalLimiter, ip);
    void monitoring.trackSecurityEvent('rate_limit.global_block', {
      ip,
      pathname,
      retryAfter,
    });
    logger.warn('Global rate limit exceeded', { ip, pathname, retryAfter });
    return { success: false, retryAfter };
  }

  const userId = request.headers.get('x-user-id') || request.headers.get('x-appwrite-user-id');
  if (userId && !perUserLimiter.isAllowed(userId)) {
    const retryAfter = calculateRetryAfter(perUserLimiter, userId);
    void monitoring.trackSecurityEvent('rate_limit.user_block', {
      ip,
      userId,
      pathname,
      retryAfter,
    });
    logger.warn('Per-user rate limit exceeded', { ip, userId, pathname, retryAfter });
    return { success: false, retryAfter };
  }

  if (isAuthenticationRoute(pathname) && !loginLimiter.isAllowed(ip)) {
    const retryAfter = calculateRetryAfter(loginLimiter, ip);
    void monitoring.trackSecurityEvent('rate_limit.login_block', {
      ip,
      pathname,
      retryAfter,
    });
    logger.warn('Login rate limit exceeded', { ip, pathname, retryAfter });
    return { success: false, retryAfter };
  }

  return { success: true };
};

export default rateLimit;
