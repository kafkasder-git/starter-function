import { supabase } from '../lib/supabase';
import type { IhtiyacSahibi, IhtiyacSahibiInsert, IhtiyacSahibiUpdate, IhtiyacSahibiStats } from '../types/ihtiyacSahipleri';

// Real service for ihtiyacSahipleri with Supabase integration
export const ihtiyacSahipleriService = {
  // Test function to check if table exists
  testConnection: async () => {
    try {
      console.log('🧪 Testing Supabase connection and table existence...');
      
      // Try to get table schema first
      const { data: tableData, error: tableError } = await supabase
        .from('ihtiyac_sahipleri')
        .select('*')
        .limit(1);
      
      console.log('📊 Table test result:', { tableData, tableError });
      
      if (tableError) {
        console.error('❌ Table does not exist or access denied:', tableError);
        return { exists: false, error: tableError.message };
      }
      
      console.log('✅ Table exists and is accessible');
      return { exists: true, data: tableData };
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return { exists: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
  getIhtiyacSahipleri: async (page: number, limit: number, filters: Record<string, unknown>) => {
    try {
      console.log('🔍 Getting ihtiyac sahipleri from Supabase:', { page, limit, filters });
      console.log('🔗 Supabase client:', supabase);
      
      // Calculate offset for pagination
      const offset = (page - 1) * limit;
      
      // Build query
      let query = supabase
        .from('ihtiyac_sahipleri')
        .select('*', { count: 'exact' });
      
      console.log('📊 Initial query built for table: ihtiyac_sahipleri');
      
      // Apply filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
        console.log('🔍 Applied status filter:', filters.status);
      }
      
      if (filters.sehir) {
        query = query.eq('sehir', filters.sehir);
        console.log('🔍 Applied sehir filter:', filters.sehir);
      }
      
      if (filters.kategori) {
        query = query.eq('kategori', filters.kategori);
        console.log('🔍 Applied kategori filter:', filters.kategori);
      }
      
      if (filters.search) {
        query = query.or(`ad.ilike.%${filters.search}%,soyad.ilike.%${filters.search}%,tc_no.ilike.%${filters.search}%`);
        console.log('🔍 Applied search filter:', filters.search);
      }
      
      console.log('📄 Applying pagination - offset:', offset, 'limit:', limit);
      
      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      console.log('📊 Supabase response:', { data, error, count });
      
      if (error) {
        console.error('❌ Error fetching ihtiyac sahipleri:', error);
        return {
          data: [],
          total: 0,
          page,
          limit,
          error: error.message
        };
      }
      
      console.log(`✅ Successfully fetched ${data?.length || 0} ihtiyac sahipleri from ${count || 0} total`);
      
      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
      };
    } catch (error) {
      console.error('Error in getIhtiyacSahipleri:', error);
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
      console.log('🔍 Getting single ihtiyac sahibi:', id);

      const { data, error } = await supabase
        .from('ihtiyac_sahipleri')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('❌ Error fetching ihtiyac sahibi:', error);
        return {
          data: null,
          error: error.message
        };
      }

      console.log('✅ Successfully fetched ihtiyac sahibi:', data);
      return {
        data: data as IhtiyacSahibi,
      };
    } catch (error) {
      console.error('Error in getIhtiyacSahibi:', error);
      return {
        data: null,
        error: 'İhtiyaç sahibi verisi alınamadı',
      };
    }
  },

  // Create new ihtiyac sahibi
  createIhtiyacSahibi: async (data: IhtiyacSahibiInsert) => {
    try {
      console.log('➕ Creating new ihtiyac sahibi:', data);

      const { data: result, error } = await supabase
        .from('ihtiyac_sahipleri')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating ihtiyac sahibi:', error);
        return {
          data: null,
          error: error.message
        };
      }

      console.log('✅ Successfully created ihtiyac sahibi:', result);
      return {
        data: result as IhtiyacSahibi,
      };
    } catch (error) {
      console.error('Error in createIhtiyacSahibi:', error);
      return {
        data: null,
        error: 'İhtiyaç sahibi oluşturulamadı',
      };
    }
  },

  // Update existing ihtiyac sahibi
  updateIhtiyacSahibi: async (id: string | number, data: IhtiyacSahibiUpdate) => {
    try {
      console.log('✏️ Updating ihtiyac sahibi:', id, data);

      const { data: result, error } = await supabase
        .from('ihtiyac_sahipleri')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating ihtiyac sahibi:', error);
        return {
          data: null,
          error: error.message
        };
      }

      console.log('✅ Successfully updated ihtiyac sahibi:', result);
      return {
        data: result as IhtiyacSahibi,
      };
    } catch (error) {
      console.error('Error in updateIhtiyacSahibi:', error);
      return {
        data: null,
        error: 'İhtiyaç sahibi güncellenemedi',
      };
    }
  },

  // Delete ihtiyac sahibi
  deleteIhtiyacSahibi: async (id: string | number) => {
    try {
      console.log('🗑️ Deleting ihtiyac sahibi:', id);

      const { error } = await supabase
        .from('ihtiyac_sahipleri')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting ihtiyac sahibi:', error);
        return {
          data: false,
          error: error.message
        };
      }

      console.log('✅ Successfully deleted ihtiyac sahibi:', id);
      return {
        data: true,
      };
    } catch (error) {
      console.error('Error in deleteIhtiyacSahibi:', error);
      return {
        data: false,
        error: 'İhtiyaç sahibi silinemedi',
      };
    }
  },

  // Get statistics
  getIstatistikler: async () => {
    try {
      console.log('📊 Getting ihtiyac sahipleri statistics');

      // Get all records for statistics calculation
      const { data, error } = await supabase
        .from('ihtiyac_sahipleri')
        .select('*');

      if (error) {
        console.error('❌ Error fetching statistics data:', error);
        return {
          data: null,
          error: error.message
        };
      }

      // Calculate statistics
      const stats: IhtiyacSahibiStats = {
        total_count: data?.length || 0,
        active_count: data?.filter(item => item.status === 'active').length || 0,
        inactive_count: data?.filter(item => item.status === 'inactive').length || 0,
        suspended_count: data?.filter(item => item.status === 'suspended').length || 0,
        total_amount: data?.reduce((sum, item) => sum + (item.toplam_tutar || 0), 0) || 0,
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
          stats.by_category[item.kategori] = (stats.by_category[item.kategori] || 0) + 1;
        }
        if (item.sehri) {
          stats.by_city[item.sehri] = (stats.by_city[item.sehri] || 0) + 1;
        }
        if (item.tur) {
          stats.by_type[item.tur] = (stats.by_type[item.tur] || 0) + 1;
        }
      });

      // Recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      stats.recent_registrations = data?.filter(item =>
        item.created_at && new Date(item.created_at) >= thirtyDaysAgo
      ).length || 0;

      console.log('✅ Successfully calculated statistics:', stats);
      return {
        data: stats,
      };
    } catch (error) {
      console.error('Error in getIstatistikler:', error);
      return {
        data: null,
        error: 'İstatistikler alınamadı',
      };
    }
  },

  // Get unique cities
  getSehirler: async () => {
    try {
      console.log('🏙️ Getting unique cities');

      const { data, error } = await supabase
        .from('ihtiyac_sahipleri')
        .select('sehri')
        .not('sehri', 'is', null);

      if (error) {
        console.error('❌ Error fetching cities:', error);
        return {
          data: [],
          error: error.message
        };
      }

      // Get unique cities
      const cities = [...new Set(data?.map(item => item.sehri).filter(Boolean))].sort();

      console.log('✅ Successfully fetched cities:', cities);
      return {
        data: cities as string[],
      };
    } catch (error) {
      console.error('Error in getSehirler:', error);
      return {
        data: [],
        error: 'Şehirler alınamadı',
      };
    }
  },
};
