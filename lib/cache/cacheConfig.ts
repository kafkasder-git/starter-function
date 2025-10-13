/**
 * @fileoverview Cache Configuration
 * @description Centralized cache configuration for React Query and other caching strategies
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Cache configuration for React Query
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep unused data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 3 times
      retry: 3,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
      // Background refetch interval (disabled by default)
      refetchInterval: false,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
};

/**
 * Cache keys for consistent query key management
 */
export const CACHE_KEYS = {
  // User related
  USER_PROFILE: ['user', 'profile'] as const,
  USER_PREFERENCES: ['user', 'preferences'] as const,
  USER_PERMISSIONS: ['user', 'permissions'] as const,

  // Beneficiaries
  BENEFICIARIES: ['beneficiaries'] as const,
  BENEFICIARY_DETAIL: (id: string) => ['beneficiaries', id] as const,

  // Aid applications
  AID_APPLICATIONS: ['aid-applications'] as const,
  AID_APPLICATION_DETAIL: (id: string) => ['aid-applications', id] as const,

  // Donations
  DONATIONS: ['donations'] as const,
  DONATION_DETAIL: (id: string) => ['donations', id] as const,

  // Members
  MEMBERS: ['members'] as const,
  MEMBER_DETAIL: (id: string) => ['members', id] as const,

  // Statistics
  STATS_BENEFICIARIES: ['stats', 'beneficiaries'] as const,
  STATS_DONATIONS: ['stats', 'donations'] as const,
  STATS_MEMBERS: ['stats', 'members'] as const,
  STATS_OVERVIEW: ['stats', 'overview'] as const,

  // System
  SYSTEM_SETTINGS: ['system', 'settings'] as const,
  FEATURE_FLAGS: ['system', 'feature-flags'] as const,
} as const;

/**
 * Cache invalidation patterns
 */
export const CACHE_INVALIDATION = {
  // Invalidate all user-related data
  invalidateUserData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['user'] });
  },

  // Invalidate all beneficiary data
  invalidateBeneficiaryData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: CACHE_KEYS.BENEFICIARIES });
  },

  // Invalidate all statistics
  invalidateStats: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['stats'] });
  },

  // Invalidate all system data
  invalidateSystemData: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['system'] });
  },
} as const;

/**
 * Cache optimization utilities
 */
export const CACHE_UTILS = {
  /**
   * Prefetch data for better user experience
   */
  prefetchUserProfile: async (queryClient: QueryClient) => {
    await queryClient.prefetchQuery({
      queryKey: CACHE_KEYS.USER_PROFILE,
      staleTime: 5 * 60 * 1000,
    });
  },

  /**
   * Prefetch common data on app initialization
   */
  prefetchInitialData: async (queryClient: QueryClient) => {
    const prefetchPromises = [
      CACHE_UTILS.prefetchUserProfile(queryClient),
      // Add more prefetch operations as needed
    ];

    await Promise.allSettled(prefetchPromises);
  },

  /**
   * Clear all cache data
   */
  clearAllCache: (queryClient: QueryClient) => {
    queryClient.clear();
  },

  /**
   * Remove stale data from cache
   */
  removeStaleData: (queryClient: QueryClient) => {
    queryClient.removeQueries({ stale: true });
  },
} as const;

/**
 * Browser cache configuration
 */
export const BROWSER_CACHE = {
  // Service worker cache names
  CACHE_NAMES: {
    STATIC: 'static-v1',
    DYNAMIC: 'dynamic-v1',
    API: 'api-v1',
    IMAGES: 'images-v1',
  },

  // Cache strategies
  STRATEGIES: {
    // Cache first for static assets
    CACHE_FIRST: 'cache-first',
    // Network first for API calls
    NETWORK_FIRST: 'network-first',
    // Stale while revalidate for dynamic content
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  },

  // Cache expiration times (in seconds)
  EXPIRATION: {
    STATIC: 365 * 24 * 60 * 60, // 1 year
    DYNAMIC: 24 * 60 * 60, // 1 day
    API: 5 * 60, // 5 minutes
    IMAGES: 7 * 24 * 60 * 60, // 1 week
  },
} as const;
