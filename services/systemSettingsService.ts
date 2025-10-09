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

import { supabase } from '../lib/supabase';
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
  private tableName = 'system_settings';

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

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        // If table doesn't exist or no data, return default settings
        if (error.code === 'PGRST116' || error.message.includes('relation') || error.message.includes('does not exist')) {
          logger.warn('System settings table does not exist, returning default settings');
          return {
            data: this.getDefaultSettings(),
            error: 'Sistem ayarları tablosu bulunamadı. Varsayılan ayarlar kullanılıyor.'
          };
        }

        logger.error('Error fetching system settings', error);
        return {
          data: this.getDefaultSettings(),
          error: 'Sistem ayarları yüklenirken bir hata oluştu'
        };
      }

      if (!data) {
        logger.info('No system settings found, returning defaults');
        return {
          data: this.getDefaultSettings(),
          error: null
        };
      }

      // Parse JSON fields and merge with defaults
      const defaults = this.getDefaultSettings();
      const settings: SystemSettings = {
        general: { ...defaults.general, ...(data.general || {}) },
        notifications: { ...defaults.notifications, ...(data.notifications || {}) },
        security: { ...defaults.security, ...(data.security || {}) },
        database: { ...defaults.database, ...(data.database || {}) }
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
        id: 1,
        general: settings.general,
        notifications: settings.notifications,
        security: settings.security,
        database: settings.database,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null
      };

      const { error } = await supabase
        .from(this.tableName)
        .upsert(updateData, { onConflict: 'id' });

      if (error) {
        // If table doesn't exist, provide helpful error message
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          logger.error('System settings table does not exist', error);
          return {
            data: null,
            error: 'Sistem ayarları tablosu bulunamadı. Lütfen veritabanı migrasyonunu çalıştırın.'
          };
        }

        logger.error('Error updating system settings', error);
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
