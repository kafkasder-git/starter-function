/**
 * @fileoverview Lawyer Module - Type definitions
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

export interface Lawyer {
  id: number;
  name: string;
  barNumber: string;
  barAssociation: string;
  phone: string;
  email: string;
  specializations: string[];
  experience: number;
  rating: number;
  totalCases: number;
  activeCases: number;
  successRate: number;
  status: 'musait' | 'dolu' | 'izinli';
  office: string;
  consultationFee?: number;
  languages: string[];
  education: string;
  notes?: string;
}
