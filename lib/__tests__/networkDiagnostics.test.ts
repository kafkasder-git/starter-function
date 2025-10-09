/**
 * @fileoverview Network Diagnostics Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkManager, getUserFriendlyErrorMessage, isRetryableError } from '../networkDiagnostics';
import type { NetworkError } from '../networkDiagnostics';

// Mock fetch
global.fetch = vi.fn();

describe('NetworkManager', () => {
  let networkManager: NetworkManager;

  beforeEach(() => {
    vi.clearAllMocks();
    networkManager = NetworkManager.getInstance();
  });

  it('should create singleton instance', () => {
    const instance1 = NetworkManager.getInstance();
    const instance2 = NetworkManager.getInstance();
    expect(instance1).toBe(instance2);
  });

  it('should test connectivity successfully', async () => {
    // Mock successful responses
    (global.fetch as any).mockResolvedValueOnce({ ok: true }); // Internet test
    (global.fetch as any).mockResolvedValueOnce({ ok: true }); // Supabase test

    const diagnostics = await networkManager.testConnectivity();

    expect(diagnostics.isOnline).toBe(true);
    expect(diagnostics.canReachInternet).toBe(true);
    expect(diagnostics.canReachSupabase).toBe(true);
    expect(diagnostics.connectionQuality).toBe('excellent');
  });

  it('should handle network errors gracefully', async () => {
    // Mock network error
    (global.fetch as any).mockRejectedValueOnce(new Error('Failed to fetch'));

    const diagnostics = await networkManager.testConnectivity();

    expect(diagnostics.isOnline).toBe(true);
    expect(diagnostics.canReachInternet).toBe(false);
    expect(diagnostics.connectionQuality).toBe('poor');
  });
});

describe('Error Utilities', () => {
  it('should return user-friendly error messages', () => {
    const networkError: NetworkError = {
      type: 'NETWORK_ERROR',
      message: 'Failed to fetch'
    };

    const message = getUserFriendlyErrorMessage(networkError);
    expect(message).toBe('Bağlantı hatası. İnternet bağlantınızı kontrol edin ve tekrar deneyin.');
  });

  it('should identify retryable errors', () => {
    const networkError: NetworkError = {
      type: 'NETWORK_ERROR',
      message: 'Failed to fetch'
    };

    expect(isRetryableError(networkError)).toBe(true);

    const authError: NetworkError = {
      type: 'AUTH_ERROR',
      message: 'Unauthorized'
    };

    expect(isRetryableError(authError)).toBe(false);
  });
});
