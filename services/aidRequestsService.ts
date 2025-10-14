import { AidRequest, AidRequestFilters, AidRequestListResponse } from '@/types/aidRequest';
import { db } from '@/lib/database';
import { collections } from '@/lib/collections';

export class AidRequestsService {
  async getAidRequests(filters: AidRequestFilters = {}): Promise<AidRequestListResponse> {
    try {
      const response = await db.list(collections.AID_REQUESTS, []);
      return {
        aid_requests: response.documents as AidRequest[],
        total: response.total
      };
    } catch (error) {
      console.error('Aid requests getirme hatası:', error);
      throw error;
    }
  }

  async createAidRequest(aidRequest: Omit<AidRequest, keyof Document>): Promise<AidRequest> {
    try {
      const response = await db.create(collections.AID_REQUESTS, aidRequest);
      return response as AidRequest;
    } catch (error) {
      console.error('Aid request oluşturma hatası:', error);
      throw error;
    }
  }

  async updateAidRequest(id: string, data: Partial<AidRequest>): Promise<AidRequest> {
    try {
      const response = await db.update(collections.AID_REQUESTS, id, data);
      return response as AidRequest;
    } catch (error) {
      console.error('Aid request güncelleme hatası:', error);
      throw error;
    }
  }

  async deleteAidRequest(id: string): Promise<void> {
    try {
      await db.delete(collections.AID_REQUESTS, id);
    } catch (error) {
      console.error('Aid request silme hatası:', error);
      throw error;
    }
  }
}

export const aidRequestsService = new AidRequestsService();
