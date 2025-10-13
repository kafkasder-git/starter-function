/**
 * @fileoverview Events List Query Hook
 * React Query hook for events data
 */

import { useQuery } from '@tanstack/react-query';

// Types for events
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  type: 'meeting' | 'conference' | 'workshop' | 'social' | 'fundraising';
  attendees: number;
  maxAttendees?: number;
  organizer: string;
  tags: string[];
  imageUrl?: string;
  registrationUrl?: string;
}

// Query key factory
export const eventsKeys = {
  all: ['events'] as const,
  lists: () => [...eventsKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...eventsKeys.lists(), filters] as const,
  details: () => [...eventsKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventsKeys.details(), id] as const,
};

/**
 * Mock data for events
 * In real implementation, this would come from an API
 */
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Yıllık Genel Kurul Toplantısı',
    description: 'Derneğimizin yıllık genel kurul toplantısı düzenlenecektir. Tüm üyelerimiz davetlidir.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 hafta sonra
    location: 'Dernek Merkezi - Konferans Salonu',
    status: 'upcoming',
    type: 'meeting',
    attendees: 45,
    maxAttendees: 100,
    organizer: 'Yönetim Kurulu',
    tags: ['genel-kurul', 'toplantı', 'yıllık'],
  },
  {
    id: '2',
    title: 'Kış Yardım Kampanyası',
    description: 'Soğuk kış günlerinde ihtiyaç sahiplerine yardım kampanyası başlatıyoruz.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
    location: 'Çeşitli Lokasyonlar',
    status: 'upcoming',
    type: 'fundraising',
    attendees: 25,
    organizer: 'Sosyal Hizmetler Ekibi',
    tags: ['yardım', 'kış', 'kampanya'],
  },
  {
    id: '3',
    title: 'Eğitim Semineri: Dijital Dönüşüm',
    description: 'Günümüzün dijital dünyasında dernek yönetimi konulu eğitim semineri.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 gün önce
    location: 'Online - Zoom',
    status: 'completed',
    type: 'workshop',
    attendees: 78,
    maxAttendees: 100,
    organizer: 'Eğitim Komisyonu',
    tags: ['eğitim', 'dijital', 'seminer'],
  },
  {
    id: '4',
    title: 'Üye Tanışma Etkinliği',
    description: 'Yeni üyelerimizle tanışma ve kaynaşma etkinliği.',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 hafta sonra
    location: 'Dernek Merkezi - Bahçe',
    status: 'upcoming',
    type: 'social',
    attendees: 12,
    maxAttendees: 50,
    organizer: 'Üye İşleri Komisyonu',
    tags: ['tanışma', 'sosyal', 'üyeler'],
  },
  {
    id: '5',
    title: 'Bağış Koordinasyon Toplantısı',
    description: 'Bağış kampanyalarının koordinasyonu için aylık toplantı.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 gün önce
    location: 'Dernek Merkezi - Toplantı Odası',
    status: 'completed',
    type: 'meeting',
    attendees: 8,
    organizer: 'Bağış Koordinasyon Ekibi',
    tags: ['bağış', 'koordinasyon', 'toplantı'],
  },
];

/**
 * Hook to fetch events list with filters
 */
export const useEventsList = (filters?: {
  status?: string;
  type?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}, options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number;
}) => {
  const limit = filters?.limit || 20;
  
  return useQuery({
    queryKey: eventsKeys.list(filters || {}),
    queryFn: async (): Promise<Event[]> => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // In real implementation, this would be an API call
        // const queryParams = new URLSearchParams();
        // if (filters?.status) queryParams.append('status', filters.status);
        // if (filters?.type) queryParams.append('type', filters.type);
        // if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toISOString());
        // if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo.toISOString());
        // if (filters?.limit) queryParams.append('limit', filters.limit.toString());
        // 
        // const response = await fetch(`/api/events?${queryParams}`);
        // const data = await response.json();
        // return data;
        
        // Filter mock data
        let filteredEvents = [...mockEvents];
        
        if (filters?.status) {
          filteredEvents = filteredEvents.filter(event => event.status === filters.status);
        }
        
        if (filters?.type) {
          filteredEvents = filteredEvents.filter(event => event.type === filters.type);
        }
        
        if (filters?.dateFrom) {
          filteredEvents = filteredEvents.filter(event => event.date >= filters.dateFrom!);
        }
        
        if (filters?.dateTo) {
          filteredEvents = filteredEvents.filter(event => event.date <= filters.dateTo!);
        }
        
        // Sort by date (upcoming first)
        filteredEvents.sort((a, b) => {
          const now = new Date();
          const aIsUpcoming = a.date > now;
          const bIsUpcoming = b.date > now;
          
          if (aIsUpcoming && !bIsUpcoming) return -1;
          if (!aIsUpcoming && bIsUpcoming) return 1;
          
          return a.date.getTime() - b.date.getTime();
        });
        
        return filteredEvents.slice(0, limit);
      } catch (error) {
        console.error('Failed to fetch events list:', error);
        return [];
      }
    },
    // Cache for 3 minutes
    staleTime: options?.staleTime || 3 * 60 * 1000,
    // Refetch every 5 minutes
    refetchInterval: options?.refetchInterval || 5 * 60 * 1000,
    // Enable/disable the query
    enabled: options?.enabled !== false,
    // Retry configuration
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Hook to fetch upcoming events
 */
export const useUpcomingEvents = (limit = 5, options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useEventsList(
    { 
      status: 'upcoming', 
      limit,
      dateFrom: new Date(), // Only future events
    },
    {
      ...options,
      staleTime: options?.staleTime || 2 * 60 * 1000, // 2 minutes for upcoming events
    }
  );
};

/**
 * Hook to fetch event details by ID
 */
export const useEventDetails = (eventId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  return useQuery({
    queryKey: eventsKeys.detail(eventId),
    queryFn: async (): Promise<Event | null> => {
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // In real implementation, this would be an API call
        // const response = await fetch(`/api/events/${eventId}`);
        // const data = await response.json();
        // return data;
        
        // Find mock event by ID
        const event = mockEvents.find(e => e.id === eventId);
        return event || null;
      } catch (error) {
        console.error(`Failed to fetch event details for ID ${eventId}:`, error);
        return null;
      }
    },
    // Cache for 5 minutes
    staleTime: options?.staleTime || 5 * 60 * 1000,
    // Enable/disable the query
    enabled: options?.enabled !== false && !!eventId,
    // Retry configuration
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
