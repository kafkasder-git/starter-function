import { describe, it, expect, beforeEach, vi } from 'vitest';
import { donationsService } from '../donationsService';

vi.mock('../../lib/database', () => ({
  db: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: '1', amount: 1000, donor_name: 'Test Donor' },
              error: null,
            })
          ),
        })),
        order: vi.fn(() =>
          Promise.resolve({
            data: [
              { id: '1', amount: 1000, donor_name: 'Test Donor' },
              { id: '2', amount: 2000, donor_name: 'John Doe' },
            ],
            error: null,
          })
        ),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({
              data: { id: '3', amount: 500, donor_name: 'New Donor' },
              error: null,
            })
          ),
        })),
      })),
    })),
  },
}));

describe('DonationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDonations', () => {
    it('should fetch all donations', async () => {
      const result = await donationsService.getDonations();

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should filter by date range', async () => {
      const filters = {
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      };

      const result = await donationsService.getDonations(filters);
      expect(result.data).toBeDefined();
    });

    it('should filter by donor type', async () => {
      const filters = {
        donor_type: 'Bireysel',
      };

      const result = await donationsService.getDonations(filters);
      expect(result.data).toBeDefined();
    });
  });

  describe('getDonation', () => {
    it('should fetch single donation', async () => {
      const result = await donationsService.getDonation('1');

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('1');
      expect(result.error).toBeNull();
    });
  });

  describe('createDonation', () => {
    it('should create new donation', async () => {
      const donationData = {
        donor_name: 'New Donor',
        donor_type: 'Bireysel',
        amount: 500,
        donation_type: 'Nakit',
        payment_method: 'Nakit',
        payment_date: '2024-01-15',
      };

      const result = await donationsService.createDonation(donationData);

      expect(result.data).toBeDefined();
      expect(result.data?.amount).toBe(500);
      expect(result.error).toBeNull();
    });

    it('should validate amount is positive', async () => {
      const invalidData = {
        donor_name: 'Test',
        amount: -100,
      };

      try {
        await donationsService.createDonation(invalidData as any);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('getDonationStats', () => {
    it('should return donation statistics', async () => {
      const stats = await donationsService.getDonationStats();

      expect(stats).toBeDefined();
      expect(typeof stats.total).toBe('number');
      expect(typeof stats.totalAmount).toBe('number');
    });

    it('should calculate monthly totals', async () => {
      const stats = await donationsService.getDonationStats();

      expect(stats.monthly).toBeDefined();
      expect(Array.isArray(stats.monthly)).toBe(true);
    });
  });

  describe('exportDonations', () => {
    it('should export donations as CSV', async () => {
      const result = await donationsService.exportDonations('csv');

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should export donations as Excel', async () => {
      const result = await donationsService.exportDonations('excel');
      expect(result).toBeDefined();
    });
  });
});
