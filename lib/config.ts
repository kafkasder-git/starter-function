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

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL,
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  serviceRoleKey: import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
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
