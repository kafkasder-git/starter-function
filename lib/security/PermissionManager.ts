/**
 * @fileoverview PermissionManager Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { logger } from '../lib/logging/logger';
/**
 * Role-Based Access Control (RBAC) System
 * Manages user roles, permissions, and access control
 */

export type Permission =
  | 'read:beneficiaries'
  | 'write:beneficiaries'
  | 'delete:beneficiaries'
  | 'read:donations'
  | 'write:donations'
  | 'delete:donations'
  | 'read:members'
  | 'write:members'
  | 'delete:members'
  | 'read:reports'
  | 'write:reports'
  | 'read:settings'
  | 'write:settings'
  | 'admin:users'
  | 'admin:system'
  | 'admin:security';

export type UserRole = 'super_admin' | 'admin' | 'manager' | 'operator' | 'viewer' | 'volunteer';

// Role hierarchy and permissions
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  manager: 60,
  operator: 40,
  viewer: 20,
  volunteer: 10,
};

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'read:beneficiaries',
    'write:beneficiaries',
    'delete:beneficiaries',
    'read:donations',
    'write:donations',
    'delete:donations',
    'read:members',
    'write:members',
    'delete:members',
    'read:reports',
    'write:reports',
    'read:settings',
    'write:settings',
    'admin:users',
    'admin:system',
    'admin:security',
  ],

  admin: [
    'read:beneficiaries',
    'write:beneficiaries',
    'delete:beneficiaries',
    'read:donations',
    'write:donations',
    'delete:donations',
    'read:members',
    'write:members',
    'delete:members',
    'read:reports',
    'write:reports',
    'read:settings',
    'write:settings',
    'admin:users',
  ],

  manager: [
    'read:beneficiaries',
    'write:beneficiaries',
    'read:donations',
    'write:donations',
    'read:members',
    'write:members',
    'read:reports',
    'write:reports',
    'read:settings',
  ],

  operator: [
    'read:beneficiaries',
    'write:beneficiaries',
    'read:donations',
    'write:donations',
    'read:members',
    'read:reports',
  ],

  viewer: ['read:beneficiaries', 'read:donations', 'read:members', 'read:reports'],

  volunteer: ['read:beneficiaries', 'read:donations'],
};

/**
 * PermissionManager Service
 * 
 * Service class for handling permissionmanager operations
 * 
 * @class PermissionManager
 */
export class PermissionManager {
  private static currentUser: { role: UserRole; permissions: Permission[] } | null = null;

  static setCurrentUser(role: UserRole, customPermissions?: Permission[]): void {
    this.currentUser = {
      role,
      permissions: customPermissions ?? ROLE_PERMISSIONS[role] || [],
    };
  }

  static getCurrentUser(): { role: UserRole; permissions: Permission[] } | null {
    return this.currentUser;
  }

  static hasPermission(permission: Permission): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.permissions.includes(permission);
  }

  static hasRole(role: UserRole): boolean {
    if (!this.currentUser) return false;
    return this.currentUser.role === role;
  }

  static hasMinimumRole(minimumRole: UserRole): boolean {
    if (!this.currentUser) return false;

    const currentLevel = ROLE_HIERARCHY[this.currentUser.role];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    return currentLevel >= requiredLevel;
  }

  static canAccess(resource: string, action: 'read' | 'write' | 'delete'): boolean {
    const permission: Permission = `${action}:${resource}` as Permission;
    return this.hasPermission(permission);
  }

  static canManage(resource: 'users' | 'system' | 'security'): boolean {
    const permission: Permission = `admin:${resource}` as Permission;
    return this.hasPermission(permission);
  }

  static getAccessibleResources(): string[] {
    if (!this.currentUser) return [];

    const resources = new Set<string>();

    this.currentUser.permissions.forEach((permission) => {
      const [action, resource] = permission.split(':');
      if (resource) {
        resources.add(resource);
      }
    });

    return Array.from(resources);
  }

  static getPermissionsByResource(resource: string): string[] {
    if (!this.currentUser) return [];

    return this.currentUser.permissions
      .filter((permission) => permission.endsWith(`:${resource}`))
      .map((permission) => permission.split(':')[0]);
  }

  static requirePermission(permission: Permission): void {
    if (!this.hasPermission(permission)) {
      throw new Error(`Bu işlem için '${permission}' yetkisi gereklidir`);
    }
  }

  static requireRole(role: UserRole): void {
    if (!this.hasRole(role)) {
      throw new Error(`Bu işlem için '${role}' rolü gereklidir`);
    }
  }

  static requireMinimumRole(minimumRole: UserRole): void {
    if (!this.hasMinimumRole(minimumRole)) {
      throw new Error(`Bu işlem için en az '${minimumRole}' rolü gereklidir`);
    }
  }
}

// Permission decorators for functions
/**
 * requirePermission function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function requirePermission(permission: Permission) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      PermissionManager.requirePermission(permission);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

/**
 * requireRole function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function requireRole(role: UserRole) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      PermissionManager.requireRole(role);
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}

// Audit logging
/**
 * AuditLogger Service
 * 
 * Service class for handling auditlogger operations
 * 
 * @class AuditLogger
 */
export class AuditLogger {
  private static logs: AuditLog[] = [];

  static log(action: string, resource: string, details?: Record<string, any>): void {
    const user = PermissionManager.getCurrentUser();

    const auditLog: AuditLog = {
      id: crypto.getRandomValues(new Uint8Array(16)).join(''),
      timestamp: new Date().toISOString(),
      userId: user?.role ?? 'anonymous',
      action,
      resource,
      details: details || {},
      ip: this.getClientIP(),
      userAgent: navigator.userAgent,
    };

    this.logs.push(auditLog);

    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // In production, send to backend
    if ((typeof import.meta !== 'undefined' && import.meta.env?.PROD) || process.env.NODE_ENV === 'production') {
      this.sendToBackend(auditLog);
    }
  }

  private static getClientIP(): string {
    // This would need to be implemented on the backend
    return 'unknown';
  }

  private static async sendToBackend(log: AuditLog): Promise<void> {
    try {
      // Send audit log to backend API
      await fetch('/api/audit-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });
    } catch (error) {
      logger.error('Failed to send audit log:', error);
    }
  }

  static getLogs(): AuditLog[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }
}

/**
 * AuditLog Interface
 * 
 * @interface AuditLog
 */
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, any>;
  ip: string;
  userAgent: string;
}
