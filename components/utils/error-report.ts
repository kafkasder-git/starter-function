/**
 * @fileoverview error-report Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ErrorInfo } from 'react';

import { logger } from '../../lib/logging/logger';
/**
 * StorageLike Interface
 *
 * @interface StorageLike
 */
export interface StorageLike {
  getItem: (key: string) => string | null;
}

/**
 * EnvironmentSource Interface
 *
 * @interface EnvironmentSource
 */
export interface EnvironmentSource {
  navigator?: Pick<Navigator, 'userAgent'> | { userAgent?: string };
  location?: Pick<Location, 'href'> | { href?: string };
  storage?: StorageLike;
  dateFactory?: () => Date;
}

/**
 * ErrorEnvironment Interface
 *
 * @interface ErrorEnvironment
 */
export interface ErrorEnvironment {
  userAgent: string;
  url: string;
  userId: string;
}

/**
 * ErrorReport Interface
 *
 * @interface ErrorReport
 */
export interface ErrorReport {
  errorId?: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  environment: ErrorEnvironment;
}

const DEFAULT_ENVIRONMENT_SOURCE: Required<Pick<EnvironmentSource, 'dateFactory'>> &
  EnvironmentSource = {
  navigator: typeof navigator !== 'undefined' ? navigator : undefined,
  location: typeof window !== 'undefined' ? window.location : undefined,
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  dateFactory: () => new Date(),
};

const mergeEnvironmentSource = (
  source?: EnvironmentSource
): Required<Pick<EnvironmentSource, 'dateFactory'>> & EnvironmentSource => ({
  navigator: source?.navigator ?? DEFAULT_ENVIRONMENT_SOURCE.navigator,
  location: source?.location ?? DEFAULT_ENVIRONMENT_SOURCE.location,
  storage: source?.storage ?? DEFAULT_ENVIRONMENT_SOURCE.storage,
  dateFactory: source?.dateFactory ?? DEFAULT_ENVIRONMENT_SOURCE.dateFactory,
});

export const getEnvironmentInfo = (source?: EnvironmentSource): ErrorEnvironment => {
  const merged = mergeEnvironmentSource(source);

  const userAgent =
    typeof merged.navigator?.userAgent === 'string' && merged.navigator.userAgent.trim().length > 0
      ? merged.navigator.userAgent
      : 'unknown';

  const url =
    typeof merged.location?.href === 'string' && merged.location.href.trim().length > 0
      ? merged.location.href
      : 'unknown';

  let userId = 'anonymous';
  const { storage } = merged;

  if (storage?.getItem) {
    try {
      const storedId = storage.getItem('user_id');
      if (storedId && storedId.trim().length > 0) {
        userId = storedId;
      }
    } catch (error) {
      logger.warn('[EnhancedErrorBoundary] Unable to access user_id from storage:', error);
    }
  }

  return {
    userAgent,
    url,
    userId,
  };
};

interface CreateErrorReportParams {
  errorId?: string;
  error: Error;
  errorInfo: Pick<ErrorInfo, 'componentStack'>;
  environmentSource?: EnvironmentSource;
}

export const createErrorReport = ({
  errorId,
  error,
  errorInfo,
  environmentSource,
}: CreateErrorReportParams): ErrorReport => {
  const mergedSource = mergeEnvironmentSource(environmentSource);
  const environment = getEnvironmentInfo(mergedSource);
  const { dateFactory } = mergedSource;

  return {
    errorId,
    message: error.message,
    stack: typeof error.stack === 'string' ? error.stack : undefined,
    componentStack: errorInfo.componentStack,
    timestamp: dateFactory().toISOString(),
    environment,
  };
};
