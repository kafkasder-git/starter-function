import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';
// import { SupabaseAuthProvider } from '../../contexts/SupabaseAuthContext';
// import { ToastProvider } from '../../components/ToastProvider';

// Mock Supabase client for testing
const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    }),
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
  }),
  rpc: vi.fn(),
};

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="test-wrapper">{children}</div>;
};

const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  permissions: ['read', 'write', 'delete'],
  ...overrides,
});

export const createMockBeneficiary = (overrides = {}) => ({
  id: '1',
  name: 'Test',
  surname: 'User',
  id_number: '12345678901',
  phone: '05551234567',
  email: 'test@example.com',
  address: 'Test Address',
  family_size: 4,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockKumbara = (overrides = {}) => ({
  id: 'kumbara-123',
  code: 'KMB-001',
  name: 'Test Kumbara',
  location: 'Test Location',
  address: 'Test Address 123',
  status: 'active' as const,
  installDate: new Date().toISOString(),
  lastCollection: null,
  totalAmount: 1500,
  monthlyAverage: 125,
  qrCode: 'KMB-001-QR',
  contactPerson: 'Test Person',
  phone: '05551234567',
  notes: 'Test notes',
  coordinates: {
    lat: 41.0082,
    lng: 28.9784,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'user-123',
  ...overrides,
});

export const createTestQRData = (overrides = {}) => ({
  code: 'KMB-001',
  name: 'Test Kumbara',
  location: 'Test Location',
  amount: 1500,
  lastCollection: new Date().toISOString(),
  contactPerson: 'Test Person',
  phone: '05551234567',
  ...overrides,
});

export const createMockCollection = (overrides = {}) => ({
  id: 'collection-123',
  kumbara_id: 'kumbara-123',
  collection_date: new Date().toISOString(),
  amount: 500,
  currency: 'TRY',
  collector_name: 'Test Collector',
  collector_id: 'user-123',
  notes: 'Test collection',
  collection_method: 'scheduled' as const,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'user-123',
  ...overrides,
});

// Utility functions for testing
export const waitFor = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach((key) => delete store[key]);
    }),
  };
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  window.IntersectionObserverEntry = vi.fn();
};

export const mockResizeObserver = () => {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  window.ResizeObserverEntry = vi.fn();
};

// Re-export everything
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Override the default render with our custom render
export { customRender as render };
export { mockSupabaseClient };
