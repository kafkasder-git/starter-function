export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// Simple API response type
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Simple beneficiary type - will be replaced by generated types below

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          email: string;
          phone: string | null;
          address: string | null;
          city: string | null;
          birth_date: string | null;
          gender: 'male' | 'female' | 'other' | null;
          occupation: string | null;
          membership_type: 'standard' | 'premium' | 'corporate' | 'student' | 'senior';
          status: 'active' | 'inactive' | 'suspended';
          join_date: string;
          emergency_contact: Json | null;
          notes: string | null;
          tags: string[] | null;
          avatar_url: string | null;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          email: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          occupation?: string | null;
          membership_type?: 'standard' | 'premium' | 'corporate' | 'student' | 'senior';
          status?: 'active' | 'inactive' | 'suspended';
          join_date?: string;
          emergency_contact?: Json | null;
          notes?: string | null;
          tags?: string[] | null;
          avatar_url?: string | null;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          occupation?: string | null;
          membership_type?: 'standard' | 'premium' | 'corporate' | 'student' | 'senior';
          status?: 'active' | 'inactive' | 'suspended';
          join_date?: string;
          emergency_contact?: Json | null;
          notes?: string | null;
          tags?: string[] | null;
          avatar_url?: string | null;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      donations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          donor_name: string;
          donor_email: string | null;
          donor_phone: string | null;
          member_id: string | null;
          amount: number;
          currency: string;
          donation_type: 'one_time' | 'monthly' | 'yearly';
          category: 'general' | 'education' | 'health' | 'emergency' | 'other';
          campaign_id: string | null;
          payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'online';
          reference_number: string | null;
          status: 'pending' | 'completed' | 'cancelled' | 'refunded';
          receipt_url: string | null;
          notes: string | null;
          is_anonymous: boolean;
          tax_deductible: boolean;
          processed_by: string | null;
          approved_by: string | null;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          donor_name: string;
          donor_email?: string | null;
          donor_phone?: string | null;
          member_id?: string | null;
          amount: number;
          currency?: string;
          donation_type?: 'one_time' | 'monthly' | 'yearly';
          category?: 'general' | 'education' | 'health' | 'emergency' | 'other';
          campaign_id?: string | null;
          payment_method?: 'cash' | 'bank_transfer' | 'credit_card' | 'online';
          reference_number?: string | null;
          status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
          receipt_url?: string | null;
          notes?: string | null;
          is_anonymous?: boolean;
          tax_deductible?: boolean;
          processed_by?: string | null;
          approved_by?: string | null;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          donor_name?: string;
          donor_email?: string | null;
          donor_phone?: string | null;
          member_id?: string | null;
          amount?: number;
          currency?: string;
          donation_type?: 'one_time' | 'monthly' | 'yearly';
          category?: 'general' | 'education' | 'health' | 'emergency' | 'other';
          campaign_id?: string | null;
          payment_method?: 'cash' | 'bank_transfer' | 'credit_card' | 'online';
          reference_number?: string | null;
          status?: 'pending' | 'completed' | 'cancelled' | 'refunded';
          receipt_url?: string | null;
          notes?: string | null;
          is_anonymous?: boolean;
          tax_deductible?: boolean;
          processed_by?: string | null;
          approved_by?: string | null;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      aid_requests: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          applicant_name: string;
          applicant_email: string | null;
          applicant_phone: string;
          applicant_address: string;
          aid_type: 'financial' | 'medical' | 'education' | 'housing' | 'food' | 'other';
          category: string | null;
          requested_amount: number | null;
          currency: string;
          urgency: 'low' | 'medium' | 'high' | 'critical';
          description: string;
          reason: string;
          family_size: number | null;
          monthly_income: number | null;
          supporting_documents: string[] | null;
          status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
          assigned_to: string | null;
          approved_amount: number | null;
          approved_by: string | null;
          approval_date: string | null;
          disbursement_date: string | null;
          disbursement_method: string | null;
          follow_up_required: boolean;
          follow_up_date: string | null;
          notes: string | null;
          internal_notes: string | null;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          applicant_name: string;
          applicant_email?: string | null;
          applicant_phone: string;
          applicant_address: string;
          aid_type: 'financial' | 'medical' | 'education' | 'housing' | 'food' | 'other';
          category?: string | null;
          requested_amount?: number | null;
          currency?: string;
          urgency?: 'low' | 'medium' | 'high' | 'critical';
          description: string;
          reason: string;
          family_size?: number | null;
          monthly_income?: number | null;
          supporting_documents?: string[] | null;
          status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
          assigned_to?: string | null;
          approved_amount?: number | null;
          approved_by?: string | null;
          approval_date?: string | null;
          disbursement_date?: string | null;
          disbursement_method?: string | null;
          follow_up_required?: boolean;
          follow_up_date?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          applicant_name?: string;
          applicant_email?: string | null;
          applicant_phone?: string;
          applicant_address?: string;
          aid_type?: 'financial' | 'medical' | 'education' | 'housing' | 'food' | 'other';
          category?: string | null;
          requested_amount?: number | null;
          currency?: string;
          urgency?: 'low' | 'medium' | 'high' | 'critical';
          description?: string;
          reason?: string;
          family_size?: number | null;
          monthly_income?: number | null;
          supporting_documents?: string[] | null;
          status?: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
          assigned_to?: string | null;
          approved_amount?: number | null;
          approved_by?: string | null;
          approval_date?: string | null;
          disbursement_date?: string | null;
          disbursement_method?: string | null;
          follow_up_required?: boolean;
          follow_up_date?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      campaigns: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          description: string;
          goal_amount: number;
          current_amount: number;
          currency: string;
          start_date: string;
          end_date: string | null;
          status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          category: string;
          image_url: string | null;
          featured: boolean;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          description: string;
          goal_amount: number;
          current_amount?: number;
          currency?: string;
          start_date: string;
          end_date?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          category: string;
          image_url?: string | null;
          featured?: boolean;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          description?: string;
          goal_amount?: number;
          current_amount?: number;
          currency?: string;
          start_date?: string;
          end_date?: string | null;
          status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
          category?: string;
          image_url?: string | null;
          featured?: boolean;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'success' | 'warning' | 'error';
          category: 'member' | 'donation' | 'aid' | 'campaign' | 'system';
          read: boolean;
          read_at: string | null;
          action_url: string | null;
          metadata: Json | null;
          expires_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          category?: 'member' | 'donation' | 'aid' | 'campaign' | 'system';
          read?: boolean;
          read_at?: string | null;
          action_url?: string | null;
          metadata?: Json | null;
          expires_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'success' | 'warning' | 'error';
          category?: 'member' | 'donation' | 'aid' | 'campaign' | 'system';
          read?: boolean;
          read_at?: string | null;
          action_url?: string | null;
          metadata?: Json | null;
          expires_at?: string | null;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          action: string;
          table_name: string;
          record_id: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          action?: string;
          table_name?: string;
          record_id?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      beneficiaries: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          surname: string;
          id_number: string;
          phone: string | null;
          address: string | null;
          city: string | null;
          district: string | null;
          birth_date: string | null;
          gender: 'male' | 'female' | 'other' | null;
          family_size: number | null;
          monthly_income: number | null;
          status: 'active' | 'passive' | 'suspended' | 'under_evaluation';
          registration_date: string;
          last_aid_date: string | null;
          total_aid_amount: number;
          priority_level: 'low' | 'medium' | 'high' | 'critical';
          needs_assessment: Json | null;
          notes: string | null;
          emergency_contact: Json | null;
          supporting_documents: string[] | null;
          case_worker_id: string | null;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          surname: string;
          id_number: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          district?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          family_size?: number | null;
          monthly_income?: number | null;
          status?: 'active' | 'passive' | 'suspended' | 'under_evaluation';
          registration_date?: string;
          last_aid_date?: string | null;
          total_aid_amount?: number;
          priority_level?: 'low' | 'medium' | 'high' | 'critical';
          needs_assessment?: Json | null;
          notes?: string | null;
          emergency_contact?: Json | null;
          supporting_documents?: string[] | null;
          case_worker_id?: string | null;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          surname?: string;
          id_number?: string;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          district?: string | null;
          birth_date?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          family_size?: number | null;
          monthly_income?: number | null;
          status?: 'active' | 'passive' | 'suspended' | 'under_evaluation';
          registration_date?: string;
          last_aid_date?: string | null;
          total_aid_amount?: number;
          priority_level?: 'low' | 'medium' | 'high' | 'critical';
          needs_assessment?: Json | null;
          notes?: string | null;
          emergency_contact?: Json | null;
          supporting_documents?: string[] | null;
          case_worker_id?: string | null;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      finance_transactions: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          transaction_type: 'income' | 'expense';
          category: string;
          subcategory: string | null;
          amount: number;
          currency: string;
          description: string;
          transaction_date: string;
          payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check';
          reference_number: string | null;
          receipt_url: string | null;
          account_id: string | null;
          campaign_id: string | null;
          member_id: string | null;
          beneficiary_id: string | null;
          status: 'pending' | 'completed' | 'cancelled';
          approved_by: string | null;
          approval_date: string | null;
          notes: string | null;
          tags: string[] | null;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          transaction_type: 'income' | 'expense';
          category: string;
          subcategory?: string | null;
          amount: number;
          currency?: string;
          description: string;
          transaction_date: string;
          payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'check';
          reference_number?: string | null;
          receipt_url?: string | null;
          account_id?: string | null;
          campaign_id?: string | null;
          member_id?: string | null;
          beneficiary_id?: string | null;
          status?: 'pending' | 'completed' | 'cancelled';
          approved_by?: string | null;
          approval_date?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          transaction_type?: 'income' | 'expense';
          category?: string;
          subcategory?: string | null;
          amount?: number;
          currency?: string;
          description?: string;
          transaction_date?: string;
          payment_method?: 'cash' | 'bank_transfer' | 'credit_card' | 'check';
          reference_number?: string | null;
          receipt_url?: string | null;
          account_id?: string | null;
          campaign_id?: string | null;
          member_id?: string | null;
          beneficiary_id?: string | null;
          status?: 'pending' | 'completed' | 'cancelled';
          approved_by?: string | null;
          approval_date?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      partners: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          partner_type:
            | 'donor'
            | 'institution'
            | 'supplier'
            | 'sponsor'
            | 'association'
            | 'volunteer';
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          tax_number: string | null;
          status: 'active' | 'inactive' | 'suspended';
          relationship_start: string;
          relationship_end: string | null;
          contract_details: Json | null;
          payment_terms: string | null;
          services_provided: string[] | null;
          notes: string | null;
          rating: number | null;
          last_contact_date: string | null;
          website: string | null;
          social_media: Json | null;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          partner_type:
            | 'donor'
            | 'institution'
            | 'supplier'
            | 'sponsor'
            | 'association'
            | 'volunteer';
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          tax_number?: string | null;
          status?: 'active' | 'inactive' | 'suspended';
          relationship_start: string;
          relationship_end?: string | null;
          contract_details?: Json | null;
          payment_terms?: string | null;
          services_provided?: string[] | null;
          notes?: string | null;
          rating?: number | null;
          last_contact_date?: string | null;
          website?: string | null;
          social_media?: Json | null;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          partner_type?:
            | 'donor'
            | 'institution'
            | 'supplier'
            | 'sponsor'
            | 'association'
            | 'volunteer';
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          tax_number?: string | null;
          status?: 'active' | 'inactive' | 'suspended';
          relationship_start?: string;
          relationship_end?: string | null;
          contract_details?: Json | null;
          payment_terms?: string | null;
          services_provided?: string[] | null;
          notes?: string | null;
          rating?: number | null;
          last_contact_date?: string | null;
          website?: string | null;
          social_media?: Json | null;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      legal_cases: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          case_number: string;
          client_name: string;
          client_id_number: string | null;
          client_phone: string | null;
          case_type: 'consultation' | 'representation' | 'mediation' | 'legal_aid';
          subject: string;
          description: string;
          status: 'open' | 'in_progress' | 'closed' | 'suspended';
          priority: 'low' | 'medium' | 'high' | 'urgent';
          assigned_lawyer_id: string | null;
          court_name: string | null;
          case_date: string | null;
          next_hearing: string | null;
          estimated_cost: number | null;
          actual_cost: number | null;
          documents: string[] | null;
          notes: string | null;
          outcome: string | null;
          satisfaction_rating: number | null;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          case_number: string;
          client_name: string;
          client_id_number?: string | null;
          client_phone?: string | null;
          case_type: 'consultation' | 'representation' | 'mediation' | 'legal_aid';
          subject: string;
          description: string;
          status?: 'open' | 'in_progress' | 'closed' | 'suspended';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_lawyer_id?: string | null;
          court_name?: string | null;
          case_date?: string | null;
          next_hearing?: string | null;
          estimated_cost?: number | null;
          actual_cost?: number | null;
          documents?: string[] | null;
          notes?: string | null;
          outcome?: string | null;
          satisfaction_rating?: number | null;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          case_number?: string;
          client_name?: string;
          client_id_number?: string | null;
          client_phone?: string | null;
          case_type?: 'consultation' | 'representation' | 'mediation' | 'legal_aid';
          subject?: string;
          description?: string;
          status?: 'open' | 'in_progress' | 'closed' | 'suspended';
          priority?: 'low' | 'medium' | 'high' | 'urgent';
          assigned_lawyer_id?: string | null;
          court_name?: string | null;
          case_date?: string | null;
          next_hearing?: string | null;
          estimated_cost?: number | null;
          actual_cost?: number | null;
          documents?: string[] | null;
          notes?: string | null;
          outcome?: string | null;
          satisfaction_rating?: number | null;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      scholarships: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          student_name: string;
          student_id_number: string;
          student_phone: string | null;
          student_email: string | null;
          school_name: string;
          grade_level: string;
          field_of_study: string | null;
          gpa: number | null;
          scholarship_type: 'tuition' | 'living_allowance' | 'books' | 'transportation' | 'full';
          amount: number;
          currency: string;
          academic_year: string;
          semester: string | null;
          status: 'applied' | 'approved' | 'active' | 'suspended' | 'completed' | 'cancelled';
          application_date: string;
          approval_date: string | null;
          start_date: string | null;
          end_date: string | null;
          parent_name: string | null;
          parent_phone: string | null;
          family_income: number | null;
          supporting_documents: string[] | null;
          academic_documents: string[] | null;
          payment_schedule: Json | null;
          requirements: string[] | null;
          notes: string | null;
          created_by: string;
          updated_by: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          student_name: string;
          student_id_number: string;
          student_phone?: string | null;
          student_email?: string | null;
          school_name: string;
          grade_level: string;
          field_of_study?: string | null;
          gpa?: number | null;
          scholarship_type: 'tuition' | 'living_allowance' | 'books' | 'transportation' | 'full';
          amount: number;
          currency?: string;
          academic_year: string;
          semester?: string | null;
          status?: 'applied' | 'approved' | 'active' | 'suspended' | 'completed' | 'cancelled';
          application_date: string;
          approval_date?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          parent_name?: string | null;
          parent_phone?: string | null;
          family_income?: number | null;
          supporting_documents?: string[] | null;
          academic_documents?: string[] | null;
          payment_schedule?: Json | null;
          requirements?: string[] | null;
          notes?: string | null;
          created_by: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          student_name?: string;
          student_id_number?: string;
          student_phone?: string | null;
          student_email?: string | null;
          school_name?: string;
          grade_level?: string;
          field_of_study?: string | null;
          gpa?: number | null;
          scholarship_type?: 'tuition' | 'living_allowance' | 'books' | 'transportation' | 'full';
          amount?: number;
          currency?: string;
          academic_year?: string;
          semester?: string | null;
          status?: 'applied' | 'approved' | 'active' | 'suspended' | 'completed' | 'cancelled';
          application_date?: string;
          approval_date?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          parent_name?: string | null;
          parent_phone?: string | null;
          family_income?: number | null;
          supporting_documents?: string[] | null;
          academic_documents?: string[] | null;
          payment_schedule?: Json | null;
          requirements?: string[] | null;
          notes?: string | null;
          created_by?: string;
          updated_by?: string | null;
          deleted_at?: string | null;
        };
      };
      system_settings: {
        Row: {
          id: number;
          created_at: string;
          updated_at: string;
          general: Json;
          notifications: Json;
          security: Json;
          database: Json;
          updated_by: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          general?: Json;
          notifications?: Json;
          security?: Json;
          database?: Json;
          updated_by?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          updated_at?: string;
          general?: Json;
          notifications?: Json;
          security?: Json;
          database?: Json;
          updated_by?: string | null;
        };
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      membership_type: 'standard' | 'premium' | 'corporate' | 'student' | 'senior';
      member_status: 'active' | 'inactive' | 'suspended';
      donation_type: 'one_time' | 'monthly' | 'yearly';
      donation_category: 'general' | 'education' | 'health' | 'emergency' | 'other';
      payment_method: 'cash' | 'bank_transfer' | 'credit_card' | 'online';
      donation_status: 'pending' | 'completed' | 'cancelled' | 'refunded';
      aid_type: 'financial' | 'medical' | 'education' | 'housing' | 'food' | 'other';
      urgency_level: 'low' | 'medium' | 'high' | 'critical';
      aid_status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
      notification_type: 'info' | 'success' | 'warning' | 'error';
      notification_category: 'member' | 'donation' | 'aid' | 'campaign' | 'system';
      beneficiary_status: 'active' | 'passive' | 'suspended' | 'under_evaluation';
      priority_level: 'low' | 'medium' | 'high' | 'critical';
      transaction_type: 'income' | 'expense';
      transaction_status: 'pending' | 'completed' | 'cancelled';
      partner_type: 'donor' | 'institution' | 'supplier' | 'sponsor' | 'association' | 'volunteer';
      partner_status: 'active' | 'inactive' | 'suspended';
      case_type: 'consultation' | 'representation' | 'mediation' | 'legal_aid';
      case_status: 'open' | 'in_progress' | 'closed' | 'suspended';
      case_priority: 'low' | 'medium' | 'high' | 'urgent';
      scholarship_type: 'tuition' | 'living_allowance' | 'books' | 'transportation' | 'full';
      scholarship_status:
        | 'applied'
        | 'approved'
        | 'active'
        | 'suspended'
        | 'completed'
        | 'cancelled';
    };
    CompositeTypes: Record<never, never>;
  };
}

// Type helpers
export type Member = Database['public']['Tables']['members']['Row'];
export type MemberInsert = Database['public']['Tables']['members']['Insert'];
export type MemberUpdate = Database['public']['Tables']['members']['Update'];

export type Donation = Database['public']['Tables']['donations']['Row'];
export type DonationInsert = Database['public']['Tables']['donations']['Insert'];
export type DonationUpdate = Database['public']['Tables']['donations']['Update'];

export type AidRequest = Database['public']['Tables']['aid_requests']['Row'];
export type AidRequestInsert = Database['public']['Tables']['aid_requests']['Insert'];
export type AidRequestUpdate = Database['public']['Tables']['aid_requests']['Update'];

export type Campaign = Database['public']['Tables']['campaigns']['Row'];
export type CampaignInsert = Database['public']['Tables']['campaigns']['Insert'];
export type CampaignUpdate = Database['public']['Tables']['campaigns']['Update'];

// Note: Notifications table is defined in schema but may not exist in database yet
// Run /supabase/migrations/001_create_notifications_table.sql to create the table
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update'];

export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

export type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];
export type BeneficiaryInsert = Database['public']['Tables']['beneficiaries']['Insert'];
export type BeneficiaryUpdate = Database['public']['Tables']['beneficiaries']['Update'];

export type FinanceTransaction = Database['public']['Tables']['finance_transactions']['Row'];
export type FinanceTransactionInsert =
  Database['public']['Tables']['finance_transactions']['Insert'];
export type FinanceTransactionUpdate =
  Database['public']['Tables']['finance_transactions']['Update'];

export type Partner = Database['public']['Tables']['partners']['Row'];
export type PartnerInsert = Database['public']['Tables']['partners']['Insert'];
export type PartnerUpdate = Database['public']['Tables']['partners']['Update'];

export type LegalCase = Database['public']['Tables']['legal_cases']['Row'];
export type LegalCaseInsert = Database['public']['Tables']['legal_cases']['Insert'];
export type LegalCaseUpdate = Database['public']['Tables']['legal_cases']['Update'];

export type Scholarship = Database['public']['Tables']['scholarships']['Row'];
export type ScholarshipInsert = Database['public']['Tables']['scholarships']['Insert'];
export type ScholarshipUpdate = Database['public']['Tables']['scholarships']['Update'];

export type SystemSettingsRow = Database['public']['Tables']['system_settings']['Row'];
export type SystemSettingsInsert = Database['public']['Tables']['system_settings']['Insert'];
export type SystemSettingsUpdate = Database['public']['Tables']['system_settings']['Update'];

// Extended types with relations
export interface MemberWithDonations extends Member {
  donations: Donation[];
  totalDonations: number;
  lastDonation?: Donation;
}

export interface DonationWithMember extends Donation {
  member?: Member;
  campaign?: Campaign;
}

export interface AidRequestWithAssignee extends AidRequest {
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CampaignWithStats extends Campaign {
  donationCount: number;
  progressPercentage: number;
  daysRemaining?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Realtime subscription types
export interface RealtimeMessage<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new?: T;
  old?: T;
  table: string;
  schema: string;
  commit_timestamp: string;
}

export interface SubscriptionConfig {
  table: string;
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
  filter?: string;
}
