/**
 * Type definitions for Model Context Protocol (MCP) server
 */

export type MCPAction = 'notification' | 'member' | 'donation';

export interface MCPRequest {
  action: MCPAction;
  payload?: Record<string, unknown>;
  meta?: {
    userId?: string;
    sessionId?: string;
    timestamp?: number;
  };
}

export interface MCPResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Notification specific types
export interface NotificationPayload {
  title: string;
  message: string;
  category: 'uye' | 'bagis' | 'yardim' | 'sistem' | 'genel';
  priority: 'dusuk' | 'orta' | 'yuksek' | 'acil';
  sound?: boolean;
  duration?: number;
  action?: {
    label: string;
    route: string;
  };
}

// Member specific types
export interface MemberPayload {
  name: string;
  email: string;
  phone?: string;
  [key: string]: string | number | boolean | undefined;
}

// Donation specific types
export interface DonationPayload {
  donorName: string;
  amount: number;
  currency: string;
  note?: string;
}