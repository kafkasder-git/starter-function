import type {
  Beneficiary,
  BeneficiaryFilters,
  BeneficiaryFormData,
  BeneficiaryInsert,
  BeneficiaryUpdate,
} from '../types/beneficiary';
import type { ApiResponse, PaginatedResponse } from './config';
import { supabase } from '../lib/supabase';

// Service-specific types
export interface BeneficiarySearchFilters extends BeneficiaryFilters {
  page?: number;
  page_size?: number;
  sort_by?: 'full_name' | 'registration_date' | 'city' | 'category' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

class BeneficiariesService {
  private readonly supabase = supabase;

  // Gelişmiş arama ve filtreleme
  async getAll(
    page = 1,
    pageSize = 10,
    filters: BeneficiarySearchFilters = {},
  ): Promise<PaginatedResponse<Beneficiary>> {
    try {
      console.log('Fetching beneficiaries from Supabase:', { page, pageSize, filters });
      
      // Calculate offset for pagination
      const offset = (page - 1) * pageSize;
      
      // Build query - try both table names
      let query = this.supabase
        .from('ihtiyac_sahipleri')
        .select('*', { count: 'exact' });
      
      // Apply filters if provided
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters.city) {
        query = query.eq('sehir', filters.city);
      }
      
      if (filters.category) {
        query = query.eq('kategori', filters.category);
      }
      
      if (filters.search_term) {
        query = query.or(`ad.ilike.%${filters.search_term}%,soyad.ilike.%${filters.search_term}%,tc_no.ilike.%${filters.search_term}%`);
      }
      
      // Apply sorting
      const sortBy = filters.sort_by || 'created_at';
      const sortOrder = filters.sort_order === 'asc' ? { ascending: true } : { ascending: false };
      
      // Execute query with pagination
      const { data, error, count } = await query
        .order(sortBy, sortOrder)
        .range(offset, offset + pageSize - 1);
      
      if (error) {
        console.error('Error fetching beneficiaries:', error);
        throw error;
      }
      
      const totalPages = Math.ceil((count || 0) / pageSize);
      
      console.log(`✅ Successfully fetched ${data?.length || 0} beneficiaries`);
      
      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
      throw error;
    }
  }

  // Yeni JSON yapısına göre beneficiary oluşturma
  async createFromFormData(formData: BeneficiaryFormData): Promise<ApiResponse<Beneficiary>> {
    try {
      const insertData: BeneficiaryInsert = {
        full_name: formData.full_name,
        identity_no: formData.identity_no,
        nationality: formData.nationality,
        country: formData.country,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        settlement: formData.settlement,
        neighborhood: formData.neighborhood,
        address: formData.address,
        household_size: formData.household_size,
        category: formData.category,
        aid_type: formData.aid_type,
        fund_region: formData.fund_region,
        linked_orphan: formData.linked_orphan,
        linked_card: formData.linked_card,
        card_no: formData.card_no,
        opened_by_unit: formData.opened_by_unit,
        iban: formData.iban,
        notes: formData.notes,
        registration_date: new Date().toISOString().split('T')[0],
      };

      return await this.create(insertData);
    } catch (error) {
      console.error('Error creating beneficiary from form:', error);
      return { data: null, error: 'Beneficiary oluşturulamadı' };
    }
  }

  // Base methods implementation
  async getById(id: string): Promise<ApiResponse<Beneficiary>> {
    try {
      const { data, error } = await this.supabase
        .from('ihtiyac_sahipleri')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching beneficiary:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching beneficiary:', error);
      return { data: null, error: 'Beneficiary bulunamadı' };
    }
  }

  async create(data: BeneficiaryInsert): Promise<ApiResponse<Beneficiary>> {
    try {
      const { data: result, error } = await this.supabase
        .from('ihtiyac_sahipleri')
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error('Error creating beneficiary:', error);
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error creating beneficiary:', error);
      return { data: null, error: 'Beneficiary oluşturulamadı' };
    }
  }

  async update(id: string, data: BeneficiaryUpdate): Promise<ApiResponse<Beneficiary>> {
    try {
      const { data: result, error } = await this.supabase
        .from('ihtiyac_sahipleri')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating beneficiary:', error);
        return { data: null, error: error.message };
      }

      return { data: result, error: null };
    } catch (error) {
      console.error('Error updating beneficiary:', error);
      return { data: null, error: 'Beneficiary güncellenemedi' };
    }
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('ihtiyac_sahipleri')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting beneficiary:', error);
        return { data: false, error: error.message };
      }

      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting beneficiary:', error);
      return { data: false, error: 'Beneficiary silinemedi' };
    }
  }

  // Kart numarasına göre arama
  async getByCardNo(cardNo: string): Promise<ApiResponse<Beneficiary>> {
    try {
      // 🔗 Gerçek Supabase sorgusu: WHERE card_no = cardNo
      return { data: null, error: null };
    } catch (error) {
      console.error('Error fetching beneficiary by card:', error);
      return { data: null, error: 'Beneficiary bulunamadı' };
    }
  }

  // Kimlik numarasına göre arama
  async getByIdentityNo(identityNo: string): Promise<ApiResponse<Beneficiary>> {
    try {
      // 🔗 Gerçek Supabase sorgusu: WHERE identity_no = identityNo OR tc_no = identityNo
      return { data: null, error: null };
    } catch (error) {
      console.error('Error fetching beneficiary by identity:', error);
      return { data: null, error: 'Beneficiary bulunamadı' };
    }
  }

  // Şehir ve yerleşim yerine göre arama
  async getByCityAndSettlement(
    city: string,
    settlement?: string,
  ): Promise<ApiResponse<Beneficiary[]>> {
    try {
      // 🔗 Gerçek Supabase sorgusu: WHERE city = city AND (settlement = settlement OR settlement IS NULL)
      return { data: [], error: null };
    } catch (error) {
      console.error('Error fetching beneficiaries by location:', error);
      return { data: null, error: 'Beneficiaries bulunamadı' };
    }
  }

  // Kategoriye göre istatistikler
  async getStatsByCategory(): Promise<ApiResponse<Record<string, number>>> {
    try {
      // 🔗 Gerçek Supabase sorgusu: GROUP BY category
      return { data: {}, error: null };
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return { data: null, error: 'İstatistikler alınamadı' };
    }
  }

  // Fon bölgesine göre istatistikler
  async getStatsByFundRegion(): Promise<ApiResponse<Record<string, number>>> {
    try {
      // 🔗 Gerçek Supabase sorgusu: GROUP BY fund_region
      return { data: {}, error: null };
    } catch (error) {
      console.error('Error fetching fund region stats:', error);
      return { data: null, error: 'İstatistikler alınamadı' };
    }
  }

  // Uyruk bazında istatistikler
  async getStatsByNationality(): Promise<ApiResponse<Record<string, number>>> {
    try {
      // 🔗 Gerçek Supabase sorgusu: GROUP BY nationality
      return { data: {}, error: null };
    } catch (error) {
      console.error('Error fetching nationality stats:', error);
      return { data: null, error: 'İstatistikler alınamadı' };
    }
  }

  // Kart bağlantılı beneficiaries
  async getLinkedCardBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    try {
      // 🔗 Gerçek Supabase sorgusu: WHERE linked_card = true
      return { data: [], error: null };
    } catch (error) {
      console.error('Error fetching linked card beneficiaries:', error);
      return { data: null, error: 'Kart bağlantılı beneficiaries bulunamadı' };
    }
  }

  // Yetim bağlantılı beneficiaries
  async getLinkedOrphanBeneficiaries(): Promise<ApiResponse<Beneficiary[]>> {
    try {
      // 🔗 Gerçek Supabase sorgusu: WHERE linked_orphan = true
      return { data: [], error: null };
    } catch (error) {
      console.error('Error fetching linked orphan beneficiaries:', error);
      return { data: null, error: 'Yetim bağlantılı beneficiaries bulunamadı' };
    }
  }

  // Toplu güncelleme (kart numarası atama vb.)
  async bulkUpdate(
    updates: { id: string; data: BeneficiaryUpdate }[],
  ): Promise<ApiResponse<Beneficiary[]>> {
    try {
      const results: Beneficiary[] = [];

      for (const update of updates) {
        const result = await this.update(update.id, update.data);
        if (result.data) {
          results.push(result.data);
        }
      }

      return { data: results, error: null };
    } catch (error) {
      console.error('Error bulk updating beneficiaries:', error);
      return { data: null, error: 'Toplu güncelleme başarısız' };
    }
  }

  // Validation fonksiyonları
  validateIdentityNo(identityNo: string): boolean {
    // TC Kimlik numarası algoritması
    if (!/^[0-9]{11}$/.test(identityNo)) {
      return false;
    }

    const digits = identityNo.split('').map(Number);
    const checksum1 =
      ((digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7 -
        (digits[1] + digits[3] + digits[5] + digits[7])) %
      10;
    const checksum2 =
      (digits[0] +
        digits[1] +
        digits[2] +
        digits[3] +
        digits[4] +
        digits[5] +
        digits[6] +
        digits[7] +
        digits[8] +
        digits[9]) %
      10;

    return digits[9] === checksum1 && digits[10] === checksum2;
  }

  validateIBAN(iban: string): boolean {
    // IBAN validation
    const cleanIban = iban.replace(/\s/g, '').toUpperCase();
    return /^TR[0-9]{2}[0-9]{4}[0-9]{1}[0-9]{16}$/.test(cleanIban);
  }

  validatePhone(phone: string): boolean {
    // Türkiye telefon numarası validation
    const cleanPhone = phone.replace(/\D/g, '');
    return /^(90)?5[0-9]{9}$/.test(cleanPhone);
  }
}

// Singleton instance
export const beneficiariesService = new BeneficiariesService();
export default beneficiariesService;
