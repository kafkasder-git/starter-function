export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  public: {
    Tables: {
      beneficiaries: {
        Row: {
          address: string | null;
          birth_date: string | null;
          city: string | null;
          created_at: string | null;
          created_by: string | null;
          disability_percentage: number | null;
          disability_status: string | null;
          district: string | null;
          email: string | null;
          employment_status: string | null;
          family_size: number | null;
          full_address: string | null;
          gender: string | null;
          health_conditions: string | null;
          household_size: number | null;
          iban: string | null;
          id: string;
          income_range: string | null;
          inputs_to_ignore: string[] | null;
          is_family_member: boolean | null;
          marital_status: string | null;
          medication_info: string | null;
          monthly_income: number | null;
          name: string;
          neighborhood: string | null;
          notes: string | null;
          phone: string | null;
          phone_text: string | null;
          primary_beneficiary_id: string | null;
          priority_level: string | null;
          profession: string | null;
          receives_social_aid: boolean | null;
          registration_date: string | null;
          residence_type: string | null;
          status: Database['public']['Enums']['beneficiary_status'] | null;
          surname: string;
          tc_no: string | null;
          updated_at: string | null;
          // Yeni alanlar (migration sonrası eklenecek)
          full_name?: string | null;
          identity_no?: string | null;
          nationality?: string | null;
          country?: string | null;
          settlement?: string | null;
          linked_orphan?: boolean | null;
          linked_card?: boolean | null;
          card_no?: string | null;
          opened_by_unit?: string | null;
          category?: string | null;
          aid_type?: string | null;
          fund_region?: string | null;
          total_amount?: number | null;
        };
        Insert: {
          address?: string | null;
          birth_date?: string | null;
          city?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          disability_percentage?: number | null;
          disability_status?: string | null;
          district?: string | null;
          email?: string | null;
          employment_status?: string | null;
          family_size?: number | null;
          full_address?: string | null;
          gender?: string | null;
          health_conditions?: string | null;
          household_size?: number | null;
          iban?: string | null;
          id?: string;
          income_range?: string | null;
          inputs_to_ignore?: string[] | null;
          is_family_member?: boolean | null;
          marital_status?: string | null;
          medication_info?: string | null;
          monthly_income?: number | null;
          name: string;
          neighborhood?: string | null;
          notes?: string | null;
          phone?: string | null;
          phone_text?: string | null;
          primary_beneficiary_id?: string | null;
          priority_level?: string | null;
          profession?: string | null;
          receives_social_aid?: boolean | null;
          registration_date?: string | null;
          residence_type?: string | null;
          status?: Database['public']['Enums']['beneficiary_status'] | null;
          surname: string;
          tc_no?: string | null;
          updated_at?: string | null;
          // Yeni alanlar
          full_name?: string | null;
          identity_no?: string | null;
          nationality?: string | null;
          country?: string | null;
          settlement?: string | null;
          linked_orphan?: boolean | null;
          linked_card?: boolean | null;
          card_no?: string | null;
          opened_by_unit?: string | null;
          category?: string | null;
          aid_type?: string | null;
          fund_region?: string | null;
          total_amount?: number | null;
        };
        Update: {
          address?: string | null;
          birth_date?: string | null;
          city?: string | null;
          created_at?: string | null;
          created_by?: string | null;
          disability_percentage?: number | null;
          disability_status?: string | null;
          district?: string | null;
          email?: string | null;
          employment_status?: string | null;
          family_size?: number | null;
          full_address?: string | null;
          gender?: string | null;
          health_conditions?: string | null;
          household_size?: number | null;
          iban?: string | null;
          id?: string;
          income_range?: string | null;
          inputs_to_ignore?: string[] | null;
          is_family_member?: boolean | null;
          marital_status?: string | null;
          medication_info?: string | null;
          monthly_income?: number | null;
          name?: string;
          neighborhood?: string | null;
          notes?: string | null;
          phone?: string | null;
          phone_text?: string | null;
          primary_beneficiary_id?: string | null;
          priority_level?: string | null;
          profession?: string | null;
          receives_social_aid?: boolean | null;
          registration_date?: string | null;
          residence_type?: string | null;
          status?: Database['public']['Enums']['beneficiary_status'] | null;
          surname?: string;
          tc_no?: string | null;
          updated_at?: string | null;
          // Yeni alanlar
          full_name?: string | null;
          identity_no?: string | null;
          nationality?: string | null;
          country?: string | null;
          settlement?: string | null;
          linked_orphan?: boolean | null;
          linked_card?: boolean | null;
          card_no?: string | null;
          opened_by_unit?: string | null;
          category?: string | null;
          aid_type?: string | null;
          fund_region?: string | null;
          total_amount?: number | null;
        };
        Relationships: [];
      };
      // Diğer tablolar...
    };
    Views: {
      beneficiary_summary: {
        Row: {
          aid_request_count: number | null;
          city: string | null;
          created_at: string | null;
          email: string | null;
          id: string | null;
          name: string | null;
          phone: string | null;
          status: Database['public']['Enums']['beneficiary_status'] | null;
          surname: string | null;
          tc_no: string | null;
          total_aid_amount: number | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      // Functions...
    };
    Enums: {
      beneficiary_status: 'active' | 'inactive' | 'suspended' | 'archived';
      aid_type: 'food' | 'cash' | 'rent' | 'education' | 'healthcare' | 'clothing' | 'other';
      application_status: 'draft' | 'under_review' | 'approved' | 'rejected' | 'implemented';
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
    CompositeTypes: Record<never, never>;
  };
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
