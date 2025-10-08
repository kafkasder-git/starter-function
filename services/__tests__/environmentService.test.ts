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

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { environment } from '../../lib/environment';

// Mock environment variables
const mockEnv = {
  MODE: 'test',
  VITE_SUPABASE_URL: 'https://test-project.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_CSRF_SECRET: 'test-csrf-secret-key',
  VITE_APP_NAME: 'Test App',
  VITE_APP_VERSION: '1.0.0',
  VITE_APP_DEBUG: 'false',
  VITE_ENABLE_PWA: 'true',
  VITE_ENABLE_ANALYTICS: 'false',
  VITE_ENABLE_OCR: 'true',
  VITE_ENABLE_MOCK_DATA: 'false',
  VITE_ENABLE_OFFLINE_MODE: 'true',
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
      expect(environment.app.name).toBeDefined();
      expect(environment.app.version).toBeDefined();
      expect(typeof environment.app.name).toBe('string');
      expect(typeof environment.app.version).toBe('string');
      expect(typeof environment.app.debug).toBe('boolean');
    });

    it('should have valid Supabase configuration', () => {
      expect(environment.supabase.url).toBeDefined();
      expect(environment.supabase.anonKey).toBeDefined();
      expect(typeof environment.supabase.url).toBe('string');
      expect(typeof environment.supabase.anonKey).toBe('string');
    });

    it('should have valid feature flags', () => {
      expect(typeof environment.features.pwa).toBe('boolean');
      expect(typeof environment.features.analytics).toBe('boolean');
      expect(typeof environment.features.ocr).toBe('boolean');
      expect(typeof environment.features.mockData).toBe('boolean');
      expect(typeof environment.features.offlineMode).toBe('boolean');
    });

    it('should have valid security configuration', () => {
      expect(typeof environment.security.sessionTimeout).toBe('number');
      expect(typeof environment.security.rateLimit).toBe('number');
      expect(environment.security.sessionTimeout).toBeGreaterThan(0);
      expect(environment.security.rateLimit).toBeGreaterThan(0);
    });
  });

  describe('Environment Validation', () => {
    it('should validate required environment variables', () => {
      const { validateEnvironment } = require('../../lib/environment');
      const result = validateEnvironment();
      
      expect(result).toBeDefined();
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe('Type Safety', () => {
    it('should have correct TypeScript types', () => {
      // Test that all required properties exist and have correct types
      expect(typeof environment.app.name).toBe('string');
      expect(typeof environment.app.version).toBe('string');
      expect(typeof environment.mode).toBe('string');
      expect(typeof environment.app.debug).toBe('boolean');

      expect(typeof environment.supabase.url).toBe('string');
      expect(typeof environment.supabase.anonKey).toBe('string');

      expect(typeof environment.features.pwa).toBe('boolean');
      expect(typeof environment.features.analytics).toBe('boolean');
      expect(typeof environment.features.ocr).toBe('boolean');
      expect(typeof environment.features.mockData).toBe('boolean');
      expect(typeof environment.features.offlineMode).toBe('boolean');

      expect(typeof environment.security.sessionTimeout).toBe('number');
      expect(typeof environment.security.rateLimit).toBe('number');
    });
  });

  describe('Feature Flag Behavior', () => {
    it('should correctly parse boolean environment variables', () => {
      expect(typeof environment.features.pwa).toBe('boolean');
      expect(typeof environment.features.analytics).toBe('boolean');
      expect(typeof environment.features.mockData).toBe('boolean');
    });
  });

  describe('Security Features', () => {
    it('should have security configuration', () => {
      expect(environment.security).toBeDefined();
      expect(typeof environment.security.sessionTimeout).toBe('number');
      expect(typeof environment.security.rateLimit).toBe('number');
      expect(environment.security.sessionTimeout).toBeGreaterThan(0);
    });
  });

  describe('Helper Functions', () => {
    it('should provide environment helper functions', () => {
      const { isProduction, isDevelopment, isTest, getEnvironmentInfo } = require('../../lib/environment');
      
      expect(typeof isProduction).toBe('function');
      expect(typeof isDevelopment).toBe('function');
      expect(typeof isTest).toBe('function');
      expect(typeof getEnvironmentInfo).toBe('function');
      
      const info = getEnvironmentInfo();
      expect(info).toBeDefined();
      expect(info.mode).toBeDefined();
    });
  });
});
