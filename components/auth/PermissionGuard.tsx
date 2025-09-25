/**
 * @fileoverview PermissionGuard Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { ReactNode } from 'react';
import { Permission, UserRole } from '../../types/auth';
import { usePermissions } from '../../hooks/usePermissions';
import { UnauthorizedPage } from './UnauthorizedPage';
import { Alert, AlertDescription } from '../ui/alert';
import { ShieldX } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: Permission;
  role?: UserRole;
  permissions?: Permission[];
  roles?: UserRole[];
  requireAll?: boolean; // true for AND, false for OR logic
  fallback?: ReactNode;
  showAlert?: boolean; // Show inline alert instead of full page
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
  role,
  permissions,
  roles,
  requireAll = true,
  fallback,
  showAlert = false,
}: PermissionGuardProps) {
  const { checkPermission, hasRole, hasAllPermissions, hasAnyPermission, hasAnyRole } =
    usePermissions();

  // Check single permission
  if (permission && !checkPermission(permission)) {
    return (
      fallback ||
      (showAlert ? (
        <PermissionAlert permission={permission} />
      ) : (
        <UnauthorizedPage requiredPermission={permission} />
      ))
    );
  }

  // Check single role
  if (role && !hasRole(role)) {
    return (
      fallback || (showAlert ? <RoleAlert role={role} /> : <UnauthorizedPage requiredRole={role} />)
    );
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);

    if (!hasAccess) {
      return (
        fallback ||
        (showAlert ? (
          <PermissionsAlert permissions={permissions} requireAll={requireAll} />
        ) : (
          <UnauthorizedPage requiredPermission={permissions[0]} />
        ))
      );
    }
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    const hasAccess = requireAll ? roles.every((r) => hasRole(r)) : hasAnyRole(roles);

    if (!hasAccess) {
      return (
        fallback ||
        (showAlert ? (
          <RolesAlert roles={roles} requireAll={requireAll} />
        ) : (
          <UnauthorizedPage requiredRole={roles[0]} />
        ))
      );
    }
  }

  return <>{children}</>;
}

// Inline alert components
function PermissionAlert({ permission }: { permission: Permission }) {
  return (
    <Alert variant="destructive" className="m-4">
      <ShieldX className="h-4 w-4" />
      <AlertDescription>
        Bu işlem için <strong>{getPermissionLabel(permission)}</strong> izni gerekli.
      </AlertDescription>
    </Alert>
  );
}

function RoleAlert({ role }: { role: UserRole }) {
  return (
    <Alert variant="destructive" className="m-4">
      <ShieldX className="h-4 w-4" />
      <AlertDescription>
        Bu işlem için <strong>{getRoleLabel(role)}</strong> rolü gerekli.
      </AlertDescription>
    </Alert>
  );
}

function PermissionsAlert({
  permissions,
  requireAll,
}: {
  permissions: Permission[];
  requireAll: boolean;
}) {
  return (
    <Alert variant="destructive" className="m-4">
      <ShieldX className="h-4 w-4" />
      <AlertDescription>
        Bu işlem için {requireAll ? 'tüm' : 'en az bir'} izin gerekli:
        <ul className="mt-2 list-disc list-inside">
          {permissions.map((p) => (
            <li key={p} className="text-sm">
              {getPermissionLabel(p)}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

function RolesAlert({ roles, requireAll }: { roles: UserRole[]; requireAll: boolean }) {
  return (
    <Alert variant="destructive" className="m-4">
      <ShieldX className="h-4 w-4" />
      <AlertDescription>
        Bu işlem için {requireAll ? 'tüm' : 'en az bir'} rol gerekli:
        <ul className="mt-2 list-disc list-inside">
          {roles.map((r) => (
            <li key={r} className="text-sm">
              {getRoleLabel(r)}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}

// Helper functions
function getPermissionLabel(permission: Permission): string {
  const labels: Record<Permission, string> = {
    [Permission.VIEW_DASHBOARD]: 'Dashboard Görüntüleme',
    [Permission.VIEW_DONATIONS]: 'Bağışları Görüntüleme',
    [Permission.CREATE_DONATION]: 'Bağış Oluşturma',
    [Permission.EDIT_DONATION]: 'Bağış Düzenleme',
    [Permission.DELETE_DONATION]: 'Bağış Silme',
    [Permission.VIEW_MEMBERS]: 'Üyeleri Görüntüleme',
    [Permission.CREATE_MEMBER]: 'Üye Oluşturma',
    [Permission.EDIT_MEMBER]: 'Üye Düzenleme',
    [Permission.DELETE_MEMBER]: 'Üye Silme',
    [Permission.VIEW_AID]: 'Yardımları Görüntüleme',
    [Permission.CREATE_AID]: 'Yardım Oluşturma',
    [Permission.EDIT_AID]: 'Yardım Düzenleme',
    [Permission.DELETE_AID]: 'Yardım Silme',
    [Permission.APPROVE_AID]: 'Yardım Onaylama',
    [Permission.VIEW_FINANCE]: 'Finansı Görüntüleme',
    [Permission.CREATE_FINANCE]: 'Finans Kaydı Oluşturma',
    [Permission.EDIT_FINANCE]: 'Finans Düzenleme',
    [Permission.DELETE_FINANCE]: 'Finans Silme',
    [Permission.VIEW_MESSAGES]: 'Mesajları Görüntüleme',
    [Permission.SEND_MESSAGES]: 'Mesaj Gönderme',
    [Permission.VIEW_EVENTS]: 'Etkinlikleri Görüntüleme',
    [Permission.CREATE_EVENT]: 'Etkinlik Oluşturma',
    [Permission.EDIT_EVENT]: 'Etkinlik Düzenleme',
    [Permission.DELETE_EVENT]: 'Etkinlik Silme',
    [Permission.VIEW_SETTINGS]: 'Ayarları Görüntüleme',
    [Permission.EDIT_SETTINGS]: 'Ayarları Düzenleme',
    [Permission.VIEW_USERS]: 'Kullanıcıları Görüntüleme',
    [Permission.CREATE_USER]: 'Kullanıcı Oluşturma',
    [Permission.EDIT_USER]: 'Kullanıcı Düzenleme',
    [Permission.DELETE_USER]: 'Kullanıcı Silme',
    [Permission.VIEW_REPORTS]: 'Raporları Görüntüleme',
    [Permission.EXPORT_REPORTS]: 'Rapor Dışa Aktarma',
  };

  return labels[permission] ?? permission;
}

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Sistem Yöneticisi',
    [UserRole.MANAGER]: 'Dernek Müdürü',
    [UserRole.OPERATOR]: 'Operatör',
    [UserRole.VIEWER]: 'Görüntüleyici',
  };

  return labels[role] ?? role;
}

// Convenience components
/**
 * AdminOnly function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function AdminOnly({
  children,
  fallback,
  showAlert,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  showAlert?: boolean;
}) {
  return (
    <PermissionGuard role={UserRole.ADMIN} fallback={fallback} showAlert={showAlert}>
      {children}
    </PermissionGuard>
  );
}

/**
 * ManagerOnly function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function ManagerOnly({
  children,
  fallback,
  showAlert,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  showAlert?: boolean;
}) {
  return (
    <PermissionGuard
      roles={[UserRole.ADMIN, UserRole.MANAGER]}
      requireAll={false}
      fallback={fallback}
      showAlert={showAlert}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * OperatorOnly function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function OperatorOnly({
  children,
  fallback,
  showAlert,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  showAlert?: boolean;
}) {
  return (
    <PermissionGuard
      roles={[UserRole.ADMIN, UserRole.MANAGER, UserRole.OPERATOR]}
      requireAll={false}
      fallback={fallback}
      showAlert={showAlert}
    >
      {children}
    </PermissionGuard>
  );
}
