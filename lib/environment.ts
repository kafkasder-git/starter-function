/**
 * @fileoverview Environment Configuration
 * @description Centralized environment variable management with type safety
 */

interface EnvironmentConfig {
  mode: 'development' | 'production' | 'test';
  app: {
    name: string;
    version: string;
    debug: boolean;
  };
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };
  sentry?: {
    dsn: string;
    environment: string;
  };
  features: {
    [x: string]: any;
    ocr: boolean;
    pwa: boolean;
    analytics: boolean;
    mockData: boolean;
    offlineMode: boolean;
  };
  security: {
    csrfSecret?: string;
    sessionTimeout: number;
    rateLimit: number;
  };
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, defaultValue = ''): string {
  // Vite exposes environment variables on import.meta.env
  // But TypeScript's ImportMeta type may not have 'env' by default
  // So we use a type assertion to access it safely
  if (
    typeof import.meta !== 'undefined' &&
    typeof (import.meta as any).env !== 'undefined'
  ) {
    const value = (import.meta as any).env[key];
    return typeof value === 'string' ? value : defaultValue;
  }
  return defaultValue;
}

/**
 * Get boolean environment variable
 */
function getBoolEnv(key: string, defaultValue = false): boolean {
  const value = getEnv(key);
  if (!value) return defaultValue;
  return value === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, defaultValue = 0): number {
  const value = getEnv(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Environment configuration object
 */
export const environment: EnvironmentConfig = {
  mode: (getEnv('MODE', 'development') as any) || 'development',
  
  app: {
    name: getEnv('VITE_APP_NAME', 'Kafkasder Management System'),
    version: getEnv('VITE_APP_VERSION', '1.0.0'),
    debug: getBoolEnv('VITE_APP_DEBUG', true),
  },
  
  supabase: {
    url: getEnv('VITE_SUPABASE_URL', ''),
    anonKey: getEnv('VITE_SUPABASE_ANON_KEY', ''),
    serviceRoleKey: getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY'),
  },
  
  sentry: getEnv('VITE_SENTRY_DSN') ? {
    dsn: getEnv('VITE_SENTRY_DSN'),
    environment: getEnv('MODE', 'development'),
  } : undefined,
  
  features: {
    ocr: getBoolEnv('VITE_ENABLE_OCR', true),
    pwa: getBoolEnv('VITE_ENABLE_PWA', true),
    analytics: getBoolEnv('VITE_ENABLE_ANALYTICS', false),
    mockData: getBoolEnv('VITE_ENABLE_MOCK_DATA', true),
    offlineMode: getBoolEnv('VITE_ENABLE_OFFLINE_MODE', true),
  },
  
  security: {
    csrfSecret: getEnv('VITE_CSRF_SECRET'),
    sessionTimeout: getNumberEnv('VITE_SESSION_TIMEOUT', 3600),
    rateLimit: getNumberEnv('VITE_RATE_LIMIT', 100),
  },
};

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required Supabase configuration
  if (!environment.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  
  if (!environment.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }
  
  // Validate URL format
  if (environment.supabase.url && !environment.supabase.url.startsWith('http')) {
    errors.push('VITE_SUPABASE_URL must be a valid URL');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return environment.mode === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return environment.mode === 'development';
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return environment.mode === 'test';
}

/**
 * Get environment info for debugging
 */
export function getEnvironmentInfo() {
  return {
    mode: environment.mode,
    app: environment.app,
    features: environment.features,
    supabase: {
      configured: Boolean(environment.supabase.url && environment.supabase.anonKey),
      url: environment.supabase.url ? '✓' : '✗',
      anonKey: environment.supabase.anonKey ? '✓' : '✗',
    },
    sentry: {
      configured: Boolean(environment.sentry?.dsn),
    },
  };
}

export default environment;
