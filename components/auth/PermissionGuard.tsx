/**
 * @fileoverview PermissionGuard Component - Permission-based rendering guard
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import React from 'react';
import { usePermission, useRole } from '../../hooks/usePermission';
import { Alert, AlertDescription } from '../ui/alert';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  /** Resource to check permission for */
  resource?: string;
  /** Action to check permission for */
  action?: string;
  /** Alternative: specific role(s) required */
  requireRole?: string | string[];
  /** Content to show when permission granted */
  children: React.ReactNode;
  /** Content to show when permission denied (optional) */
  fallback?: React.ReactNode;
  /** Show default "access denied" message if no fallback provided */
  showAccessDenied?: boolean;
}

/**
 * Permission Guard Component
 *
 * Conditionally renders children based on user permissions or roles
 *
 * @example
 * // Check permission
 * <PermissionGuard resource="donations" action="approve">
 *   <button>Onayla</button>
 * </PermissionGuard>
 *
 * @example
 * // Check role
 * <PermissionGuard requireRole={['admin', 'yönetici']}>
 *   <AdminPanel />
 * </PermissionGuard>
 *
 * @example
 * // With custom fallback
 * <PermissionGuard
 *   resource="settings"
 *   action="write"
 *   fallback={<div>Bu özellik sadece yöneticiler için</div>}
 * >
 *   <SettingsEditor />
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  resource,
  action = 'read',
  requireRole,
  children,
  fallback,
  showAccessDenied = false,
}) => {
  // Call hooks unconditionally at the top
  const hasPermission = usePermission(resource || '', action);
  const hasRole = useRole(requireRole || '');

  // Then do conditional logic based on whether resource/role was provided
  const hasAccess = (resource ? hasPermission : true) && (requireRole ? hasRole : true);

  if (!hasAccess) {
    // Show custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show access denied message if enabled
    if (showAccessDenied) {
      return (
        <Alert variant="destructive" className="my-4">
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Bu işlem için yetkiniz bulunmamaktadır.
            {resource && action && (
              <span className="mt-1 block text-sm opacity-75">
                Gerekli yetki: {resource}:{action}
              </span>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    // Default: render nothing
    return null;
  }

  // User has access, render children
  return <>{children}</>;
};

/**
 * Role Guard Component - Simpler version for role-only checks
 *
 * @example
 * <RoleGuard roles="admin">
 *   <AdminFeatures />
 * </RoleGuard>
 */
export const RoleGuard: React.FC<{
  roles: string | string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ roles, children, fallback }) => {
  const hasRole = useRole(roles);

  if (!hasRole) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};

export default PermissionGuard;
