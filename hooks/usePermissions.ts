/**
 * @fileoverview usePermissions Module - Unified permission management hooks
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 2.0.0
 *
 * @description
 * Consolidated permission hooks including usePermissions, usePermission, useRole, and useUserRole
 * This module replaces the old separate usePermission.ts file
 */

import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Permission, UserRole } from '../types/auth';
import { rolesService } from '../services/rolesService';

// ============================================================================
// MAIN PERMISSIONS HOOK
// ============================================================================

/**
 * Main permissions hook - comprehensive permission management
 *
 * @returns Object with permission checking utilities
 */
export function usePermissions() {
  const {
    user,
    hasRole,
    hasPermission: hasPermissionFn,
    checkPermission: checkPermissionFn,
  } = useAuthStore() as any;
  const check = (permission: Permission): boolean => {
    const fn = checkPermissionFn ?? hasPermissionFn;
    return typeof fn === 'function' ? fn(permission) : false;
  };

  const canView = (permission: Permission): boolean => {
    return check(permission);
  };

  const canCreate = (permission: Permission): boolean => {
    return check(permission);
  };

  const canEdit = (permission: Permission): boolean => {
    return check(permission);
  };

  const canDelete = (permission: Permission): boolean => {
    return check(permission);
  };

  const isAdmin = (): boolean => {
    return hasRole(UserRole.ADMIN);
  };

  const isManager = (): boolean => {
    return hasRole(UserRole.MANAGER) || isAdmin();
  };

  const isOperator = (): boolean => {
    return hasRole(UserRole.OPERATOR) || isManager();
  };

  const isViewer = (): boolean => {
    return hasRole(UserRole.VIEWER) || isOperator();
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.some((role) => hasRole(role));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => check(permission));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => check(permission));
  };

  const getUserDisplayName = (): string => {
    return user?.name ?? 'Kullanıcı';
  };

  const getUserRole = (): string => {
    if (!user) return 'Misafir';

    switch (user.role) {
      case UserRole.ADMIN:
        return 'Sistem Yöneticisi';
      case UserRole.MANAGER:
        return 'Dernek Müdürü';
      case UserRole.OPERATOR:
        return 'Operatör';
      case UserRole.VIEWER:
        return 'Görüntüleyici';
      default:
        return 'Bilinmeyen';
    }
  };

  const getPermissionScope = () => {
    if (!user) return 'none';

    const permissionCount = user.permissions.length;
    const totalPermissions = Object.keys(Permission).length;
    const percentage = (permissionCount / totalPermissions) * 100;

    if (percentage >= 90) return 'full';
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    if (percentage >= 20) return 'limited';
    return 'restricted';
  };

  return {
    user,
    canView,
    canCreate,
    canEdit,
    canDelete,
    isAdmin,
    isManager,
    isOperator,
    isViewer,
    hasAnyRole,
    hasAllPermissions,
    hasAnyPermission,
    getUserDisplayName,
    getUserRole,
    getPermissionScope,
    checkPermission: check,
    hasRole,
  };
}

// ============================================================================
// INDIVIDUAL PERMISSION HOOKS (from old usePermission.ts)
// ============================================================================

/**
 * Hook to check if current user has a specific permission
 *
 * @param resource - Resource name (e.g., 'donations', 'members')
 * @param action - Action name (e.g., 'read', 'write', 'approve', 'delete')
 * @returns boolean indicating if user has the permission
 *
 * @example
 * const canApprove = usePermission('donations', 'approve');
 * const canDelete = usePermission('members', 'delete');
 *
 * if (canApprove) {
 *   return <button>Onayla</button>;
 * }
 */
export const usePermission = (resource: string, action = 'read'): boolean => {
  const [hasPermission, setHasPermission] = useState(false);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const checkPermission = async () => {
      if (!user?.id) {
        setHasPermission(false);
        return;
      }

      try {
        const permission = await rolesService.hasPermission(user.id, `${resource}:${action}`);
        setHasPermission(permission);
      } catch {
        setHasPermission(false);
      }
    };

    checkPermission();
  }, [user?.id, resource, action]);

  return hasPermission;
};

/**
 * Hook to check if current user has specific role
 *
 * @param roles - Role name(s) to check (string or array)
 * @returns boolean indicating if user has one of the roles
 *
 * @example
 * const isAdmin = useRole('admin');
 * const isAdminOrManager = useRole(['admin', 'manager', 'yönetici', 'müdür']);
 */
export const useRole = (roles: string | string[]): boolean => {
  const user = useAuthStore((state) => state.user);

  if (!user?.role) {
    return false;
  }

  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.includes(user.role);
};

/**
 * Hook to get current user's role details
 *
 * @returns Role object with permissions
 *
 * @example
 * const { role, permissions, isLoading } = useUserRole();
 */
export const useUserRole = () => {
  const [role, setRole] = useState<any | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await rolesService.getUserRole(user.id);

        if (data) {
          setRole(data);
          // Convert Json[] to string[] safely
          const perms = Array.isArray(data.permissions)
            ? data.permissions.filter((p): p is string => typeof p === 'string')
            : [];
          setPermissions(perms);
        }
      } catch {
        // Silently fail - user will see no permissions
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user?.id]);

  return { role, permissions, isLoading };
};

// Default export for backward compatibility
export default usePermission;
