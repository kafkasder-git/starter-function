import { Donation, DonationFilters, DonationListResponse } from '@/types/donation';
import { db } from '@/lib/database';
import { collections } from '@/lib/collections';

export class DonationsService {
  async getDonations(filters: DonationFilters = {}): Promise<DonationListResponse> {
    try {
      const response = await db.list(collections.DONATIONS, []);
      return {
        donations: response.documents as Donation[],
        total: response.total
      };
    } catch (error) {
      console.error('Donations getirme hatası:', error);
      throw error;
    }
  }

  async createDonation(donation: Omit<Donation, keyof Document>): Promise<Donation> {
    try {
      const response = await db.create(collections.DONATIONS, donation);
      return response as Donation;
    } catch (error) {
      console.error('Donation oluşturma hatası:', error);
      throw error;
    }
  }

  async updateDonation(id: string, data: Partial<Donation>): Promise<Donation> {
    try {
      const response = await db.update(collections.DONATIONS, id, data);
      return response as Donation;
    } catch (error) {
      console.error('Donation güncelleme hatası:', error);
      throw error;
    }
  }

  async deleteDonation(id: string): Promise<void> {
    try {
      await db.delete(collections.DONATIONS, id);
    } catch (error) {
      console.error('Donation silme hatası:', error);
      throw error;
    }
  }
}

export const donationsService = new DonationsService();
