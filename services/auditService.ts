/**
 * @fileoverview Audit Service - Audit logging and tracking
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { db, collections, queryHelpers } from '../lib/database';
import { logger } from '../lib/logging/logger';

/**
 * Audit log event types
 */
export enum AuditEventType {
  // Authentication
  LOGIN = 'login',
  LOGOUT = 'logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_RESET = 'password_reset',

  // CRUD Operations
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  SOFT_DELETE = 'soft_delete',
  RESTORE = 'restore',

  // Financial
  PAYMENT_CREATED = 'payment_created',
  PAYMENT_APPROVED = 'payment_approved',
  PAYMENT_REJECTED = 'payment_rejected',
  DONATION_RECEIVED = 'donation_received',

  // Aid Management
  AID_REQUEST_CREATED = 'aid_request_created',
  AID_REQUEST_APPROVED = 'aid_request_approved',
  AID_REQUEST_REJECTED = 'aid_request_rejected',
  AID_DISTRIBUTED = 'aid_distributed',

  // Data Export/Import
  DATA_EXPORTED = 'data_exported',
  DATA_IMPORTED = 'data_imported',

  // System
  SETTINGS_CHANGED = 'settings_changed',
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  ROLE_CHANGED = 'role_changed',
  PERMISSION_CHANGED = 'permission_changed',

  // Access
  ACCESS_DENIED = 'access_denied',
  UNAUTHORIZED_ACCESS_ATTEMPT = 'unauthorized_access_attempt',
}

/**
 * Audit log severity levels
 */
export enum AuditSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * Audit log entry interface
 */
export interface AuditLog {
  id?: string;
  user_id: string;
  user_email?: string;
  event_type: AuditEventType;
  severity: AuditSeverity;
  resource_type?: string;
  resource_id?: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at?: string;
}

/**
 * Audit log filter options
 */
export interface AuditLogFilter {
  user_id?: string;
  event_type?: AuditEventType;
  severity?: AuditSeverity;
  resource_type?: string;
  start_date?: Date;
  end_date?: Date;
  limit?: number;
  offset?: number;
}

/**
 * Audit Service class
 */
class AuditService {
  private readonly collectionName = collections.AUDIT_LOGS;
  private readonly retentionDays = 90; // Keep logs for 90 days

  /**
   * Create an audit log entry
   */
  async log(entry: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
    try {
      // Add browser information
      const enrichedEntry = {
        ...entry,
        ip_address: entry.ip_address || this.getClientIP(),
        user_agent: entry.user_agent || navigator.userAgent,
        created_at: new Date().toISOString(),
      };

      // Log to console in development
      if (import.meta.env.DEV) {
        logger.info('Audit Log:', enrichedEntry);
      }

      // Store in Appwrite
      const { error } = await db.create(this.collectionName, enrichedEntry);

      if (error) {
        logger.error('Failed to create audit log:', error);
        // Fallback to local storage if Appwrite fails
        this.logToLocalStorage(enrichedEntry);
      }
    } catch (error) {
      logger.error('Audit log error:', error);
      // Fallback to local storage
      this.logToLocalStorage(entry);
    }
  }

  /**
   * Log successful login
   */
  async logLogin(userId: string, userEmail: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_email: userEmail,
      event_type: AuditEventType.LOGIN,
      severity: AuditSeverity.INFO,
      action: 'User logged in successfully',
      details: {
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log failed login attempt
   */
  async logLoginFailed(email: string, reason: string): Promise<void> {
    await this.log({
      user_id: 'unknown',
      user_email: email,
      event_type: AuditEventType.LOGIN_FAILED,
      severity: AuditSeverity.WARNING,
      action: 'Failed login attempt',
      details: {
        email,
        reason,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log logout
   */
  async logLogout(userId: string, userEmail: string): Promise<void> {
    await this.log({
      user_id: userId,
      user_email: userEmail,
      event_type: AuditEventType.LOGOUT,
      severity: AuditSeverity.INFO,
      action: 'User logged out',
    });
  }

  /**
   * Log CRUD operation
   */
  async logCRUD(
    userId: string,
    userEmail: string,
    operation: 'create' | 'read' | 'update' | 'delete',
    resourceType: string,
    resourceId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const eventTypeMap = {
      create: AuditEventType.CREATE,
      read: AuditEventType.READ,
      update: AuditEventType.UPDATE,
      delete: AuditEventType.DELETE,
    };

    await this.log({
      user_id: userId,
      user_email: userEmail,
      event_type: eventTypeMap[operation],
      severity: operation === 'delete' ? AuditSeverity.WARNING : AuditSeverity.INFO,
      resource_type: resourceType,
      resource_id: resourceId,
      action: `${operation.toUpperCase()} ${resourceType}`,
      details,
    });
  }

  /**
   * Log data export
   */
  async logDataExport(
    userId: string,
    userEmail: string,
    resourceType: string,
    recordCount: number,
    format: string
  ): Promise<void> {
    await this.log({
      user_id: userId,
      user_email: userEmail,
      event_type: AuditEventType.DATA_EXPORTED,
      severity: AuditSeverity.WARNING,
      resource_type: resourceType,
      action: `Exported ${recordCount} ${resourceType} records`,
      details: {
        record_count: recordCount,
        format,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Log access denied
   */
  async logAccessDenied(
    userId: string,
    userEmail: string,
    resource: string,
    requiredPermission?: string
  ): Promise<void> {
    await this.log({
      user_id: userId,
      user_email: userEmail,
      event_type: AuditEventType.ACCESS_DENIED,
      severity: AuditSeverity.WARNING,
      action: `Access denied to ${resource}`,
      details: {
        resource,
        required_permission: requiredPermission,
      },
    });
  }

  /**
   * Log settings change
   */
  async logSettingsChange(
    userId: string,
    userEmail: string,
    setting: string,
    oldValue: any,
    newValue: any
  ): Promise<void> {
    await this.log({
      user_id: userId,
      user_email: userEmail,
      event_type: AuditEventType.SETTINGS_CHANGED,
      severity: AuditSeverity.WARNING,
      action: `Changed setting: ${setting}`,
      details: {
        setting,
        old_value: oldValue,
        new_value: newValue,
      },
    });
  }

  /**
   * Get audit logs with filters
   */
  async getLogs(filter: AuditLogFilter = {}): Promise<AuditLog[]> {
    try {
      const queries = [];

      if (filter.user_id) {
        queries.push(queryHelpers.equal('user_id', filter.user_id));
      }

      if (filter.event_type) {
        queries.push(queryHelpers.equal('event_type', filter.event_type));
      }

      if (filter.severity) {
        queries.push(queryHelpers.equal('severity', filter.severity));
      }

      if (filter.resource_type) {
        queries.push(queryHelpers.equal('resource_type', filter.resource_type));
      }

      if (filter.start_date) {
        queries.push(
          queryHelpers.greaterThanEqualDate('created_at', filter.start_date.toISOString())
        );
      }

      if (filter.end_date) {
        queries.push(queryHelpers.lessThanEqualDate('created_at', filter.end_date.toISOString()));
      }

      if (filter.limit) {
        queries.push(queryHelpers.limit(filter.limit));
      }

      if (filter.offset) {
        queries.push(queryHelpers.offset(filter.offset));
      }

      // Order by created_at desc
      queries.push(queryHelpers.orderDesc('created_at'));

      const { data, error } = await db.list(this.collectionName, queries);

      if (error) {
        logger.error('Failed to fetch audit logs:', error);
        return [];
      }

      return data?.documents || [];
    } catch (error) {
      logger.error('Error fetching audit logs:', error);
      return [];
    }
  }

  /**
   * Get audit log statistics
   */
  async getStatistics(days = 30): Promise<Record<string, number>> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const logs = await this.getLogs({
        start_date: startDate,
      });

      const stats: Record<string, number> = {};

      logs.forEach((log) => {
        const key = log.event_type;
        stats[key] = (stats[key] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Error getting audit statistics:', error);
      return {};
    }
  }

  /**
   * Clean up old audit logs
   */
  async cleanup(): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.retentionDays);

      // Get old logs first
      const { data: oldLogs } = await db.list(this.collectionName, [
        queryHelpers.lessThan('created_at', cutoffDate.toISOString()),
      ]);

      if (oldLogs?.documents?.length) {
        // Delete each old log individually (Appwrite doesn't support bulk delete)
        for (const log of oldLogs.documents) {
          await db.delete(this.collectionName, log.$id);
        }
        logger.info(
          `Cleaned up ${oldLogs.documents.length} audit logs older than ${this.retentionDays} days`
        );
      }
    } catch (error) {
      logger.error('Error cleaning up audit logs:', error);
    }
  }

  /**
   * Fallback to local storage if Appwrite fails
   */
  private logToLocalStorage(entry: any): void {
    try {
      const logs = JSON.parse(localStorage.getItem('audit_logs_fallback') || '[]');
      logs.push(entry);

      // Keep only last 100 logs in local storage
      if (logs.length > 100) {
        logs.shift();
      }

      localStorage.setItem('audit_logs_fallback', JSON.stringify(logs));
    } catch (error) {
      logger.error('Failed to log to local storage:', error);
    }
  }

  /**
   * Get client IP address (best effort)
   */
  private getClientIP(): string {
    // In a real application, this would come from the server
    // For now, return a placeholder
    return 'client';
  }
}

// Export singleton instance
export const auditService = new AuditService();

export default auditService;
