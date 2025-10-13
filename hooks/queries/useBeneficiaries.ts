/**
 * @fileoverview Beneficiaries Query Hook
 * React Query hook for beneficiaries data
 */

import { useQuery } from '@tanstack/react-query';

// Types for beneficiaries
export interface Beneficiary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  district: string;
  registrationDate: Date;
  lastAidDate?: Date;
  aidCount: number;
  totalAidAmount: number;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  familyMembers: number;
  income: number;
  expenses: number;
  tags: string[];
  documents: {
    id: string;
    type: string;
    name: string;
    url: string;
    uploadDate: Date;
  }[];
}

// Query key factory
export const beneficiariesKeys = {
  all: ['beneficiaries'] as const,
  lists: () => [...beneficiariesKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...beneficiariesKeys.lists(), filters] as const,
  details: () => [...beneficiariesKeys.all, 'detail'] as const,
  detail: (id: string) => [...beneficiariesKeys.details(), id] as const,
  stats: () => [...beneficiariesKeys.all, 'stats'] as const,
};

/**
 * Mock data for beneficiaries
 * In real implementation, this would come from an API
 */
const mockBeneficiaries: Beneficiary[] = [
  {
    id: '1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    email: 'ahmet.yilmaz@email.com',
    phone: '+90 532 123 4567',
    address: 'Cumhuriyet Mahallesi, Atatürk Caddesi No: 15',
    city: 'İstanbul',
    district: 'Kadıköy',
    registrationDate: new Date('2024-01-15'),
    lastAidDate: new Date('2024-11-20'),
    aidCount: 8,
    totalAidAmount: 12500,
    status: 'active',
    priority: 'medium',
    notes: 'Düzenli yardım alıyor, ailesi 4 kişi',
    familyMembers: 4,
    income: 3500,
    expenses: 4200,
    tags: ['gıda-yardımı', 'nakdi-yardım', 'çocuklu-aile'],
    documents: [
      {
        id: 'doc1',
        type: 'kimlik',
        name: 'Kimlik Fotokopisi',
        url: '/documents/ahmet-yilmaz-kimlik.pdf',
        uploadDate: new Date('2024-01-15'),
      },
    ],
  },
  {
    id: '2',
    firstName: 'Fatma',
    lastName: 'Demir',
    email: 'fatma.demir@email.com',
    phone: '+90 533 987 6543',
    address: 'Merkez Mahallesi, İnönü Caddesi No: 42',
    city: 'Ankara',
    district: 'Çankaya',
    registrationDate: new Date('2024-02-20'),
    lastAidDate: new Date('2024-11-18'),
    aidCount: 12,
    totalAidAmount: 18750,
    status: 'active',
    priority: 'high',
    notes: 'Yaşlı, tek başına yaşıyor, sürekli tıbbi yardım gerekiyor',
    familyMembers: 1,
    income: 2800,
    expenses: 3200,
    tags: ['yaşlı', 'sağlık-yardımı', 'nakdi-yardım'],
    documents: [
      {
        id: 'doc2',
        type: 'kimlik',
        name: 'Kimlik Fotokopisi',
        url: '/documents/fatma-demir-kimlik.pdf',
        uploadDate: new Date('2024-02-20'),
      },
      {
        id: 'doc3',
        type: 'sağlık-raporu',
        name: 'Sağlık Raporu',
        url: '/documents/fatma-demir-saglik.pdf',
        uploadDate: new Date('2024-02-22'),
      },
    ],
  },
  {
    id: '3',
    firstName: 'Mehmet',
    lastName: 'Kaya',
    phone: '+90 534 555 1234',
    address: 'Yenişehir Mahallesi, Gazi Caddesi No: 78',
    city: 'İzmir',
    district: 'Konak',
    registrationDate: new Date('2024-03-10'),
    lastAidDate: new Date('2024-10-15'),
    aidCount: 5,
    totalAidAmount: 8750,
    status: 'pending',
    priority: 'low',
    notes: 'Yeni kayıt, belgeler eksik',
    familyMembers: 3,
    income: 4200,
    expenses: 3800,
    tags: ['yeni-kayıt', 'gıda-yardımı'],
    documents: [],
  },
  {
    id: '4',
    firstName: 'Ayşe',
    lastName: 'Özkan',
    email: 'ayse.ozkan@email.com',
    phone: '+90 535 777 8888',
    address: 'Bahçelievler Mahallesi, Cumhuriyet Caddesi No: 123',
    city: 'Bursa',
    district: 'Osmangazi',
    registrationDate: new Date('2024-01-05'),
    lastAidDate: new Date('2024-11-22'),
    aidCount: 15,
    totalAidAmount: 22500,
    status: 'active',
    priority: 'urgent',
    notes: 'Kanser tedavisi gören hasta, acil maddi yardım gerekiyor',
    familyMembers: 2,
    income: 2500,
    expenses: 5500,
    tags: ['kanser-hastası', 'acil-yardım', 'sağlık-yardımı', 'nakdi-yardım'],
    documents: [
      {
        id: 'doc4',
        type: 'kimlik',
        name: 'Kimlik Fotokopisi',
        url: '/documents/ayse-ozkan-kimlik.pdf',
        uploadDate: new Date('2024-01-05'),
      },
      {
        id: 'doc5',
        type: 'sağlık-raporu',
        name: 'Onkoloji Raporu',
        url: '/documents/ayse-ozkan-onkoloji.pdf',
        uploadDate: new Date('2024-01-08'),
      },
    ],
  },
];

/**
 * Hook to fetch beneficiaries list with filters
 */
export const useBeneficiariesList = (
  filters?: {
    status?: string;
    priority?: string;
    city?: string;
    district?: string;
    search?: string;
    limit?: number;
    offset?: number;
  },
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number;
  }
) => {
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;

  return useQuery({
    queryKey: beneficiariesKeys.list(filters || {}),
    queryFn: async (): Promise<{ data: Beneficiary[]; total: number }> => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // In real implementation, this would be an API call
        // const queryParams = new URLSearchParams();
        // if (filters?.status) queryParams.append('status', filters.status);
        // if (filters?.priority) queryParams.append('priority', filters.priority);
        // if (filters?.city) queryParams.append('city', filters.city);
        // if (filters?.district) queryParams.append('district', filters.district);
        // if (filters?.search) queryParams.append('search', filters.search);
        // if (filters?.limit) queryParams.append('limit', filters.limit.toString());
        // if (filters?.offset) queryParams.append('offset', filters.offset.toString());
        //
        // const response = await fetch(`/api/beneficiaries?${queryParams}`);
        // const data = await response.json();
        // return data;

        // Filter mock data
        let filteredBeneficiaries = [...mockBeneficiaries];

        if (filters?.status) {
          filteredBeneficiaries = filteredBeneficiaries.filter(
            (beneficiary) => beneficiary.status === filters.status
          );
        }

        if (filters?.priority) {
          filteredBeneficiaries = filteredBeneficiaries.filter(
            (beneficiary) => beneficiary.priority === filters.priority
          );
        }

        if (filters?.city) {
          filteredBeneficiaries = filteredBeneficiaries.filter((beneficiary) =>
            beneficiary.city.toLowerCase().includes(filters.city!.toLowerCase())
          );
        }

        if (filters?.district) {
          filteredBeneficiaries = filteredBeneficiaries.filter((beneficiary) =>
            beneficiary.district.toLowerCase().includes(filters.district!.toLowerCase())
          );
        }

        if (filters?.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredBeneficiaries = filteredBeneficiaries.filter(
            (beneficiary) =>
              beneficiary.firstName.toLowerCase().includes(searchTerm) ||
              beneficiary.lastName.toLowerCase().includes(searchTerm) ||
              beneficiary.email?.toLowerCase().includes(searchTerm) ||
              beneficiary.phone?.includes(searchTerm)
          );
        }

        // Sort by priority and registration date
        filteredBeneficiaries.sort((a, b) => {
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;

          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }

          return b.registrationDate.getTime() - a.registrationDate.getTime();
        });

        const total = filteredBeneficiaries.length;
        const paginatedData = filteredBeneficiaries.slice(offset, offset + limit);

        return {
          data: paginatedData,
          total,
        };
      } catch (error) {
        console.error('Failed to fetch beneficiaries list:', error);
        return { data: [], total: 0 };
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
 * Hook to fetch beneficiary details by ID
 */
export const useBeneficiaryDetails = (
  beneficiaryId: string,
  options?: {
    enabled?: boolean;
    staleTime?: number;
  }
) => {
  return useQuery({
    queryKey: beneficiariesKeys.detail(beneficiaryId),
    queryFn: async (): Promise<Beneficiary | null> => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // In real implementation, this would be an API call
        // const response = await fetch(`/api/beneficiaries/${beneficiaryId}`);
        // const data = await response.json();
        // return data;

        // Find mock beneficiary by ID
        const beneficiary = mockBeneficiaries.find((b) => b.id === beneficiaryId);
        return beneficiary || null;
      } catch (error) {
        console.error(`Failed to fetch beneficiary details for ID ${beneficiaryId}:`, error);
        return null;
      }
    },
    // Cache for 5 minutes
    staleTime: options?.staleTime || 5 * 60 * 1000,
    // Enable/disable the query
    enabled: options?.enabled !== false && !!beneficiaryId,
    // Retry configuration
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

/**
 * Hook to fetch beneficiaries statistics
 */
export const useBeneficiariesStats = (options?: { enabled?: boolean; staleTime?: number }) => {
  return useQuery({
    queryKey: beneficiariesKeys.stats(),
    queryFn: async (): Promise<{
      total: number;
      active: number;
      pending: number;
      inactive: number;
      byPriority: Record<string, number>;
      byCity: Record<string, number>;
      totalAidAmount: number;
      averageAidAmount: number;
    }> => {
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 400));

        // Calculate stats from mock data
        const total = mockBeneficiaries.length;
        const active = mockBeneficiaries.filter((b) => b.status === 'active').length;
        const pending = mockBeneficiaries.filter((b) => b.status === 'pending').length;
        const inactive = mockBeneficiaries.filter((b) => b.status === 'inactive').length;

        const byPriority = mockBeneficiaries.reduce(
          (acc, b) => {
            acc[b.priority] = (acc[b.priority] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        const byCity = mockBeneficiaries.reduce(
          (acc, b) => {
            acc[b.city] = (acc[b.city] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        const totalAidAmount = mockBeneficiaries.reduce((sum, b) => sum + b.totalAidAmount, 0);
        const averageAidAmount = totalAidAmount / total;

        return {
          total,
          active,
          pending,
          inactive,
          byPriority,
          byCity,
          totalAidAmount,
          averageAidAmount,
        };
      } catch (error) {
        console.error('Failed to fetch beneficiaries stats:', error);
        return {
          total: 0,
          active: 0,
          pending: 0,
          inactive: 0,
          byPriority: {},
          byCity: {},
          totalAidAmount: 0,
          averageAidAmount: 0,
        };
      }
    },
    // Cache for 5 minutes
    staleTime: options?.staleTime || 5 * 60 * 1000,
    // Enable/disable the query
    enabled: options?.enabled !== false,
    // Retry configuration
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};
