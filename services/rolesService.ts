/**
 * @fileoverview rolesService Module - Role and permission management service
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { db, collections, queryHelpers } from '../lib/database';
import { logger } from '../lib/logging/logger';
import { normalizeRoleToEnglish } from '../lib/roleMapping';

// Type aliases for better readability
export interface Role {
  $id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  $id: string;
  resource: string;
  action: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface UserPermission {
  $id: string;
  user_id: string;
  permission_id: string;
  granted_at: string;
  granted_by: string;
}

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
const rolesCollection = collections.ROLES;
const permissionsCollection = collections.PERMISSIONS;
const userProfilesCollection = collections.USER_PROFILES;

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

      const { data, error } = await db.list(rolesCollection, [
        queryHelpers.orderAsc('name')
      ]);

      if (error) {
        logger.error('Error fetching roles', error);
        return {
          data: null,
          error: 'Roller yüklenirken bir hata oluştu',
        };
      }

      logger.info(`Successfully fetched ${data?.documents?.length || 0} roles`);
      return { data: data?.documents || [], error: null };
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

      const { data, error } = await db.get(rolesCollection, id);

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

      const { data, error } = await db.list(permissionsCollection, [
        queryHelpers.orderAsc('resource'),
        queryHelpers.orderAsc('action')
      ]);

      if (error) {
        logger.error('Error fetching permissions', error);
        return {
          data: null,
          error: 'İzinler yüklenirken bir hata oluştu',
        };
      }

      logger.info(`Successfully fetched ${data?.documents?.length || 0} permissions`);
      return { data: data?.documents || [], error: null };
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
      const { data: userProfile } = await db.list(userProfilesCollection, [
        queryHelpers.equal('$id', userId)
      ]);

      if (!userProfile?.documents?.[0]) {
        return false;
      }

      // Normalize role name (Turkish to English)
      const normalizedRole = normalizeRoleToEnglish(userProfile.documents[0].role);

      // Get role permissions
      const { data: role } = await db.list(rolesCollection, [
        queryHelpers.equal('name', normalizedRole)
      ]);

      if (!role?.documents?.[0] || !role.documents[0].permissions) {
        return false;
      }

      const permissions = Array.isArray(role.documents[0].permissions) ? role.documents[0].permissions : [];

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
      const { data: userProfile, error: userError } = await db.list(userProfilesCollection, [
        queryHelpers.equal('$id', userId)
      ]);

      if (userError || !userProfile?.documents?.[0]) {
        logger.error('Error fetching user profile', userError);
        return {
          data: null,
          error: 'Kullanıcı profili bulunamadı',
        };
      }

      // Normalize role name (Turkish to English)
      const normalizedRole = normalizeRoleToEnglish(userProfile.documents[0].role);

      // Get role details
      const { data: role, error: roleError } = await db.list(rolesCollection, [
        queryHelpers.equal('name', normalizedRole)
      ]);

      if (roleError || !role?.documents?.[0]) {
        logger.error('Error fetching role details', roleError);
        return {
          data: null,
          error: 'Rol bilgisi bulunamadı',
        };
      }

      return { data: role.documents[0], error: null };
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
      const { data: roleExists } = await db.list(rolesCollection, [
        queryHelpers.equal('name', newRole)
      ]);

      if (!roleExists?.documents?.[0]) {
        return {
          data: null,
          error: 'Belirtilen rol bulunamadı',
        };
      }

      // Update user role
      const { error } = await db.update(userProfilesCollection, userId, { 
        role: newRole, 
        $updatedAt: new Date().toISOString() 
      });

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

      const { data: users, error } = await db.list(userProfilesCollection, [
        queryHelpers.orderAsc('name')
      ]);

      if (error) {
        logger.error('Error fetching users', error);
        return {
          data: null,
          error: 'Kullanıcılar yüklenirken bir hata oluştu',
        };
      }

      const userRoles = users?.documents?.map(user => ({
        id: user.$id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_active: user.is_active
      })) || [];

      return { data: userRoles as UserWithRole[], error: null };
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

      const { data: users, error } = await db.list(userProfilesCollection, [
        queryHelpers.equal('is_active', true)
      ]);

      if (error) {
        logger.error('Error fetching role stats', error);
        return {
          data: null,
          error: 'İstatistikler yüklenirken bir hata oluştu',
        };
      }

      // Count users by normalized role (both Turkish and English)
      const stats =
        users?.documents?.reduce(
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

      const { data, error } = await db.create(rolesCollection, {
        name,
        display_name: displayName,
        description,
        permissions: permissions,
        is_active: true,
      });

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
        $updatedAt: new Date().toISOString(),
      };

      if (updates.display_name) updateData.display_name = updates.display_name;
      if (updates.description) updateData.description = updates.description;
      if (updates.permissions) updateData.permissions = updates.permissions;
      if (updates.is_active !== undefined) updateData.is_active = updates.is_active;

      const { data, error } = await db.update(rolesCollection, id, updateData);

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
