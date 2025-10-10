/**
 * @fileoverview rolesService Module - Role and permission management service
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';
import { logger } from '../lib/logging/logger';
import type { Tables } from '../types/supabase';
import { normalizeRoleToEnglish } from '../lib/roleMapping';

// Type aliases for better readability
export type Role = Tables<'roles'>;
export type Permission = Tables<'permissions'>;
export type UserPermission = Tables<'user_permissions'>;

export interface RoleWithPermissions extends Role {
  permissionDetails?: Permission[];
}

export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean | null;
  roleDetails?: Role;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Module-level constants
const rolesTable = 'roles';
const permissionsTable = 'permissions';
const userProfilesTable = 'user_profiles';

/**
 * Role and permission management service
 */
const rolesService = {
  /**
   * Get all roles
   */
  async getRoles(): Promise<ApiResponse<Role[]>> {
    try {
      logger.info('Fetching all roles');

      const { data, error } = await supabase.from(rolesTable).select('*').order('name');

      if (error) {
        logger.error('Error fetching roles', error);
        return {
          data: null,
          error: 'Roller yüklenirken bir hata oluştu',
        };
      }

      logger.info(`Successfully fetched ${data?.length || 0} roles`);
      return { data, error: null };
    } catch (error) {
      logger.error('Unexpected error fetching roles', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get a single role by ID
   */
  async getRole(id: string): Promise<ApiResponse<Role>> {
    try {
      logger.info(`Fetching role: ${id}`);

      const { data, error } = await supabase.from(rolesTable).select('*').eq('id', id).single();

      if (error) {
        logger.error('Error fetching role', error);
        return {
          data: null,
          error: 'Rol yüklenirken bir hata oluştu',
        };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('Unexpected error fetching role', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<ApiResponse<Permission[]>> {
    try {
      logger.info('Fetching all permissions');

      const { data, error } = await supabase
        .from(permissionsTable)
        .select('*')
        .order('resource, action');

      if (error) {
        logger.error('Error fetching permissions', error);
        return {
          data: null,
          error: 'İzinler yüklenirken bir hata oluştu',
        };
      }

      logger.info(`Successfully fetched ${data?.length || 0} permissions`);
      return { data, error: null };
    } catch (error) {
      logger.error('Unexpected error fetching permissions', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get permissions grouped by resource
   */
  async getPermissionsByResource(): Promise<ApiResponse<Record<string, Permission[]>>> {
    try {
      const response = await this.getPermissions();

      if (response.error || !response.data) {
        return response as any;
      }

      const grouped = response.data.reduce(
        (acc, permission) => {
          const resource = permission.resource;
          if (!acc[resource]) {
            acc[resource] = [];
          }
          acc[resource].push(permission);
          return acc;
        },
        {} as Record<string, Permission[]>,
      );

      return { data: grouped, error: null };
    } catch (error) {
      logger.error('Unexpected error grouping permissions', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      // Get user role
      const { data: userProfile } = await supabase
        .from(userProfilesTable)
        .select('role')
        .eq('id', userId)
        .single();

      if (!userProfile) {
        return false;
      }

      // Normalize role name (Turkish to English)
      const normalizedRole = normalizeRoleToEnglish(userProfile.role);

      // Get role permissions
      const { data: role } = await supabase
        .from(rolesTable)
        .select('permissions')
        .eq('name', normalizedRole)
        .single();

      if (!role || !role.permissions) {
        return false;
      }

      const permissions = Array.isArray(role.permissions) ? role.permissions : [];

      // Check for wildcard permissions (e.g., "users:*")
      const [resource] = permissionName.split(':');
      const hasWildcard = permissions.includes(`${resource}:*`);
      const hasSpecific = permissions.includes(permissionName);
      const hasAllAccess = permissions.includes('*:*');

      return hasWildcard || hasSpecific || hasAllAccess;
    } catch (error) {
      logger.error('Error checking permission', error);
      return false;
    }
  },

  /**
   * Get user's role details
   */
  async getUserRole(userId: string): Promise<ApiResponse<RoleWithPermissions>> {
    try {
      logger.info(`Fetching role for user: ${userId}`);

      // Get user profile with role
      const { data: userProfile, error: userError } = await supabase
        .from(userProfilesTable)
        .select('role')
        .eq('id', userId)
        .single();

      if (userError || !userProfile) {
        logger.error('Error fetching user profile', userError);
        return {
          data: null,
          error: 'Kullanıcı profili bulunamadı',
        };
      }

      // Normalize role name (Turkish to English)
      const normalizedRole = normalizeRoleToEnglish(userProfile.role);

      // Get role details
      const { data: role, error: roleError } = await supabase
        .from(rolesTable)
        .select('*')
        .eq('name', normalizedRole)
        .single();

      if (roleError || !role) {
        logger.error('Error fetching role details', roleError);
        return {
          data: null,
          error: 'Rol bilgisi bulunamadı',
        };
      }

      return { data: role, error: null };
    } catch (error) {
      logger.error('Unexpected error fetching user role', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(userId: string, newRole: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info(`Updating user ${userId} role to ${newRole}`);

      // Verify role exists
      const { data: roleExists } = await supabase
        .from(rolesTable)
        .select('name')
        .eq('name', newRole)
        .single();

      if (!roleExists) {
        return {
          data: null,
          error: 'Belirtilen rol bulunamadı',
        };
      }

      // Update user role
      const { error } = await supabase
        .from(userProfilesTable)
        .update({ role: newRole as any, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) {
        logger.error('Error updating user role', error);
        return {
          data: null,
          error: 'Kullanıcı rolü güncellenirken bir hata oluştu',
        };
      }

      logger.info('Successfully updated user role');
      return { data: true, error: null };
    } catch (error) {
      logger.error('Unexpected error updating user role', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get all users with their roles
   */
  async getUsersWithRoles(): Promise<ApiResponse<UserWithRole[]>> {
    try {
      logger.info('Fetching users with roles');

      const { data: users, error } = await supabase
        .from(userProfilesTable)
        .select('id, name, email, role, is_active')
        .order('name');

      if (error) {
        logger.error('Error fetching users', error);
        return {
          data: null,
          error: 'Kullanıcılar yüklenirken bir hata oluştu',
        };
      }

      return { data: users as UserWithRole[], error: null };
    } catch (error) {
      logger.error('Unexpected error fetching users', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get role statistics
   */
  async getRoleStats(): Promise<ApiResponse<Record<string, number>>> {
    try {
      logger.info('Fetching role statistics');

      const { data: users, error } = await supabase
        .from(userProfilesTable)
        .select('role')
        .eq('is_active', true);

      if (error) {
        logger.error('Error fetching role stats', error);
        return {
          data: null,
          error: 'İstatistikler yüklenirken bir hata oluştu',
        };
      }

      // Count users by normalized role (both Turkish and English)
      const stats =
        users?.reduce(
          (acc: Record<string, number>, user: { role: string | null }) => {
            const userRole = user.role || 'unknown';
            const normalized = normalizeRoleToEnglish(userRole);

            // Count for both normalized (English) and original role name
            acc[normalized] = (acc[normalized] || 0) + 1;
            acc[userRole] = (acc[userRole] || 0) + 1;

            return acc;
          },
          {} as Record<string, number>,
        ) || {};

      return { data: stats, error: null };
    } catch (error) {
      logger.error('Unexpected error fetching role stats', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Create a new role
   */
  async createRole(
    name: string,
    displayName: string,
    description: string,
    permissions: string[],
  ): Promise<ApiResponse<Role>> {
    try {
      logger.info(`Creating new role: ${name}`);

      const { data, error } = await supabase
        .from(rolesTable)
        .insert({
          name,
          display_name: displayName,
          description,
          permissions: permissions as any,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        logger.error('Error creating role', error);
        return {
          data: null,
          error: 'Rol oluşturulurken bir hata oluştu',
        };
      }

      logger.info('Successfully created role');
      return { data, error: null };
    } catch (error) {
      logger.error('Unexpected error creating role', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Update an existing role
   */
  async updateRole(
    id: string,
    updates: {
      display_name?: string;
      description?: string;
      permissions?: string[];
      is_active?: boolean;
    },
  ): Promise<ApiResponse<Role>> {
    try {
      logger.info(`Updating role: ${id}`);

      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.display_name) updateData.display_name = updates.display_name;
      if (updates.description) updateData.description = updates.description;
      if (updates.permissions) updateData.permissions = updates.permissions;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

      const { data, error } = await supabase
        .from(rolesTable)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating role', error);
        return {
          data: null,
          error: 'Rol güncellenirken bir hata oluştu',
        };
      }

      logger.info('Successfully updated role');
      return { data, error: null };
    } catch (error) {
      logger.error('Unexpected error updating role', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get permission matrix for a role
   */
  getPermissionMatrix(role: Role): Record<string, string[]> {
    const permissions = Array.isArray(role.permissions) ? role.permissions : [];
    const matrix: Record<string, string[]> = {};

    permissions.forEach((perm: any) => {
      const permStr = String(perm);
      const parts = permStr.split(':');
      const resource = parts[0];
      const action = parts[1];

      if (resource && action) {
        if (!matrix[resource]) {
          matrix[resource] = [];
        }
        if (!matrix[resource].includes(action)) {
          matrix[resource].push(action);
        }
      }
    });

    return matrix;
  },

  /**
   * Check if role has access to resource
   */
  roleHasAccess(role: Role, resource: string, action: string = 'read'): boolean {
    const permissions = Array.isArray(role.permissions) ? role.permissions : [];
    const permStrings = permissions.map((p: any) => String(p));

    return (
      permStrings.includes(`${resource}:${action}`) ||
      permStrings.includes(`${resource}:*`) ||
      permStrings.includes('*:*')
    );
  },
};

// Export the service
export { rolesService };
export default rolesService;
