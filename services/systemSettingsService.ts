/**
 * @fileoverview systemSettingsService Module - System settings management service
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

/*
 * Database Migration Required:
 * 
 * CREATE TABLE IF NOT EXISTS system_settings (
 *   id INTEGER PRIMARY KEY DEFAULT 1,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW(),
 *   general JSONB DEFAULT '{}',
 *   notifications JSONB DEFAULT '{}',
 *   security JSONB DEFAULT '{}',
 *   database JSONB DEFAULT '{}',
 *   updated_by TEXT,
 *   CONSTRAINT single_row CHECK (id = 1)
 * );
 */

import { db, collections, queryHelpers } from '../lib/database';
import { logger } from '../lib/logging/logger';
import { useAuthStore } from '../stores/authStore';

// System settings interfaces
export interface SystemSettings {
  general: {
    organizationName: string;
    organizationAddress: string;
    organizationPhone: string;
    organizationEmail: string;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    auditLogNotifications: boolean;
  };
  security: {
    sessionTimeout: number;
    passwordExpiry: number;
    mfaEnabled: boolean;
    ipWhitelist: string[];
  };
  database: {
    backupFrequency: string;
    dataRetentionDays: number;
    enableArchiving: boolean;
  };
}

export interface SystemSettingsRow {
  id: number;
  created_at: string;
  updated_at: string;
  general: Record<string, any>;
  notifications: Record<string, any>;
  security: Record<string, any>;
  database: Record<string, any>;
  updated_by: string | null;
}

export interface SystemSettingsApiResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * System settings management service class
 */
export class SystemSettingsService {
  private collectionName = collections.SYSTEM_SETTINGS;

  /**
   * Get default settings
   */
  private getDefaultSettings(): SystemSettings {
    return {
      general: {
        organizationName: 'Dernek Yönetim Sistemi',
        organizationAddress: '',
        organizationPhone: '',
        organizationEmail: ''
      },
      notifications: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        auditLogNotifications: true
      },
      security: {
        sessionTimeout: 30,
        passwordExpiry: 90,
        mfaEnabled: false,
        ipWhitelist: []
      },
      database: {
        backupFrequency: 'daily',
        dataRetentionDays: 365,
        enableArchiving: true
      }
    };
  }

  /**
   * Fetch system settings
   */
  async getSettings(): Promise<SystemSettingsApiResponse<SystemSettings>> {
    try {
      logger.info('Fetching system settings');

      const { data, error } = await db.list(this.collectionName, [
        queryHelpers.limit(1)
      ]);

      if (error) {
        logger.error('Error fetching system settings', error);
        return {
          data: this.getDefaultSettings(),
          error: 'Sistem ayarları yüklenirken bir hata oluştu'
        };
      }

      const settingsData = data?.documents?.[0];
      if (!settingsData) {
        logger.info('No system settings found, returning defaults');
        return {
          data: this.getDefaultSettings(),
          error: null
        };
      }

      // Parse JSON fields and merge with defaults
      const defaults = this.getDefaultSettings();
      const settings: SystemSettings = {
        general: { ...defaults.general, ...(settingsData.general || {}) },
        notifications: { ...defaults.notifications, ...(settingsData.notifications || {}) },
        security: { ...defaults.security, ...(settingsData.security || {}) },
        database: { ...defaults.database, ...(settingsData.database || {}) }
      };

      logger.info('Successfully fetched system settings');

      return {
        data: settings,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error fetching system settings', error);
      return {
        data: this.getDefaultSettings(),
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Update system settings
   */
  async updateSettings(settings: SystemSettings): Promise<SystemSettingsApiResponse<boolean>> {
    try {
      logger.info('Updating system settings');

      const user = useAuthStore.getState().user;
      const updateData = {
        general: settings.general,
        notifications: settings.notifications,
        security: settings.security,
        database: settings.database,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null
      };

      // Check if settings document exists
      const { data: existingData } = await db.list(this.collectionName, [
        queryHelpers.limit(1)
      ]);

      let result;
      if (existingData?.documents?.[0]) {
        // Update existing document
        result = await db.update(this.collectionName, existingData.documents[0].$id, updateData);
      } else {
        // Create new document with fixed ID
        result = await db.create(this.collectionName, {
          ...updateData,
          id: 1
        }, 'system-settings-1');
      }

      if (result.error) {
        logger.error('Error updating system settings', result.error);
        return {
          data: null,
          error: 'Sistem ayarları güncellenirken bir hata oluştu'
        };
      }

      logger.info('Successfully updated system settings');

      return {
        data: true,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error updating system settings', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<SystemSettingsApiResponse<boolean>> {
    try {
      logger.info('Resetting system settings to defaults');

      const defaultSettings = this.getDefaultSettings();
      const result = await this.updateSettings(defaultSettings);

      if (result.error) {
        return result;
      }

      logger.info('Successfully reset system settings');

      return {
        data: true,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error resetting system settings', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Get default settings (public method)
   */
  getDefaultSettingsPublic(): SystemSettings {
    return this.getDefaultSettings();
  }
}

// Export singleton instance
export const systemSettingsService = new SystemSettingsService();
export default systemSettingsService;
