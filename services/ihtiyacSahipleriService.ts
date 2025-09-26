/**
 * @fileoverview ihtiyacSahipleriService Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { supabase } from '../lib/supabase';
import { logger } from '../lib/logging/logger';
import type { IhtiyacSahibi, IhtiyacSahibiInsert, IhtiyacSahibiUpdate, IhtiyacSahibiStats } from '../types/ihtiyacSahipleri';

// Real service for ihtiyacSahipleri with Supabase integration
export const ihtiyacSahipleriService = {
  // Test function to check if table exists
  testConnection: async () => {
    try {
      logger.info('🧪 Testing Supabase connection and table existence...');
      
      // Try to get table schema first
      const { data: tableData, error: tableError } = await supabase
        .from('ihtiyac_sahipleri')
        .select('*')
        .limit(1);
      
      logger.info('📊 Table test result:', { tableData, tableError });
      
      if (tableError) {
        logger.error('❌ Table does not exist or access denied:', tableError);
        return { exists: false, error: tableError.message };
      }
      
      logger.info('✅ Table exists and is accessible');
      return { exists: true, data: tableData };
    } catch (error) {
      logger.error('❌ Connection test failed:', error);
      return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  getIhtiyacSahipleri: async (page: number, limit: number, filters: Record<string, unknown>) => {
    try {
      logger.info('🔍 Getting ihtiyac sahipleri from Supabase:', { page, limit, filters });
      logger.info('🔗 Supabase client:', supabase);
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Build query
      let query = supabase
        .from('ihtiyac_sahipleri')
        .select('*', { count: 'exact' });
      
      logger.info('📊 Initial query built for table: ihtiyac_sahipleri');
      
      // Apply filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
        logger.info('🔍 Applied status filter:', filters.status);
      }
      
      if (filters.sehir) {
        query = query.eq('sehir', filters.sehir);
        logger.info('🔍 Applied sehir filter:', filters.sehir);
      }
      
      if (filters.kategori) {
        query = query.eq('kategori', filters.kategori);
        logger.info('🔍 Applied kategori filter:', filters.kategori);
      }
      
      if (filters.search) {
        query = query.or(`ad.ilike.%${filters.search}%,soyad.ilike.%${filters.search}%,tc_no.ilike.%${filters.search}%`);
        logger.info('🔍 Applied search filter:', filters.search);
      }
      
      logger.info('📄 Applying pagination - offset:', offset, 'limit:', limit);
      
      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      logger.info('📊 Supabase response:', { data, error, count });
      
      if (error) {
        logger.error('❌ Error fetching ihtiyac sahipleri:', error);
        return {
          data: [],
          total: 0,
          page,
          limit,
          error: error.message
        };
      }
      
      logger.info(`✅ Successfully fetched ${data?.length ?? 0} ihtiyac sahipleri from ${count ?? 0} total`);
      
      return {
        data: data ?? [],
        total: count ?? 0,
        page,
        limit,
      };
    } catch (error) {
      logger.error('Error in getIhtiyacSahipleri:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        error: 'İhtiyaç sahipleri verileri alınamadı',
      };
    }
  },

  // Get single ihtiyac sahibi by ID
  getIhtiyacSahibi: async (id: string | number) => {
    try {
      logger.info('🔍 Getting single ihtiyac sahibi:', id);

      const { data, error } = await supabase
        .from('ihtiyac_sahipleri')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        logger.error('❌ Error fetching ihtiyac sahibi:', error);
        return {
          data: null,
          error: error.message
        };
      }

      logger.info('✅ Successfully fetched ihtiyac sahibi:', data);
      return {
        data: data as IhtiyacSahibi,
      };
    } catch (error) {
      logger.error('Error in getIhtiyacSahibi:', error);
      return {
        data: null,
        error: 'İhtiyaç sahibi verisi alınamadı',
      };
    }
  },

  // Create new ihtiyac sahibi
  createIhtiyacSahibi: async (data: IhtiyacSahibiInsert) => {
    try {
      logger.info('➕ Creating new ihtiyac sahibi:', data);

      const { data: result, error } = await supabase
        .from('ihtiyac_sahipleri')
        .insert(data)
        .select()
        .single();

      if (error) {
        logger.error('❌ Error creating ihtiyac sahibi:', error);
        return {
          data: null,
          error: error.message
        };
      }

      logger.info('✅ Successfully created ihtiyac sahibi:', result);
      return {
        data: result as IhtiyacSahibi,
      };
    } catch (error) {
      logger.error('Error in createIhtiyacSahibi:', error);
      return {
        data: null,
        error: 'İhtiyaç sahibi oluşturulamadı',
      };
    }
  },

  // Update existing ihtiyac sahibi
  updateIhtiyacSahibi: async (id: string | number, data: IhtiyacSahibiUpdate) => {
    try {
      logger.info('✏️ Updating ihtiyac sahibi:', id, data);

      const { data: result, error } = await supabase
        .from('ihtiyac_sahipleri')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('❌ Error updating ihtiyac sahibi:', error);
        return {
          data: null,
          error: error.message
        };
      }

      logger.info('✅ Successfully updated ihtiyac sahibi:', result);
      return {
        data: result as IhtiyacSahibi,
      };
    } catch (error) {
      logger.error('Error in updateIhtiyacSahibi:', error);
      return {
        data: null,
        error: 'İhtiyaç sahibi güncellenemedi',
      };
    }
  },

  // Delete ihtiyac sahibi
  deleteIhtiyacSahibi: async (id: string | number) => {
    try {
      logger.info('🗑️ Deleting ihtiyac sahibi:', id);

      const { error } = await supabase
        .from('ihtiyac_sahipleri')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('❌ Error deleting ihtiyac sahibi:', error);
        return {
          data: false,
          error: error.message
        };
      }

      logger.info('✅ Successfully deleted ihtiyac sahibi:', id);
      return {
        data: true,
      };
    } catch (error) {
      logger.error('Error in deleteIhtiyacSahibi:', error);
      return {
        data: false,
        error: 'İhtiyaç sahibi silinemedi',
      };
    }
  },

  // Get statistics
  getIstatistikler: async () => {
    try {
      logger.info('📊 Getting ihtiyac sahipleri statistics');

      // Get all records for statistics calculation
      const { data, error } = await supabase
        .from('ihtiyac_sahipleri')
        .select('*');

      if (error) {
        logger.error('❌ Error fetching statistics data:', error);
        return {
          data: null,
          error: error.message
        };
      }

      // Calculate statistics
      const stats: IhtiyacSahibiStats = {
        total_count: data?.length ?? 0,
        active_count: data?.filter(item => item.status === 'active').length ?? 0,
        inactive_count: data?.filter(item => item.status === 'inactive').length ?? 0,
        suspended_count: data?.filter(item => item.status === 'suspended').length ?? 0,
        total_amount: data?.reduce((sum, item) => sum + (item.toplam_tutar ?? 0), 0) ?? 0,
        average_amount: 0,
        by_category: {},
        by_city: {},
        by_type: {},
        recent_registrations: 0,
      };

      // Calculate average amount
      if (stats.total_count > 0) {
        stats.average_amount = stats.total_amount / stats.total_count;
      }

      // Group by category
      data?.forEach(item => {
        if (item.kategori) {
          stats.by_category[item.kategori] = (stats.by_category[item.kategori] ?? 0) + 1;
        }
        if (item.sehri) {
          stats.by_city[item.sehri] = (stats.by_city[item.sehri] ?? 0) + 1;
        }
        if (item.tur) {
          stats.by_type[item.tur] = (stats.by_type[item.tur] ?? 0) + 1;
        }
      });

      // Recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      stats.recent_registrations = data?.filter(item =>
        item.created_at && new Date(item.created_at) >= thirtyDaysAgo
      ).length ?? 0;

      logger.info('✅ Successfully calculated statistics:', stats);
      return {
        data: stats,
      };
    } catch (error) {
      logger.error('Error in getIstatistikler:', error);
      return {
        data: null,
        error: 'İstatistikler alınamadı',
      };
    }
  },

  // Get unique cities
  getSehirler: async () => {
    try {
      logger.info('🏙️ Getting unique cities');

      const { data, error } = await supabase
        .from('ihtiyac_sahipleri')
        .select('sehri')
        .not('sehri', 'is', null);

      if (error) {
        logger.error('❌ Error fetching cities:', error);
        return {
          data: [],
          error: error.message
        };
      }

      // Get unique cities
      const cities = [...new Set(data?.map(item => item.sehri).filter(Boolean))].sort((a, b) => a.localeCompare(b));

      logger.info('✅ Successfully fetched cities:', cities);
      return {
        data: cities as string[],
      };
    } catch (error) {
      logger.error('Error in getSehirler:', error);
      return {
        data: [],
        error: 'Şehirler alınamadı',
      };
    }
  },
};
