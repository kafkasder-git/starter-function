import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from '../usePermissions';
import { UserRole, Permission } from '../../types/auth';

// Mock the auth context - since it doesn't exist, we'll mock useAuthStore instead
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from '../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

describe('usePermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Individual Permission Checks', () => {
    it('should check view permission correctly', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        permissions: [Permission.VIEW_DASHBOARD],
      };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        checkPermission: vi.fn().mockImplementation((permission) => {
          return mockUser.permissions.includes(permission);
        }),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canView(Permission.VIEW_DASHBOARD)).toBe(true);
      expect(result.current.canView(Permission.VIEW_DONATIONS)).toBe(false);
    });

    it('should check create permission correctly', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.MANAGER,
        permissions: [Permission.CREATE_DONATION],
      };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        checkPermission: vi.fn().mockImplementation((permission) => {
          return mockUser.permissions.includes(permission);
        }),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canCreate(Permission.CREATE_DONATION)).toBe(true);
      expect(result.current.canCreate(Permission.CREATE_USER)).toBe(false);
    });

    it('should check edit permission correctly', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.OPERATOR,
        permissions: [Permission.EDIT_DONATION],
      };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        checkPermission: vi.fn().mockImplementation((permission) => {
          return mockUser.permissions.includes(permission);
        }),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canEdit(Permission.EDIT_DONATION)).toBe(true);
      expect(result.current.canEdit(Permission.EDIT_USER)).toBe(false);
    });

    it('should check delete permission correctly', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        permissions: [Permission.DELETE_DONATION],
      };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        checkPermission: vi.fn().mockImplementation((permission) => {
          return mockUser.permissions.includes(permission);
        }),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canDelete(Permission.DELETE_DONATION)).toBe(true);
      expect(result.current.canDelete(Permission.DELETE_USER)).toBe(false);
    });
  });

  describe('Role Hierarchy', () => {
    it('should identify admin correctly', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.ADMIN },
        checkPermission: vi.fn(),
        hasRole: vi.fn().mockImplementation((role) => role === UserRole.ADMIN),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAdmin()).toBe(true);
      expect(result.current.isManager()).toBe(true);
      expect(result.current.isOperator()).toBe(true);
      expect(result.current.isViewer()).toBe(true);
    });

    it('should identify manager correctly', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.MANAGER },
        checkPermission: vi.fn(),
        hasRole: vi.fn().mockImplementation((role) => role === UserRole.MANAGER),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.isManager()).toBe(true);
      expect(result.current.isOperator()).toBe(true);
      expect(result.current.isViewer()).toBe(true);
    });

    it('should identify operator correctly', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.OPERATOR },
        checkPermission: vi.fn(),
        hasRole: vi.fn().mockImplementation((role) => role === UserRole.OPERATOR),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.isManager()).toBe(false);
      expect(result.current.isOperator()).toBe(true);
      expect(result.current.isViewer()).toBe(true);
    });

    it('should identify viewer correctly', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.VIEWER },
        checkPermission: vi.fn(),
        hasRole: vi.fn().mockImplementation((role) => role === UserRole.VIEWER),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.isManager()).toBe(false);
      expect(result.current.isOperator()).toBe(false);
      expect(result.current.isViewer()).toBe(true);
    });
  });

  describe('Multiple Role Checks', () => {
    it('should check hasAnyRole correctly', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.MANAGER },
        checkPermission: vi.fn(),
        hasRole: vi.fn().mockImplementation((role) => role === UserRole.MANAGER),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyRole([UserRole.ADMIN, UserRole.MANAGER])).toBe(true);
      expect(result.current.hasAnyRole([UserRole.OPERATOR, UserRole.VIEWER])).toBe(false);
    });

    it('should return false for empty roles array', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.ADMIN },
        checkPermission: vi.fn(),
        hasRole: vi.fn().mockReturnValue(true),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAnyRole([])).toBe(false);
    });
  });

  describe('Multiple Permission Checks', () => {
    it('should check hasAllPermissions correctly', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        permissions: [Permission.VIEW_DASHBOARD, Permission.CREATE_DONATION, Permission.EDIT_DONATION],
      };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        checkPermission: vi.fn().mockImplementation((permission) => {
          return mockUser.permissions.includes(permission);
        }),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      const permissions = [Permission.VIEW_DASHBOARD, Permission.CREATE_DONATION];
      expect(result.current.hasAllPermissions(permissions)).toBe(true);

      const missingPermissions = [Permission.VIEW_DASHBOARD, Permission.DELETE_USER];
      expect(result.current.hasAllPermissions(missingPermissions)).toBe(false);
    });

    it('should check hasAnyPermission correctly', () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.OPERATOR,
        permissions: [Permission.VIEW_DASHBOARD, Permission.CREATE_DONATION],
      };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        checkPermission: vi.fn().mockImplementation((permission) => {
          return mockUser.permissions.includes(permission);
        }),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      const permissions = [Permission.VIEW_DASHBOARD, Permission.DELETE_USER];
      expect(result.current.hasAnyPermission(permissions)).toBe(true);

      const missingPermissions = [Permission.DELETE_USER, Permission.EDIT_USER];
      expect(result.current.hasAnyPermission(missingPermissions)).toBe(false);
    });

    it('should return false for empty permissions array', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.ADMIN },
        checkPermission: vi.fn().mockReturnValue(true),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.hasAllPermissions([])).toBe(true); // Empty array should return true
      expect(result.current.hasAnyPermission([])).toBe(false); // Empty array should return false
    });
  });

  describe('User Display Functions', () => {
    it('should return user display name correctly', () => {
      mockUseAuthStore.mockReturnValue({
        user: { name: 'John Doe' },
        checkPermission: vi.fn(),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.getUserDisplayName()).toBe('John Doe');
    });

    it('should return default name when user name is not available', () => {
      mockUseAuthStore.mockReturnValue({
        user: { name: undefined },
        checkPermission: vi.fn(),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.getUserDisplayName()).toBe('Kullanıcı');
    });

    it('should return user role correctly', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.MANAGER },
        checkPermission: vi.fn(),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.getUserRole()).toBe('Dernek Müdürü');
    });

    it('should return guest when no user', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        checkPermission: vi.fn(),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.getUserRole()).toBe('Misafir');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null user gracefully', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        checkPermission: vi.fn().mockReturnValue(false),
        hasRole: vi.fn().mockReturnValue(false),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canView(Permission.VIEW_DASHBOARD)).toBe(false);
      expect(result.current.isAdmin()).toBe(false);
      expect(result.current.hasAnyRole([UserRole.ADMIN])).toBe(false);
      expect(result.current.hasAllPermissions([Permission.VIEW_DASHBOARD])).toBe(false);
    });

    it('should handle undefined permissions array', () => {
      mockUseAuthStore.mockReturnValue({
        user: { permissions: undefined },
        checkPermission: vi.fn().mockReturnValue(false),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(result.current.canView(Permission.VIEW_DASHBOARD)).toBe(false);
    });

    it('should handle checkPermission throwing error', () => {
      mockUseAuthStore.mockReturnValue({
        user: { role: UserRole.ADMIN },
        checkPermission: vi.fn().mockImplementation(() => {
          throw new Error('Permission check failed');
        }),
        hasRole: vi.fn(),
      } as any);

      const { result } = renderHook(() => usePermissions());

      expect(() => result.current.canView(Permission.VIEW_DASHBOARD)).toThrow('Permission check failed');
    });
  });
});
