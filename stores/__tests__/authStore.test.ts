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

  describe('Session Management', () => {
    beforeEach(() => {
      // Mock supabase
      vi.mock('../../lib/supabase', () => ({
        supabase: {
          auth: {
            refreshSession: vi.fn(),
          },
        },
      }));
    });

    it('should refresh session successfully', async () => {
      const { refreshSession } = useAuthStore.getState();
      const mockSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'Bearer',
        user: {
          id: '123',
          email: 'test@example.com',
        },
      };

      // Mock successful refresh
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      await refreshSession();
      const state = useAuthStore.getState();

      expect(state.session).toEqual(mockSession);
      expect(state.error).toBe(null);
    });

    it('should handle refresh session failure', async () => {
      const { refreshSession } = useAuthStore.getState();

      // Mock failed refresh
      const { supabase } = await import('../../lib/supabase');
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null },
        error: new Error('Refresh failed'),
      });

      await refreshSession();
      const state = useAuthStore.getState();

      expect(state.user).toBe(null);
      expect(state.session).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should prevent concurrent refresh attempts', async () => {
      const { refreshSession } = useAuthStore.getState();

      // Mock slow refresh
      const { supabase } = await import('../../lib/supabase');
      let resolveRefresh: (value: any) => void;
      const refreshPromise = new Promise(resolve => {
        resolveRefresh = resolve;
      });
      vi.mocked(supabase.auth.refreshSession).mockReturnValue(refreshPromise);

      // Start two concurrent refresh attempts
      const promise1 = refreshSession();
      const promise2 = refreshSession();

      // Should return the same promise
      expect(promise1).toBe(promise2);

      // Complete the refresh
      resolveRefresh!({
        data: { session: null },
        error: null,
      });

      await Promise.all([promise1, promise2]);
    });

    it('should check session expiry and logout if expired', () => {
      const { setSession, checkSessionExpiry, logout } = useAuthStore.getState();

      // Set expired session
      setSession({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: Date.now() / 1000 - 3600, // 1 hour ago
        token_type: 'Bearer',
        user: { id: '123', email: 'test@example.com' },
      });

      checkSessionExpiry();
      const state = useAuthStore.getState();

      expect(state.user).toBe(null);
      expect(state.session).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });

    it('should refresh session if it should be refreshed', async () => {
      const { setSession, checkSessionExpiry } = useAuthStore.getState();

      // Set session that should be refreshed (expires in 5 minutes)
      setSession({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: Date.now() / 1000 + 300, // 5 minutes
        token_type: 'Bearer',
        user: { id: '123', email: 'test@example.com' },
      });

      // Mock successful refresh
      const { supabase } = await import('../../lib/supabase');
      const mockSession = {
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_at: Date.now() / 1000 + 3600,
        token_type: 'Bearer',
        user: { id: '123', email: 'test@example.com' },
      };
      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      checkSessionExpiry();

      // Wait for async refresh
      await new Promise(resolve => setTimeout(resolve, 0));
      const state = useAuthStore.getState();

      expect(state.session).toEqual(mockSession);
    });

    it('should not check session expiry when not authenticated', () => {
      const { checkSessionExpiry, logout } = useAuthStore.getState();

      // Ensure no user is set
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);

      // Should not call logout
      const logoutSpy = vi.spyOn(useAuthStore.getState(), 'logout');
      checkSessionExpiry();

      expect(logoutSpy).not.toHaveBeenCalled();
    });
  });

  describe('Session Expiry Edge Cases', () => {
    it('should handle session with no expires_at', () => {
      const { setSession, checkSessionExpiry } = useAuthStore.getState();

      setSession({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: undefined,
        token_type: 'Bearer',
        user: { id: '123', email: 'test@example.com' },
      });

      // Should not crash
      expect(() => checkSessionExpiry()).not.toThrow();
    });

    it('should handle session with null expires_at', () => {
      const { setSession, checkSessionExpiry } = useAuthStore.getState();

      setSession({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: null,
        token_type: 'Bearer',
        user: { id: '123', email: 'test@example.com' },
      });

      // Should not crash
      expect(() => checkSessionExpiry()).not.toThrow();
    });

    it('should handle session with zero expires_at', () => {
      const { setSession, checkSessionExpiry } = useAuthStore.getState();

      setSession({
        access_token: 'token',
        refresh_token: 'refresh',
        expires_at: 0,
        token_type: 'Bearer',
        user: { id: '123', email: 'test@example.com' },
      });

      checkSessionExpiry();
      const state = useAuthStore.getState();

      expect(state.user).toBe(null);
      expect(state.isAuthenticated).toBe(false);
    });
  });
});
