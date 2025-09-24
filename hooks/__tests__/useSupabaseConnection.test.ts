import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useSupabaseConnection, isSupabaseConfigured } from '../useSupabaseConnection';
import { supabase } from '../../lib/supabase';

// Mock supabase client
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn(),
  },
}));

describe('useSupabaseConnection', () => {
  beforeEach(() => {
    vi.resetModules(); // Reset modules to clear import.meta.env mocks
    vi.clearAllMocks();
  });

  it('should return not connected if config is missing', async () => {
    vi.stubGlobal('import.meta.env', { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' });

    const { result } = renderHook(() => useSupabaseConnection());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toContain('Supabase konfigürasyonu eksik');
  });

  it('should return connected on successful connection test', async () => {
    vi.stubGlobal('import.meta.env', {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    });
    (supabase.from('users').select as vi.Mock).mockResolvedValue({
      data: [{ count: 1 }],
      error: null,
    });

    const { result } = renderHook(() => useSupabaseConnection());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.projectUrl).toBe('https://test.supabase.co');
  });

  it('should return connected even if users table does not exist', async () => {
    vi.stubGlobal('import.meta.env', {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    });
    (supabase.from('users').select as vi.Mock).mockResolvedValue({
      data: null,
      error: { message: 'relation "public.users" does not exist' },
    });

    const { result } = renderHook(() => useSupabaseConnection());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isConnected).toBe(true);
    expect(result.current.error).toContain('Users tablosu henüz oluşturulmamış');
  });

  it('should return error on connection failure', async () => {
    vi.stubGlobal('import.meta.env', {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    });
    const errorMessage = 'Connection failed';
    (supabase.from('users').select as vi.Mock).mockResolvedValue({
      data: null,
      error: { message: errorMessage },
    });

    const { result } = renderHook(() => useSupabaseConnection());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });
});

describe('isSupabaseConfigured', () => {
  it('should return true for valid configuration', () => {
    vi.stubGlobal('import.meta.env', {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    });
    expect(isSupabaseConfigured()).toBe(true);
  });

  it('should return false for invalid URL', () => {
    vi.stubGlobal('import.meta.env', {
      VITE_SUPABASE_URL: 'your-project',
      VITE_SUPABASE_ANON_KEY: 'test-key',
    });
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('should return false for invalid key', () => {
    vi.stubGlobal('import.meta.env', {
      VITE_SUPABASE_URL: 'https://test.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'your-anon-key',
    });
    expect(isSupabaseConfigured()).toBe(false);
  });

  it('should return false for missing config', () => {
    vi.stubGlobal('import.meta.env', { VITE_SUPABASE_URL: '', VITE_SUPABASE_ANON_KEY: '' });
    expect(isSupabaseConfigured()).toBe(false);
  });
});
