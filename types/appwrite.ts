/**
 * @fileoverview Appwrite Types
 * @description Type definitions for Appwrite collections and models
 */

import type { Models } from 'appwrite';

// Base Appwrite Document interface
export interface AppwriteDocument extends Models.Document {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  $collectionId: string;
  $databaseId: string;
}

// User Profile Collection
export interface UserProfile extends AppwriteDocument {
  user_id: string;
  email: string;
  name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  department?: string;
  location?: string;
  bio?: string;
  preferences?: {
    language: string;
    theme: string;
    notifications: boolean;
  };
  last_login?: string;
  is_active: boolean;
  created_by?: string;
  updated_by?: string;
}

// Beneficiaries Collection
export interface Beneficiary extends AppwriteDocument {
  name: string;
  surname: string;
  email?: string;
  phone?: string;
  address: string;
  city: string;
  district?: string;
  postal_code?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'other';
  id_number?: string;
  family_size: number;
  monthly_income?: number;
  need_type: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  supporting_documents?: string[];
  notes?: string;
  assigned_to?: string;
  created_by: string;
  updated_by?: string;
  last_assessment?: string;
  next_follow_up?: string;
}

// Donations Collection
export interface Donation extends AppwriteDocument {
  donor_name: string;
  donor_email?: string;
  donor_phone?: string;
  amount: number;
  currency: string;
  donation_type: 'cash' | 'in_kind' | 'service' | 'other';
  payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check' | 'other';
  description?: string;
  purpose?: string;
  beneficiary_id?: string;
  campaign_id?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  receipt_number?: string;
  receipt_url?: string;
  notes?: string;
  approved_by?: string;
  approved_at?: string;
  created_by: string;
  updated_by?: string;
}

// Aid Applications Collection
export interface AidApplication extends AppwriteDocument {
  applicant_name: string;
  applicant_email?: string;
  applicant_phone?: string;
  applicant_address: string;
  applicant_city: string;
  aid_type: string;
  description: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  requested_amount?: number;
  approved_amount?: number;
  assigned_to?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  completion_date?: string;
  supporting_documents?: string[];
  notes?: string;
  created_by: string;
  updated_by?: string;
}

// Campaigns Collection
export interface Campaign extends AppwriteDocument {
  title: string;
  description: string;
  goal_amount: number;
  current_amount: number;
  currency: string;
  start_date: string;
  end_date?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  category: string;
  tags?: string[];
  image_url?: string;
  organizer_name: string;
  organizer_email?: string;
  organizer_phone?: string;
  target_beneficiaries?: string[];
  progress_percentage: number;
  donation_count: number;
  is_featured: boolean;
  created_by: string;
  updated_by?: string;
}

// System Settings Collection
export interface SystemSettings extends AppwriteDocument {
  general: {
    site_name: string;
    site_description?: string;
    contact_email: string;
    contact_phone?: string;
    address?: string;
    timezone: string;
    language: string;
  };
  notifications: {
    email_enabled: boolean;
    sms_enabled: boolean;
    push_enabled: boolean;
    admin_notifications: boolean;
    user_notifications: boolean;
  };
  security: {
    session_timeout: number;
    password_min_length: number;
    require_email_verification: boolean;
    two_factor_enabled: boolean;
    rate_limiting_enabled: boolean;
  };
  database: {
    backup_frequency: string;
    retention_days: number;
    auto_cleanup_enabled: boolean;
  };
  updated_by?: string;
}

// Roles Collection
export interface Role extends AppwriteDocument {
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  created_by: string;
  updated_by?: string;
}

// Permissions Collection
export interface Permission extends AppwriteDocument {
  name: string;
  display_name: string;
  description: string;
  category: string;
  is_active: boolean;
  created_by: string;
  updated_by?: string;
}

// User Permissions Collection
export interface UserPermission extends AppwriteDocument {
  user_id: string;
  permission_id: string;
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
}

// Partners Collection
export interface Partner extends AppwriteDocument {
  name: string;
  type: 'corporate' | 'individual' | 'ngo' | 'government' | 'other';
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  website?: string;
  description?: string;
  partnership_type: 'sponsor' | 'volunteer' | 'supplier' | 'collaborator' | 'other';
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  start_date: string;
  end_date?: string;
  contribution_amount?: number;
  contribution_type?: string;
  notes?: string;
  created_by: string;
  updated_by?: string;
}

// Audit Logs Collection
export interface AuditLog extends AppwriteDocument {
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  success: boolean;
  error_message?: string;
}

// Family Relationships Collection
export interface FamilyRelationship extends AppwriteDocument {
  primary_beneficiary_id: string;
  dependent_beneficiary_id?: string;
  family_member_id?: string;
  relationship_type: string;
  is_dependent: boolean;
  created_by: string;
  updated_by?: string;
}

// File Storage Types
export interface FileMetadata extends AppwriteDocument {
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  bucket_id: string;
  file_id: string;
  uploaded_by: string;
  uploaded_at: string;
  is_public: boolean;
  tags?: string[];
  description?: string;
}

// Statistics Types
export interface BeneficiaryStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  suspended: number;
  by_city: Record<string, number>;
  by_need_type: Record<string, number>;
  by_urgency: Record<string, number>;
}

export interface DonationStats {
  total_amount: number;
  total_count: number;
  average_amount: number;
  by_type: Record<string, number>;
  by_status: Record<string, number>;
  by_month: Record<string, number>;
  top_donors: Array<{
    name: string;
    amount: number;
    count: number;
  }>;
}

export interface CampaignStats {
  total_campaigns: number;
  active_campaigns: number;
  completed_campaigns: number;
  total_raised: number;
  total_goal: number;
  average_progress: number;
  by_status: Record<string, number>;
  by_category: Record<string, number>;
}

export interface AidRequestStats {
  total: number;
  pending: number;
  under_review: number;
  approved: number;
  rejected: number;
  completed: number;
  by_type: Record<string, number>;
  by_urgency: Record<string, number>;
  average_processing_time: number;
}

// API Response Types
export interface AppwriteResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  metadata?: {
    total?: number;
    offset?: number;
    limit?: number;
  };
}

export interface AppwriteListResponse<T> {
  documents: T[];
  total: number;
  offset: number;
  limit: number;
}

// Query Types
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderType?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
  search?: string;
}

// Collection Names
export const COLLECTIONS = {
  USER_PROFILES: 'user_profiles',
  BENEFICIARIES: 'beneficiaries',
  DONATIONS: 'donations',
  AID_APPLICATIONS: 'aid_applications',
  CAMPAIGNS: 'campaigns',
  SYSTEM_SETTINGS: 'system_settings',
  ROLES: 'roles',
  PERMISSIONS: 'permissions',
  USER_PERMISSIONS: 'user_permissions',
  PARTNERS: 'partners',
  AUDIT_LOGS: 'audit_logs',
  FAMILY_RELATIONSHIPS: 'family_relationships',
  FILE_METADATA: 'file_metadata',
} as const;

// Bucket Names
export const BUCKETS = {
  DOCUMENTS: 'documents',
  IMAGES: 'images',
  AVATARS: 'avatars',
  REPORTS: 'reports',
} as const;

// Permission Names
export const PERMISSIONS = {
  // Beneficiary permissions
  BENEFICIARY_VIEW: 'beneficiary:view',
  BENEFICIARY_CREATE: 'beneficiary:create',
  BENEFICIARY_UPDATE: 'beneficiary:update',
  BENEFICIARY_DELETE: 'beneficiary:delete',
  
  // Donation permissions
  DONATION_VIEW: 'donation:view',
  DONATION_CREATE: 'donation:create',
  DONATION_UPDATE: 'donation:update',
  DONATION_DELETE: 'donation:delete',
  DONATION_APPROVE: 'donation:approve',
  
  // Aid request permissions
  AID_REQUEST_VIEW: 'aid_request:view',
  AID_REQUEST_CREATE: 'aid_request:create',
  AID_REQUEST_UPDATE: 'aid_request:update',
  AID_REQUEST_DELETE: 'aid_request:delete',
  AID_REQUEST_ASSIGN: 'aid_request:assign',
  AID_REQUEST_APPROVE: 'aid_request:approve',
  
  // Campaign permissions
  CAMPAIGN_VIEW: 'campaign:view',
  CAMPAIGN_CREATE: 'campaign:create',
  CAMPAIGN_UPDATE: 'campaign:update',
  CAMPAIGN_DELETE: 'campaign:delete',
  
  // User management permissions
  USER_VIEW: 'user:view',
  USER_CREATE: 'user:create',
  USER_UPDATE: 'user:update',
  USER_DELETE: 'user:delete',
  USER_ROLE_ASSIGN: 'user:role_assign',
  
  // System permissions
  SYSTEM_SETTINGS_VIEW: 'system:settings_view',
  SYSTEM_SETTINGS_UPDATE: 'system:settings_update',
  SYSTEM_AUDIT_VIEW: 'system:audit_view',
  SYSTEM_REPORTS_VIEW: 'system:reports_view',
  SYSTEM_REPORTS_EXPORT: 'system:reports_export',
} as const;

// Role Names
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  COORDINATOR: 'coordinator',
  VOLUNTEER: 'volunteer',
  VIEWER: 'viewer',
} as const;

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];
export type PermissionName = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type RoleName = typeof ROLES[keyof typeof ROLES];