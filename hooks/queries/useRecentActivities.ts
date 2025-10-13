/**
 * @fileoverview Recent Activities Query Hook
 * React Query hook for recent activities data
 */

import { useQuery } from '@tanstack/react-query';

// Types for recent activities
export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: 'donation' | 'aid_request' | 'member_join' | 'campaign' | 'event' | 'report';
  status: 'completed' | 'pending' | 'in_progress';
  user?: string;
  amount?: number;
  icon?: string;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
}

// Query key factory
export const activitiesKeys = {
  all: ['activities'] as const,
  recent: () => [...activitiesKeys.all, 'recent'] as const,
  recentWithLimit: (limit: number) => [...activitiesKeys.recent(), { limit }] as const,
  byType: (type: string) => [...activitiesKeys.all, 'type', type] as const,
};

/**
 * Mock data for recent activities
 * In real implementation, this would come from an API
 */
const mockActivities: RecentActivity[] = [
  {
    id: '1',
    title: 'Yeni Bağış Kaydı',
    description: 'ABC Şirketi tarafından 5.000₺ bağış yapıldı',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 saat önce
    type: 'donation',
    status: 'completed',
    user: 'Muhasebe Ekibi',
    amount: 5000,
    icon: 'Heart',
    color: 'text-success-600',
    priority: 'medium',
  },
  {
    id: '2',
    title: 'Yardım Başvurusu',
    description: 'Ahmet Yılmaz - Gıda yardımı başvurusu',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 saat önce
    type: 'aid_request',
    status: 'pending',
    user: 'Sosyal Hizmetler',
    icon: 'Users',
    color: 'text-info-600',
    priority: 'high',
  },
  {
    id: '3',
    title: 'Yeni Üye Kaydı',
    description: 'Fatma Demir sisteme üye olarak katıldı',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 saat önce
    type: 'member_join',
    status: 'completed',
    user: 'Üye İşleri',
    icon: 'UserPlus',
    color: 'text-primary-600',
    priority: 'low',
  },
  {
    id: '4',
    title: 'Kampanya Başlatıldı',
    description: 'Kış Yardım Kampanyası aktif hale getirildi',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 saat önce
    type: 'campaign',
    status: 'in_progress',
    user: 'Kampanya Ekibi',
    icon: 'Megaphone',
    color: 'text-warning-600',
    priority: 'high',
  },
  {
    id: '5',
    title: 'Etkinlik Planlandı',
    description: 'Yıllık Genel Kurul toplantısı planlandı',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 saat önce
    type: 'event',
    status: 'pending',
    user: 'Etkinlik Ekibi',
    icon: 'Calendar',
    color: 'text-purple-600',
    priority: 'medium',
  },
  {
    id: '6',
    title: 'Aylık Rapor',
    description: 'Kasım ayı faaliyet raporu hazırlandı',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 gün önce
    type: 'report',
    status: 'completed',
    user: 'Raporlama Ekibi',
    icon: 'FileText',
    color: 'text-gray-600',
    priority: 'low',
  },
];

/**
 * Hook to fetch recent activities
 */
export const useRecentActivities = (options?: {
  limit?: number;
  enabled?: boolean;
  refetchInterval?: number;
  staleTime?: number;
}) => {
  const limit = options?.limit || 10;
  
  return useQuery({
    queryKey: activitiesKeys.recentWithLimit(limit),
    queryFn: async (): Promise<RecentActivity[]> => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // In real implementation, this would be an API call
        // const response = await fetch(`/api/activities/recent?limit=${limit}`);
        // const data = await response.json();
        // return data;
        
        // Return mock data for now
        return mockActivities.slice(0, limit);
      } catch (error) {
        console.error('Failed to fetch recent activities:', error);
        
        // Return empty array on error
        return [];
      }
    },
    // Cache for 2 minutes (activities change frequently)
    staleTime: options?.staleTime || 2 * 60 * 1000,
    // Refetch every 30 seconds for real-time updates
    refetchInterval: options?.refetchInterval || 30 * 1000,
    // Enable/disable the query
    enabled: options?.enabled !== false,
    // Retry configuration
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

/**
 * Hook to fetch activities by type
 */
export const useActivitiesByType = (type: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: activitiesKeys.byType(type),
    queryFn: async (): Promise<RecentActivity[]> => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Filter mock data by type
        return mockActivities.filter(activity => activity.type === type);
      } catch (error) {
        console.error(`Failed to fetch activities for type ${type}:`, error);
        return [];
      }
    },
    // Cache for 5 minutes
    staleTime: options?.staleTime || 5 * 60 * 1000,
    // Enable/disable the query
    enabled: options?.enabled !== false && !!type,
    // Retry configuration
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
