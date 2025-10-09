/**
 * @fileoverview partnersService Module - Partners/Sponsors management service
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { supabase, TABLES } from '../lib/supabase';
import { logger } from '../lib/logging/logger';
import { useAuthStore } from '../stores/authStore';

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

/**
 * Partners management service class
 */
export class PartnersService {
  private tableName = TABLES.PARTNERS;

  /**
   * Map Partner to SponsorOrganization interface
   */
  private mapPartnerToSponsor(partner: Partner): SponsorOrganization {
    return {
      id: partner.id,
      name: partner.name,
      type: partner.partner_type === 'sponsor' ? 'Kurumsal Sponsor' : partner.partner_type,
      contactPerson: partner.contact_person || '',
      phone: partner.phone || '',
      email: partner.email || '',
      address: partner.address || '',
      status: partner.status === 'active' ? 'Aktif' : partner.status === 'inactive' ? 'Pasif' : partner.status,
      totalSponsorship: 0, // TODO: Calculate from donations table
      currentProjects: 0, // TODO: Calculate from projects table
      completedProjects: 0, // TODO: Calculate from projects table
      lastSponsorshipDate: partner.relationship_start,
      contractStart: partner.relationship_start,
      contractEnd: partner.relationship_end || '',
      sponsorshipAreas: partner.services_provided || [],
      rating: partner.rating || 0,
      website: partner.website || '',
      taxNumber: partner.tax_number || '',
      description: partner.notes || '',
      logo: '', // TODO: Add logo field to partners table
      tags: [], // TODO: Add tags field to partners table
      donorCount: 0 // TODO: Calculate from donations table
    };
  }

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

      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,contact_person.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%`);
      }

      if (filters?.partnerType) {
        query = query.eq('partner_type', filters.partnerType);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.city) {
        query = query.eq('city', filters.city);
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error fetching partners', error);
        return {
          data: null,
          error: 'Ortaklar yüklenirken bir hata oluştu',
          count: 0,
          totalPages: 0
        };
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 0;

      logger.info('Successfully fetched partners', { count, totalPages });

      return {
        data: data as Partner[],
        error: null,
        count: count || 0,
        totalPages
      };
    } catch (error) {
      logger.error('Unexpected error fetching partners', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
        count: 0,
        totalPages: 0
      };
    }
  }

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
        partnerType: 'sponsor'
      };

      const result = await this.getPartners(page, pageSize, sponsorFilters);

      if (result.error || !result.data) {
        return {
          data: null,
          error: result.error,
          count: result.count,
          totalPages: result.totalPages
        };
      }

      const sponsors = result.data.map(partner => this.mapPartnerToSponsor(partner));

      return {
        data: sponsors,
        error: null,
        count: result.count,
        totalPages: result.totalPages
      };
    } catch (error) {
      logger.error('Unexpected error fetching sponsors', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
        count: 0,
        totalPages: 0
      };
    }
  }

  /**
   * Fetch single partner by ID
   */
  async getPartner(id: string): Promise<PartnersApiResponse<Partner>> {
    try {
      logger.info('Fetching partner by ID', { id });

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        logger.error('Error fetching partner', error);
        return {
          data: null,
          error: 'Ortak bulunamadı'
        };
      }

      logger.info('Successfully fetched partner', { id });

      return {
        data: data as Partner,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error fetching partner', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Create new partner
   */
  async createPartner(partnerData: PartnerInsert): Promise<PartnersApiResponse<Partner>> {
    try {
      logger.info('Creating partner', { name: partnerData.name });

      const insertData = {
        ...partnerData,
        status: partnerData.status || 'active'
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([insertData])
        .select()
        .single();

      if (error) {
        logger.error('Error creating partner', error);
        return {
          data: null,
          error: 'Ortak oluşturulurken bir hata oluştu'
        };
      }

      logger.info('Successfully created partner', { id: data.id, name: data.name });

      return {
        data: data as Partner,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error creating partner', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

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
        updated_by: user?.id || null
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating partner', error);
        return {
          data: null,
          error: 'Ortak güncellenirken bir hata oluştu'
        };
      }

      logger.info('Successfully updated partner', { id });

      return {
        data: data as Partner,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error updating partner', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Soft delete partner
   */
  async deletePartner(id: string): Promise<PartnersApiResponse<boolean>> {
    try {
      logger.info('Deleting partner', { id });

      const { error } = await supabase
        .from(this.tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        logger.error('Error deleting partner', error);
        return {
          data: null,
          error: 'Ortak silinirken bir hata oluştu'
        };
      }

      logger.info('Successfully deleted partner', { id });

      return {
        data: true,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error deleting partner', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Get partner statistics
   */
  async getPartnerStats(): Promise<PartnersApiResponse<PartnerStats>> {
    try {
      logger.info('Fetching partner statistics');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('partner_type, status')
        .is('deleted_at', null);

      if (error) {
        logger.error('Error fetching partner stats', error);
        return {
          data: null,
          error: 'İstatistikler yüklenirken bir hata oluştu'
        };
      }

      const partners = data as Partner[];
      const total = partners.length;
      
      // Count by type
      const byType: Record<string, number> = {};
      partners.forEach(partner => {
        byType[partner.partner_type] = (byType[partner.partner_type] || 0) + 1;
      });

      // Count by status
      const byStatus: Record<string, number> = {};
      partners.forEach(partner => {
        byStatus[partner.status] = (byStatus[partner.status] || 0) + 1;
      });

      const totalSponsors = byType['sponsor'] || 0;
      const activeSponsors = partners.filter(p => p.partner_type === 'sponsor' && p.status === 'active').length;

      const stats: PartnerStats = {
        total,
        byType,
        byStatus,
        totalSponsors,
        activeSponsors
      };

      logger.info('Successfully calculated partner stats', stats);

      return {
        data: stats,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error calculating partner stats', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Get unique partner types for filter dropdown
   */
  async getPartnerTypes(): Promise<PartnersApiResponse<string[]>> {
    try {
      logger.info('Fetching partner types');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('partner_type')
        .is('deleted_at', null);

      if (error) {
        logger.error('Error fetching partner types', error);
        return {
          data: null,
          error: 'Ortak türleri yüklenirken bir hata oluştu'
        };
      }

      const types = [...new Set(data.map((item: any) => item.partner_type as string))].sort();

      logger.info('Successfully fetched partner types', { types });

      return {
        data: types as string[],
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error fetching partner types', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }
}

// Export singleton instance
export const partnersService = new PartnersService();
export default partnersService;
