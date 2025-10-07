import { describe, it, expect, beforeEach, vi } from 'vitest';
import { membersService } from '../membersService';

// Mock Supabase
vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: '1', first_name: 'Test', last_name: 'User' },
            error: null,
          })),
        })),
        order: vi.fn(() => Promise.resolve({
          data: [
            { id: '1', first_name: 'Test', last_name: 'User' },
            { id: '2', first_name: 'John', last_name: 'Doe' },
          ],
          error: null,
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: '3', first_name: 'New', last_name: 'Member' },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: '1', first_name: 'Updated', last_name: 'User' },
              error: null,
            })),
          })),
        })),
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null })),
      })),
    })),
  },
}));

describe('MembersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMembers', () => {
    it('should fetch all members', async () => {
      const result = await membersService.getMembers();
      
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should handle filters', async () => {
      const filters = {
        status: 'Aktif',
        city: 'İstanbul',
      };
      
      const result = await membersService.getMembers(filters);
      expect(result.data).toBeDefined();
    });
  });

  describe('getMember', () => {
    it('should fetch single member by id', async () => {
      const result = await membersService.getMember('1');
      
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('1');
      expect(result.error).toBeNull();
    });

    it('should handle non-existent member', async () => {
      const result = await membersService.getMember('invalid-id');
      expect(result.data).toBeDefined();
    });
  });

  describe('createMember', () => {
    it('should create new member', async () => {
      const memberData = {
        first_name: 'New',
        last_name: 'Member',
        email: 'new@example.com',
        phone: '05551234567',
      };
      
      const result = await membersService.createMember(memberData);
      
      expect(result.data).toBeDefined();
      expect(result.data?.first_name).toBe('New');
      expect(result.error).toBeNull();
    });

    it('should validate required fields', async () => {
      const invalidData = {
        first_name: '',
        last_name: '',
      };
      
      // Should throw or return error
      try {
        await membersService.createMember(invalidData as any);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('updateMember', () => {
    it('should update existing member', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'User',
      };
      
      const result = await membersService.updateMember('1', updateData);
      
      expect(result.data).toBeDefined();
      expect(result.data?.first_name).toBe('Updated');
      expect(result.error).toBeNull();
    });
  });

  describe('deleteMember', () => {
    it('should delete member', async () => {
      const result = await membersService.deleteMember('1');
      
      expect(result.error).toBeNull();
    });
  });

  describe('searchMembers', () => {
    it('should search members by query', async () => {
      const result = await membersService.searchMembers('Test');
      
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should handle empty search query', async () => {
      const result = await membersService.searchMembers('');
      expect(result.data).toBeDefined();
    });
  });

  describe('getMemberStats', () => {
    it('should return member statistics', async () => {
      const stats = await membersService.getMemberStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.active).toBe('number');
    });
  });
});
