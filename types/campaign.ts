/**
 * @fileoverview Campaign Types - Campaign management types
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import type { BaseEntity } from '../services/baseService';
import type { Campaign as CampaignRow, CampaignInsert as CampaignInsertRow, CampaignUpdate as CampaignUpdateRow, CampaignWithStats } from '../types/database';

/**
 * Campaign status types
 */
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

/**
 * Campaign category types
 */
export type CampaignCategory = string; // Can be extended with specific categories

/**
 * App-level Campaign interface
 * Extends BaseEntity and includes all database fields plus computed properties
 */
export interface Campaign extends BaseEntity {
  /** Unique identifier (overrides BaseEntity's number to string) */
  id: string;
  /** Campaign name */
  name: string;
  /** Campaign description */
  description: string;
  /** Goal amount for the campaign */
  goal_amount: number;
  /** Current amount raised */
  current_amount: number;
  /** Currency code (e.g., 'TRY', 'USD') */
  currency: string;
  /** Campaign start date */
  start_date: string;
  /** Campaign end date (optional) */
  end_date: string | null;
  /** Campaign status */
  status: CampaignStatus;
  /** Campaign category */
  category: string;
  /** Image URL for the campaign */
  image_url: string | null;
  /** Whether the campaign is featured */
  featured: boolean;
  /** Soft delete timestamp */
  deleted_at: string | null;
  /** Computed: Progress percentage (0-100) */
  progress_percentage: number;
  /** Computed: Days remaining until end_date (null if no end_date) */
  days_remaining?: number;
  /** Computed: Whether the campaign is currently active */
  is_active: boolean;
}

/**
 * Campaign creation interface
 * Omits auto-generated and computed fields
 */
export interface CampaignInsert extends Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'progress_percentage' | 'days_remaining' | 'is_active'> {
  /** ID is auto-generated */
  id?: never;
  /** Created timestamp is auto-generated */
  created_at?: never;
  /** Updated timestamp is auto-generated */
  updated_at?: never;
  /** Computed fields are not set during creation */
  progress_percentage?: never;
  days_remaining?: never;
  is_active?: never;
}

/**
 * Campaign update interface
 * Partial update excluding immutable and computed fields
 */
export interface CampaignUpdate extends Partial<Omit<Campaign, 'id' | 'created_at' | 'progress_percentage' | 'days_remaining' | 'is_active'>> {
  /** ID cannot be updated */
  id?: never;
  /** Created timestamp cannot be updated */
  created_at?: never;
  /** Computed fields are updated automatically */
  progress_percentage?: never;
  days_remaining?: never;
  is_active?: never;
}

/**
 * Campaign filters for querying
 */
export interface CampaignsFilters {
  /** Search term for campaign name or description */
  searchTerm?: string;
  /** Filter by campaign status */
  status?: CampaignStatus;
  /** Filter by campaign category */
  category?: string;
  /** Filter campaigns starting from this date */
  dateFrom?: string;
  /** Filter campaigns ending before this date */
  dateTo?: string;
}

/**
 * Campaign statistics
 */
export interface CampaignStats {
  /** Total number of campaigns */
  total: number;
  /** Number of active campaigns */
  active: number;
  /** Number of completed campaigns */
  completed: number;
  /** Number of draft campaigns */
  draft: number;
  /** Number of paused campaigns */
  paused: number;
  /** Total goal amount across all campaigns */
  totalGoalAmount: number;
  /** Total current amount raised across all campaigns */
  totalCurrentAmount: number;
  /** Average progress percentage across all campaigns */
  averageProgress: number;
}

/**
 * Campaign with additional statistics
 * Re-exported from database types for convenience
 */
export type { CampaignWithStats };

/**
 * Note: Unlike beneficiaries, campaigns collection uses English field names
 * in the database, so no field mapping functions are needed.
 * The service can use these types directly with the database.
 */

// Export type aliases for backward compatibility
export type CampaignRow = Campaign;
export type CampaignInsertRow = CampaignInsert;
export type CampaignUpdateRow = CampaignUpdate;