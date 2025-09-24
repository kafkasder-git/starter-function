import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import { UserRole, Permission } from '../../types/auth';

// Mock Zustand
vi.mock('zustand', () => ({
  create: vi.fn((fn) => {
    let state = {};
    const setState = (partial: any) => {
      state = { ...state, ...(typeof partial === 'function' ? partial(state) : partial) };
    };
    const getState = () => state;

    // Initialize state
    state = fn(setState, getState, undefined);

    return () => state;
  }),
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useAuthStore.getState();
    store.reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();

      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.session).toBe(null);
      expect(state.user?.permissions || []).toEqual([]);
      expect(state.role).toBe(null);
    });
  });

  describe('Authentication Actions', () => {
    it('should set loading state', () => {
      const { setLoading } = useAuthStore.getState();

      setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);

      setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set error', () => {
      const { setError } = useAuthStore.getState();
      const errorMessage = 'Authentication failed';

      setError(errorMessage);
      expect(useAuthStore.getState().error).toBe(errorMessage);
    });

    it('should clear error', () => {
      const { setError, clearError } = useAuthStore.getState();

      setError('Some error');
      expect(useAuthStore.getState().error).toBe('Some error');

      clearError();
      expect(useAuthStore.getState().error).toBe(null);
    });

    it('should set user', () => {
      const { setUser } = useAuthStore.getState();
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        permissions: [Permission.VIEW_DASHBOARD, Permission.VIEW_DONATIONS],
      };

      setUser(mockUser);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.role).toBe(UserRole.ADMIN);
      expect(state.user?.permissions || []).toEqual([Permission.VIEW_DASHBOARD, Permission.VIEW_DONATIONS]);
    });

    it('should set session', () => {
      const { setSession } = useAuthStore.getState();
      const mockSession = {
        access_token: 'token123',
        refresh_token: 'refresh123',
        expires_in: 3600,
        token_type: 'Bearer',
        user: {
          id: '123',
          email: 'test@example.com',
        },
      };

      setSession(mockSession);
      expect(useAuthStore.getState().session).toEqual(mockSession);
    });

    it('should sign out user', () => {
      const { setUser, setSession, signOut } = useAuthStore.getState();

      // First set a user and session
      setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        permissions: [Permission.VIEW_DASHBOARD],
      });
      setSession({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_in: 3600,
        token_type: 'Bearer',
        user: { id: '123', email: 'test@example.com' },
      });

      // Then sign out
      signOut();
      const state = useAuthStore.getState();

      expect(state.user).toBe(null);
      expect(state.session).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.role).toBe(null);
      expect(state.user?.permissions || []).toEqual([]);
      expect(state.error).toBe(null);
    });

    it('should reset store', () => {
      const { setUser, setError, setLoading, reset } = useAuthStore.getState();

      // Set some state
      setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        permissions: ['read'],
      });
      setError('Some error');
      setLoading(true);

      // Reset
      reset();
      const state = useAuthStore.getState();

      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.session).toBe(null);
      expect(state.permissions).toEqual([]);
      expect(state.role).toBe(null);
    });
  });

  describe('Permission Checks', () => {
    it('should check if user has permission', () => {
      const { setUser, hasPermission } = useAuthStore.getState();

      setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        permissions: [Permission.VIEW_DASHBOARD, Permission.VIEW_DONATIONS, Permission.DELETE_DONATION],
      });

      expect(hasPermission(Permission.VIEW_DASHBOARD)).toBe(true);
      expect(hasPermission(Permission.VIEW_DONATIONS)).toBe(true);
      expect(hasPermission(Permission.EDIT_SETTINGS)).toBe(false);
      expect(hasPermission(Permission.CREATE_USER)).toBe(false);
    });

    it('should return false for permission check when no user', () => {
      const { hasPermission } = useAuthStore.getState();

      expect(hasPermission('read')).toBe(false);
    });

    it('should check if user has role', () => {
      const { setUser, hasRole } = useAuthStore.getState();

      setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.ADMIN,
        permissions: [Permission.VIEW_DASHBOARD, Permission.VIEW_DONATIONS],
      });

      expect(hasRole(UserRole.ADMIN)).toBe(true);
      expect(hasRole(UserRole.VIEWER)).toBe(false);
      expect(hasRole(UserRole.MANAGER)).toBe(false);
    });

    it('should return false for role check when no user', () => {
      const { hasRole } = useAuthStore.getState();

      expect(hasRole(UserRole.ADMIN)).toBe(false);
    });
  });

  describe('Computed Properties', () => {
    it('should correctly compute isAuthenticated', () => {
      const { setUser } = useAuthStore.getState();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);

      setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.VIEWER,
        permissions: [],
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should correctly extract role from user', () => {
      const { setUser } = useAuthStore.getState();

      setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: UserRole.MANAGER,
        permissions: [Permission.VIEW_DASHBOARD, Permission.VIEW_DONATIONS, Permission.EDIT_DONATION, Permission.DELETE_DONATION],
      });

      expect(useAuthStore.getState().role).toBe(UserRole.MANAGER);
    });

    it('should correctly extract permissions from user', () => {
      const { setUser } = useAuthStore.getState();
      const permissions = [Permission.VIEW_DASHBOARD, Permission.VIEW_DONATIONS, Permission.EDIT_DONATION, Permission.DELETE_DONATION];

      setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
        permissions,
      });

      expect(useAuthStore.getState().user?.permissions || []).toEqual(permissions);
    });
  });

  describe('Error Handling', () => {
    it('should handle authentication errors', () => {
      const { setError, setLoading } = useAuthStore.getState();

      setLoading(true);
      setError('Invalid credentials');

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe('Invalid credentials');
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear error on successful authentication', () => {
      const { setError, setUser, clearError } = useAuthStore.getState();

      setError('Previous error');
      expect(useAuthStore.getState().error).toBe('Previous error');

      clearError();
      setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'user',
        permissions: [],
      });

      const state = useAuthStore.getState();
      expect(state.error).toBe(null);
      expect(state.isAuthenticated).toBe(true);
    });
  });
});
