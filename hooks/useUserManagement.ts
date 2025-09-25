/**
 * @fileoverview useUserManagement Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// 👥 USER MANAGEMENT HOOK
// Real-time user management with Supabase integration

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { logger } from '../lib/logging/logger';
import {
  userManagementService,
  type ManagedUser,
  type CreateUserRequest,
  type UpdateUserRequest,
  type UserFilters,
  type UserListResponse,
  type UserActivity,
} from '../services/userManagementService';

interface UseUserManagementReturn {
  // State
  readonly users: readonly ManagedUser[];
  readonly activities: readonly UserActivity[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly totalUsers: number;
  readonly currentPage: number;
  readonly totalPages: number;
  readonly stats: {
    readonly total: number;
    readonly active: number;
    readonly inactive: number;
    readonly pending: number;
    readonly suspended: number;
  };

  // Actions
  readonly loadUsers: (filters?: UserFilters) => Promise<void>;
  readonly createUser: (request: CreateUserRequest) => Promise<ManagedUser>;
  readonly updateUser: (id: string, request: UpdateUserRequest) => Promise<ManagedUser>;
  readonly deleteUser: (id: string) => Promise<void>;
  readonly resetPassword: (id: string, newPassword?: string) => Promise<void>;
  readonly loadActivities: (userId?: string) => Promise<void>;
  readonly loadStats: () => Promise<void>;
  readonly refreshData: () => Promise<void>;

  // Utilities
  readonly clearError: () => void;
  readonly getUserById: (id: string) => ManagedUser | undefined;
  readonly isUserSelected: (id: string) => boolean;
}

/**
 * useUserManagement function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useUserManagement(): UseUserManagementReturn {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<UserFilters>({});
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0,
    suspended: 0,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
  });

  /**
   * Load users with filters
   */
  const loadUsers = useCallback(async (filters: UserFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response: UserListResponse = await userManagementService.getUsers(filters);

      setUsers([...response.users]);
      setPagination({
        currentPage: response.page,
        totalPages: response.totalPages,
        total: response.total,
      });
      setCurrentFilters(filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcılar yüklenemedi';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create new user
   */
  const createUser = useCallback(async (request: CreateUserRequest): Promise<ManagedUser> => {
    setLoading(true);
    setError(null);

    try {
      const newUser = await userManagementService.createUser(request);

      // Add to local state
      setUsers((prev) => [newUser, ...prev]);

      toast.success(`Kullanıcı ${newUser.name} başarıyla oluşturuldu`);

      // Refresh stats
      await loadStats();

      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kullanıcı oluşturulamadı';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user
   */
  const updateUser = useCallback(
    async (id: string, request: UpdateUserRequest): Promise<ManagedUser> => {
      setLoading(true);
      setError(null);

      try {
        const updatedUser = await userManagementService.updateUser(id, request);

        // Update local state
        setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)));

        toast.success(`Kullanıcı ${updatedUser.name} başarıyla güncellendi`);

        // Refresh stats
        await loadStats();

        return updatedUser;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Kullanıcı güncellenemedi';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Delete user
   */
  const deleteUser = useCallback(
    async (id: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const userToDelete = users.find((u) => u.id === id);

        await userManagementService.deleteUser(id);

        // Remove from local state
        setUsers((prev) => prev.filter((user) => user.id !== id));

        toast.success(`Kullanıcı ${userToDelete?.name ?? 'bilinmeyen'} başarıyla silindi`);

        // Refresh stats
        await loadStats();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Kullanıcı silinemedi';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [users],
  );

  /**
   * Reset user password
   */
  const resetPassword = useCallback(
    async (id: string, newPassword?: string): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const user = users.find((u) => u.id === id);

        await userManagementService.resetUserPassword(id, newPassword);

        toast.success(`${user?.name ?? 'Kullanıcı'} şifresi sıfırlandı`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Şifre sıfırlanamadı';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [users],
  );

  /**
   * Load user activities
   */
  const loadActivities = useCallback(async (userId?: string): Promise<void> => {
    try {
      const userActivities = await userManagementService.getUserActivities(userId, 100);
      setActivities([...userActivities]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Aktiviteler yüklenemedi';
      logger.error('Failed to load activities:', errorMessage);
      // Don't show toast for activities as it's not critical
    }
  }, []);

  /**
   * Load user statistics
   */
  const loadStats = useCallback(async (): Promise<void> => {
    try {
      const userStats = await userManagementService.getUserStats();
      setStats({
        total: userStats.total,
        active: userStats.active,
        inactive: userStats.inactive,
        pending: userStats.pending,
        suspended: userStats.suspended,
      });
    } catch (err) {
      logger.error('Failed to load user stats:', err);
      // Don't show toast for stats as it's not critical
    }
  }, []);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await Promise.all([loadUsers(currentFilters), loadActivities(), loadStats()]);
  }, [currentFilters, loadUsers, loadActivities, loadStats]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Get user by ID from local state
   */
  const getUserById = useCallback(
    (id: string): ManagedUser | undefined => {
      return users.find((user) => user.id === id);
    },
    [users],
  );

  /**
   * Check if user is selected (for future multi-select functionality)
   */
  const isUserSelected = useCallback((id: string): boolean => {
    // This would be used with a selectedUsers state for bulk operations
    return false;
  }, []);

  // Initial data load
  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadUsers(), loadActivities(), loadStats()]);
    };

    initializeData();
  }, []);

  return {
    // State
    users,
    activities,
    loading,
    error,
    totalUsers: pagination.total,
    currentPage: pagination.currentPage,
    totalPages: pagination.totalPages,
    stats,

    // Actions
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    loadActivities,
    loadStats,
    refreshData,

    // Utilities
    clearError,
    getUserById,
    isUserSelected,
  };
}

export default useUserManagement;
