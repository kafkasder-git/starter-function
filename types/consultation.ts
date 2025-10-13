/**
 * @fileoverview Consultation Types - Type definitions for legal consultation system
 *
 * @author Dernek Yönetim Sistemi Team
 * @version 1.0.0
 */

export interface Consultation {
  id: number;
  title: string;
  description: string;
  category: 'medeni' | 'ceza' | 'is' | 'ticaret' | 'idare' | 'aile' | 'icra' | 'diger';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'scheduled' | 'completed';
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  assignedLawyer?: string;
  lawyerPhone?: string;
  consultationDate?: string;
  notes?: string;
  createdDate: string;
  expectedDate?: string;
  rating?: number;
}

export interface LegalConsultation {
  id: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  subject: string;
  description: string;
  category: 'medeni' | 'ceza' | 'is' | 'ticaret' | 'idare' | 'aile' | 'icra' | 'diger';
  urgency: 'acil' | 'orta' | 'normal';
  status: 'bekliyor' | 'incelemede' | 'atandi' | 'tamamlandi';
  assignedLawyer?: string;
  lawyerPhone?: string;
  consultationDate?: string;
  notes?: string;
  createdDate: string;
  expectedDate?: string;
  rating?: number;
}

export interface ConsultationFormData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  subject: string;
  description: string;
  category: string;
  urgency: string;
  notes?: string;
  expectedDate?: string;
}

export interface ConsultationFilters {
  category?: string;
  urgency?: string;
  status?: string;
  assignedLawyer?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ConsultationStats {
  total: number;
  pending: number;
  scheduled: number;
  completed: number;
  urgent: number;
  byCategory: Record<string, number>;
  byLawyer: Record<string, number>;
}

export type ConsultationStatus = 'bekliyor' | 'incelemede' | 'atandi' | 'tamamlandi';
export type ConsultationUrgency = 'acil' | 'orta' | 'normal';
export type ConsultationCategory =
  | 'medeni'
  | 'ceza'
  | 'is'
  | 'ticaret'
  | 'idare'
  | 'aile'
  | 'icra'
  | 'diger';
