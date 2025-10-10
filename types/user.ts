/**
 * @fileoverview User Management Types
 * @description Type definitions for user management operations
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// =============================================================================
// USER ROLES AND PERMISSIONS
// =============================================================================

/**
 * User roles in the system
 */
export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

/**
 * Permission levels
 */
export type PermissionLevel = 'read' | 'write' | 'delete' | 'admin';

// =============================================================================
// USER ENTITY
// =============================================================================

/**
 * Managed user in the system
 */
export interface ManagedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
  notes?: string;
  sendInvitation: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  isActive: boolean;
}

// =============================================================================
// USER OPERATIONS
// =============================================================================

/**
 * Request to create a new user
 */
export interface CreateUserRequest {
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  department?: string;
  notes?: string;
  sendInvitation: boolean;
}

/**
 * Request to update an existing user
 */
export interface UpdateUserRequest {
  email?: string;
  name?: string;
  role?: UserRole;
  phone?: string;
  department?: string;
  notes?: string;
  isActive?: boolean;
}

// =============================================================================
// USER FILTERING AND LISTING
// =============================================================================

/**
 * Filters for user list queries
 */
export interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  department?: string;
  page?: number;
  limit?: number;
}

/**
 * Response for user list queries
 */
export interface UserListResponse {
  users: ManagedUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================================================
// USER ACTIVITY
// =============================================================================

/**
 * User activity log entry
 */
export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * User statistics
 */
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  byRole: Record<UserRole, number>;
  byDepartment: Record<string, number>;
  recentLogins: number;
  recentRegistrations: number;
}
