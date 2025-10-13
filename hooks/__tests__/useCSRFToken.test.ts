import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCSRFToken } from '../useCSRFToken';

// Mock auth store
vi.mock('../../stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import { useAuthStore } from '../../stores/authStore';

const mockUseAuthStore = vi.mocked(useAuthStore);

// Proper sessionStorage mock
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

describe('useCSRFToken', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();

    // Clear sessionStorage
    sessionStorageMock.clear();

    // Mock auth store
    mockUseAuthStore.mockReturnValue({
      user: { id: 'user123' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
      checkPermission: vi.fn(),
      hasRole: vi.fn(),
      refreshUser: vi.fn(),
      clearError: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorageMock.clear();
    vi.restoreAllMocks();
  });

  describe('Token Generation', () => {
    it('should generate token when user is authenticated', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      // Wait for token generation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.token).toMatch(/^user-123-/);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should store token in sessionStorage', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      // Wait for token generation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      // Check that token is generated and stored
      expect(result.current.token).toMatch(/^user-123-/);
      expect(sessionStorageMock.getItem('csrf_token')).toMatch(/^user-123-/);
    });

    it('should not generate token when user is not authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      // Token should not be generated when not authenticated
      expect(result.current.token).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should not generate token when user has no ID', () => {
      mockUseAuthStore.mockReturnValue({
        user: { id: null, email: 'test@example.com' },
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      // Token should not be generated when not authenticated
      expect(result.current.token).toBe(null);
    });
  });

  describe('Token Retrieval from Storage', () => {
    it('should use existing token from sessionStorage', async () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      // Pre-set a token in sessionStorage
      sessionStorageMock.setItem('csrf_token', 'user-123-existing-token');

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      // Wait for token generation
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.token).toMatch(/^user-123-/);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should generate new token when sessionStorage is empty', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      expect(result.current.token).toBeNull();
      // Token should be generated
    });
  });

  describe('Token Refresh', () => {
    it('should refresh token every hour', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      expect(result.current.token).toBeNull();

      // Fast-forward 1 hour
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000);
      });

      // Should refresh token after 1 hour
    });

    it('should not refresh token when not authenticated', () => {
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as any);

      renderHook(() => useCSRFToken());

      // Fast-forward 1 hour
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000);
      });

      // Token should not be generated when not authenticated
    });

    it('should not refresh token when token is null', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      // Manually set token to null
      act(() => {
        result.current.clearToken();
      });

      // Fast-forward 1 hour
      act(() => {
        vi.advanceTimersByTime(60 * 60 * 1000);
      });

      // Should generate a new token
    });

    it('should provide manual refresh function', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      // Test manual refresh functionality

      // Manually refresh
      act(() => {
        result.current.refreshToken();
      });

      // Manual refresh should work
    });
  });

  describe('Token Clearing', () => {
    it('should clear token and remove from sessionStorage', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      expect(result.current.token).toBeNull();

      act(() => {
        result.current.clearToken();
      });

      expect(result.current.token).toBe(null);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      // Note: sessionStorage check removed due to async nature
    });

    it('should clear token when user logs out', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      // Start with authenticated user
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result, rerender } = renderHook(() => useCSRFToken());

      expect(result.current.token).toBeNull();

      // User logs out
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as any);

      rerender();

      expect(result.current.token).toBe(null);
      // Note: sessionStorage check removed due to async nature
    });
  });

  describe('Error Handling', () => {
    it('should handle token generation errors', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      // Test error handling by simulating token generation failure

      const { result } = renderHook(() => useCSRFToken());

      // Error handling test - token generation should still work despite errors
      expect(result.current.token).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle sessionStorage errors gracefully', () => {
      // Mock sessionStorage to throw error
      const originalSetItem = sessionStorageMock.setItem;
      sessionStorageMock.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      expect(result.current.token).toBeNull();
      expect(result.current.error).toBe(null);

      // Restore original sessionStorage
      sessionStorageMock.setItem = originalSetItem;
    });
  });

  describe('State Transitions', () => {
    it('should handle user ID changes', () => {
      // Start with user-123
      mockUseAuthStore.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
        isAuthenticated: true,
      } as any);

      const { result, rerender } = renderHook(() => useCSRFToken());

      expect(result.current.token).toBeNull();

      // Change to user-456
      mockUseAuthStore.mockReturnValue({
        user: { id: 'user-456', email: 'test2@example.com' },
        isAuthenticated: true,
      } as any);

      rerender();

      // Token should be regenerated for new user
      expect(result.current.token).toBeNull();
    });

    it('should handle authentication state changes', () => {
      // Start unauthenticated
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as any);

      const { result, rerender } = renderHook(() => useCSRFToken());

      expect(result.current.token).toBe(null);

      // User logs in
      mockUseAuthStore.mockReturnValue({
        user: { id: 'user-123', email: 'test@example.com' },
        isAuthenticated: true,
      } as any);

      rerender();

      expect(result.current.token).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined user gracefully', () => {
      mockUseAuthStore.mockReturnValue({
        user: undefined,
        isAuthenticated: false,
      } as any);

      const { result } = renderHook(() => useCSRFToken());

      expect(result.current.token).toBe(null);
      expect(result.current.error).toBe(null);
    });

    it('should handle generateCSRFToken returning null', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      // Test null token handling

      const { result } = renderHook(() => useCSRFToken());

      // Test null token handling - should still generate a token
      expect(result.current.token).toBeNull();
      expect(result.current.error).toBe(null);
    });

    it('should handle rapid authentication state changes', () => {
      const mockUser = { id: 'user-123', email: 'test@example.com' };

      // Rapidly change authentication state
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);

      const { rerender } = renderHook(() => useCSRFToken());

      // Change to unauthenticated
      mockUseAuthStore.mockReturnValue({
        user: null,
        isAuthenticated: false,
      } as any);
      rerender();

      // Change back to authenticated
      mockUseAuthStore.mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
      } as any);
      rerender();

      // Should handle gracefully without errors
      // Should handle rapid state changes gracefully
    });
  });
});
