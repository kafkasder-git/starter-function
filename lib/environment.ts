/**
 * @fileoverview environment Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// 🌍 ENVIRONMENT CONFIGURATION MANAGER
// Centralized environment variable management

import { generateTestSecret } from './security/testSecrets';

import { logger } from './logging/logger';
interface EnvironmentConfig {
  // Application
  app: {
    name: string;
    version: string;
    mode: 'development' | 'production' | 'test';
    debug: boolean;
  };

  // Supabase
  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };

  // Feature Flags
  features: {
    pwa: boolean;
    analytics: boolean;
    ai: boolean;
    monitoring: boolean;
    mockData: boolean;
    offlineMode: boolean;
    security?: {
      virusScan: boolean;
      contentModeration: boolean;
      watermarking: boolean;
      encryption: boolean;
    };
  };

  // Performance
  performance: {
    serviceWorker: boolean;
    cacheStrategy: 'networkFirst' | 'cacheFirst';
    bundleAnalyzer: boolean;
    sourcemaps: boolean;
  };

  // Security
  security: {
    csp: boolean;
    hsts: boolean;
    xssProtection: boolean;
    contentTypeOptions: boolean;
  };

  // Development
  development: {
    port: number;
    host: string;
    open: boolean;
    cors: boolean;
  };

  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    console: boolean;
    errorTracking: boolean;
    performanceLogging: boolean;
  };

  // Sentry
  sentry: {
    dsn: string;
    environment: string;
    enabled: boolean;
    debug: boolean;
    tracesSampleRate: number;
    profilesSampleRate: number;
    enableLogs: boolean;
    consoleLoggingLevels: string[];
    // MCP-specific settings
    mcpMonitoring: boolean;
    mcpTracesSampleRate: number;
    mcpServerName: string;
  };
}

// Environment variable getter with type safety
function getEnvVar(key: string, defaultValue?: string): string {
  // Check if we're in a browser environment (Vite)
  const isBrowser = typeof window !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env;
  const isNode = typeof process !== 'undefined' && process.env;

  let value: string | undefined;

  if (isBrowser && typeof import.meta !== 'undefined' && import.meta.env) {
    value = import.meta.env[key as keyof ImportMetaEnv] as string;
  } else if (isNode && process.env) {
    value = process.env[key];
  }

  // If no environment variable is set, use default value
    if (!value || value === '') {
    if (defaultValue === undefined) {
      logger.warn(`Environment variable ${key} is not defined and no default provided`);
      return '';
    }
    return defaultValue;
  }

  return value;
}

function getEnvBool(key: string, defaultValue = false): boolean {
  const value = getEnvVar(key);
  if (value === '') return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

function getEnvNumber(key: string, defaultValue = 0): number {
  const value = getEnvVar(key);
  if (value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// Environment validation
function validateEnvironment(): void {
  const mode = getEnvVar('VITE_APP_MODE', 'development');

  // In test mode, use default values for missing environment variables
  if (mode === 'test') {
    // Set default test values for required variables if not provided
    if (typeof process !== 'undefined' && process.env) {
      process.env.VITE_SUPABASE_URL ??= 'https://test.supabase.co';
      process.env.VITE_SUPABASE_ANON_KEY ??= 'test-anon-key';
      process.env.VITE_CSRF_SECRET ??= generateTestSecret('csrf');
    }
    logger.info('🧪 Test mode: Using default environment values');
    return;
  }

  const requiredVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'VITE_CSRF_SECRET'];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    const value = getEnvVar(varName, '');
    if (!value || value === '') {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    const errorMessage = `
🚨 KRİTİK GÜVENLİK UYARISI!

Eksik environment variable'lar tespit edildi:
${missingVars.map((v) => `  - ${v}`).join('\n')}

Lütfen .env dosyanızı oluşturun ve gerekli değişkenleri ekleyin:

# .env dosyası oluşturun:
cp .env.example .env

# Gerekli değişkenleri ekleyin:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_CSRF_SECRET=your_csrf_secret_key

Bu eksiklikler giderilmezse uygulama çalışmayacaktır!
        `;

    throw new Error(errorMessage);
  }

  // Security check - hardcoded credentials kontrolü (test ortamında disable)
  const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
  const supabaseKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

  // Test ortamında hardcoded credentials check'ini disable et
  if (mode !== 'test') {
    if (
      supabaseUrl.includes('gyburnfaszhxcxdnwogj') ||
      supabaseKey.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
    ) {
      throw new Error(`
🚨 KRİTİK GÜVENLİK AÇIĞI TESPİT EDİLDİ!

Environment variable'larda hardcoded credentials tespit edildi:

VITE_SUPABASE_URL: ${supabaseUrl}
VITE_SUPABASE_ANON_KEY: ${supabaseKey.substring(0, 20)}...

Bu çok tehlikelidir! Lütfen:
1. Bu credentials'ları derhal değiştirin
2. Environment variable'ları .env dosyasından alın
3. Git history'den bu bilgileri temizleyin

            `);
    }
  }

  logger.info('✅ Environment validation başarılı');
}

// Lazy environment validation - only validate when explicitly requested
let environmentValidated = false;

/**
 * validateEnvironmentIfNeeded function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function validateEnvironmentIfNeeded(): void {
  if (environmentValidated) return;

  const appMode = getEnvVar('VITE_APP_MODE', 'development');
  const forceValidation = getEnvVar('VITE_FORCE_ENV_VALIDATION', 'false');
  const shouldValidate = appMode !== 'test' || forceValidation === 'true';
  logger.info('🔧 Environment validation check:', {
    mode: appMode,
    shouldValidate,
    forceValidation,
  });

  if (shouldValidate) {
    validateEnvironment();
  } else {
    logger.info('🧪 Skipping environment validation in test mode');
  }

  environmentValidated = true;
}

// Environment validation is now lazy-loaded
// Call validateEnvironmentIfNeeded() when needed

// Main environment configuration
export const environment: EnvironmentConfig = {
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Dernek Yönetim Sistemi'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    mode: ['development', 'production', 'test'].includes(getEnvVar('VITE_APP_MODE', 'development'))
      ? (getEnvVar('VITE_APP_MODE', 'development') as 'development' | 'production' | 'test')
      : 'development',
    debug: getEnvBool('VITE_APP_DEBUG', true),
  },

  supabase: {
    url: getEnvVar('VITE_SUPABASE_URL'),
    anonKey: getEnvVar('VITE_SUPABASE_ANON_KEY'),
    serviceRoleKey: getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY'),
  },

  features: {
    pwa: getEnvBool('VITE_ENABLE_PWA', true),
    analytics: getEnvBool('VITE_ENABLE_ANALYTICS', false),
    ai: getEnvBool('VITE_ENABLE_AI', true),
    monitoring: getEnvBool('VITE_ENABLE_MONITORING', true),
    mockData: getEnvBool('VITE_ENABLE_MOCK_DATA', true),
    offlineMode: getEnvBool('VITE_ENABLE_OFFLINE_MODE', true),
  },

  performance: {
    serviceWorker: getEnvBool('VITE_ENABLE_SERVICE_WORKER', true),
    cacheStrategy: ['networkFirst', 'cacheFirst'].includes(
      getEnvVar('VITE_CACHE_STRATEGY', 'networkFirst'),
    )
      ? (getEnvVar('VITE_CACHE_STRATEGY', 'networkFirst') as 'networkFirst' | 'cacheFirst')
      : 'networkFirst',
    bundleAnalyzer: getEnvBool('VITE_BUNDLE_ANALYZER', false),
    sourcemaps: getEnvBool('VITE_SOURCEMAPS', false),
  },

  security: {
    csp: getEnvBool('VITE_ENABLE_CSP', true),
    hsts: getEnvBool('VITE_ENABLE_HSTS', true),
    xssProtection: getEnvBool('VITE_ENABLE_XSS_PROTECTION', true),
    contentTypeOptions: getEnvBool('VITE_ENABLE_CONTENT_TYPE_OPTIONS', true),
  },

  development: {
    port: getEnvNumber('VITE_DEV_PORT', 5173),
    host: getEnvVar('VITE_DEV_HOST', 'localhost'),
    open: getEnvBool('VITE_DEV_OPEN', true),
    cors: getEnvBool('VITE_DEV_CORS', true),
  },

  logging: {
    level: ['debug', 'info', 'warn', 'error'].includes(getEnvVar('VITE_LOG_LEVEL', 'info'))
      ? (getEnvVar('VITE_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error')
      : 'info',
    console: getEnvBool('VITE_ENABLE_CONSOLE_LOGS', true),
    errorTracking: getEnvBool('VITE_ENABLE_ERROR_TRACKING', true),
    performanceLogging: getEnvBool('VITE_ENABLE_PERFORMANCE_LOGGING', true),
  },

  sentry: {
    dsn: getEnvVar(
      'VITE_SENTRY_DSN',
      'https://02c770edd9fe48bbe40659ff7727789d@o4510066087362560.ingest.de.sentry.io/4510066095423568',
    ),
    environment: getEnvVar('VITE_SENTRY_ENVIRONMENT', getEnvVar('VITE_APP_MODE', 'development')),
    enabled: getEnvBool(
      'VITE_SENTRY_ENABLED',
      getEnvVar('VITE_APP_MODE', 'development') === 'production',
    ),
    debug: getEnvBool('VITE_SENTRY_DEBUG', getEnvBool('VITE_APP_DEBUG', true)),
    tracesSampleRate: parseFloat(getEnvVar('VITE_SENTRY_TRACES_SAMPLE_RATE', '1.0')),
    profilesSampleRate: parseFloat(getEnvVar('VITE_SENTRY_PROFILES_SAMPLE_RATE', '1.0')),
    enableLogs: getEnvBool('VITE_SENTRY_ENABLE_LOGS', true),
    consoleLoggingLevels: getEnvVar('VITE_SENTRY_CONSOLE_LEVELS', 'log,warn,error').split(','),
    // MCP-specific settings
    mcpMonitoring: getEnvBool('VITE_SENTRY_MCP_MONITORING', true),
    mcpTracesSampleRate: parseFloat(getEnvVar('VITE_SENTRY_MCP_TRACES_SAMPLE_RATE', '1.0')),
    mcpServerName: getEnvVar('VITE_SENTRY_MCP_SERVER_NAME', 'dernek-management-server'),
  },
};

// Environment info for debugging
/**
 * getEnvironmentInfo function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function getEnvironmentInfo() {
  return {
    config: environment,
    runtime: {
      nodeEnv: getEnvVar('VITE_APP_MODE', 'development'),
      isDevelopment: getEnvVar('VITE_APP_MODE', 'development') === 'development',
      isProduction: getEnvVar('VITE_APP_MODE', 'development') === 'production',
      baseUrl: getEnvVar('VITE_BASE_URL', '/'),
    },
    build: {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: 'unknown', // Deprecated navigator.platform replaced with safer fallback
      language: navigator.language,
    },
  };
}

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof EnvironmentConfig['features']): boolean => {
  return environment.features[feature];
};

export const isProduction = (): boolean => {
  return environment.app.mode === 'production';
};

export const isDevelopment = (): boolean => {
  return environment.app.mode === 'development';
};

// Logging helper
export const log = {
  debug: (...args: unknown[]) => {
    if (environment.logging.console && environment.logging.level === 'debug') {
      logger.debug('[DEBUG]', ...args);
    }
  },

  info: (...args: unknown[]) => {
    if (environment.logging.console && ['debug', 'info'].includes(environment.logging.level)) {
      console.info('[INFO]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (
      environment.logging.console &&
      ['debug', 'info', 'warn'].includes(environment.logging.level)
    ) {
      logger.warn('[WARN]', ...args);
    }
  },

  error: (...args: unknown[]) => {
    if (environment.logging.console) {
      logger.error('[ERROR]', ...args);
    }

    if (environment.logging.errorTracking) {
      // Send to error tracking service
    }
  },
};

// Performance logging
export const performanceLog = (metric: string, value: number, context?: unknown) => {
  if (environment.logging.performanceLogging) {
    log.info(`[PERFORMANCE] ${metric}: ${value.toString()}ms`, context);
  }
};

// Export environment for global access
export default environment;
