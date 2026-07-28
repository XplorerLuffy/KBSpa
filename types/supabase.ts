// Generated from the Supabase project schema. Regenerate after any migration:
//   supabase gen types typescript --project-id <ref> > types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type AppointmentRow = {
  amount_total: number | null;
  cancelled_reason: string | null;
  contact_email: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  created_at: string;
  customer_id: string;
  end_time: string;
  gender: string | null;
  id: string;
  notes: string | null;
  payment_status: string;
  price: number | null;
  reminder_sent_at: string | null;
  service_id: string;
  staff_id: string;
  start_time: string;
  status: string;
  stripe_session_id: string | null;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: AppointmentRow;
        Insert: {
          amount_total?: number | null;
          cancelled_reason?: string | null;
          contact_email?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          created_at?: string;
          customer_id: string;
          end_time: string;
          gender?: string | null;
          id?: string;
          notes?: string | null;
          payment_status?: string;
          price?: number | null;
          reminder_sent_at?: string | null;
          service_id: string;
          staff_id: string;
          start_time: string;
          status?: string;
          stripe_session_id?: string | null;
          updated_at?: string;
        };
        Update: Partial<AppointmentRow>;
        Relationships: [];
      };
      business_hours: {
        Row: {
          close_time: string;
          is_closed: boolean;
          open_time: string;
          updated_at: string;
          weekday: number;
        };
        Insert: {
          close_time?: string;
          is_closed?: boolean;
          open_time?: string;
          updated_at?: string;
          weekday: number;
        };
        Update: {
          close_time?: string;
          is_closed?: boolean;
          open_time?: string;
          updated_at?: string;
          weekday?: number;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          is_read: boolean;
          message: string;
          name: string;
          phone: string | null;
          subject: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          is_read?: boolean;
          message: string;
          name: string;
          phone?: string | null;
          subject?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          name?: string;
          phone?: string | null;
          subject?: string | null;
        };
        Relationships: [];
      };
      favorites: {
        Row: { created_at: string; customer_id: string; service_id: string };
        Insert: { created_at?: string; customer_id: string; service_id: string };
        Update: { created_at?: string; customer_id?: string; service_id?: string };
        Relationships: [];
      };
      gallery_items: {
        Row: {
          caption: string | null;
          category: string | null;
          created_at: string;
          id: string;
          image_url: string;
          is_featured: boolean;
          sort_order: number;
        };
        Insert: {
          caption?: string | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          image_url: string;
          is_featured?: boolean;
          sort_order?: number;
        };
        Update: {
          caption?: string | null;
          category?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string;
          is_featured?: boolean;
          sort_order?: number;
        };
        Relationships: [];
      };
      holidays: {
        Row: {
          created_at: string;
          date: string;
          id: string;
          reason: string | null;
          staff_id: string | null;
        };
        Insert: {
          created_at?: string;
          date: string;
          id?: string;
          reason?: string | null;
          staff_id?: string | null;
        };
        Update: {
          created_at?: string;
          date?: string;
          id?: string;
          reason?: string | null;
          staff_id?: string | null;
        };
        Relationships: [];
      };
      notification_logs: {
        Row: {
          channel: string;
          created_at: string;
          error: string | null;
          id: string;
          payload: Json | null;
          recipient: string;
          status: string;
          template: string | null;
        };
        Insert: {
          channel: string;
          created_at?: string;
          error?: string | null;
          id?: string;
          payload?: Json | null;
          recipient: string;
          status?: string;
          template?: string | null;
        };
        Update: {
          channel?: string;
          created_at?: string;
          error?: string | null;
          id?: string;
          payload?: Json | null;
          recipient?: string;
          status?: string;
          template?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string | null;
          gender: string | null;
          id: string;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          gender?: string | null;
          id: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string | null;
          gender?: string | null;
          id?: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      promotions: {
        Row: {
          banner_image_url: string | null;
          category_id: string | null;
          created_at: string;
          description: string | null;
          discount_type: string | null;
          discount_value: number | null;
          ends_at: string | null;
          id: string;
          is_active: boolean;
          service_id: string | null;
          starts_at: string | null;
          title: string;
        };
        Insert: {
          banner_image_url?: string | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          discount_type?: string | null;
          discount_value?: number | null;
          ends_at?: string | null;
          id?: string;
          is_active?: boolean;
          service_id?: string | null;
          starts_at?: string | null;
          title: string;
        };
        Update: {
          banner_image_url?: string | null;
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          discount_type?: string | null;
          discount_value?: number | null;
          ends_at?: string | null;
          id?: string;
          is_active?: boolean;
          service_id?: string | null;
          starts_at?: string | null;
          title?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          benefits: string[];
          category_id: string | null;
          created_at: string;
          description: string | null;
          duration_minutes: number;
          gallery_urls: string[];
          id: string;
          image_url: string | null;
          is_active: boolean;
          is_featured: boolean;
          name: string;
          price: number;
          short_description: string | null;
          slug: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          benefits?: string[];
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes: number;
          gallery_urls?: string[];
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          name: string;
          price: number;
          short_description?: string | null;
          slug: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          benefits?: string[];
          category_id?: string | null;
          created_at?: string;
          description?: string | null;
          duration_minutes?: number;
          gallery_urls?: string[];
          id?: string;
          image_url?: string | null;
          is_active?: boolean;
          is_featured?: boolean;
          name?: string;
          price?: number;
          short_description?: string | null;
          slug?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: { key: string; updated_at: string; value: Json };
        Insert: { key: string; updated_at?: string; value: Json };
        Update: { key?: string; updated_at?: string; value?: Json };
        Relationships: [];
      };
      staff: {
        Row: {
          bio: string | null;
          created_at: string;
          full_name: string;
          id: string;
          is_active: boolean;
          photo_url: string | null;
          sort_order: number;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          full_name: string;
          id?: string;
          is_active?: boolean;
          photo_url?: string | null;
          sort_order?: number;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_active?: boolean;
          photo_url?: string | null;
          sort_order?: number;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      staff_services: {
        Row: { service_id: string; staff_id: string };
        Insert: { service_id: string; staff_id: string };
        Update: { service_id?: string; staff_id?: string };
        Relationships: [];
      };
      testimonials: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          customer_name: string;
          id: string;
          is_approved: boolean;
          is_featured: boolean;
          quote: string;
          rating: number;
          service_id: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          customer_name: string;
          id?: string;
          is_approved?: boolean;
          is_featured?: boolean;
          quote: string;
          rating?: number;
          service_id?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          customer_name?: string;
          id?: string;
          is_approved?: boolean;
          is_featured?: boolean;
          quote?: string;
          rating?: number;
          service_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      business_timezone: { Args: Record<never, never>; Returns: string };
      slot_interval_minutes: { Args: Record<never, never>; Returns: number };
      is_admin: { Args: Record<never, never>; Returns: boolean };
      get_available_slots: {
        Args: {
          p_staff_id: string;
          p_service_id: string;
          p_date: string;
          p_exclude_appointment_id?: string;
        };
        Returns: { slot: string }[];
      };
      create_appointment: {
        Args: {
          p_service_id: string;
          p_staff_id: string;
          p_start_time: string;
          p_contact_name?: string;
          p_contact_phone?: string;
          p_contact_email?: string;
          p_gender?: string;
          p_notes?: string;
        };
        Returns: AppointmentRow;
      };
      cancel_appointment: {
        Args: { p_appointment_id: string; p_reason?: string };
        Returns: AppointmentRow;
      };
      reschedule_appointment: {
        Args: {
          p_appointment_id: string;
          p_start_time: string;
          p_staff_id?: string;
        };
        Returns: AppointmentRow;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
