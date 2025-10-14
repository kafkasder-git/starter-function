import { Document } from 'appwrite';

export interface Beneficiary extends Document {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive' | 'pending';
  category: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BeneficiaryFilters {
  status?: string;
  category?: string;
  search?: string;
}

export interface BeneficiaryListResponse {
  beneficiaries: Beneficiary[];
  total: number;
}
