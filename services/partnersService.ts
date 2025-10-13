/**
 * @fileoverview partnersService Module - Partners/Sponsors management service
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { db, collections, queryHelpers } from '../lib/database';
import { logger } from '../lib/logging/logger';
import { useAuthStore } from '../stores/authStore';
import type { 
  PartnerStats, 
  MonthlyTrend, 
  TopDonor, 
  DonationFrequency,
  SponsorOrganization 
} from '../types/partners';

// Partner interfaces
export interface Partner {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  partner_type: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  tax_number: string | null;
  status: string;
  relationship_start: string;
  relationship_end: string | null;
  contract_details: string | null;
  payment_terms: string | null;
  services_provided: string[] | null;
  notes: string | null;
  rating: number | null;
  last_contact_date: string | null;
  website: string | null;
  social_media: Record<string, string> | null;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
}

export interface PartnerInsert {
  name: string;
  partner_type: string;
  relationship_start: string;
  created_by: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  tax_number?: string | null;
  status?: string;
  relationship_end?: string | null;
  contract_details?: string | null;
  payment_terms?: string | null;
  services_provided?: string[] | null;
  notes?: string | null;
  rating?: number | null;
  last_contact_date?: string | null;
  website?: string | null;
  social_media?: Record<string, string> | null;
}

export interface PartnerUpdate {
  name?: string;
  partner_type?: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  tax_number?: string | null;
  status?: string;
  relationship_start?: string;
  relationship_end?: string | null;
  contract_details?: string | null;
  payment_terms?: string | null;
  services_provided?: string[] | null;
  notes?: string | null;
  rating?: number | null;
  last_contact_date?: string | null;
  website?: string | null;
  social_media?: Record<string, string> | null;
  updated_by?: string;
  updated_at?: string;
}

export interface PartnersFilters {
  searchTerm?: string;
  partnerType?: string;
  status?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PartnerStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  totalSponsors: number;
  activeSponsors: number;
}

export interface PartnersApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
  totalPages?: number;
}

// SponsorOrganization interface for UI compatibility
export interface SponsorOrganization {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  totalSponsorship: number;
  currentProjects: number;
  completedProjects: number;
  lastSponsorshipDate: string;
  contractStart: string;
  contractEnd: string;
  sponsorshipAreas: string[];
  rating: number;
  website: string;
  taxNumber: string;
  description: string;
  logo: string;
  tags: string[];
  donorCount: number;
}

// Module-level constants
const collectionName = collections.PARTNERS;

// Helper functions
/**
 * Map Partner to SponsorOrganization interface
 */
function mapPartnerToSponsor(partner: Partner): SponsorOrganization {
  return {
    id: partner.id,
    name: partner.name,
    description: partner.notes || '',
    logo: partner.website || '',
    tags: partner.services_provided || [],
    donorCount: 0, // This would need to be calculated from donations
  };
}

/**
 * Partners management service
 */
const partnersService = {
  /**
   * Map Partner to SponsorOrganization interface (compatibility method)
   */
  async mapPartnerToSponsor(partner: Partner): Promise<SponsorOrganization> {
    try {
      // Donations tablosundan gerçek hesaplamalar
      const { data: donations } = await db.list(collections.DONATIONS, [
        queryHelpers.equal('partner_id', partner.id),
        queryHelpers.order('desc', 'created_at')
      ]);

      const totalSponsorship = donations?.documents?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0;
      const donorCount = new Set(donations?.documents?.map(d => d.donor_id).filter(Boolean)).size || 0;
      const lastSponsorshipDate = donations?.documents?.[0]?.created_at || partner.relationship_start;

      return {
        id: partner.id,
        name: partner.name,
        type: partner.partner_type === 'sponsor' ? 'Kurumsal Sponsor' : partner.partner_type,
        contactPerson: partner.contact_person || '',
        phone: partner.phone || '',
        email: partner.email || '',
        address: partner.address || '',
        status:
          partner.status === 'active'
            ? 'Aktif'
            : partner.status === 'inactive'
              ? 'Pasif'
              : partner.status,
        totalSponsorship,
        currentProjects: 0, // TODO: Calculate from projects table when available
        completedProjects: 0, // TODO: Calculate from projects table when available
        lastSponsorshipDate,
        contractStart: partner.relationship_start,
        contractEnd: partner.relationship_end || '',
        sponsorshipAreas: partner.services_provided || [],
        rating: partner.rating || 0,
        website: partner.website || '',
        taxNumber: partner.tax_number || '',
        description: partner.notes || '',
        logo: partner.logo_url || '', // Logo field added
        tags: partner.tags || [], // Tags field added
        donorCount,
      };
    } catch (error) {
      logger.error('Error calculating partner statistics:', error);
      // Fallback to basic data if calculation fails
      return {
        id: partner.id,
        name: partner.name,
        type: partner.partner_type === 'sponsor' ? 'Kurumsal Sponsor' : partner.partner_type,
        contactPerson: partner.contact_person || '',
        phone: partner.phone || '',
        email: partner.email || '',
        address: partner.address || '',
        status:
          partner.status === 'active'
            ? 'Aktif'
            : partner.status === 'inactive'
              ? 'Pasif'
              : partner.status,
        totalSponsorship: 0,
        currentProjects: 0,
        completedProjects: 0,
        lastSponsorshipDate: partner.relationship_start,
        contractStart: partner.relationship_start,
        contractEnd: partner.relationship_end || '',
        sponsorshipAreas: partner.services_provided || [],
        rating: partner.rating || 0,
        website: partner.website || '',
        taxNumber: partner.tax_number || '',
        description: partner.notes || '',
        logo: partner.logo_url || '',
        tags: partner.tags || [],
        donorCount: 0,
      };
    }
  },

  /**
   * Fetch paginated partners with filtering
   */
  async getPartners(
    page: number = 1,
    pageSize: number = 10,
    filters?: PartnersFilters
  ): Promise<PartnersApiResponse<Partner[]>> {
    try {
      logger.info('Fetching partners', { page, pageSize, filters });

      const queries = [];

      // Apply filters
      if (filters?.searchTerm) {
        // Appwrite search is simpler - search by name only
        queries.push(queryHelpers.search('name', filters.searchTerm));
      }

      if (filters?.partnerType) {
        queries.push(queryHelpers.equal('partner_type', filters.partnerType));
      }

      if (filters?.status) {
        queries.push(queryHelpers.equal('status', filters.status));
      }

      if (filters?.city) {
        queries.push(queryHelpers.equal('city', filters.city));
      }

      if (filters?.dateFrom) {
        queries.push(queryHelpers.greaterThanEqualDate('created_at', filters.dateFrom));
      }

      if (filters?.dateTo) {
        queries.push(queryHelpers.lessThanEqualDate('created_at', filters.dateTo));
      }

      // Apply pagination
      const offset = (page - 1) * pageSize;
      queries.push(queryHelpers.offset(offset));
      queries.push(queryHelpers.limit(pageSize));

      // Order by created_at desc
      queries.push(queryHelpers.orderDesc('created_at'));

      const { data, error } = await db.list(collectionName, queries);

      if (error) {
        logger.error('Error fetching partners', error);
        return {
          data: null,
          error: 'Ortaklar yüklenirken bir hata oluştu',
          count: 0,
          totalPages: 0,
        };
      }

      const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;

      logger.info('Successfully fetched partners', { count: data?.total, totalPages });

      return {
        data: data?.documents || [],
        error: null,
        count: data?.total || 0,
        totalPages,
      };
    } catch (error) {
      logger.error('Unexpected error fetching partners', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
        count: 0,
        totalPages: 0,
      };
    }
  },

  /**
   * Fetch sponsors (partners with type 'sponsor')
   */
  async getSponsors(
    page: number = 1,
    pageSize: number = 10,
    filters?: PartnersFilters
  ): Promise<PartnersApiResponse<SponsorOrganization[]>> {
    try {
      const sponsorFilters = {
        ...filters,
        partnerType: 'sponsor',
      };

      const result = await this.getPartners(page, pageSize, sponsorFilters);

      if (result.error || !result.data) {
        return {
          data: null,
          error: result.error,
          count: result.count,
          totalPages: result.totalPages,
        };
      }

      const sponsors = result.data.map((partner) => this.mapPartnerToSponsor(partner));

      return {
        data: sponsors,
        error: null,
        count: result.count,
        totalPages: result.totalPages,
      };
    } catch (error) {
      logger.error('Unexpected error fetching sponsors', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
        count: 0,
        totalPages: 0,
      };
    }
  },

  /**
   * Fetch single partner by ID
   */
  async getPartner(id: string): Promise<PartnersApiResponse<Partner>> {
    try {
      logger.info('Fetching partner by ID', { id });

      const { data, error } = await db.get(collectionName, id);

      if (error) {
        logger.error('Error fetching partner', error);
        return {
          data: null,
          error: 'Ortak bulunamadı',
        };
      }

      logger.info('Successfully fetched partner', { id });

      return {
        data: data as Partner,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error fetching partner', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Create new partner
   */
  async createPartner(partnerData: PartnerInsert): Promise<PartnersApiResponse<Partner>> {
    try {
      logger.info('Creating partner', { name: partnerData.name });

      const insertData = {
        ...partnerData,
        status: partnerData.status || 'active',
      };

      const { data, error } = await db.create(collectionName, insertData);

      if (error) {
        logger.error('Error creating partner', error);
        return {
          data: null,
          error: 'Ortak oluşturulurken bir hata oluştu',
        };
      }

      logger.info('Successfully created partner', { id: data.$id, name: data.name });

      return {
        data: data as Partner,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error creating partner', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Update existing partner
   */
  async updatePartner(id: string, updates: PartnerUpdate): Promise<PartnersApiResponse<Partner>> {
    try {
      logger.info('Updating partner', { id });

      const user = useAuthStore.getState().user;
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      };

      const { data, error } = await db.update(collectionName, id, updateData);

      if (error) {
        logger.error('Error updating partner', error);
        return {
          data: null,
          error: 'Ortak güncellenirken bir hata oluştu',
        };
      }

      logger.info('Successfully updated partner', { id });

      return {
        data: data as Partner,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error updating partner', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Soft delete partner
   */
  async deletePartner(id: string): Promise<PartnersApiResponse<boolean>> {
    try {
      logger.info('Deleting partner', { id });

      const { error } = await db.update(collectionName, id, {
        deleted_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Error deleting partner', error);
        return {
          data: null,
          error: 'Ortak silinirken bir hata oluştu',
        };
      }

      logger.info('Successfully deleted partner', { id });

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error deleting partner', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get partner statistics
   */
  async getPartnerStats(): Promise<PartnersApiResponse<PartnerStats>> {
    try {
      logger.info('Fetching partner statistics');

      const { data, error } = await db.list(collectionName, [
        queryHelpers.select(['partner_type', 'status']),
      ]);

      if (error) {
        logger.error('Error fetching partner stats', error);
        return {
          data: null,
          error: 'İstatistikler yüklenirken bir hata oluştu',
        };
      }

      const partners = data?.documents || [];
      const total = partners.length;

      // Count by type
      const byType: Record<string, number> = {};
      partners.forEach((partner: any) => {
        byType[partner.partner_type] = (byType[partner.partner_type] || 0) + 1;
      });

      // Count by status
      const byStatus: Record<string, number> = {};
      partners.forEach((partner: any) => {
        byStatus[partner.status] = (byStatus[partner.status] || 0) + 1;
      });

      const totalSponsors = byType['sponsor'] || 0;
      const activeSponsors = partners.filter(
        (p: any) => p.partner_type === 'sponsor' && p.status === 'active'
      ).length;

      const stats: PartnerStats = {
        total,
        byType,
        byStatus,
        totalSponsors,
        activeSponsors,
      };

      logger.info('Successfully calculated partner stats', stats);

      return {
        data: stats,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error calculating partner stats', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get unique partner types for filter dropdown
   */
  async getPartnerTypes(): Promise<PartnersApiResponse<string[]>> {
    try {
      logger.info('Fetching partner types');

      const { data, error } = await db.list(collectionName, [
        queryHelpers.select(['partner_type']),
      ]);

      if (error) {
        logger.error('Error fetching partner types', error);
        return {
          data: null,
          error: 'Ortak türleri yüklenirken bir hata oluştu',
        };
      }

      const types = [
        ...new Set(data?.documents?.map((item: any) => item.partner_type as string) || []),
      ].sort();

      logger.info('Successfully fetched partner types', { types });

      return {
        data: types as string[],
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error fetching partner types', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get partner statistics
   */
  async getPartnerStats(partnerId: string): Promise<PartnersApiResponse<PartnerStats>> {
    try {
      logger.info('Fetching partner statistics', { partnerId });

      // Get partner donations
      const { data: donations, error: donationsError } = await db.list(collections.DONATIONS, [
        queryHelpers.equal('partner_id', partnerId),
        queryHelpers.order('desc', 'created_at')
      ]);

      if (donationsError) {
        logger.error('Error fetching partner donations', donationsError);
        return {
          data: null,
          error: 'Partner bağışları yüklenirken bir hata oluştu',
        };
      }

      const donationsList = donations?.documents || [];
      
      // Calculate statistics
      const totalDonations = donationsList.reduce((sum, d) => sum + (d.amount || 0), 0);
      const donorCount = new Set(donationsList.map(d => d.donor_id).filter(Boolean)).size;
      const lastDonationDate = donationsList[0]?.created_at || null;
      
      // Monthly donation trend (last 12 months)
      const monthlyTrend = this.calculateMonthlyTrend(donationsList);
      
      // Top donors
      const topDonors = this.calculateTopDonors(donationsList);
      
      // Donation frequency
      const donationFrequency = this.calculateDonationFrequency(donationsList);

      const stats: PartnerStats = {
        partnerId,
        totalDonations,
        donorCount,
        lastDonationDate,
        monthlyTrend,
        topDonors,
        donationFrequency,
        averageDonation: donationsList.length > 0 ? totalDonations / donationsList.length : 0,
        totalDonationsCount: donationsList.length,
        lastUpdated: new Date().toISOString(),
      };

      logger.info('Successfully calculated partner statistics', { 
        partnerId, 
        totalDonations, 
        donorCount 
      });

      return {
        data: stats,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error calculating partner statistics', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Calculate monthly donation trend
   */
  calculateMonthlyTrend(donations: any[]): MonthlyTrend[] {
    const monthlyData: { [key: string]: { amount: number; count: number } } = {};
    
    donations.forEach(donation => {
      const date = new Date(donation.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { amount: 0, count: 0 };
      }
      
      monthlyData[monthKey].amount += donation.amount || 0;
      monthlyData[monthKey].count += 1;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        amount: data.amount,
        count: data.count,
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months
  },

  /**
   * Calculate top donors
   */
  calculateTopDonors(donations: any[]): TopDonor[] {
    const donorTotals: { [key: string]: { donorId: string; total: number; count: number } } = {};
    
    donations.forEach(donation => {
      if (donation.donor_id) {
        if (!donorTotals[donation.donor_id]) {
          donorTotals[donation.donor_id] = {
            donorId: donation.donor_id,
            total: 0,
            count: 0,
          };
        }
        
        donorTotals[donation.donor_id].total += donation.amount || 0;
        donorTotals[donation.donor_id].count += 1;
      }
    });

    return Object.values(donorTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Top 10 donors
  },

  /**
   * Calculate donation frequency
   */
  calculateDonationFrequency(donations: any[]): DonationFrequency {
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const lastMonth = donations.filter(d => new Date(d.created_at) >= oneMonthAgo).length;
    const lastThreeMonths = donations.filter(d => new Date(d.created_at) >= threeMonthsAgo).length;
    const lastYear = donations.filter(d => new Date(d.created_at) >= oneYearAgo).length;

    return {
      lastMonth,
      lastThreeMonths,
      lastYear,
      total: donations.length,
    };
  },
};

// Export the service
export { partnersService };
export default partnersService;
