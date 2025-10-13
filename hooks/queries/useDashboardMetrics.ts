/**
 * @fileoverview Dashboard Metrics Query Hook
 * React Query hook for dashboard metrics data
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { intelligentStatsService } from '../../services/intelligentStatsService';

// Types for dashboard metrics
export interface DashboardMetrics {
  totalDonations: number;
  totalAidRequests: number;
  totalMembers: number;
  totalEvents: number;
  monthlyDonationGrowth: number;
  monthlyAidGrowth: number;
  completionRate: number;
  satisfactionRate: number;
}

// Query key factory
export const dashboardKeys = {
  all: ['dashboard'] as const,
  metrics: () => [...dashboardKeys.all, 'metrics'] as const,
  metricsWithFilters: (filters: Record<string, any>) => 
    [...dashboardKeys.metrics(), filters] as const,
};

/**
 * Hook to fetch dashboard metrics
 */
export const useDashboardMetrics = (options?: {
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: dashboardKeys.metrics(),
    queryFn: async (): Promise<DashboardMetrics> => {
      try {
        // Use the existing intelligent stats service
        const stats = await intelligentStatsService.getStats();
        
        // Transform the data to match our interface
        return {
          totalDonations: stats.totalDonations || 0,
          totalAidRequests: stats.totalAidRequests || 0,
          totalMembers: stats.totalMembers || 0,
          totalEvents: stats.totalEvents || 0,
          monthlyDonationGrowth: stats.monthlyDonationGrowth || 0,
          monthlyAidGrowth: stats.monthlyAidGrowth || 0,
          completionRate: stats.completionRate || 0,
          satisfactionRate: stats.satisfactionRate || 0,
        };
      } catch (error) {
        console.error('Failed to fetch dashboard metrics:', error);
        
        // Return fallback data on error
        return {
          totalDonations: 0,
          totalAidRequests: 0,
          totalMembers: 0,
          totalEvents: 0,
          monthlyDonationGrowth: 0,
          monthlyAidGrowth: 0,
          completionRate: 0,
          satisfactionRate: 0,
        };
      }
    },
    // Cache for 5 minutes
    staleTime: options?.staleTime || 5 * 60 * 1000,
    // Refetch every 2 minutes for real-time updates
    refetchInterval: options?.refetchInterval || 2 * 60 * 1000,
    // Enable/disable the query
    enabled: options?.enabled !== false,
    // Retry configuration
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to prefetch dashboard metrics
 * Useful for preloading data before user navigates to dashboard
 */
export const usePrefetchDashboardMetrics = () => {
  const queryClient = useQueryClient();
  
  return useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: dashboardKeys.metrics(),
      queryFn: async (): Promise<DashboardMetrics> => {
        const stats = await intelligentStatsService.getStats();
        return {
          totalDonations: stats.totalDonations || 0,
          totalAidRequests: stats.totalAidRequests || 0,
          totalMembers: stats.totalMembers || 0,
          totalEvents: stats.totalEvents || 0,
          monthlyDonationGrowth: stats.monthlyDonationGrowth || 0,
          monthlyAidGrowth: stats.monthlyAidGrowth || 0,
          completionRate: stats.completionRate || 0,
          satisfactionRate: stats.satisfactionRate || 0,
        };
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
};
