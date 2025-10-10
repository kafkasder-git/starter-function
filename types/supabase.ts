export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      aid_applications: {
        Row: {
          amount: number | null;
          application_date: string | null;
          approval_date: string | null;
          approved_amount: number | null;
          approved_by: string | null;
          beneficiary_id: number;
          category: string | null;
          completion_date: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string;
          documents: Json | null;
          evaluation_notes: string | null;
          id: number;
          rejection_reason: string | null;
          requested_amount: number | null;
          updated_at: string | null;
          updated_by: string | null;
          urgency_level: number | null;
        };
        Insert: {
          amount?: number | null;
          application_date?: string | null;
          approval_date?: string | null;
          approved_amount?: number | null;
          approved_by?: string | null;
          beneficiary_id: number;
          category?: string | null;
          completion_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description: string;
          documents?: Json | null;
          evaluation_notes?: string | null;
          id?: number;
          rejection_reason?: string | null;
          requested_amount?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
          urgency_level?: number | null;
        };
        Update: {
          amount?: number | null;
          application_date?: string | null;
          approval_date?: string | null;
          approved_amount?: number | null;
          approved_by?: string | null;
          beneficiary_id?: number;
          category?: string | null;
          completion_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string;
          documents?: Json | null;
          evaluation_notes?: string | null;
          id?: number;
          rejection_reason?: string | null;
          requested_amount?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
          urgency_level?: number | null;
        };
        Relationships: [];
      };
      aid_history: {
        Row: {
          aid_type: Database['public']['Enums']['aid_type'];
          amount: number | null;
          application_id: string | null;
          beneficiary_id: string;
          created_at: string | null;
          delivery_date: string;
          delivery_method: string | null;
          document_number: string | null;
          id: string;
          notes: string | null;
          quantity: number | null;
          responsible_person: string | null;
        };
        Insert: {
          aid_type: Database['public']['Enums']['aid_type'];
          amount?: number | null;
          application_id?: string | null;
          beneficiary_id: string;
          created_at?: string | null;
          delivery_date: string;
          delivery_method?: string | null;
          document_number?: string | null;
          id?: string;
          notes?: string | null;
          quantity?: number | null;
          responsible_person?: string | null;
        };
        Update: {
          aid_type?: Database['public']['Enums']['aid_type'];
          amount?: number | null;
          application_id?: string | null;
          beneficiary_id?: string;
          created_at?: string | null;
          delivery_date?: string;
          delivery_method?: string | null;
          document_number?: string | null;
          id?: string;
          notes?: string | null;
          quantity?: number | null;
          responsible_person?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'aid_history_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'new_aid_applications';
            referencedColumns: ['id'];
          },
        ];
      };
      aid_requests: {
        Row: {
          amount: number | null;
          assigned_to: string | null;
          beneficiary_id: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          priority: Database['public']['Enums']['aid_request_priority'] | null;
          request_type: string;
          status: Database['public']['Enums']['aid_request_status'] | null;
          updated_at: string | null;
        };
        Insert: {
          amount?: number | null;
          assigned_to?: string | null;
          beneficiary_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          priority?: Database['public']['Enums']['aid_request_priority'] | null;
          request_type: string;
          status?: Database['public']['Enums']['aid_request_status'] | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number | null;
          assigned_to?: string | null;
          beneficiary_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          priority?: Database['public']['Enums']['aid_request_priority'] | null;
          request_type?: string;
          status?: Database['public']['Enums']['aid_request_status'] | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      application_status_history: {
        Row: {
          application_id: string;
          change_reason: string | null;
          changed_by: string;
          created_at: string | null;
          id: string;
          new_status: Database['public']['Enums']['application_status'];
          notes: string | null;
          previous_status: Database['public']['Enums']['application_status'] | null;
        };
        Insert: {
          application_id: string;
          change_reason?: string | null;
          changed_by: string;
          created_at?: string | null;
          id?: string;
          new_status: Database['public']['Enums']['application_status'];
          notes?: string | null;
          previous_status?: Database['public']['Enums']['application_status'] | null;
        };
        Update: {
          application_id?: string;
          change_reason?: string | null;
          changed_by?: string;
          created_at?: string | null;
          id?: string;
          new_status?: Database['public']['Enums']['application_status'];
          notes?: string | null;
          previous_status?: Database['public']['Enums']['application_status'] | null;
        };
        Relationships: [
          {
            foreignKeyName: 'application_status_history_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'new_aid_applications';
            referencedColumns: ['id'];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          created_at: string | null;
          id: string;
          ip_address: unknown | null;
          new_values: Json | null;
          old_values: Json | null;
          record_id: string | null;
          table_name: string;
          user_agent: string | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_values?: Json | null;
          old_values?: Json | null;
          record_id?: string | null;
          table_name: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          id?: string;
          ip_address?: unknown | null;
          new_values?: Json | null;
          old_values?: Json | null;
          record_id?: string | null;
          table_name?: string;
          user_agent?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      bank_payment_orders: {
        Row: {
          amount: number;
          approval_date: string | null;
          approved_by: string | null;
          beneficiary_account: string;
          beneficiary_name: string;
          created_at: string | null;
          created_by: string | null;
          currency: string | null;
          description: string | null;
          id: string;
          order_number: string;
          payment_date: string;
          payment_method: string | null;
          processed_by: string | null;
          processed_date: string | null;
          reference_number: string | null;
          rejection_reason: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          approval_date?: string | null;
          approved_by?: string | null;
          beneficiary_account: string;
          beneficiary_name: string;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          order_number: string;
          payment_date: string;
          payment_method?: string | null;
          processed_by?: string | null;
          processed_date?: string | null;
          reference_number?: string | null;
          rejection_reason?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          approval_date?: string | null;
          approved_by?: string | null;
          beneficiary_account?: string;
          beneficiary_name?: string;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          order_number?: string;
          payment_date?: string;
          payment_method?: string | null;
          processed_by?: string | null;
          processed_date?: string | null;
          reference_number?: string | null;
          rejection_reason?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      bulk_messages: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          delivery_report: Json | null;
          failed_count: number | null;
          id: string;
          message: string;
          message_type: string;
          scheduled_at: string | null;
          sent_at: string | null;
          sent_count: number | null;
          status: string;
          target_criteria: Json | null;
          target_group: string;
          title: string;
          total_recipients: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          delivery_report?: Json | null;
          failed_count?: number | null;
          id?: string;
          message: string;
          message_type: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          sent_count?: number | null;
          status?: string;
          target_criteria?: Json | null;
          target_group: string;
          title: string;
          total_recipients?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          delivery_report?: Json | null;
          failed_count?: number | null;
          id?: string;
          message?: string;
          message_type?: string;
          scheduled_at?: string | null;
          sent_at?: string | null;
          sent_count?: number | null;
          status?: string;
          target_criteria?: Json | null;
          target_group?: string;
          title?: string;
          total_recipients?: number | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      campaigns: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          current_amount: number | null;
          description: string | null;
          end_date: string | null;
          id: string;
          start_date: string | null;
          status: Database['public']['Enums']['campaign_status'] | null;
          target_amount: number | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          current_amount?: number | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          start_date?: string | null;
          status?: Database['public']['Enums']['campaign_status'] | null;
          target_amount?: number | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          current_amount?: number | null;
          description?: string | null;
          end_date?: string | null;
          id?: string;
          start_date?: string | null;
          status?: Database['public']['Enums']['campaign_status'] | null;
          target_amount?: number | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      cash_aid_vault: {
        Row: {
          amount: number;
          balance_after: number | null;
          beneficiary_id: string | null;
          created_at: string | null;
          created_by: string | null;
          currency: string | null;
          description: string | null;
          id: string;
          payment_order_id: string | null;
          reference_document: string | null;
          transaction_date: string | null;
          transaction_type: string;
        };
        Insert: {
          amount: number;
          balance_after?: number | null;
          beneficiary_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          payment_order_id?: string | null;
          reference_document?: string | null;
          transaction_date?: string | null;
          transaction_type: string;
        };
        Update: {
          amount?: number;
          balance_after?: number | null;
          beneficiary_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          payment_order_id?: string | null;
          reference_document?: string | null;
          transaction_date?: string | null;
          transaction_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cash_aid_vault_payment_order_id_fkey';
            columns: ['payment_order_id'];
            isOneToOne: false;
            referencedRelation: 'bank_payment_orders';
            referencedColumns: ['id'];
          },
        ];
      };
      consent_records: {
        Row: {
          beneficiary_id: string;
          consent_date: string | null;
          consent_text: string;
          created_at: string | null;
          id: string;
          is_consented: boolean;
          signature_data: string | null;
          updated_at: string | null;
          witness_employee_id: string | null;
        };
        Insert: {
          beneficiary_id: string;
          consent_date?: string | null;
          consent_text: string;
          created_at?: string | null;
          id?: string;
          is_consented?: boolean;
          signature_data?: string | null;
          updated_at?: string | null;
          witness_employee_id?: string | null;
        };
        Update: {
          beneficiary_id?: string;
          consent_date?: string | null;
          consent_text?: string;
          created_at?: string | null;
          id?: string;
          is_consented?: boolean;
          signature_data?: string | null;
          updated_at?: string | null;
          witness_employee_id?: string | null;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          application_id: string | null;
          beneficiary_id: string;
          category: Database['public']['Enums']['document_category'];
          created_at: string | null;
          description: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          id: string;
          mime_type: string;
          original_name: string;
          tags: string[] | null;
          uploaded_by: string;
        };
        Insert: {
          application_id?: string | null;
          beneficiary_id: string;
          category: Database['public']['Enums']['document_category'];
          created_at?: string | null;
          description?: string | null;
          file_name: string;
          file_path: string;
          file_size: number;
          id?: string;
          mime_type: string;
          original_name: string;
          tags?: string[] | null;
          uploaded_by: string;
        };
        Update: {
          application_id?: string | null;
          beneficiary_id?: string;
          category?: Database['public']['Enums']['document_category'];
          created_at?: string | null;
          description?: string | null;
          file_name?: string;
          file_path?: string;
          file_size?: number;
          id?: string;
          mime_type?: string;
          original_name?: string;
          tags?: string[] | null;
          uploaded_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'documents_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: false;
            referencedRelation: 'new_aid_applications';
            referencedColumns: ['id'];
          },
        ];
      };
      donations: {
        Row: {
          allocated_to: string | null;
          allocation_percentage: number | null;
          amount: number;
          approval_date: string | null;
          bank_account: string | null;
          beneficiary_id: string | null;
          campaign_id: string | null;
          category: string | null;
          communication_preference: string | null;
          created_at: string | null;
          created_by: string | null;
          currency: string | null;
          description: string | null;
          donation_type: string;
          donor_email: string | null;
          donor_name: string;
          donor_phone: string | null;
          donor_type: string | null;
          id: string;
          ip_address: string | null;
          is_recurring: boolean | null;
          notes: string | null;
          payment_method: string | null;
          payment_reference: string | null;
          processed_by: string | null;
          receipt_date: string | null;
          receipt_issued: boolean | null;
          receipt_number: string | null;
          recurring_amount: number | null;
          recurring_end_date: string | null;
          recurring_frequency: string | null;
          referral_code: string | null;
          rejection_reason: string | null;
          source: string | null;
          status: Database['public']['Enums']['donation_status'] | null;
          tax_certificate_number: string | null;
          tax_deductible: boolean | null;
          thank_you_date: string | null;
          thank_you_sent: boolean | null;
          transaction_id: string | null;
          updated_at: string | null;
          updated_by: string | null;
          user_agent: string | null;
        };
        Insert: {
          allocated_to?: string | null;
          allocation_percentage?: number | null;
          amount: number;
          approval_date?: string | null;
          bank_account?: string | null;
          beneficiary_id?: string | null;
          campaign_id?: string | null;
          category?: string | null;
          communication_preference?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          description?: string | null;
          donation_type: string;
          donor_email?: string | null;
          donor_name: string;
          donor_phone?: string | null;
          donor_type?: string | null;
          id?: string;
          ip_address?: string | null;
          is_recurring?: boolean | null;
          notes?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          processed_by?: string | null;
          receipt_date?: string | null;
          receipt_issued?: boolean | null;
          receipt_number?: string | null;
          recurring_amount?: number | null;
          recurring_end_date?: string | null;
          recurring_frequency?: string | null;
          referral_code?: string | null;
          rejection_reason?: string | null;
          source?: string | null;
          status?: Database['public']['Enums']['donation_status'] | null;
          tax_certificate_number?: string | null;
          tax_deductible?: boolean | null;
          thank_you_date?: string | null;
          thank_you_sent?: boolean | null;
          transaction_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_agent?: string | null;
        };
        Update: {
          allocated_to?: string | null;
          allocation_percentage?: number | null;
          amount?: number;
          approval_date?: string | null;
          bank_account?: string | null;
          beneficiary_id?: string | null;
          campaign_id?: string | null;
          category?: string | null;
          communication_preference?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          description?: string | null;
          donation_type?: string;
          donor_email?: string | null;
          donor_name?: string;
          donor_phone?: string | null;
          donor_type?: string | null;
          id?: string;
          ip_address?: string | null;
          is_recurring?: boolean | null;
          notes?: string | null;
          payment_method?: string | null;
          payment_reference?: string | null;
          processed_by?: string | null;
          receipt_date?: string | null;
          receipt_issued?: boolean | null;
          receipt_number?: string | null;
          recurring_amount?: number | null;
          recurring_end_date?: string | null;
          recurring_frequency?: string | null;
          referral_code?: string | null;
          rejection_reason?: string | null;
          source?: string | null;
          status?: Database['public']['Enums']['donation_status'] | null;
          tax_certificate_number?: string | null;
          tax_deductible?: boolean | null;
          thank_you_date?: string | null;
          thank_you_sent?: boolean | null;
          transaction_id?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          user_agent?: string | null;
        };
        Relationships: [];
      };
      employees: {
        Row: {
          created_at: string | null;
          email: string;
          full_name: string;
          id: string;
          is_active: boolean | null;
          role: Database['public']['Enums']['user_role'];
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          email: string;
          full_name: string;
          id?: string;
          is_active?: boolean | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          email?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean | null;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      event_attendees: {
        Row: {
          attendance_notes: string | null;
          attendee_email: string | null;
          attendee_name: string;
          attendee_phone: string | null;
          created_at: string | null;
          created_by: string | null;
          event_id: string | null;
          id: string;
          registration_date: string | null;
          status: string;
        };
        Insert: {
          attendance_notes?: string | null;
          attendee_email?: string | null;
          attendee_name: string;
          attendee_phone?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          event_id?: string | null;
          id?: string;
          registration_date?: string | null;
          status?: string;
        };
        Update: {
          attendance_notes?: string | null;
          attendee_email?: string | null;
          attendee_name?: string;
          attendee_phone?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          event_id?: string | null;
          id?: string;
          registration_date?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'event_attendees_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      events: {
        Row: {
          contact_email: string | null;
          contact_person: string | null;
          contact_phone: string | null;
          cost: number | null;
          created_at: string | null;
          created_by: string | null;
          current_attendees: number | null;
          description: string | null;
          event_date: string;
          event_time: string | null;
          event_type: string;
          id: string;
          location: string | null;
          max_attendees: number | null;
          notes: string | null;
          organizer: string | null;
          registration_deadline: string | null;
          registration_required: boolean | null;
          requirements: string | null;
          status: string;
          title: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          contact_email?: string | null;
          contact_person?: string | null;
          contact_phone?: string | null;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          current_attendees?: number | null;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          event_type: string;
          id?: string;
          location?: string | null;
          max_attendees?: number | null;
          notes?: string | null;
          organizer?: string | null;
          registration_deadline?: string | null;
          registration_required?: boolean | null;
          requirements?: string | null;
          status?: string;
          title: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          contact_email?: string | null;
          contact_person?: string | null;
          contact_phone?: string | null;
          cost?: number | null;
          created_at?: string | null;
          created_by?: string | null;
          current_attendees?: number | null;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          event_type?: string;
          id?: string;
          location?: string | null;
          max_attendees?: number | null;
          notes?: string | null;
          organizer?: string | null;
          registration_deadline?: string | null;
          registration_required?: boolean | null;
          requirements?: string | null;
          status?: string;
          title?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      family_relationships: {
        Row: {
          created_at: string | null;
          family_member_id: string;
          id: string;
          is_dependent: boolean | null;
          primary_beneficiary_id: string;
          relationship_type: Database['public']['Enums']['relationship_type'];
        };
        Insert: {
          created_at?: string | null;
          family_member_id: string;
          id?: string;
          is_dependent?: boolean | null;
          primary_beneficiary_id: string;
          relationship_type: Database['public']['Enums']['relationship_type'];
        };
        Update: {
          created_at?: string | null;
          family_member_id?: string;
          id?: string;
          is_dependent?: boolean | null;
          primary_beneficiary_id?: string;
          relationship_type?: Database['public']['Enums']['relationship_type'];
        };
        Relationships: [];
      };
      finance_transactions: {
        Row: {
          account_from: string | null;
          account_to: string | null;
          amount: number;
          approval_status: string | null;
          approved_at: string | null;
          approved_by: string | null;
          beneficiary_id: string | null;
          campaign_id: string | null;
          category: string | null;
          created_at: string | null;
          created_by: string | null;
          currency: string | null;
          description: string;
          id: number;
          notes: string | null;
          reference_document: string | null;
          reference_number: string | null;
          status: string | null;
          transaction_date: string | null;
          transaction_type: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          account_from?: string | null;
          account_to?: string | null;
          amount: number;
          approval_status?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          beneficiary_id?: string | null;
          campaign_id?: string | null;
          category?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          description: string;
          id?: number;
          notes?: string | null;
          reference_document?: string | null;
          reference_number?: string | null;
          status?: string | null;
          transaction_date?: string | null;
          transaction_type: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          account_from?: string | null;
          account_to?: string | null;
          amount?: number;
          approval_status?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          beneficiary_id?: string | null;
          campaign_id?: string | null;
          category?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          currency?: string | null;
          description?: string;
          id?: number;
          notes?: string | null;
          reference_document?: string | null;
          reference_number?: string | null;
          status?: string | null;
          transaction_date?: string | null;
          transaction_type?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'finance_transactions_campaign_id_fkey';
            columns: ['campaign_id'];
            isOneToOne: false;
            referencedRelation: 'campaigns';
            referencedColumns: ['id'];
          },
        ];
      };
      ihtiyac_sahipleri: {
        Row: {
          acil_iletisim_1_ad: string | null;
          acil_iletisim_1_telefon: string | null;
          acil_iletisim_1_yakinlik: string | null;
          acil_iletisim_2_ad: string | null;
          acil_iletisim_2_telefon: string | null;
          acil_iletisim_2_yakinlik: string | null;
          ad_soyad: string;
          adres: string | null;
          Adres: string | null;
          aile_kisi_sayisi: number | null;
          anne_adi: string | null;
          aylik_gelir: number | null;
          aylik_gider: number | null;
          baba_adi: string | null;
          bakmakla_yukumlu_kisi: string | null;
          cinsiyet: string | null;
          created_at: string | null;
          csv_id: string | null;
          din: string | null;
          dogum_tarihi: string | null;
          dogum_yeri: string | null;
          egitim_durumu: string | null;
          email: string | null;
          es_bilgisi: string | null;
          iban: string | null;
          id: number;
          ID: string | null;
          is_durumu: string | null;
          kan_grubu: string | null;
          kategori: string | null;
          Kategori: string | null;
          kayit_tarihi: string | null;
          Kayit_Tarihi: string | null;
          kimlik_no: string | null;
          Kimlik_No: string | null;
          mahalle: string | null;
          Mahalle: string | null;
          medeni_hal: string | null;
          meslek: string | null;
          sehri: string | null;
          telefon_no: string | null;
          Telefon_No: string | null;
          tur: string | null;
          Tur: string | null;
          ulkesi: string | null;
          updated_at: string | null;
          uyruk: string | null;
          Uyruk: string | null;
          yerlesimi: string | null;
          Yerlesimi: string | null;
        };
        Insert: {
          acil_iletisim_1_ad?: string | null;
          acil_iletisim_1_telefon?: string | null;
          acil_iletisim_1_yakinlik?: string | null;
          acil_iletisim_2_ad?: string | null;
          acil_iletisim_2_telefon?: string | null;
          acil_iletisim_2_yakinlik?: string | null;
          ad_soyad: string;
          adres?: string | null;
          Adres?: string | null;
          aile_kisi_sayisi?: number | null;
          anne_adi?: string | null;
          aylik_gelir?: number | null;
          aylik_gider?: number | null;
          baba_adi?: string | null;
          bakmakla_yukumlu_kisi?: string | null;
          cinsiyet?: string | null;
          created_at?: string | null;
          csv_id?: string | null;
          din?: string | null;
          dogum_tarihi?: string | null;
          dogum_yeri?: string | null;
          egitim_durumu?: string | null;
          email?: string | null;
          es_bilgisi?: string | null;
          iban?: string | null;
          id?: number;
          ID?: string | null;
          is_durumu?: string | null;
          kan_grubu?: string | null;
          kategori?: string | null;
          Kategori?: string | null;
          kayit_tarihi?: string | null;
          Kayit_Tarihi?: string | null;
          kimlik_no?: string | null;
          Kimlik_No?: string | null;
          mahalle?: string | null;
          Mahalle?: string | null;
          medeni_hal?: string | null;
          meslek?: string | null;
          sehri?: string | null;
          telefon_no?: string | null;
          Telefon_No?: string | null;
          tur?: string | null;
          Tur?: string | null;
          ulkesi?: string | null;
          updated_at?: string | null;
          uyruk?: string | null;
          Uyruk?: string | null;
          yerlesimi?: string | null;
          Yerlesimi?: string | null;
        };
        Update: {
          acil_iletisim_1_ad?: string | null;
          acil_iletisim_1_telefon?: string | null;
          acil_iletisim_1_yakinlik?: string | null;
          acil_iletisim_2_ad?: string | null;
          acil_iletisim_2_telefon?: string | null;
          acil_iletisim_2_yakinlik?: string | null;
          ad_soyad?: string;
          adres?: string | null;
          Adres?: string | null;
          aile_kisi_sayisi?: number | null;
          anne_adi?: string | null;
          aylik_gelir?: number | null;
          aylik_gider?: number | null;
          baba_adi?: string | null;
          bakmakla_yukumlu_kisi?: string | null;
          cinsiyet?: string | null;
          created_at?: string | null;
          csv_id?: string | null;
          din?: string | null;
          dogum_tarihi?: string | null;
          dogum_yeri?: string | null;
          egitim_durumu?: string | null;
          email?: string | null;
          es_bilgisi?: string | null;
          iban?: string | null;
          id?: number;
          ID?: string | null;
          is_durumu?: string | null;
          kan_grubu?: string | null;
          kategori?: string | null;
          Kategori?: string | null;
          kayit_tarihi?: string | null;
          Kayit_Tarihi?: string | null;
          kimlik_no?: string | null;
          Kimlik_No?: string | null;
          mahalle?: string | null;
          Mahalle?: string | null;
          medeni_hal?: string | null;
          meslek?: string | null;
          sehri?: string | null;
          telefon_no?: string | null;
          Telefon_No?: string | null;
          tur?: string | null;
          Tur?: string | null;
          ulkesi?: string | null;
          updated_at?: string | null;
          uyruk?: string | null;
          Uyruk?: string | null;
          yerlesimi?: string | null;
          Yerlesimi?: string | null;
        };
        Relationships: [];
      };
      ihtiyac_sahipleri_backup: {
        Row: {
          ad_soyad: string;
          adres: string | null;
          Adres: string | null;
          created_at: string | null;
          csv_id: string | null;
          iban: string | null;
          id: number;
          ID: string | null;
          kategori: string | null;
          Kategori: string | null;
          kayit_tarihi: string | null;
          Kayit_Tarihi: string | null;
          kimlik_no: string | null;
          Kimlik_No: string | null;
          mahalle: string | null;
          Mahalle: string | null;
          sehri: string | null;
          telefon_no: string | null;
          Telefon_No: string | null;
          tur: string | null;
          Tur: string | null;
          ulkesi: string | null;
          updated_at: string | null;
          uyruk: string | null;
          Uyruk: string | null;
          yerlesimi: string | null;
          Yerlesimi: string | null;
        };
        Insert: {
          ad_soyad: string;
          adres?: string | null;
          Adres?: string | null;
          created_at?: string | null;
          csv_id?: string | null;
          iban?: string | null;
          id?: never;
          ID?: string | null;
          kategori?: string | null;
          Kategori?: string | null;
          kayit_tarihi?: string | null;
          Kayit_Tarihi?: string | null;
          kimlik_no?: string | null;
          Kimlik_No?: string | null;
          mahalle?: string | null;
          Mahalle?: string | null;
          sehri?: string | null;
          telefon_no?: string | null;
          Telefon_No?: string | null;
          tur?: string | null;
          Tur?: string | null;
          ulkesi?: string | null;
          updated_at?: string | null;
          uyruk?: string | null;
          Uyruk?: string | null;
          yerlesimi?: string | null;
          Yerlesimi?: string | null;
        };
        Update: {
          ad_soyad?: string;
          adres?: string | null;
          Adres?: string | null;
          created_at?: string | null;
          csv_id?: string | null;
          iban?: string | null;
          id?: never;
          ID?: string | null;
          kategori?: string | null;
          Kategori?: string | null;
          kayit_tarihi?: string | null;
          Kayit_Tarihi?: string | null;
          kimlik_no?: string | null;
          Kimlik_No?: string | null;
          mahalle?: string | null;
          Mahalle?: string | null;
          sehri?: string | null;
          telefon_no?: string | null;
          Telefon_No?: string | null;
          tur?: string | null;
          Tur?: string | null;
          ulkesi?: string | null;
          updated_at?: string | null;
          uyruk?: string | null;
          Uyruk?: string | null;
          yerlesimi?: string | null;
          Yerlesimi?: string | null;
        };
        Relationships: [];
      };
      internal_messages: {
        Row: {
          attachments: Json | null;
          created_at: string | null;
          id: string;
          message: string;
          message_type: string;
          priority: string;
          read_at: string | null;
          recipient_group: string | null;
          recipient_id: string | null;
          reply_to_id: string | null;
          sender_id: string;
          status: string;
          subject: string;
          updated_at: string | null;
        };
        Insert: {
          attachments?: Json | null;
          created_at?: string | null;
          id?: string;
          message: string;
          message_type?: string;
          priority?: string;
          read_at?: string | null;
          recipient_group?: string | null;
          recipient_id?: string | null;
          reply_to_id?: string | null;
          sender_id: string;
          status?: string;
          subject: string;
          updated_at?: string | null;
        };
        Update: {
          attachments?: Json | null;
          created_at?: string | null;
          id?: string;
          message?: string;
          message_type?: string;
          priority?: string;
          read_at?: string | null;
          recipient_group?: string | null;
          recipient_id?: string | null;
          reply_to_id?: string | null;
          sender_id?: string;
          status?: string;
          subject?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'internal_messages_reply_to_id_fkey';
            columns: ['reply_to_id'];
            isOneToOne: false;
            referencedRelation: 'internal_messages';
            referencedColumns: ['id'];
          },
        ];
      };
      inventory_items: {
        Row: {
          category: string;
          created_at: string | null;
          created_by: string | null;
          current_stock: number | null;
          description: string | null;
          expiry_date: string | null;
          id: string;
          item_code: string | null;
          item_name: string;
          max_stock_level: number | null;
          min_stock_level: number | null;
          status: string;
          storage_location: string | null;
          supplier: string | null;
          total_value: number | null;
          unit: string;
          unit_cost: number | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          created_by?: string | null;
          current_stock?: number | null;
          description?: string | null;
          expiry_date?: string | null;
          id?: string;
          item_code?: string | null;
          item_name: string;
          max_stock_level?: number | null;
          min_stock_level?: number | null;
          status?: string;
          storage_location?: string | null;
          supplier?: string | null;
          total_value?: number | null;
          unit: string;
          unit_cost?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          created_by?: string | null;
          current_stock?: number | null;
          description?: string | null;
          expiry_date?: string | null;
          id?: string;
          item_code?: string | null;
          item_name?: string;
          max_stock_level?: number | null;
          min_stock_level?: number | null;
          status?: string;
          storage_location?: string | null;
          supplier?: string | null;
          total_value?: number | null;
          unit?: string;
          unit_cost?: number | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      inventory_transactions: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          id: string;
          item_id: string | null;
          notes: string | null;
          quantity: number;
          reason: string | null;
          reference_id: string | null;
          reference_number: string | null;
          reference_type: string | null;
          total_cost: number | null;
          transaction_date: string | null;
          transaction_type: string;
          unit_cost: number | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          item_id?: string | null;
          notes?: string | null;
          quantity: number;
          reason?: string | null;
          reference_id?: string | null;
          reference_number?: string | null;
          reference_type?: string | null;
          total_cost?: number | null;
          transaction_date?: string | null;
          transaction_type: string;
          unit_cost?: number | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          item_id?: string | null;
          notes?: string | null;
          quantity?: number;
          reason?: string | null;
          reference_id?: string | null;
          reference_number?: string | null;
          reference_type?: string | null;
          total_cost?: number | null;
          transaction_date?: string | null;
          transaction_type?: string;
          unit_cost?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'inventory_transactions_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: false;
            referencedRelation: 'inventory_items';
            referencedColumns: ['id'];
          },
        ];
      };
      kv_store_4d8b8678: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
        Relationships: [];
      };
      kv_store_c0432982: {
        Row: {
          key: string;
          value: Json;
        };
        Insert: {
          key: string;
          value: Json;
        };
        Update: {
          key?: string;
          value?: Json;
        };
        Relationships: [];
      };
      lawyer_assignments: {
        Row: {
          assignment_date: string | null;
          consultation_id: string | null;
          created_at: string | null;
          created_by: string | null;
          id: string;
          lawyer_email: string | null;
          lawyer_name: string;
          lawyer_phone: string | null;
          notes: string | null;
          specialty: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          assignment_date?: string | null;
          consultation_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          lawyer_email?: string | null;
          lawyer_name: string;
          lawyer_phone?: string | null;
          notes?: string | null;
          specialty?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          assignment_date?: string | null;
          consultation_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          lawyer_email?: string | null;
          lawyer_name?: string;
          lawyer_phone?: string | null;
          notes?: string | null;
          specialty?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lawyer_assignments_consultation_id_fkey';
            columns: ['consultation_id'];
            isOneToOne: false;
            referencedRelation: 'legal_consultations';
            referencedColumns: ['id'];
          },
        ];
      };
      legal_cases: {
        Row: {
          actual_cost: number | null;
          beneficiary_id: number | null;
          case_number: string | null;
          case_status: string | null;
          case_type: string | null;
          court_name: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string;
          end_date: string | null;
          estimated_cost: number | null;
          id: number;
          lawyer_name: string | null;
          next_hearing_date: string | null;
          notes: string | null;
          start_date: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          actual_cost?: number | null;
          beneficiary_id?: number | null;
          case_number?: string | null;
          case_status?: string | null;
          case_type?: string | null;
          court_name?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description: string;
          end_date?: string | null;
          estimated_cost?: number | null;
          id?: number;
          lawyer_name?: string | null;
          next_hearing_date?: string | null;
          notes?: string | null;
          start_date?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          actual_cost?: number | null;
          beneficiary_id?: number | null;
          case_number?: string | null;
          case_status?: string | null;
          case_type?: string | null;
          court_name?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string;
          end_date?: string | null;
          estimated_cost?: number | null;
          id?: number;
          lawyer_name?: string | null;
          next_hearing_date?: string | null;
          notes?: string | null;
          start_date?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      legal_consultations: {
        Row: {
          assigned_lawyer: string | null;
          category: string;
          client_email: string | null;
          client_name: string;
          client_phone: string;
          consultation_date: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string;
          expected_date: string | null;
          id: string;
          lawyer_phone: string | null;
          notes: string | null;
          rating: number | null;
          status: string;
          subject: string;
          updated_at: string | null;
          updated_by: string | null;
          urgency: string;
        };
        Insert: {
          assigned_lawyer?: string | null;
          category: string;
          client_email?: string | null;
          client_name: string;
          client_phone: string;
          consultation_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description: string;
          expected_date?: string | null;
          id?: string;
          lawyer_phone?: string | null;
          notes?: string | null;
          rating?: number | null;
          status?: string;
          subject: string;
          updated_at?: string | null;
          updated_by?: string | null;
          urgency?: string;
        };
        Update: {
          assigned_lawyer?: string | null;
          category?: string;
          client_email?: string | null;
          client_name?: string;
          client_phone?: string;
          consultation_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string;
          expected_date?: string | null;
          id?: string;
          lawyer_phone?: string | null;
          notes?: string | null;
          rating?: number | null;
          status?: string;
          subject?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          urgency?: string;
        };
        Relationships: [];
      };
      legal_documents: {
        Row: {
          consultation_id: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          document_name: string;
          document_type: string;
          file_path: string;
          file_size: number | null;
          id: string;
          mime_type: string | null;
        };
        Insert: {
          consultation_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          document_name: string;
          document_type: string;
          file_path: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
        };
        Update: {
          consultation_id?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          document_name?: string;
          document_type?: string;
          file_path?: string;
          file_size?: number | null;
          id?: string;
          mime_type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'legal_documents_consultation_id_fkey';
            columns: ['consultation_id'];
            isOneToOne: false;
            referencedRelation: 'legal_consultations';
            referencedColumns: ['id'];
          },
        ];
      };
      meetings: {
        Row: {
          agenda: string | null;
          created_at: string | null;
          created_by: string | null;
          decisions: string | null;
          event_id: string | null;
          id: string;
          location_details: string | null;
          meeting_duration: number | null;
          meeting_type: string;
          minutes: string | null;
          next_meeting_date: string | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          agenda?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          decisions?: string | null;
          event_id?: string | null;
          id?: string;
          location_details?: string | null;
          meeting_duration?: number | null;
          meeting_type: string;
          minutes?: string | null;
          next_meeting_date?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          agenda?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          decisions?: string | null;
          event_id?: string | null;
          id?: string;
          location_details?: string | null;
          meeting_duration?: number | null;
          meeting_type?: string;
          minutes?: string | null;
          next_meeting_date?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'meetings_event_id_fkey';
            columns: ['event_id'];
            isOneToOne: false;
            referencedRelation: 'events';
            referencedColumns: ['id'];
          },
        ];
      };
      members: {
        Row: {
          accessibility_needs: string | null;
          address: string | null;
          annual_fee: number | null;
          avatar_url: string | null;
          birth_date: string | null;
          certifications: Json | null;
          city: string | null;
          committee_memberships: Json | null;
          contribution_amount: number | null;
          country: string | null;
          created_at: string | null;
          created_by: string | null;
          dietary_restrictions: string | null;
          district: string | null;
          education_level: string | null;
          email: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relation: string | null;
          employer: string | null;
          event_attendance_count: number | null;
          event_notifications: boolean | null;
          experience_years: number | null;
          expiry_date: string | null;
          fee_paid: boolean | null;
          gender: string | null;
          id: string;
          ip_address: string | null;
          join_date: string | null;
          languages: Json | null;
          last_activity_date: string | null;
          last_payment_date: string | null;
          leadership_positions: Json | null;
          marital_status: string | null;
          marketing_consent: boolean | null;
          membership_number: string | null;
          membership_status: string | null;
          membership_type: string | null;
          name: string;
          newsletter_subscription: boolean | null;
          notes: string | null;
          occupation: string | null;
          payment_method: string | null;
          phone: string | null;
          postal_code: string | null;
          preferred_contact_method: string | null;
          profession: string | null;
          referral_code: string | null;
          skills_and_expertise: Json | null;
          source: string | null;
          special_requirements: string | null;
          specialization: string | null;
          status: Database['public']['Enums']['member_status'] | null;
          surname: string;
          updated_at: string | null;
          updated_by: string | null;
          user_agent: string | null;
          volunteer_hours: number | null;
          volunteer_interests: Json | null;
        };
        Insert: {
          accessibility_needs?: string | null;
          address?: string | null;
          annual_fee?: number | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          certifications?: Json | null;
          city?: string | null;
          committee_memberships?: Json | null;
          contribution_amount?: number | null;
          country?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          dietary_restrictions?: string | null;
          district?: string | null;
          education_level?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          employer?: string | null;
          event_attendance_count?: number | null;
          event_notifications?: boolean | null;
          experience_years?: number | null;
          expiry_date?: string | null;
          fee_paid?: boolean | null;
          gender?: string | null;
          id?: string;
          ip_address?: string | null;
          join_date?: string | null;
          languages?: Json | null;
          last_activity_date?: string | null;
          last_payment_date?: string | null;
          leadership_positions?: Json | null;
          marital_status?: string | null;
          marketing_consent?: boolean | null;
          membership_number?: string | null;
          membership_status?: string | null;
          membership_type?: string | null;
          name: string;
          newsletter_subscription?: boolean | null;
          notes?: string | null;
          occupation?: string | null;
          payment_method?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          preferred_contact_method?: string | null;
          profession?: string | null;
          referral_code?: string | null;
          skills_and_expertise?: Json | null;
          source?: string | null;
          special_requirements?: string | null;
          specialization?: string | null;
          status?: Database['public']['Enums']['member_status'] | null;
          surname: string;
          updated_at?: string | null;
          updated_by?: string | null;
          user_agent?: string | null;
          volunteer_hours?: number | null;
          volunteer_interests?: Json | null;
        };
        Update: {
          accessibility_needs?: string | null;
          address?: string | null;
          annual_fee?: number | null;
          avatar_url?: string | null;
          birth_date?: string | null;
          certifications?: Json | null;
          city?: string | null;
          committee_memberships?: Json | null;
          contribution_amount?: number | null;
          country?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          dietary_restrictions?: string | null;
          district?: string | null;
          education_level?: string | null;
          email?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relation?: string | null;
          employer?: string | null;
          event_attendance_count?: number | null;
          event_notifications?: boolean | null;
          experience_years?: number | null;
          expiry_date?: string | null;
          fee_paid?: boolean | null;
          gender?: string | null;
          id?: string;
          ip_address?: string | null;
          join_date?: string | null;
          languages?: Json | null;
          last_activity_date?: string | null;
          last_payment_date?: string | null;
          leadership_positions?: Json | null;
          marital_status?: string | null;
          marketing_consent?: boolean | null;
          membership_number?: string | null;
          membership_status?: string | null;
          membership_type?: string | null;
          name?: string;
          newsletter_subscription?: boolean | null;
          notes?: string | null;
          occupation?: string | null;
          payment_method?: string | null;
          phone?: string | null;
          postal_code?: string | null;
          preferred_contact_method?: string | null;
          profession?: string | null;
          referral_code?: string | null;
          skills_and_expertise?: Json | null;
          source?: string | null;
          special_requirements?: string | null;
          specialization?: string | null;
          status?: Database['public']['Enums']['member_status'] | null;
          surname?: string;
          updated_at?: string | null;
          updated_by?: string | null;
          user_agent?: string | null;
          volunteer_hours?: number | null;
          volunteer_interests?: Json | null;
        };
        Relationships: [];
      };
      n8n_chat_histories: {
        Row: {
          id: number;
          message: Json;
          session_id: string;
        };
        Insert: {
          id?: number;
          message: Json;
          session_id: string;
        };
        Update: {
          id?: number;
          message?: Json;
          session_id?: string;
        };
        Relationships: [];
      };
      new_aid_applications: {
        Row: {
          aid_type: Database['public']['Enums']['aid_type'];
          application_number: string;
          approved_amount: number | null;
          approved_by: string | null;
          approved_quantity: number | null;
          beneficiary_id: string;
          created_at: string | null;
          created_by: string;
          description: string | null;
          id: string;
          implementation_date: string | null;
          implementation_notes: string | null;
          implemented_by: string | null;
          requested_amount: number | null;
          requested_quantity: number | null;
          reviewed_by: string | null;
          status: Database['public']['Enums']['application_status'] | null;
          updated_at: string | null;
          urgency_level: Database['public']['Enums']['urgency_level'] | null;
        };
        Insert: {
          aid_type: Database['public']['Enums']['aid_type'];
          application_number: string;
          approved_amount?: number | null;
          approved_by?: string | null;
          approved_quantity?: number | null;
          beneficiary_id: string;
          created_at?: string | null;
          created_by: string;
          description?: string | null;
          id?: string;
          implementation_date?: string | null;
          implementation_notes?: string | null;
          implemented_by?: string | null;
          requested_amount?: number | null;
          requested_quantity?: number | null;
          reviewed_by?: string | null;
          status?: Database['public']['Enums']['application_status'] | null;
          updated_at?: string | null;
          urgency_level?: Database['public']['Enums']['urgency_level'] | null;
        };
        Update: {
          aid_type?: Database['public']['Enums']['aid_type'];
          application_number?: string;
          approved_amount?: number | null;
          approved_by?: string | null;
          approved_quantity?: number | null;
          beneficiary_id?: string;
          created_at?: string | null;
          created_by?: string;
          description?: string | null;
          id?: string;
          implementation_date?: string | null;
          implementation_notes?: string | null;
          implemented_by?: string | null;
          requested_amount?: number | null;
          requested_quantity?: number | null;
          reviewed_by?: string | null;
          status?: Database['public']['Enums']['application_status'] | null;
          updated_at?: string | null;
          urgency_level?: Database['public']['Enums']['urgency_level'] | null;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          created_at: string | null;
          data: Json | null;
          id: string;
          is_read: boolean | null;
          message: string;
          title: string;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          is_read?: boolean | null;
          message: string;
          title: string;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          is_read?: boolean | null;
          message?: string;
          title?: string;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      orphans: {
        Row: {
          beneficiary_id: string;
          caregiver_id: string;
          created_at: string | null;
          end_date: string | null;
          id: string;
          is_active: boolean | null;
          relationship_description: string | null;
          start_date: string | null;
          support_type: string | null;
          updated_at: string | null;
        };
        Insert: {
          beneficiary_id: string;
          caregiver_id: string;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          relationship_description?: string | null;
          start_date?: string | null;
          support_type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          beneficiary_id?: string;
          caregiver_id?: string;
          created_at?: string | null;
          end_date?: string | null;
          id?: string;
          is_active?: boolean | null;
          relationship_description?: string | null;
          start_date?: string | null;
          support_type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      partners: {
        Row: {
          address: string | null;
          contact_person: string | null;
          created_at: string | null;
          created_by: string | null;
          email: string | null;
          end_date: string | null;
          established_date: string | null;
          id: number;
          last_contact: string | null;
          name: string;
          notes: string | null;
          partner_category: string | null;
          partner_type: string | null;
          partnership_type: string | null;
          phone: string | null;
          rating: number | null;
          start_date: string | null;
          status: string | null;
          tags: string[] | null;
          tax_number: string | null;
          total_contribution: number | null;
          type: string | null;
          updated_at: string | null;
          updated_by: string | null;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          contact_person?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          end_date?: string | null;
          established_date?: string | null;
          id?: number;
          last_contact?: string | null;
          name: string;
          notes?: string | null;
          partner_category?: string | null;
          partner_type?: string | null;
          partnership_type?: string | null;
          phone?: string | null;
          rating?: number | null;
          start_date?: string | null;
          status?: string | null;
          tags?: string[] | null;
          tax_number?: string | null;
          total_contribution?: number | null;
          type?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          contact_person?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          email?: string | null;
          end_date?: string | null;
          established_date?: string | null;
          id?: number;
          last_contact?: string | null;
          name?: string;
          notes?: string | null;
          partner_category?: string | null;
          partner_type?: string | null;
          partnership_type?: string | null;
          phone?: string | null;
          rating?: number | null;
          start_date?: string | null;
          status?: string | null;
          tags?: string[] | null;
          tax_number?: string | null;
          total_contribution?: number | null;
          type?: string | null;
          updated_at?: string | null;
          updated_by?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          action: string;
          created_at: string | null;
          description: string | null;
          display_name: string;
          id: string;
          name: string;
          resource: string;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          description?: string | null;
          display_name: string;
          id?: string;
          name: string;
          resource: string;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          description?: string | null;
          display_name?: string;
          id?: string;
          name?: string;
          resource?: string;
        };
        Relationships: [];
      };
      relationships: {
        Row: {
          created_at: string | null;
          id: number;
          person_1_id: number;
          person_2_id: number;
          relationship_type: string;
        };
        Insert: {
          created_at?: string | null;
          id?: never;
          person_1_id: number;
          person_2_id: number;
          relationship_type: string;
        };
        Update: {
          created_at?: string | null;
          id?: never;
          person_1_id?: number;
          person_2_id?: number;
          relationship_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'relationships_person_1_id_fkey';
            columns: ['person_1_id'];
            isOneToOne: false;
            referencedRelation: 'ihtiyac_sahipleri';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'relationships_person_2_id_fkey';
            columns: ['person_2_id'];
            isOneToOne: false;
            referencedRelation: 'ihtiyac_sahipleri';
            referencedColumns: ['id'];
          },
        ];
      };
      roles: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_name: string;
          id: string;
          is_active: boolean | null;
          name: string;
          permissions: Json | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_name: string;
          id?: string;
          is_active?: boolean | null;
          name: string;
          permissions?: Json | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_name?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          permissions?: Json | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      scholarships: {
        Row: {
          academic_performance: Json | null;
          amount: number | null;
          contact_info: Json | null;
          created_at: string | null;
          created_by: string | null;
          education_level: string | null;
          end_date: string | null;
          grade_level: string | null;
          id: number;
          national_id: string | null;
          notes: string | null;
          scholarship_type: string | null;
          school_name: string | null;
          start_date: string | null;
          status: string | null;
          student_id: string | null;
          student_name: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          academic_performance?: Json | null;
          amount?: number | null;
          contact_info?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          education_level?: string | null;
          end_date?: string | null;
          grade_level?: string | null;
          id?: number;
          national_id?: string | null;
          notes?: string | null;
          scholarship_type?: string | null;
          school_name?: string | null;
          start_date?: string | null;
          status?: string | null;
          student_id?: string | null;
          student_name: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          academic_performance?: Json | null;
          amount?: number | null;
          contact_info?: Json | null;
          created_at?: string | null;
          created_by?: string | null;
          education_level?: string | null;
          end_date?: string | null;
          grade_level?: string | null;
          id?: number;
          national_id?: string | null;
          notes?: string | null;
          scholarship_type?: string | null;
          school_name?: string | null;
          start_date?: string | null;
          status?: string | null;
          student_id?: string | null;
          student_name?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          created_at: string | null;
          database: Json | null;
          general: Json | null;
          id: number;
          notifications: Json | null;
          security: Json | null;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          created_at?: string | null;
          database?: Json | null;
          general?: Json | null;
          id?: number;
          notifications?: Json | null;
          security?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          created_at?: string | null;
          database?: Json | null;
          general?: Json | null;
          id?: number;
          notifications?: Json | null;
          security?: Json | null;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      task_assignments: {
        Row: {
          assigned_by: string;
          assigned_to: string;
          assignment_date: string | null;
          completed_at: string | null;
          created_at: string | null;
          id: string;
          notes: string | null;
          status: string;
          task_id: string | null;
        };
        Insert: {
          assigned_by: string;
          assigned_to: string;
          assignment_date?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          status?: string;
          task_id?: string | null;
        };
        Update: {
          assigned_by?: string;
          assigned_to?: string;
          assignment_date?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          id?: string;
          notes?: string | null;
          status?: string;
          task_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'task_assignments_task_id_fkey';
            columns: ['task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          actual_hours: number | null;
          completed_date: string | null;
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          due_date: string | null;
          estimated_hours: number | null;
          id: string;
          priority: string;
          progress_percentage: number | null;
          status: string;
          tags: string[] | null;
          task_type: string;
          title: string;
          updated_at: string | null;
          updated_by: string | null;
        };
        Insert: {
          actual_hours?: number | null;
          completed_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          id?: string;
          priority?: string;
          progress_percentage?: number | null;
          status?: string;
          tags?: string[] | null;
          task_type: string;
          title: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Update: {
          actual_hours?: number | null;
          completed_date?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          id?: string;
          priority?: string;
          progress_percentage?: number | null;
          status?: string;
          tags?: string[] | null;
          task_type?: string;
          title?: string;
          updated_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      user_permissions: {
        Row: {
          expires_at: string | null;
          granted_at: string | null;
          granted_by: string | null;
          id: string;
          is_active: boolean | null;
          permission_id: string | null;
          user_id: string | null;
        };
        Insert: {
          expires_at?: string | null;
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          is_active?: boolean | null;
          permission_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          expires_at?: string | null;
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          is_active?: boolean | null;
          permission_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_permissions_granted_by_fkey';
            columns: ['granted_by'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_permissions_permission_id_fkey';
            columns: ['permission_id'];
            isOneToOne: false;
            referencedRelation: 'permissions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_permissions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'user_profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string;
          id: string;
          is_active: boolean | null;
          metadata: Json | null;
          name: string;
          role: Database['public']['Enums']['user_role'];
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email: string;
          id: string;
          is_active?: boolean | null;
          metadata?: Json | null;
          name: string;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string;
          id?: string;
          is_active?: boolean | null;
          metadata?: Json | null;
          name?: string;
          role?: Database['public']['Enums']['user_role'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      donation_summary: {
        Row: {
          average_amount: number | null;
          donation_count: number | null;
          month: string | null;
          total_amount: number | null;
        };
        Relationships: [];
      };
      donations_by_donor_type: {
        Row: {
          average_amount: number | null;
          donation_count: number | null;
          donor_type: string | null;
          total_amount: number | null;
        };
        Relationships: [];
      };
      donations_monthly_summary: {
        Row: {
          average_amount: number | null;
          donation_count: number | null;
          month: string | null;
          total_amount: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_user_permissions: {
        Args: { user_id: string };
        Returns: Json;
      };
      get_user_profile: {
        Args: { user_id: string };
        Returns: Json;
      };
      get_user_role: {
        Args: Record<PropertyKey, never> | { user_id: string };
        Returns: string;
      };
      has_permission: {
        Args: { permission_name: string; user_id: string };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_admin_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_manager_or_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_staff_user: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      aid_request_priority: 'low' | 'medium' | 'high' | 'urgent';
      aid_request_status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed';
      aid_type: 'food' | 'cash' | 'rent' | 'education' | 'healthcare' | 'clothing' | 'other';
      application_status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'implemented';
      beneficiary_status: 'active' | 'inactive' | 'suspended' | 'archived';
      campaign_status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
      document_category:
        | 'identity'
        | 'income_proof'
        | 'medical_report'
        | 'photo'
        | 'application_form'
        | 'consent'
        | 'other';
      donation_status: 'pending' | 'approved' | 'rejected' | 'processed';
      member_status: 'active' | 'inactive' | 'suspended' | 'expired';
      relationship_type:
        | 'spouse'
        | 'child'
        | 'parent'
        | 'sibling'
        | 'grandparent'
        | 'grandchild'
        | 'other';
      urgency_level: 'low' | 'medium' | 'high' | 'critical';
      user_role:
        | 'admin'
        | 'manager'
        | 'operator'
        | 'viewer'
        | 'yönetici'
        | 'müdür'
        | 'operatör'
        | 'görüntüleyici';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      aid_request_priority: ['low', 'medium', 'high', 'urgent'],
      aid_request_status: ['pending', 'approved', 'rejected', 'in_progress', 'completed'],
      aid_type: ['food', 'cash', 'rent', 'education', 'healthcare', 'clothing', 'other'],
      application_status: ['draft', 'under_review', 'approved', 'rejected', 'implemented'],
      beneficiary_status: ['active', 'inactive', 'suspended', 'archived'],
      campaign_status: ['draft', 'active', 'paused', 'completed', 'cancelled'],
      document_category: [
        'identity',
        'income_proof',
        'medical_report',
        'photo',
        'application_form',
        'consent',
        'other',
      ],
      donation_status: ['pending', 'approved', 'rejected', 'processed'],
      member_status: ['active', 'inactive', 'suspended', 'expired'],
      relationship_type: [
        'spouse',
        'child',
        'parent',
        'sibling',
        'grandparent',
        'grandchild',
        'other',
      ],
      urgency_level: ['low', 'medium', 'high', 'critical'],
      user_role: [
        'admin',
        'manager',
        'operator',
        'viewer',
        'yönetici',
        'müdür',
        'operatör',
        'görüntüleyici',
      ],
    },
  },
} as const;

// Utility types for Supabase operations
export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

export interface SupabaseQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface ConnectionStatus {
  connected: boolean;
  lastChecked: Date;
  error?: string;
}

export interface BatchOperationResult<T> {
  success: T[];
  failed: Array<{ item: T; error: Error }>;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
}
