/**    it('should throw error for missing required variables', () => {
      // Create a copy without the required variable
      const { VITE_SUPABASE_URL: _removedUrl, ..._envWithoutUrl } = mockEnv;

      // Mock import.meta.env without required variable
      vi.stubGlobal('import', {
        meta: {
          env: _envWithoutUrl,
        },
      });overview Environment Service Unit Tests
 * @description Tests   describe('Environment Validation', () => {
    it('should throw error for missing required variables', () => {
      // Create a copy without the required variable
      const { VITE_SUPABASE_URL: _removed, ...envWithoutUrl } = mockEnv;

      // Mock import.meta.env without required variable
      vi.stubGlobal('import', {
        meta: {
          env: envWithoutUrl,
        },
      });

      // Re-import environment module to test validation
      expect(() => {
        const envModule = require('../../lib/environment');
        // Access the environment to trigger validation
        const { environment: env } = envModule;
        expect(env).toBeDefined(); // This will trigger the validation
      }).toThrow();onfiguration and validation
 */

import { describe, expect, it, vi } from 'vitest';
import { generateTestSecret } from '../../lib/security/testSecrets';
import { environment } from '../../lib/environment';

// Mock environment variables
const mockEnv = {
  VITE_SUPABASE_URL: 'https://test-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_CSRF_SECRET: generateTestSecret('csrf'),
  VITE_APP_NAME: 'Test App',
  VITE_APP_VERSION: '1.0.0',
  VITE_APP_MODE: 'test',
  VITE_APP_DEBUG: 'false',
  VITE_ENABLE_PWA: 'true',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_ENABLE_OCR: 'true',
  VITE_ENABLE_DEMO_MODE: 'false',
  VITE_ENABLE_OFFLINE_MODE: 'true',
  VITE_LOG_LEVEL: 'error',
  VITE_LOG_CONSOLE: 'true',
  VITE_LOG_ERROR_TRACKING: 'true',
  VITE_LOG_PERFORMANCE: 'false',
};

describe('Environment Service', () => {
  beforeEach(() => {
    // Mock import.meta.env
    vi.stubGlobal('import', {
      meta: {
        env: mockEnv,
      },
    });
  });

  describe('Environment Configuration', () => {
    it('should have valid app configuration', () => {
      expect(environment.app.name).toBe('Test App');
      expect(environment.app.version).toBe('1.0.0');
      expect(environment.app.mode).toBe('development');
      expect(environment.app.debug).toBe(false);
    });

    it('should have valid Supabase configuration', () => {
      expect(environment.supabase.url).toBe('https://test-project.supabase.co');
      expect(environment.supabase.anonKey).toBe('test-anon-key');
      expect(environment.supabase.serviceRoleKey).toBeUndefined();
    });

    it('should have valid feature flags', () => {
      expect(environment.features.pwa).toBe(true);
      expect(environment.features.analytics).toBe(false);
      expect(environment.features.monitoring).toBe(true);
      expect(environment.features.demoMode).toBe(false);
      expect(environment.features.offlineMode).toBe(true);
    });

    it('should have valid security configuration', () => {
      expect(environment.security.csp).toBe(true);
      expect(environment.security.hsts).toBe(true);
      expect(environment.security.xssProtection).toBe(true);
      expect(environment.security.contentTypeOptions).toBe(true);
    });

    it('should have valid logging configuration', () => {
      expect(environment.logging.level).toBe('error');
      expect(environment.logging.console).toBe(true);
      expect(environment.logging.errorTracking).toBe(true);
      expect(environment.logging.performanceLogging).toBe(false);
    });
  });

  describe('Environment Validation', () => {
    it('should throw error for missing required variables', () => {
      // Create a copy without the required variable
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { VITE_SUPABASE_URL: _removedUrl, ..._envWithoutUrl } = mockEnv;

      // Mock import.meta.env without required variable
      vi.stubGlobal('import', {
        meta: {
          env: mockEnv,
        },
      });

      // This should throw an error
      expect(() => {
        const envModule = require('../../lib/environment');
        // Access the environment to trigger validation
        const { environment: env } = envModule;
        expect(env).toBeDefined(); // This will trigger the validation
      }).toThrow();
    });

    it('should throw error for hardcoded credentials', () => {
      const dangerousEnv = {
        ...mockEnv,
        VITE_SUPABASE_URL: 'https://hardcoded-test-url.supabase.co',
        VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test',
      };

      vi.stubGlobal('import', {
        meta: {
          env: dangerousEnv,
        },
      });

      // This should throw an error
      expect(() => {
        const envModule = require('../../lib/environment');
        // Access the environment to trigger validation
        const { environment: env } = envModule;
        expect(env).toBeDefined(); // This will trigger the validation
      }).toThrow('KRİTİK GÜVENLİK AÇIĞI');
    });
  });

  describe('Type Safety', () => {
    it('should have correct TypeScript types', () => {
      // Test that all required properties exist and have correct types
      expect(typeof environment.app.name).toBe('string');
      expect(typeof environment.app.version).toBe('string');
      expect(typeof environment.app.mode).toBe('string');
      expect(typeof environment.app.debug).toBe('boolean');

      expect(typeof environment.supabase.url).toBe('string');
      expect(typeof environment.supabase.anonKey).toBe('string');

      expect(typeof environment.features.pwa).toBe('boolean');
      expect(typeof environment.features.analytics).toBe('boolean');
      expect(typeof environment.features.monitoring).toBe('boolean');

      expect(typeof environment.security.csp).toBe('boolean');
      expect(typeof environment.security.hsts).toBe('boolean');
      expect(typeof environment.security.xssProtection).toBe('boolean');
      expect(typeof environment.security.contentTypeOptions).toBe('boolean');

      expect(typeof environment.logging.level).toBe('string');
      expect(typeof environment.logging.console).toBe('boolean');
      expect(typeof environment.logging.errorTracking).toBe('boolean');
      expect(typeof environment.logging.performanceLogging).toBe('boolean');
    });
  });

  describe('Feature Flag Behavior', () => {
    it('should correctly parse boolean environment variables', () => {
      expect(environment.features.pwa).toBe(true);
      expect(environment.features.analytics).toBe(false);
      expect(environment.features.demoMode).toBe(false);
    });

    it('should handle string boolean values', () => {
      // Test with string values
      const stringEnv = {
        ...mockEnv,
        VITE_ENABLE_PWA: 'false',
        VITE_APP_DEBUG: 'true',
      };

      vi.stubGlobal('import', {
        meta: {
          env: stringEnv,
        },
      });

      // Re-import to test string parsing
      const envModule = require('../../lib/environment');
      expect(envModule.environment.features.pwa).toBe(false);
      expect(envModule.environment.app.debug).toBe(true);
    });
  });

  describe('Security Features', () => {
    it('should have security features enabled by default', () => {
      expect(environment.security.csp).toBe(true);
      expect(environment.security.hsts).toBe(true);
      expect(environment.security.xssProtection).toBe(true);
      expect(environment.security.contentTypeOptions).toBe(true);
    });

    it('should disable security features when explicitly set to false', () => {
      const insecureEnv = {
        ...mockEnv,
        VITE_CSP_ENABLE: 'false',
        VITE_HSTS_ENABLE: 'false',
      };

      vi.stubGlobal('import', {
        meta: {
          env: insecureEnv,
        },
      });

      const envModule = require('../../lib/environment');
      expect(envModule.environment.security.csp).toBe(false);
      expect(envModule.environment.security.hsts).toBe(false);
    });
  });

  describe('Logging Configuration', () => {
    it('should have appropriate log levels', () => {
      const validLogLevels = ['debug', 'info', 'warn', 'error'];
      expect(validLogLevels).toContain(environment.logging.level);
    });

    it('should handle different log level configurations', () => {
      const debugEnv = {
        ...mockEnv,
        VITE_LOG_LEVEL: 'debug',
      };

      vi.stubGlobal('import', {
        meta: {
          env: debugEnv,
        },
      });

      const envModule = require('../../lib/environment');
      expect(envModule.environment.logging.level).toBe('debug');
    });
  });
});
