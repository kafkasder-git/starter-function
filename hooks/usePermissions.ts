/**
 * @fileoverview usePermissions Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useAuth } from '../contexts/AuthContext';
import { Permission, UserRole } from '../types/auth';

/**
 * usePermissions function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function usePermissions() {
  const { user, checkPermission, hasRole } = useAuth();

  const canView = (permission: Permission): boolean => {
    return checkPermission(permission);
  };

  const canCreate = (permission: Permission): boolean => {
    return checkPermission(permission);
  };

  const canEdit = (permission: Permission): boolean => {
    return checkPermission(permission);
  };

  const canDelete = (permission: Permission): boolean => {
    return checkPermission(permission);
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
    return permissions.every((permission) => checkPermission(permission));
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => checkPermission(permission));
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
    checkPermission,
    hasRole,
  };
}
