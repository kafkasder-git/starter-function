/**
 * @fileoverview campaignsService Module - Campaign management service
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { supabase, TABLES } from '../lib/supabase';
import { logger } from '../lib/logging/logger';
import { useAuthStore } from '../stores/authStore';

// Campaign interfaces
export interface Campaign {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  currency: string;
  start_date: string;
  end_date: string | null;
  status: 'draft' | 'active' | 'completed' | 'paused';
  category: string;
  image_url: string | null;
  featured: boolean;
  created_by: string;
  updated_by: string | null;
  deleted_at: string | null;
}

export interface CampaignInsert {
  name: string;
  description?: string;
  goal_amount: number;
  start_date: string;
  category?: string;
  created_by: string;
  end_date?: string | null;
  currency?: string;
  current_amount?: number;
  status?: 'draft' | 'active' | 'completed' | 'paused';
  image_url?: string | null;
  featured?: boolean;
}

export interface CampaignUpdate {
  name?: string;
  description?: string;
  goal_amount?: number;
  start_date?: string;
  end_date?: string | null;
  status?: 'draft' | 'active' | 'completed' | 'paused';
  category?: string;
  image_url?: string | null;
  featured?: boolean;
  updated_by?: string;
  updated_at?: string;
}

export interface CampaignsFilters {
  searchTerm?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CampaignStats {
  total: number;
  active: number;
  completed: number;
  draft: number;
  paused: number;
  totalGoalAmount: number;
  totalCurrentAmount: number;
  averageProgress: number;
}

export interface CampaignsApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
  totalPages?: number;
}

/**
 * Campaign management service class
 */
export class CampaignsService {
  private tableName = TABLES.CAMPAIGNS;

  /**
   * Fetch paginated campaigns with filtering support
   */
  async getCampaigns(
    page: number = 1,
    pageSize: number = 10,
    filters?: CampaignsFilters
  ): Promise<CampaignsApiResponse<Campaign[]>> {
    try {
      logger.info('Fetching campaigns', { page, pageSize, filters });

      let query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.searchTerm) {
        query = query.or(`name.ilike.%${filters.searchTerm}%,description.ilike.%${filters.searchTerm}%`);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.category) {
        query = query.eq('category', filters.category);
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
        logger.error('Error fetching campaigns', error);
        return {
          data: null,
          error: 'Kampanyalar yüklenirken bir hata oluştu',
          count: 0,
          totalPages: 0
        };
      }

      const totalPages = count ? Math.ceil(count / pageSize) : 0;

      logger.info('Successfully fetched campaigns', { count, totalPages });

      return {
        data: data as Campaign[],
        error: null,
        count: count || 0,
        totalPages
      };
    } catch (error) {
      logger.error('Unexpected error fetching campaigns', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
        count: 0,
        totalPages: 0
      };
    }
  }

  /**
   * Fetch single campaign by ID
   */
  async getCampaign(id: string): Promise<CampaignsApiResponse<Campaign>> {
    try {
      logger.info('Fetching campaign by ID', { id });

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        logger.error('Error fetching campaign', error);
        return {
          data: null,
          error: 'Kampanya bulunamadı'
        };
      }

      logger.info('Successfully fetched campaign', { id });

      return {
        data: data as Campaign,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error fetching campaign', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Create new campaign
   */
  async createCampaign(campaignData: CampaignInsert): Promise<CampaignsApiResponse<Campaign>> {
    try {
      logger.info('Creating campaign', { name: campaignData.name });

      const insertData = {
        ...campaignData,
        currency: campaignData.currency || 'TRY',
        current_amount: campaignData.current_amount || 0,
        status: campaignData.status || 'draft',
        featured: campaignData.featured || false
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([insertData])
        .select()
        .single();

      if (error) {
        logger.error('Error creating campaign', error);
        return {
          data: null,
          error: 'Kampanya oluşturulurken bir hata oluştu'
        };
      }

      logger.info('Successfully created campaign', { id: data.id, name: data.name });

      return {
        data: data as Campaign,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error creating campaign', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Update existing campaign
   */
  async updateCampaign(id: string, updates: CampaignUpdate): Promise<CampaignsApiResponse<Campaign>> {
    try {
      logger.info('Updating campaign', { id });

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
        logger.error('Error updating campaign', error);
        return {
          data: null,
          error: 'Kampanya güncellenirken bir hata oluştu'
        };
      }

      logger.info('Successfully updated campaign', { id });

      return {
        data: data as Campaign,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error updating campaign', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Soft delete campaign
   */
  async deleteCampaign(id: string): Promise<CampaignsApiResponse<boolean>> {
    try {
      logger.info('Deleting campaign', { id });

      const { error } = await supabase
        .from(this.tableName)
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        logger.error('Error deleting campaign', error);
        return {
          data: null,
          error: 'Kampanya silinirken bir hata oluştu'
        };
      }

      logger.info('Successfully deleted campaign', { id });

      return {
        data: true,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error deleting campaign', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(): Promise<CampaignsApiResponse<CampaignStats>> {
    try {
      logger.info('Fetching campaign statistics');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('status, goal_amount, current_amount')
        .is('deleted_at', null);

      if (error) {
        logger.error('Error fetching campaign stats', error);
        return {
          data: null,
          error: 'İstatistikler yüklenirken bir hata oluştu'
        };
      }

      const campaigns = data as Campaign[];
      const total = campaigns.length;
      const active = campaigns.filter(c => c.status === 'active').length;
      const completed = campaigns.filter(c => c.status === 'completed').length;
      const draft = campaigns.filter(c => c.status === 'draft').length;
      const paused = campaigns.filter(c => c.status === 'paused').length;
      
      const totalGoalAmount = campaigns.reduce((sum, c) => sum + (c.goal_amount || 0), 0);
      const totalCurrentAmount = campaigns.reduce((sum, c) => sum + (c.current_amount || 0), 0);
      const averageProgress = totalGoalAmount > 0 ? (totalCurrentAmount / totalGoalAmount) * 100 : 0;

      const stats: CampaignStats = {
        total,
        active,
        completed,
        draft,
        paused,
        totalGoalAmount,
        totalCurrentAmount,
        averageProgress: Math.round(averageProgress * 100) / 100
      };

      logger.info('Successfully calculated campaign stats', stats);

      return {
        data: stats,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error calculating campaign stats', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }

  /**
   * Update campaign amount (used when donations are linked)
   */
  async updateCampaignAmount(id: string, amount: number): Promise<CampaignsApiResponse<Campaign>> {
    try {
      logger.info('Updating campaign amount', { id, amount });

      const { data, error } = await supabase
        .from(this.tableName)
        .update({ 
          current_amount: amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating campaign amount', error);
        return {
          data: null,
          error: 'Kampanya tutarı güncellenirken bir hata oluştu'
        };
      }

      logger.info('Successfully updated campaign amount', { id, amount });

      return {
        data: data as Campaign,
        error: null
      };
    } catch (error) {
      logger.error('Unexpected error updating campaign amount', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu'
      };
    }
  }
}

// Export singleton instance
export const campaignsService = new CampaignsService();
export default campaignsService;
