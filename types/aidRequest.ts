import { Document } from 'appwrite';

export interface AidRequest extends Document {
  beneficiary_id: string;
  beneficiary_name: string;
  request_type: 'financial' | 'material' | 'medical' | 'educational';
  amount?: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AidRequestFilters {
  status?: string;
  request_type?: string;
  priority?: string;
  beneficiary_id?: string;
}

export interface AidRequestListResponse {
  aid_requests: AidRequest[];
  total: number;
}
