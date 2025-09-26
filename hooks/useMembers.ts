/**
 * @fileoverview useMembers Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
// Removed direct supabase import - using service layer instead
import type { Member, MemberInsert, MemberUpdate, MemberWithDonations } from '../types/database';
import { useSupabaseData, useSupabasePagination, useSupabaseSearch } from './useSupabaseData';
import { TABLES } from '../lib/supabase';

// Basic members hook
/**
 * useMembers function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useMembers(
  options: {
    includeDeleted?: boolean;
    status?: 'active' | 'inactive' | 'suspended';
    membershipType?: string;
    realtime?: boolean;
  } = {},
) {
  const { includeDeleted = false, status, membershipType, realtime = true } = options;

  const filters = useMemo(() => {
    const f: Record<string, any> = {};

    if (!includeDeleted) {
      f.deleted_at = 'is.null';
    }

    if (status) {
      f.status = status;
    }

    if (membershipType) {
      f.membership_type = membershipType;
    }

    return f;
  }, [includeDeleted, status, membershipType]);

  const {
    data: members,
    loading,
    error,
    count,
    refetch,
    insert,
    update,
    delete: deleteMember,
    bulkInsert,
    bulkUpdate,
    bulkDelete,
  } = useSupabaseData<Member>(TABLES.MEMBERS, {
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    filters,
    realtime,
  });

  // Create new member
  const createMember = useCallback(
    async (memberData: Omit<MemberInsert, 'created_by'>) => {
      try {
        // Add created_by from current user context (you'll need to get this from auth)
        const newMember = await insert({
          ...memberData,
          created_by: 'current-user-id', // Replace with actual user ID from auth context
        });

        toast.success(`${memberData.name} başarıyla eklendi`);
        return newMember;
      } catch (error) {
        throw error;
      }
    },
    [insert],
  );

  // Update member
  const updateMember = useCallback(
    async (id: string, memberData: Partial<MemberUpdate>) => {
      try {
        const updatedMember = await update(id, {
          ...memberData,
          updated_by: 'current-user-id', // Replace with actual user ID
          updated_at: new Date().toISOString(),
        });

        return updatedMember;
      } catch (error) {
        throw error;
      }
    },
    [update],
  );

  // Get member statistics
  const getStats = useCallback(() => {
    return {
      total: members.length,
      active: members.filter((m) => m.status === 'active').length,
      inactive: members.filter((m) => m.status === 'inactive').length,
      suspended: members.filter((m) => m.status === 'suspended').length,
      byMembershipType: {
        standard: members.filter((m) => m.membership_type === 'standard').length,
        premium: members.filter((m) => m.membership_type === 'premium').length,
        corporate: members.filter((m) => m.membership_type === 'corporate').length,
        student: members.filter((m) => m.membership_type === 'student').length,
        senior: members.filter((m) => m.membership_type === 'senior').length,
      },
    };
  }, [members]);

  // Activate/deactivate members
  const activateMember = useCallback(
    async (id: string) => {
      return updateMember(id, { status: 'active' });
    },
    [updateMember],
  );

  const deactivateMember = useCallback(
    async (id: string) => {
      return updateMember(id, { status: 'inactive' });
    },
    [updateMember],
  );

  const suspendMember = useCallback(
    async (id: string) => {
      return updateMember(id, { status: 'suspended' });
    },
    [updateMember],
  );

  // Bulk status updates
  const bulkUpdateStatus = useCallback(
    async (ids: string[], status: 'active' | 'inactive' | 'suspended') => {
      const updates = ids.map((id) => ({
        id,
        data: {
          status,
          updated_by: 'current-user-id',
          updated_at: new Date().toISOString(),
        } as Partial<Member>,
      }));

      await bulkUpdate(updates);
      toast.success(`${ids.length} üye durumu ${status} olarak güncellendi`);
    },
    [bulkUpdate],
  );

  // Bulk membership type update
  const bulkUpdateMembershipType = useCallback(
    async (ids: string[], membershipType: string) => {
      const updates = ids.map((id) => ({
        id,
        data: {
          membership_type: membershipType,
          updated_by: 'current-user-id',
          updated_at: new Date().toISOString(),
        } as Partial<Member>,
      }));

      await bulkUpdate(updates);
      toast.success(`${ids.length} üye ${membershipType} üyeliğine güncellendi`);
    },
    [bulkUpdate],
  );

  return {
    members,
    loading,
    error,
    count,
    stats: getStats(),
    refetch,
    createMember,
    updateMember,
    deleteMember,
    activateMember,
    deactivateMember,
    suspendMember,
    bulkInsert,
    bulkUpdate,
    bulkDelete,
    bulkUpdateStatus,
    bulkUpdateMembershipType,
  };
}

// Paginated members hook
/**
 * useMembersPaginated function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useMembersPaginated(
  options: {
    pageSize?: number;
    includeDeleted?: boolean;
    searchQuery?: string;
    filters?: Record<string, any>;
  } = {},
) {
  const {
    pageSize = 20,
    includeDeleted = false,
    searchQuery = '',
    filters: additionalFilters = {},
  } = options;

  const filters = useMemo(() => {
    const f = { ...additionalFilters };

    if (!includeDeleted) {
      f.deleted_at = 'is.null';
    }

    return f;
  }, [includeDeleted, additionalFilters]);

  const searchFields = ['name', 'email', 'phone', 'city', 'occupation'];

  return useSupabasePagination<Member>(TABLES.MEMBERS, {
    select: '*',
    orderBy: { column: 'created_at', ascending: false },
    pageSize,
    filters,
    searchQuery,
    searchFields,
  });
}

// Member search hook
/**
 * useMemberSearch function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useMemberSearch(
  options: {
    maxResults?: number;
    debounceMs?: number;
  } = {},
) {
  const { maxResults = 50, debounceMs = 300 } = options;

  const searchFields = ['name', 'email', 'phone', 'city'];

  return useSupabaseSearch<Member>(TABLES.MEMBERS, searchFields, {
    select: 'id, name, email, phone, status, membership_type',
    debounceMs,
    maxResults,
  });
}

// Member with donations hook
/**
 * useMemberWithDonations function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useMemberWithDonations(memberId: string) {
  const {
    data: members,
    loading: memberLoading,
    error: memberError,
  } = useSupabaseData<Member>(TABLES.MEMBERS, {
    select: '*',
    filters: { id: memberId },
    limit: 1,
  });

  const {
    data: donations,
    loading: donationsLoading,
    error: donationsError,
  } = useSupabaseData(TABLES.DONATIONS, {
    select: '*',
    filters: { member_id: memberId, deleted_at: 'is.null' },
    orderBy: { column: 'created_at', ascending: false },
  });

  const member = members[0];
  const loading = memberLoading ?? donationsLoading;
  const error = memberError ?? donationsError;

  const memberWithDonations: MemberWithDonations | null = useMemo(() => {
    if (!member) return null;

    const totalDonations = donations.reduce((sum, donation) => {
      return sum + (donation.status === 'completed' ? donation.amount : 0);
    }, 0);

    const lastDonation = donations.find((d) => d.status === 'completed');

    return {
      ...member,
      donations,
      totalDonations,
      lastDonation,
    };
  }, [member, donations]);

  return {
    member: memberWithDonations,
    loading,
    error,
  };
}

// Member export data formatter
/**
 * useMemberExportData function
 * 
 * @param {Object} params - Function parameters
 * @returns {void} Nothing
 */
export function useMemberExportData() {
  const formatMemberForExport = useCallback((member: Member) => {
    return {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone ?? '-',
      city: member.city ?? '-',
      membershipType: member.membership_type,
      status: member.status,
      joinDate: member.join_date,
      birthDate: member.birth_date ?? '-',
      gender: member.gender ?? '-',
      occupation: member.occupation ?? '-',
      createdAt: member.created_at,
    };
  }, []);

  const formatMembersForExport = useCallback(
    (members: Member[]) => {
      return members.map(formatMemberForExport);
    },
    [formatMemberForExport],
  );

  return {
    formatMemberForExport,
    formatMembersForExport,
  };
}
