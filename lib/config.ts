/**
 * @fileoverview config Module - Application module
 * 
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

// Application Configuration with Supabase
export const APP_CONFIG = {
  name: 'Dernek Yönetim Sistemi',
  version: '1.0.0',
  mode: 'production', // Changed from 'demo' to 'production'
  description: 'Modern NGO Management System - Full Stack Application',
  features: {
    auth: true,
    notifications: true,
    supabase: true, // Added Supabase support
    realtime: true, // Added realtime support
    localStorage: false, // Disabled localStorage for production
  },
};

import { environment } from './environment';

// Supabase Configuration - Service role key removed for security
export const SUPABASE_CONFIG = {
  url: environment.supabase.url,
  anonKey: environment.supabase.anonKey,
  // serviceRoleKey removed - never expose in frontend for security
};

// Environment check
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Development credentials fallback (only for development)
export const DEV_CREDENTIALS = isDevelopment
  ? {
      'admin@dernek.org': 'admin123',
      'manager@dernek.org': 'manager123',
      'operator@dernek.org': 'operator123',
      'viewer@dernek.org': 'viewer123',
    }
  : {};

export default APP_CONFIG;
