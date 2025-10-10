/**
 * @fileoverview ProtectedRoute Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { UserRole, type Permission, ROLE_PERMISSIONS } from '../../types/auth';
import { UnauthorizedPage } from './UnauthorizedPage';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  fallback?: ReactNode;
}

/**
 * ProtectedRoute function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredPermission,
  requiredRole,
  fallback,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  // Get user role from Appwrite user metadata
  const getUserRole = (): UserRole | null => {
    if (!user) return null;

    // Try to get role from user metadata
    const role = user.metadata?.role as UserRole || user.role;
    if (role && Object.values(UserRole).includes(role)) {
      return role;
    }

    // Default to VIEWER if no role is set
    return UserRole.VIEWER;
  };

  const userRole = getUserRole();

  // Check if user has required permission
  const checkPermission = (permission: Permission): boolean => {
    if (!userRole) return false;

    const rolePermissions = ROLE_PERMISSIONS[userRole];
    return rolePermissions.includes(permission);
  };

  // Check if user has required role
  const hasRole = (role: UserRole): boolean => {
    if (!userRole) return false;

    // Admin has access to all roles
    if (userRole === UserRole.ADMIN) return true;

    // Check exact role match
    if (userRole === role) return true;

    // Manager can access operator and viewer
    if (userRole === UserRole.MANAGER && (role === UserRole.OPERATOR || role === UserRole.VIEWER)) {
      return true;
    }

    // Operator can access viewer
    if (userRole === UserRole.OPERATOR && role === UserRole.VIEWER) {
      return true;
    }

    return false;
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm text-slate-600 animate-pulse">Kimlik doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    return fallback || <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <UnauthorizedPage requiredRole={requiredRole} currentRole={userRole} />;
  }

  // Check permission requirement
  if (requiredPermission && !checkPermission(requiredPermission)) {
    return <UnauthorizedPage requiredPermission={requiredPermission} currentRole={userRole} />;
  }

  return <>{children}</>;
}

// Convenience components for common protection patterns
/**
 * AdminRoute function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRole={UserRole.ADMIN}>{children}</ProtectedRoute>;
}

/**
 * ManagerRoute function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function ManagerRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRole={UserRole.MANAGER}>{children}</ProtectedRoute>;
}

/**
 * PermissionGuard function
 *
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function PermissionGuard({
  children,
  permission,
  fallback,
}: {
  children: ReactNode;
  permission: Permission;
  fallback?: ReactNode;
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return fallback ?? null;
  }

  // Get user role
  const role = user?.metadata?.role as UserRole || user?.role;
  const userRole = role && Object.values(UserRole).includes(role) ? role : UserRole.VIEWER;

  // Check permission
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  const hasPermission = rolePermissions.includes(permission);

  if (!hasPermission) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
