import { supabase } from '../lib/supabase';

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
};
