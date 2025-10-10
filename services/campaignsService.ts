/**
 * @fileoverview campaignsService Module - Campaign management service
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { db, collections, queryHelpers } from '../lib/database';
import type { ApiResponse } from '../types/database';
import type { Campaign, CampaignInsert, CampaignUpdate, CampaignsFilters, CampaignStats } from '../types/campaign';
import { logger } from '../lib/logging/logger';
import { useAuthStore } from '../stores/authStore';

// Module-level constants

// Module-level constants
const collectionName = collections.CAMPAIGNS;

/**
 * Campaign management service
 */
const campaignsService = {
  /**
   * Fetch paginated campaigns with filtering support
   */
  async getCampaigns(
    page: number = 1,
    pageSize: number = 10,
    filters?: CampaignsFilters,
  ): Promise<ApiResponse<Campaign[]>> {
    try {
      logger.info('Fetching campaigns', { page, pageSize, filters });

      const queries: string[] = [];

      // Apply filters
      if (filters?.status) {
        queries.push(queryHelpers.equal('status', filters.status));
      }

      if (filters?.category) {
        queries.push(queryHelpers.equal('category', filters.category));
      }

      if (filters?.dateFrom) {
        queries.push(queryHelpers.greaterThanEqualDate('created_at', filters.dateFrom));
      }

      if (filters?.dateTo) {
        queries.push(queryHelpers.lessThanEqualDate('created_at', filters.dateTo));
      }

      // Order by creation date (newest first)
      queries.push(queryHelpers.orderDesc('created_at'));

      // Apply pagination
      const from = (page - 1) * pageSize;
      queries.push(queryHelpers.offset(from));
      queries.push(queryHelpers.limit(pageSize));

      const { data, error } = await db.list(collectionName, queries);

      if (error) {
        logger.error('Error fetching campaigns', error);
        return {
          data: null,
          error: 'Kampanyalar yüklenirken bir hata oluştu',
        };
      }

      const totalPages = data?.total ? Math.ceil(data.total / pageSize) : 0;

      logger.info('Successfully fetched campaigns', { count: data?.total, totalPages });

      return {
        data: data?.documents as Campaign[],
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error fetching campaigns', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Fetch single campaign by ID
   */
  async getCampaign(id: string): Promise<ApiResponse<Campaign>> {
    try {
      logger.info('Fetching campaign by ID', { id });

      const { data, error } = await db.get(collectionName, id);

      if (error) {
        logger.error('Error fetching campaign', error);
        return {
          data: null,
          error: 'Kampanya bulunamadı',
        };
      }

      logger.info('Successfully fetched campaign', { id });

      return {
        data: data as Campaign,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error fetching campaign', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Create new campaign
   */
  async createCampaign(campaignData: CampaignInsert): Promise<ApiResponse<Campaign>> {
    try {
      logger.info('Creating campaign', { name: campaignData.name });

      const insertData = {
        ...campaignData,
        currency: campaignData.currency || 'TRY',
        current_amount: campaignData.current_amount || 0,
        status: campaignData.status || 'draft',
        featured: campaignData.featured || false,
      };

      const { data, error } = await db.create(collectionName, insertData);

      if (error) {
        logger.error('Error creating campaign', error);
        return {
          data: null,
          error: 'Kampanya oluşturulurken bir hata oluştu',
        };
      }

      logger.info('Successfully created campaign', { id: data.id, name: data.name });

      return {
        data: data as Campaign,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error creating campaign', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Update existing campaign
   */
  async updateCampaign(
    id: string,
    updates: CampaignUpdate,
  ): Promise<ApiResponse<Campaign>> {
    try {
      logger.info('Updating campaign', { id });

      const user = useAuthStore.getState().user;
      const updateData = {
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: user?.id || null,
      };

      const { data, error } = await db.update(collectionName, id, updateData);

      if (error) {
        logger.error('Error updating campaign', error);
        return {
          data: null,
          error: 'Kampanya güncellenirken bir hata oluştu',
        };
      }

      logger.info('Successfully updated campaign', { id });

      return {
        data: data as Campaign,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error updating campaign', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Soft delete campaign
   */
  async deleteCampaign(id: string): Promise<ApiResponse<boolean>> {
    try {
      logger.info('Deleting campaign', { id });

      const { error } = await db.update(collectionName, id, {
        deleted_at: new Date().toISOString()
      });

      if (error) {
        logger.error('Error deleting campaign', error);
        return {
          data: null,
          error: 'Kampanya silinirken bir hata oluştu',
        };
      }

      logger.info('Successfully deleted campaign', { id });

      return {
        data: true,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error deleting campaign', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Get campaign statistics
   */
  async getCampaignStats(): Promise<ApiResponse<CampaignStats>> {
    try {
      logger.info('Fetching campaign statistics');

      const { data, error } = await db.list(collectionName, [
        queryHelpers.select(['status', 'goal_amount', 'current_amount'])
      ]);

      if (error) {
        logger.error('Error fetching campaign stats', error);
        return {
          data: null,
          error: 'İstatistikler yüklenirken bir hata oluştu',
        };
      }

      const campaigns = data?.documents as Campaign[];
      const total = campaigns.length;
      const active = campaigns.filter((c) => c.status === 'active').length;
      const completed = campaigns.filter((c) => c.status === 'completed').length;
      const draft = campaigns.filter((c) => c.status === 'draft').length;
      const paused = campaigns.filter((c) => c.status === 'paused').length;

      const totalGoalAmount = campaigns.reduce((sum, c) => sum + (c.goal_amount || 0), 0);
      const totalCurrentAmount = campaigns.reduce((sum, c) => sum + (c.current_amount || 0), 0);
      const averageProgress =
        totalGoalAmount > 0 ? (totalCurrentAmount / totalGoalAmount) * 100 : 0;

      const stats: CampaignStats = {
        total,
        active,
        completed,
        draft,
        paused,
        totalGoalAmount,
        totalCurrentAmount,
        averageProgress: Math.round(averageProgress * 100) / 100,
      };

      logger.info('Successfully calculated campaign stats', stats);

      return {
        data: stats,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error calculating campaign stats', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },

  /**
   * Update campaign amount (used when donations are linked)
   */
  async updateCampaignAmount(id: string, amount: number): Promise<ApiResponse<Campaign>> {
    try {
      logger.info('Updating campaign amount', { id, amount });

      const { data, error } = await db.update(collectionName, id, {
        current_amount: amount,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Error updating campaign amount', error);
        return {
          data: null,
          error: 'Kampanya tutarı güncellenirken bir hata oluştu',
        };
      }

      logger.info('Successfully updated campaign amount', { id, amount });

      return {
        data: data as Campaign,
        error: null,
      };
    } catch (error) {
      logger.error('Unexpected error updating campaign amount', error);
      return {
        data: null,
        error: 'Beklenmeyen bir hata oluştu',
      };
    }
  },
};

// Export the service
export { campaignsService };
export default campaignsService;
