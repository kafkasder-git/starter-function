/**
 * @fileoverview supabase Module - Application module
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

import { createClient } from '@supabase/supabase-js';
import { environment } from './environment';
import type { Database } from '../types/supabase';
import { logger } from './logging/logger';
// Shared table name constants for hooks/services
export const TABLES = {
  DONATIONS: 'donations',
  MEMBERS: 'members',
  BENEFICIARIES: 'beneficiaries',
  AID_REQUESTS: 'aid_requests',
  CAMPAIGNS: 'campaigns',
  PARTNERS: 'partners',
  SYSTEM_SETTINGS: 'system_settings',
  AID_APPLICATIONS: 'aid_applications',
  NEW_AID_APPLICATIONS: 'new_aid_applications',
  FINANCE_TRANSACTIONS: 'finance_transactions',
  LEGAL_CONSULTATIONS: 'legal_consultations',
  EVENTS: 'events',
  TASKS: 'tasks',
  INVENTORY_ITEMS: 'inventory_items',
} as const;

// Supabase configuration using centralized environment management
const supabaseUrl = environment.supabase.url;
const supabaseAnonKey = environment.supabase.anonKey;

// Debug environment variables
logger.info('Supabase Configuration Debug:', {
  supabaseUrl,
  hasAnonKey: Boolean(supabaseAnonKey),
  anonKeyLength: supabaseAnonKey?.length ?? 0,
  supabaseUrlValid: supabaseUrl?.startsWith('http'),
  importMetaEnv: {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
  },
  environment: {
    url: environment.supabase.url,
    anonKey: environment.supabase.anonKey ? 'SET' : 'NOT_SET',
  },
  allImportMetaEnv:
    typeof import.meta !== 'undefined' && import.meta.env
      ? Object.keys(import.meta.env as Record<string, any>).filter((key) => key.startsWith('VITE_'))
      : [],
  rawImportMetaEnv: {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
});

// Validate Supabase configuration
if (!supabaseUrl?.startsWith('http')) {
  logger.warn('Invalid or missing VITE_SUPABASE_URL. Supabase features will be disabled.');
}

if (!supabaseAnonKey) {
  logger.warn('Missing VITE_SUPABASE_ANON_KEY. Supabase features will be disabled.');
}

// Create a safe Supabase client - use default values if environment is not configured
const normalizedUrl = (supabaseUrl || '').trim();
const normalizedKey = (supabaseAnonKey || '').trim();
const safeSupabaseUrl = normalizedUrl.startsWith('http')
  ? normalizedUrl
  : 'https://placeholder.supabase.co';
const safeSupabaseKey = normalizedKey ? normalizedKey : 'placeholder-key';

// CSRF token functionality removed for security
// Supabase JWT + RLS provides sufficient protection against CSRF attacks
// CSRF tokens are not needed with proper JWT authentication

// Supabase client instance oluştur - Singleton pattern
let supabaseInstance: ReturnType<typeof createClient> | null = null;

export const supabase = (() => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Prevent multiple instances by checking global state
  if (typeof window !== 'undefined' && (window as any).__supabaseInstance) {
    return (window as any).__supabaseInstance;
  }

  supabaseInstance = createClient<Database>(safeSupabaseUrl, safeSupabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        // Custom headers will be added per request
      },
    },
  });

  // Store instance globally to prevent multiple instances
  if (typeof window !== 'undefined') {
    (window as any).__supabaseInstance = supabaseInstance;
  }

  // CSRF token interceptor removed for security
  // Supabase JWT authentication + RLS provides sufficient protection

  return supabaseInstance;
})();

// Admin client removed for security - service role key should never be in frontend
// If admin operations are needed, implement them in a backend API
// export const supabaseAdmin = createClient(...) // REMOVED FOR SECURITY

// Typed supabase client - using generated types from types/supabase.ts
export type SupabaseClient = ReturnType<typeof createClient<Database>>;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl?.startsWith('http') && supabaseAnonKey && supabaseAnonKey !== 'placeholder-key',
  );
};

// Helper function to get Supabase configuration status
export const getSupabaseStatus = () => {
  return {
    configured: isSupabaseConfigured(),
    url: supabaseUrl,
    hasKey: Boolean(supabaseAnonKey),
    isPlaceholder: safeSupabaseUrl === 'https://placeholder.supabase.co',
  };
};

export default supabase;
