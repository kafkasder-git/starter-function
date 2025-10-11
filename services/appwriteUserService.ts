/**
 * @fileoverview Appwrite User Management Service
 * @description Complete user management with roles, permissions, and authentication
 */

import { databases, DATABASE_ID, ID, Query, Permission, Role } from '../lib/appwrite';
import { collections, db, queryHelpers } from '../lib/database';
import { logger } from '../lib/logging/logger';

// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  OPERATOR: 'operator',
  VIEWER: 'viewer',
} as const;

export const USER_PERMISSIONS = {
  // User management
  CREATE_USER: 'create_user',
  READ_USER: 'read_user',
  UPDATE_USER: 'update_user',
  DELETE_USER: 'delete_user',
  
  // Beneficiary management
  CREATE_BENEFICIARY: 'create_beneficiary',
  READ_BENEFICIARY: 'read_beneficiary',
  UPDATE_BENEFICIARY: 'update_beneficiary',
  DELETE_BENEFICIARY: 'delete_beneficiary',
  
  // Donation management
  CREATE_DONATION: 'create_donation',
  READ_DONATION: 'read_donation',
  UPDATE_DONATION: 'update_donation',
  DELETE_DONATION: 'delete_donation',
  
  // Campaign management
  CREATE_CAMPAIGN: 'create_campaign',
  READ_CAMPAIGN: 'read_campaign',
  UPDATE_CAMPAIGN: 'update_campaign',
  DELETE_CAMPAIGN: 'delete_campaign',
  
  // Aid application management
  CREATE_AID_APPLICATION: 'create_aid_application',
  READ_AID_APPLICATION: 'read_aid_application',
  UPDATE_AID_APPLICATION: 'update_aid_application',
  DELETE_AID_APPLICATION: 'delete_aid_application',
  
  // Finance management
  CREATE_FINANCE_TRANSACTION: 'create_finance_transaction',
  READ_FINANCE_TRANSACTION: 'read_finance_transaction',
  UPDATE_FINANCE_TRANSACTION: 'update_finance_transaction',
  DELETE_FINANCE_TRANSACTION: 'delete_finance_transaction',
  
  // Legal consultation management
  CREATE_LEGAL_CONSULTATION: 'create_legal_consultation',
  READ_LEGAL_CONSULTATION: 'read_legal_consultation',
  UPDATE_LEGAL_CONSULTATION: 'update_legal_consultation',
  DELETE_LEGAL_CONSULTATION: 'delete_legal_consultation',
  
  // Event management
  CREATE_EVENT: 'create_event',
  READ_EVENT: 'read_event',
  UPDATE_EVENT: 'update_event',
  DELETE_EVENT: 'delete_event',
  
  // Inventory management
  CREATE_INVENTORY_ITEM: 'create_inventory_item',
  READ_INVENTORY_ITEM: 'read_inventory_item',
  UPDATE_INVENTORY_ITEM: 'update_inventory_item',
  DELETE_INVENTORY_ITEM: 'delete_inventory_item',
  
  // Task management
  CREATE_TASK: 'create_task',
  READ_TASK: 'read_task',
  UPDATE_TASK: 'update_task',
  DELETE_TASK: 'delete_task',
  
  // Notification management
  CREATE_NOTIFICATION: 'create_notification',
  READ_NOTIFICATION: 'read_notification',
  UPDATE_NOTIFICATION: 'update_notification',
  DELETE_NOTIFICATION: 'delete_notification',
  
  // System management
  READ_SYSTEM_SETTINGS: 'read_system_settings',
  UPDATE_SYSTEM_SETTINGS: 'update_system_settings',
  READ_AUDIT_LOGS: 'read_audit_logs',
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data',
} as const;

// Role-based permissions mapping
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(USER_PERMISSIONS),
  [USER_ROLES.MANAGER]: [
    USER_PERMISSIONS.READ_USER,
    USER_PERMISSIONS.UPDATE_USER,
    USER_PERMISSIONS.CREATE_BENEFICIARY,
    USER_PERMISSIONS.READ_BENEFICIARY,
    USER_PERMISSIONS.UPDATE_BENEFICIARY,
    USER_PERMISSIONS.CREATE_DONATION,
    USER_PERMISSIONS.READ_DONATION,
    USER_PERMISSIONS.UPDATE_DONATION,
    USER_PERMISSIONS.CREATE_CAMPAIGN,
    USER_PERMISSIONS.READ_CAMPAIGN,
    USER_PERMISSIONS.UPDATE_CAMPAIGN,
    USER_PERMISSIONS.CREATE_AID_APPLICATION,
    USER_PERMISSIONS.READ_AID_APPLICATION,
    USER_PERMISSIONS.UPDATE_AID_APPLICATION,
    USER_PERMISSIONS.CREATE_FINANCE_TRANSACTION,
    USER_PERMISSIONS.READ_FINANCE_TRANSACTION,
    USER_PERMISSIONS.UPDATE_FINANCE_TRANSACTION,
    USER_PERMISSIONS.CREATE_LEGAL_CONSULTATION,
    USER_PERMISSIONS.READ_LEGAL_CONSULTATION,
    USER_PERMISSIONS.UPDATE_LEGAL_CONSULTATION,
    USER_PERMISSIONS.CREATE_EVENT,
    USER_PERMISSIONS.READ_EVENT,
    USER_PERMISSIONS.UPDATE_EVENT,
    USER_PERMISSIONS.CREATE_INVENTORY_ITEM,
    USER_PERMISSIONS.READ_INVENTORY_ITEM,
    USER_PERMISSIONS.UPDATE_INVENTORY_ITEM,
    USER_PERMISSIONS.CREATE_TASK,
    USER_PERMISSIONS.READ_TASK,
    USER_PERMISSIONS.UPDATE_TASK,
    USER_PERMISSIONS.CREATE_NOTIFICATION,
    USER_PERMISSIONS.READ_NOTIFICATION,
    USER_PERMISSIONS.UPDATE_NOTIFICATION,
    USER_PERMISSIONS.READ_SYSTEM_SETTINGS,
    USER_PERMISSIONS.EXPORT_DATA,
  ],
  [USER_ROLES.OPERATOR]: [
    USER_PERMISSIONS.READ_USER,
    USER_PERMISSIONS.READ_BENEFICIARY,
    USER_PERMISSIONS.UPDATE_BENEFICIARY,
    USER_PERMISSIONS.CREATE_DONATION,
    USER_PERMISSIONS.READ_DONATION,
    USER_PERMISSIONS.UPDATE_DONATION,
    USER_PERMISSIONS.READ_CAMPAIGN,
    USER_PERMISSIONS.CREATE_AID_APPLICATION,
    USER_PERMISSIONS.READ_AID_APPLICATION,
    USER_PERMISSIONS.UPDATE_AID_APPLICATION,
    USER_PERMISSIONS.READ_FINANCE_TRANSACTION,
    USER_PERMISSIONS.CREATE_LEGAL_CONSULTATION,
    USER_PERMISSIONS.READ_LEGAL_CONSULTATION,
    USER_PERMISSIONS.READ_EVENT,
    USER_PERMISSIONS.READ_INVENTORY_ITEM,
    USER_PERMISSIONS.UPDATE_INVENTORY_ITEM,
    USER_PERMISSIONS.READ_TASK,
    USER_PERMISSIONS.UPDATE_TASK,
    USER_PERMISSIONS.READ_NOTIFICATION,
    USER_PERMISSIONS.UPDATE_NOTIFICATION,
  ],
  [USER_ROLES.VIEWER]: [
    USER_PERMISSIONS.READ_USER,
    USER_PERMISSIONS.READ_BENEFICIARY,
    USER_PERMISSIONS.READ_DONATION,
    USER_PERMISSIONS.READ_CAMPAIGN,
    USER_PERMISSIONS.READ_AID_APPLICATION,
    USER_PERMISSIONS.READ_FINANCE_TRANSACTION,
    USER_PERMISSIONS.READ_LEGAL_CONSULTATION,
    USER_PERMISSIONS.READ_EVENT,
    USER_PERMISSIONS.READ_INVENTORY_ITEM,
    USER_PERMISSIONS.READ_TASK,
    USER_PERMISSIONS.READ_NOTIFICATION,
  ],
} as const;

// User profile interface
export interface UserProfile {
  $id?: string;
  user_id: string;
  email: string;
  name: string;
  role: keyof typeof USER_ROLES;
  permissions: string[];
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  profile_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// User creation interface
export interface CreateUserData {
  user_id: string;
  email: string;
  name: string;
  role: keyof typeof USER_ROLES;
  profile_data?: Record<string, any>;
}

// User update interface
export interface UpdateUserData {
  name?: string;
  role?: keyof typeof USER_ROLES;
  status?: 'active' | 'inactive' | 'suspended';
  profile_data?: Record<string, any>;
}

class AppwriteUserService {
  /**
   * Create a new user profile
   */
  async createUser(data: CreateUserData): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const permissions = ROLE_PERMISSIONS[data.role] || [];
      
      const userData = {
        user_id: data.user_id,
        email: data.email,
        name: data.name,
        role: data.role,
        permissions: JSON.stringify(permissions),
        status: 'active' as const,
        profile_data: data.profile_data ? JSON.stringify(data.profile_data) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const result = await db.create<UserProfile>(
        collections.USER_PROFILES,
        userData,
        ID.unique(),
        [
          Permission.read(Role.any()),
          Permission.update(Role.user(data.user_id)),
          Permission.delete(Role.user(data.user_id)),
        ]
      );

      if (result.error) {
        logger.error('Error creating user profile:', result.error);
        return { data: null, error: result.error };
      }

      logger.info(`User profile created: ${data.email}`);
      return { data: result.data, error: null };
    } catch (error) {
      logger.error('Error creating user profile:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user profile by ID
   */
  async getUserById(userId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const result = await db.get<UserProfile>(collections.USER_PROFILES, userId);
      
      if (result.error) {
        logger.error(`Error getting user profile ${userId}:`, result.error);
        return { data: null, error: result.error };
      }

      return { data: result.data, error: null };
    } catch (error) {
      logger.error(`Error getting user profile ${userId}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user profile by email
   */
  async getUserByEmail(email: string): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const result = await db.list<UserProfile>(
        collections.USER_PROFILES,
        [queryHelpers.equal('email', email)]
      );

      if (result.error) {
        logger.error(`Error getting user profile by email ${email}:`, result.error);
        return { data: null, error: result.error };
      }

      const user = result.data?.documents?.[0] || null;
      return { data: user, error: null };
    } catch (error) {
      logger.error(`Error getting user profile by email ${email}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user profile by Appwrite user ID
   */
  async getUserByAppwriteId(appwriteUserId: string): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const result = await db.list<UserProfile>(
        collections.USER_PROFILES,
        [queryHelpers.equal('user_id', appwriteUserId)]
      );

      if (result.error) {
        logger.error(`Error getting user profile by Appwrite ID ${appwriteUserId}:`, result.error);
        return { data: null, error: result.error };
      }

      const user = result.data?.documents?.[0] || null;
      return { data: user, error: null };
    } catch (error) {
      logger.error(`Error getting user profile by Appwrite ID ${appwriteUserId}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * List all users with pagination and filtering
   */
  async listUsers(options: {
    page?: number;
    limit?: number;
    role?: keyof typeof USER_ROLES;
    status?: 'active' | 'inactive' | 'suspended';
    search?: string;
  } = {}): Promise<{ data: UserProfile[] | null; total: number; error: Error | null }> {
    try {
      const { page = 1, limit = 20, role, status, search } = options;
      const queries = [];

      // Add filters
      if (role) {
        queries.push(queryHelpers.equal('role', role));
      }
      if (status) {
        queries.push(queryHelpers.equal('status', status));
      }
      if (search) {
        queries.push(queryHelpers.search('name', search));
      }

      // Add pagination
      queries.push(queryHelpers.offset((page - 1) * limit));
      queries.push(queryHelpers.limit(limit));
      queries.push(queryHelpers.orderDesc('created_at'));

      const result = await db.list<UserProfile>(collections.USER_PROFILES, queries);

      if (result.error) {
        logger.error('Error listing users:', result.error);
        return { data: null, total: 0, error: result.error };
      }

      return {
        data: result.data?.documents || [],
        total: result.data?.total || 0,
        error: null
      };
    } catch (error) {
      logger.error('Error listing users:', error);
      return { data: null, total: 0, error: error as Error };
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, data: UpdateUserData): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (data.name) updateData.name = data.name;
      if (data.role) {
        updateData.role = data.role;
        updateData.permissions = JSON.stringify(ROLE_PERMISSIONS[data.role] || []);
      }
      if (data.status) updateData.status = data.status;
      if (data.profile_data) updateData.profile_data = JSON.stringify(data.profile_data);

      const result = await db.update<UserProfile>(
        collections.USER_PROFILES,
        userId,
        updateData
      );

      if (result.error) {
        logger.error(`Error updating user profile ${userId}:`, result.error);
        return { data: null, error: result.error };
      }

      logger.info(`User profile updated: ${userId}`);
      return { data: result.data, error: null };
    } catch (error) {
      logger.error(`Error updating user profile ${userId}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Delete user profile
   */
  async deleteUser(userId: string): Promise<{ error: Error | null }> {
    try {
      const result = await db.delete(collections.USER_PROFILES, userId);

      if (result.error) {
        logger.error(`Error deleting user profile ${userId}:`, result.error);
        return { error: result.error };
      }

      logger.info(`User profile deleted: ${userId}`);
      return { error: null };
    } catch (error) {
      logger.error(`Error deleting user profile ${userId}:`, error);
      return { error: error as Error };
    }
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(userId: string): Promise<{ error: Error | null }> {
    try {
      const result = await db.update<UserProfile>(
        collections.USER_PROFILES,
        userId,
        {
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      );

      if (result.error) {
        logger.error(`Error updating last login for user ${userId}:`, result.error);
        return { error: result.error };
      }

      return { error: null };
    } catch (error) {
      logger.error(`Error updating last login for user ${userId}:`, error);
      return { error: error as Error };
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const { data: user } = await this.getUserById(userId);
      
      if (!user) return false;
      
      const permissions = JSON.parse(user.permissions || '[]');
      return permissions.includes(permission);
    } catch (error) {
      logger.error(`Error checking permission for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get user's permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const { data: user } = await this.getUserById(userId);
      
      if (!user) return [];
      
      return JSON.parse(user.permissions || '[]');
    } catch (error) {
      logger.error(`Error getting permissions for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, role: keyof typeof USER_ROLES): Promise<boolean> {
    try {
      const { data: user } = await this.getUserById(userId);
      return user?.role === role;
    } catch (error) {
      logger.error(`Error checking role for user ${userId}:`, error);
      return false;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: keyof typeof USER_ROLES): Promise<{ data: UserProfile[] | null; error: Error | null }> {
    try {
      const result = await db.list<UserProfile>(
        collections.USER_PROFILES,
        [
          queryHelpers.equal('role', role),
          queryHelpers.equal('status', 'active'),
          queryHelpers.orderAsc('name')
        ]
      );

      if (result.error) {
        logger.error(`Error getting users by role ${role}:`, result.error);
        return { data: null, error: result.error };
      }

      return { data: result.data?.documents || [], error: null };
    } catch (error) {
      logger.error(`Error getting users by role ${role}:`, error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Create initial admin user
   */
  async createInitialAdmin(): Promise<{ data: UserProfile | null; error: Error | null }> {
    try {
      const adminData: CreateUserData = {
        user_id: 'admin-user',
        email: 'admin@kafkasder.org',
        name: 'System Administrator',
        role: USER_ROLES.ADMIN,
        profile_data: {
          is_initial_admin: true,
          created_by: 'system'
        }
      };

      return await this.createUser(adminData);
    } catch (error) {
      logger.error('Error creating initial admin user:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    data: {
      total: number;
      active: number;
      inactive: number;
      suspended: number;
      byRole: Record<string, number>;
    } | null;
    error: Error | null;
  }> {
    try {
      const [totalResult, activeResult, inactiveResult, suspendedResult] = await Promise.all([
        db.list<UserProfile>(collections.USER_PROFILES, [queryHelpers.limit(1)]),
        db.list<UserProfile>(collections.USER_PROFILES, [queryHelpers.equal('status', 'active'), queryHelpers.limit(1)]),
        db.list<UserProfile>(collections.USER_PROFILES, [queryHelpers.equal('status', 'inactive'), queryHelpers.limit(1)]),
        db.list<UserProfile>(collections.USER_PROFILES, [queryHelpers.equal('status', 'suspended'), queryHelpers.limit(1)]),
      ]);

      const stats = {
        total: totalResult.data?.total || 0,
        active: activeResult.data?.total || 0,
        inactive: inactiveResult.data?.total || 0,
        suspended: suspendedResult.data?.total || 0,
        byRole: {} as Record<string, number>,
      };

      // Get role statistics
      for (const role of Object.values(USER_ROLES)) {
        const roleResult = await db.list<UserProfile>(
          collections.USER_PROFILES,
          [queryHelpers.equal('role', role), queryHelpers.limit(1)]
        );
        stats.byRole[role] = roleResult.data?.total || 0;
      }

      return { data: stats, error: null };
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      return { data: null, error: error as Error };
    }
  }
}

// Export singleton instance
export const appwriteUserService = new AppwriteUserService();
export default appwriteUserService;
