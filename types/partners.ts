/**
 * @fileoverview Partner Types
 * @description Type definitions for partner management
 */

export interface PartnerStats {
  partnerId: string;
  totalDonations: number;
  donorCount: number;
  lastDonationDate: string | null;
  monthlyTrend: MonthlyTrend[];
  topDonors: TopDonor[];
  donationFrequency: DonationFrequency;
  averageDonation: number;
  totalDonationsCount: number;
  lastUpdated: string;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
  count: number;
}

export interface TopDonor {
  donorId: string;
  total: number;
  count: number;
}

export interface DonationFrequency {
  lastMonth: number;
  lastThreeMonths: number;
  lastYear: number;
  total: number;
}

export interface PartnerFilters {
  searchTerm?: string;
  partnerType?: string;
  status?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface PartnersApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface Partner {
  id: string;
  name: string;
  partner_type: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string;
  relationship_start: string;
  relationship_end?: string;
  services_provided?: string[];
  rating?: number;
  website?: string;
  tax_number?: string;
  notes?: string;
  logo_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface SponsorOrganization {
  id: string;
  name: string;
  type: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  totalSponsorship: number;
  currentProjects: number;
  completedProjects: number;
  lastSponsorshipDate: string;
  contractStart: string;
  contractEnd: string;
  sponsorshipAreas: string[];
  rating: number;
  website: string;
  taxNumber: string;
  description: string;
  logo: string;
  tags: string[];
  donorCount: number;
}
