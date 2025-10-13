/**
 * @fileoverview securityConfigManager Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { z } from 'zod';
import { ServiceError, ServiceErrorCode } from '../../services/config';
import {
  DEFAULT_SECURITY_CONFIG,
  type APISecurityConfig,
  type RateLimitConfig,
} from './apiSecurity';

// Configuration validation schemas
const rateLimitConfigSchema = z.object({
  windowMs: z
    .number()
    .min(1000)
    .max(24 * 60 * 60 * 1000), // 1 second to 24 hours
  maxRequests: z.number().min(1).max(10000),
  skipSuccessfulRequests: z.boolean().optional(),
  skipFailedRequests: z.boolean().optional(),
});

const apiSecurityConfigSchema = z.object({
  rateLimiting: z.object({
    global: rateLimitConfigSchema,
    perEndpoint: z.record(z.string(), rateLimitConfigSchema),
    perUser: rateLimitConfigSchema,
  }),

  inputValidation: z.object({
    maxRequestSize: z
      .number()
      .min(1024)
      .max(100 * 1024 * 1024), // 1KB to 100MB
    allowedContentTypes: z.array(z.string()),
    sanitizeInput: z.boolean(),
    validateSchema: z.boolean(),
  }),

  xssProtection: z.object({
    enabled: z.boolean(),
    allowedTags: z.array(z.string()),
    allowedAttributes: z.record(z.string(), z.array(z.string())),
  }),

  csrfProtection: z.object({
    enabled: z.boolean(),
    tokenName: z.string(),
    cookieName: z.string(),
    secure: z.boolean(),
    sameSite: z.enum(['strict', 'lax', 'none']),
  }),

  apiVersioning: z.object({
    currentVersion: z.string(),
    supportedVersions: z.array(z.string()),
    deprecationWarnings: z.boolean(),
    forceLatest: z.boolean(),
  }),
});

// Security configuration presets
export const SECURITY_PRESETS = {
  development: {
    ...DEFAULT_SECURITY_CONFIG,
    rateLimiting: {
      ...DEFAULT_SECURITY_CONFIG.rateLimiting,
      global: {
        ...DEFAULT_SECURITY_CONFIG.rateLimiting.global,
        maxRequests: 10000, // More lenient for development
      },
    },
    csrfProtection: {
      ...DEFAULT_SECURITY_CONFIG.csrfProtection,
      enabled: false, // Disabled for easier development
    },
  } as APISecurityConfig,

  testing: {
    ...DEFAULT_SECURITY_CONFIG,
    rateLimiting: {
      ...DEFAULT_SECURITY_CONFIG.rateLimiting,
      global: {
        ...DEFAULT_SECURITY_CONFIG.rateLimiting.global,
        maxRequests: 50000, // Very lenient for testing
      },
    },
    inputValidation: {
      ...DEFAULT_SECURITY_CONFIG.inputValidation,
      sanitizeInput: false, // May interfere with tests
    },
  } as APISecurityConfig,

  production: {
    ...DEFAULT_SECURITY_CONFIG,
    rateLimiting: {
      ...DEFAULT_SECURITY_CONFIG.rateLimiting,
      global: {
        ...DEFAULT_SECURITY_CONFIG.rateLimiting.global,
        maxRequests: 500, // Stricter for production
      },
      perEndpoint: {
        ...DEFAULT_SECURITY_CONFIG.rateLimiting.perEndpoint,
        '/api/auth/login': {
          windowMs: 15 * 60 * 1000,
          maxRequests: 3, // Very strict for login
        },
        '/api/auth/register': {
          windowMs: 60 * 60 * 1000,
          maxRequests: 5, // Allow reasonable retries for registration
        },
      },
    },
    inputValidation: {
      ...DEFAULT_SECURITY_CONFIG.inputValidation,
      maxRequestSize: 5 * 1024 * 1024, // Smaller max size for production
    },
  } as APISecurityConfig,

  highSecurity: {
    ...DEFAULT_SECURITY_CONFIG,
    rateLimiting: {
      ...DEFAULT_SECURITY_CONFIG.rateLimiting,
      global: {
        ...DEFAULT_SECURITY_CONFIG.rateLimiting.global,
        maxRequests: 100, // Very strict
        windowMs: 5 * 60 * 1000, // Shorter window
      },
      perUser: {
        ...DEFAULT_SECURITY_CONFIG.rateLimiting.perUser,
        maxRequests: 50,
        windowMs: 5 * 60 * 1000,
      },
    },
    inputValidation: {
      ...DEFAULT_SECURITY_CONFIG.inputValidation,
      maxRequestSize: 1 * 1024 * 1024, // 1MB max
      sanitizeInput: true,
      validateSchema: true,
    },
    xssProtection: {
      ...DEFAULT_SECURITY_CONFIG.xssProtection,
      allowedTags: [], // No HTML tags allowed
      allowedAttributes: {},
    },
  } as APISecurityConfig,
};

// Security configuration manager
/**
 * SecurityConfigManager Service
 *
 * Service class for handling securityconfigmanager operations
 *
 * @class SecurityConfigManager
 */
export class SecurityConfigManager {
  private currentConfig: APISecurityConfig;
  private configHistory: { timestamp: number; config: APISecurityConfig; reason: string }[] = [];

  constructor(initialConfig: APISecurityConfig = DEFAULT_SECURITY_CONFIG) {
    this.currentConfig = this.validateConfig(initialConfig);
    this.addToHistory(this.currentConfig, 'Initial configuration');
  }

  // Get current configuration
  getConfig(): APISecurityConfig {
    return { ...this.currentConfig };
  }

  // Update configuration
  updateConfig(newConfig: Partial<APISecurityConfig>, reason = 'Manual update'): APISecurityConfig {
    const mergedConfig = this.mergeConfigs(this.currentConfig, newConfig);
    const validatedConfig = this.validateConfig(mergedConfig);

    this.addToHistory(this.currentConfig, `Before: ${reason}`);
    this.currentConfig = validatedConfig;
    this.addToHistory(this.currentConfig, reason);

    return { ...this.currentConfig };
  }

  // Load preset configuration
  loadPreset(preset: keyof typeof SECURITY_PRESETS, reason?: string): APISecurityConfig {
    const presetConfig = SECURITY_PRESETS[preset];
    if (!presetConfig) {
      throw new ServiceError(
        ServiceErrorCode.VALIDATION_ERROR,
        `Unknown security preset: ${preset}`,
        { availablePresets: Object.keys(SECURITY_PRESETS) }
      );
    }

    this.addToHistory(this.currentConfig, `Before loading preset: ${preset}`);
    this.currentConfig = this.validateConfig(presetConfig);
    this.addToHistory(this.currentConfig, reason || `Loaded preset: ${preset}`);

    return { ...this.currentConfig };
  }

  // Validate configuration
  private validateConfig(config: APISecurityConfig): APISecurityConfig {
    try {
      return apiSecurityConfigSchema.parse(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
        throw new ServiceError(
          ServiceErrorCode.VALIDATION_ERROR,
          `Invalid security configuration: ${messages.join(', ')}`,
          { validationErrors: error.issues }
        );
      }
      throw error;
    }
  }

  // Merge configurations
  private mergeConfigs(
    current: APISecurityConfig,
    update: Partial<APISecurityConfig>
  ): APISecurityConfig {
    return {
      rateLimiting: {
        ...current.rateLimiting,
        ...update.rateLimiting,
        perEndpoint: {
          ...current.rateLimiting.perEndpoint,
          ...update.rateLimiting?.perEndpoint,
        },
      },
      inputValidation: {
        ...current.inputValidation,
        ...update.inputValidation,
      },
      xssProtection: {
        ...current.xssProtection,
        ...update.xssProtection,
        allowedAttributes: {
          ...current.xssProtection.allowedAttributes,
          ...update.xssProtection?.allowedAttributes,
        },
      },
      csrfProtection: {
        ...current.csrfProtection,
        ...update.csrfProtection,
      },
      apiVersioning: {
        ...current.apiVersioning,
        ...update.apiVersioning,
      },
    };
  }

  // Add configuration to history
  private addToHistory(config: APISecurityConfig, reason: string): void {
    this.configHistory.push({
      timestamp: Date.now(),
      config: { ...config },
      reason,
    });

    // Keep only last 50 configurations
    if (this.configHistory.length > 50) {
      this.configHistory = this.configHistory.slice(-50);
    }
  }

  // Get configuration history
  getConfigHistory(): { timestamp: number; reason: string; date: string }[] {
    return this.configHistory.map((entry) => ({
      timestamp: entry.timestamp,
      reason: entry.reason,
      date: new Date(entry.timestamp).toISOString(),
    }));
  }

  // Rollback to previous configuration
  rollback(steps = 1): APISecurityConfig {
    if (this.configHistory.length < steps + 1) {
      throw new ServiceError(
        ServiceErrorCode.VALIDATION_ERROR,
        `Cannot rollback ${steps} steps. Only ${this.configHistory.length - 1} configurations available.`
      );
    }

    const targetConfig = this.configHistory[this.configHistory.length - steps - 1];
    this.currentConfig = { ...targetConfig.config };
    this.addToHistory(this.currentConfig, `Rolled back ${steps} steps`);

    return { ...this.currentConfig };
  }

  // Export configuration
  exportConfig(): string {
    return JSON.stringify(this.currentConfig, null, 2);
  }

  // Import configuration
  importConfig(configJson: string, reason = 'Imported configuration'): APISecurityConfig {
    try {
      const config = JSON.parse(configJson) as APISecurityConfig;
      const validatedConfig = this.validateConfig(config);

      this.addToHistory(this.currentConfig, `Before: ${reason}`);
      this.currentConfig = validatedConfig;
      this.addToHistory(this.currentConfig, reason);

      return { ...this.currentConfig };
    } catch (error) {
      throw new ServiceError(ServiceErrorCode.VALIDATION_ERROR, 'Failed to import configuration', {
        originalError: error,
      });
    }
  }

  // Get configuration diff
  getConfigDiff(otherConfig: APISecurityConfig): Record<string, any> {
    const diff: Record<string, any> = {};

    // Simple diff implementation - can be enhanced
    const compareObjects = (obj1: any, obj2: any, path = ''): void => {
      for (const key in obj1) {
        const currentPath = path ? `${path}.${key}` : key;

        if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
          if (typeof obj2[key] === 'object' && obj2[key] !== null) {
            compareObjects(obj1[key], obj2[key], currentPath);
          } else {
            diff[currentPath] = { current: obj1[key], other: obj2[key] };
          }
        } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
          diff[currentPath] = { current: obj1[key], other: obj2[key] };
        }
      }
    };

    compareObjects(this.currentConfig, otherConfig);
    return diff;
  }

  // Validate rate limit configuration
  validateRateLimitConfig(config: RateLimitConfig): boolean {
    try {
      rateLimitConfigSchema.parse(config);
      return true;
    } catch {
      return false;
    }
  }

  // Get recommended configuration for environment
  getRecommendedConfig(
    environment: 'development' | 'testing' | 'production' | 'high-security'
  ): APISecurityConfig {
    switch (environment) {
      case 'development':
        return SECURITY_PRESETS.development;
      case 'testing':
        return SECURITY_PRESETS.testing;
      case 'production':
        return SECURITY_PRESETS.production;
      case 'high-security':
        return SECURITY_PRESETS.highSecurity;
      default:
        return DEFAULT_SECURITY_CONFIG;
    }
  }
}

// Export singleton instance
export const securityConfigManager = new SecurityConfigManager();
