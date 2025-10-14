import { Beneficiary, BeneficiaryFilters, BeneficiaryListResponse } from '@/types/beneficiary';
import { db } from '@/lib/database';
import { collections } from '@/lib/collections';

export class BeneficiariesService {
  async getBeneficiaries(filters: BeneficiaryFilters = {}): Promise<BeneficiaryListResponse> {
    try {
      const response = await db.list(collections.BENEFICIARIES, []);
      return {
        beneficiaries: response.documents as Beneficiary[],
        total: response.total
      };
    } catch (error) {
      console.error('Beneficiaries getirme hatası:', error);
      throw error;
    }
  }

  async createBeneficiary(beneficiary: Omit<Beneficiary, keyof Document>): Promise<Beneficiary> {
    try {
      const response = await db.create(collections.BENEFICIARIES, beneficiary);
      return response as Beneficiary;
    } catch (error) {
      console.error('Beneficiary oluşturma hatası:', error);
      throw error;
    }
  }

  async updateBeneficiary(id: string, data: Partial<Beneficiary>): Promise<Beneficiary> {
    try {
      const response = await db.update(collections.BENEFICIARIES, id, data);
      return response as Beneficiary;
    } catch (error) {
      console.error('Beneficiary güncelleme hatası:', error);
      throw error;
    }
  }

  async deleteBeneficiary(id: string): Promise<void> {
    try {
      await db.delete(collections.BENEFICIARIES, id);
    } catch (error) {
      console.error('Beneficiary silme hatası:', error);
      throw error;
    }
  }
}

export const beneficiariesService = new BeneficiariesService();
