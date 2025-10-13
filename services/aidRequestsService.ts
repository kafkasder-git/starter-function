/**
 * @fileoverview aidRequestsService Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { db, collections, queryHelpers } from '../lib/database';
import { logger } from '../lib/logging/logger';
import type {
  AidRequest,
  AidRequestInsert,
  AidRequestUpdate,
  AidRequestFilters,
  AidRequestStats,
} from '../types/aidRequest';
import type { PaginatedResponse, ApiResponse } from '../types/database';

class AidRequestsService {
  // Get all aid requests with pagination and filters
  async getAidRequests(
    page = 1,
    pageSize = 10,
    filters: AidRequestFilters = {}
  ): Promise<PaginatedResponse<AidRequest>> {
    try {
      const queries: string[] = [];

      // Apply filters
      if (filters.status) {
        queries.push(queryHelpers.equal('status', filters.status));
      }

      if (filters.aidType) {
        queries.push(queryHelpers.equal('aid_type', filters.aidType));
      }

      if (filters.urgency) {
        queries.push(queryHelpers.equal('urgency', filters.urgency));
      }

      if (filters.assignedTo) {
        queries.push(queryHelpers.equal('assigned_to', filters.assignedTo));
      }

      if (filters.dateFrom) {
        queries.push(queryHelpers.greaterThanEqualDate('created_at', filters.dateFrom));
      }

      if (filters.dateTo) {
        queries.push(queryHelpers.lessThanEqualDate('created_at', filters.dateTo));
      }

      if (filters.minAmount) {
        queries.push(queryHelpers.greaterThanEqual('requested_amount', filters.minAmount));
      }

      if (filters.maxAmount) {
        queries.push(queryHelpers.lessThanEqual('requested_amount', filters.maxAmount));
      }

      // Order by creation date (newest first)
      queries.push(queryHelpers.orderDesc('created_at'));

      // Apply pagination
      const from = (page - 1) * pageSize;
      queries.push(queryHelpers.offset(from));
      queries.push(queryHelpers.limit(pageSize));

      const { data, error } = await db.list(collections.AID_APPLICATIONS, queries);

      if (error) {
        logger.error('Error fetching aid requests:', error);
        throw new Error(`Aid requests fetch failed: ${error.message}`);
      }

      const totalPages = Math.ceil((data?.total ?? 0) / pageSize);

      return {
        data: data?.documents || [],
        count: data?.total ?? 0,
        page,
        pageSize,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      };
    } catch (error) {
      logger.error('AidRequestsService.getAidRequests error:', error);
      throw error;
    }
  }

  // Get single aid request by ID
  async getAidRequest(id: string): Promise<ApiResponse<AidRequest>> {
    try {
      const { data, error } = await db.get(collections.AID_APPLICATIONS, id);

      if (error) {
        logger.error('Error fetching aid request:', error);
        return { data: null, error: error.message };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('AidRequestsService.getAidRequest error:', error);
      return { data: null, error: 'Aid request fetch failed' };
    }
  }

  // Create new aid request
  async createAidRequest(aidRequest: AidRequestInsert): Promise<ApiResponse<AidRequest>> {
    try {
      const now = new Date().toISOString();
      const insertData = {
        ...aidRequest,
        created_at: now,
        updated_at: now,
        status: aidRequest.status ?? 'pending',
        urgency: aidRequest.urgency ?? 'medium',
        currency: aidRequest.currency ?? 'TRY',
        follow_up_required: aidRequest.follow_up_required ?? false,
      };

      const { data, error } = await db.create(collections.AID_APPLICATIONS, insertData);

      if (error) {
        logger.error('Error creating aid request:', error);
        return { data: null, error: `Yardım talebi oluşturulamadı: ${error.message}` };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('AidRequestsService.createAidRequest error:', error);
      return { data: null, error: 'Aid request creation failed' };
    }
  }

  // Update aid request
  async updateAidRequest(id: string, updates: AidRequestUpdate): Promise<ApiResponse<AidRequest>> {
    try {
      const { data, error } = await db.update(collections.AID_APPLICATIONS, id, {
        ...updates,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Error updating aid request:', error);
        return { data: null, error: `Güncelleme başarısız: ${error.message}` };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('AidRequestsService.updateAidRequest error:', error);
      return { data: null, error: 'Aid request update failed' };
    }
  }

  // Assign aid request to user
  async assignAidRequest(
    id: string,
    assignedTo: string,
    assignedBy: string
  ): Promise<ApiResponse<AidRequest>> {
    try {
      const { data, error } = await db.update(collections.AID_APPLICATIONS, id, {
        assigned_to: assignedTo,
        status: 'under_review',
        updated_by: assignedBy,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Error assigning aid request:', error);
        return { data: null, error: `Atama başarısız: ${error.message}` };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('AidRequestsService.assignAidRequest error:', error);
      return { data: null, error: 'Aid request assignment failed' };
    }
  }

  // Approve aid request
  async approveAidRequest(
    id: string,
    approvedAmount: number,
    approvedBy: string,
    disbursementMethod?: string
  ): Promise<ApiResponse<AidRequest>> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await db.update(collections.AID_APPLICATIONS, id, {
        status: 'approved',
        approved_amount: approvedAmount,
        approved_by: approvedBy,
        approval_date: now.split('T')[0],
        disbursement_method: disbursementMethod,
        updated_by: approvedBy,
        updated_at: now,
      });

      if (error) {
        logger.error('Error approving aid request:', error);
        return { data: null, error: `Onaylama başarısız: ${error.message}` };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('AidRequestsService.approveAidRequest error:', error);
      return { data: null, error: 'Aid request approval failed' };
    }
  }

  // Reject aid request
  async rejectAidRequest(
    id: string,
    rejectedBy: string,
    reason?: string
  ): Promise<ApiResponse<AidRequest>> {
    try {
      const { data, error } = await db.update(collections.AID_APPLICATIONS, id, {
        status: 'rejected',
        internal_notes: reason,
        updated_by: rejectedBy,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        logger.error('Error rejecting aid request:', error);
        return { data: null, error: `Reddetme başarısız: ${error.message}` };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('AidRequestsService.rejectAidRequest error:', error);
      return { data: null, error: 'Aid request rejection failed' };
    }
  }

  // Complete aid request (disbursement done)
  async completeAidRequest(id: string, completedBy: string): Promise<ApiResponse<AidRequest>> {
    try {
      const now = new Date().toISOString();
      const { data, error } = await db.update(collections.AID_APPLICATIONS, id, {
        status: 'completed',
        disbursement_date: now.split('T')[0],
        updated_by: completedBy,
        updated_at: now,
      });

      if (error) {
        logger.error('Error completing aid request:', error);
        return { data: null, error: `Tamamlama başarısız: ${error.message}` };
      }

      return { data, error: null };
    } catch (error) {
      logger.error('AidRequestsService.completeAidRequest error:', error);
      return { data: null, error: 'Aid request completion failed' };
    }
  }

  // Get aid request statistics - safe count-only approach
  async getAidRequestStats(): Promise<ApiResponse<AidRequestStats>> {
    try {
      // Get all aid requests for statistics
      const { data, error } = await db.list(collections.AID_APPLICATIONS, [
        queryHelpers.select([
          'status',
          'aid_type',
          'urgency',
          'requested_amount',
          'approved_amount',
        ]),
      ]);

      if (error) {
        logger.error('Error fetching aid request stats:', error);
        return { data: null, error: error.message };
      }

      const documents = data?.documents || [];
      const total = documents.length;

      const stats: AidRequestStats = {
        total,
        pending: documents.filter((d: any) => d.status === 'pending').length,
        underReview: documents.filter((d: any) => d.status === 'under_review').length,
        approved: documents.filter((d: any) => d.status === 'approved').length,
        rejected: documents.filter((d: any) => d.status === 'rejected').length,
        completed: documents.filter((d: any) => d.status === 'completed').length,
        totalRequestedAmount: documents.reduce(
          (sum: number, d: any) => sum + (d.requested_amount || 0),
          0
        ),
        totalApprovedAmount: documents.reduce(
          (sum: number, d: any) => sum + (d.approved_amount || 0),
          0
        ),
        byAidType: {},
        byUrgency: {},
      };

      // Calculate by aid type
      documents.forEach((d: any) => {
        if (d.aid_type) {
          stats.byAidType[d.aid_type] = (stats.byAidType[d.aid_type] || 0) + 1;
        }
      });

      // Calculate by urgency
      documents.forEach((d: any) => {
        if (d.urgency) {
          stats.byUrgency[d.urgency] = (stats.byUrgency[d.urgency] || 0) + 1;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      logger.error('AidRequestsService.getAidRequestStats error:', error);
      return { data: null, error: 'Stats fetch failed' };
    }
  }

  // Search aid requests
  async searchAidRequests(searchTerm: string, limit = 10): Promise<ApiResponse<AidRequest[]>> {
    try {
      // Note: Appwrite doesn't support complex OR queries like Supabase
      // We'll search by applicant_name as the primary field
      const { data, error } = await db.list(collections.AID_APPLICATIONS, [
        queryHelpers.search('applicant_name', searchTerm),
        queryHelpers.orderDesc('created_at'),
        queryHelpers.limit(limit),
      ]);

      if (error) {
        logger.error('Error searching aid requests:', error);
        return { data: null, error: error.message };
      }

      return { data: data?.documents || [], error: null };
    } catch (error) {
      logger.error('AidRequestsService.searchAidRequests error:', error);
      return { data: null, error: 'Search failed' };
    }
  }

  // Get aid requests assigned to user
  async getMyAidRequests(userId: string): Promise<ApiResponse<AidRequest[]>> {
    try {
      const { data, error } = await db.list(collections.AID_APPLICATIONS, [
        queryHelpers.equal('assigned_to', userId),
        queryHelpers.orderDesc('created_at'),
      ]);

      if (error) {
        logger.error('Error fetching user aid requests:', error);
        return { data: null, error: error.message };
      }

      return { data: data?.documents || [], error: null };
    } catch (error) {
      logger.error('AidRequestsService.getMyAidRequests error:', error);
      return { data: null, error: 'My aid requests fetch failed' };
    }
  }

  // Get recent aid requests
  async getRecentAidRequests(limit = 5): Promise<ApiResponse<AidRequest[]>> {
    try {
      const { data, error } = await db.list(collections.AID_APPLICATIONS, [
        queryHelpers.orderDesc('created_at'),
        queryHelpers.limit(limit),
      ]);

      if (error) {
        logger.error('Error fetching recent aid requests:', error);
        return { data: null, error: error.message };
      }

      return { data: data?.documents || [], error: null };
    } catch (error) {
      logger.error('AidRequestsService.getRecentAidRequests error:', error);
      return { data: null, error: 'Recent aid requests fetch failed' };
    }
  }

  // Soft delete aid request
  async deleteAidRequest(id: string, deletedBy: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await db.update(collections.AID_APPLICATIONS, id, {
        deleted_at: new Date().toISOString(),
        updated_by: deletedBy,
      });

      if (error) {
        logger.error('Error deleting aid request:', error);
        return { data: null, error: `Silme işlemi başarısız: ${error.message}` };
      }

      return { data: true, error: null };
    } catch (error) {
      logger.error('AidRequestsService.deleteAidRequest error:', error);
      return { data: null, error: 'Aid request deletion failed' };
    }
  }

  // Bulk operations
  async bulkUpdateStatus(
    requestIds: string[],
    status: string,
    updatedBy: string
  ): Promise<ApiResponse<boolean>> {
    try {
      // Appwrite doesn't have bulk update, so we'll update each request individually
      const updatePromises = requestIds.map((id) =>
        db.update(collections.AID_APPLICATIONS, id, {
          status,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const errors = results.filter((result) => result.status === 'rejected');

      if (errors.length > 0) {
        logger.error('Error bulk updating aid request status:', errors);
        return {
          data: null,
          error: `Toplu güncelleme başarısız: ${errors.length} kayıt güncellenemedi`,
        };
      }

      return { data: true, error: null };
    } catch (error) {
      logger.error('AidRequestsService.bulkUpdateStatus error:', error);
      return { data: null, error: 'Bulk update failed' };
    }
  }
}

// Export singleton instance
export const aidRequestsService = new AidRequestsService();
export default aidRequestsService;
