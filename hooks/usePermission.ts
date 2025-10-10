/**
 * @fileoverview usePermission Hook - Permission checking hook
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { rolesService } from '../services/rolesService';
import { useAuthStore } from '../stores/authStore';

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
      } catch (error) {
        console.error('Error checking permission:', error);
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
  const [role, setRole] = useState<any>(null);
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
          setPermissions(Array.isArray(data.permissions) ? data.permissions : []);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [user?.id]);

  return { role, permissions, isLoading };
};

export default usePermission;
