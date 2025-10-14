import { Document } from 'appwrite';

export interface Donation extends Document {
  amount: number;
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  payment_method: 'cash' | 'bank_transfer' | 'card' | 'online';
  status: 'pending' | 'confirmed' | 'failed';
  category: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DonationFilters {
  status?: string;
  payment_method?: string;
  category?: string;
  search?: string;
}

export interface DonationListResponse {
  donations: Donation[];
  total: number;
}
