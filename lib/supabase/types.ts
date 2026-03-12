export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      approved_counties: {
        Row: {
          active: boolean | null
          id: string
          name: string
          state: string
        }
        Insert: {
          active?: boolean | null
          id?: string
          name: string
          state?: string
        }
        Update: {
          active?: boolean | null
          id?: string
          name?: string
          state?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          admin_reviewed: boolean | null
          cook_id: string
          customer_id: string
          description: string
          id: string
          lea_report_date: string | null
          order_id: string
          reported_to_lea: boolean
          submitted_at: string
        }
        Insert: {
          admin_reviewed?: boolean | null
          cook_id: string
          customer_id: string
          description: string
          id?: string
          lea_report_date?: string | null
          order_id: string
          reported_to_lea?: boolean
          submitted_at?: string
        }
        Update: {
          admin_reviewed?: boolean | null
          cook_id?: string
          customer_id?: string
          description?: string
          id?: string
          lea_report_date?: string | null
          order_id?: string
          reported_to_lea?: boolean
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "public_cook_listings"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "complaints_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      cook_profiles: {
        Row: {
          active: boolean
          address: string | null
          bio: string | null
          county: string
          created_at: string
          cuisine_types: string[]
          id: string
          last_meal_reset_date: string | null
          last_week_reset_date: string | null
          lat: number | null
          lng: number | null
          location: unknown
          permit_number: string
          permit_verified: boolean
          profile_photo_url: string | null
          total_daily_meals: number | null
          total_weekly_meals: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          active?: boolean
          address?: string | null
          bio?: string | null
          county: string
          created_at?: string
          cuisine_types?: string[]
          id?: string
          last_meal_reset_date?: string | null
          last_week_reset_date?: string | null
          lat?: number | null
          lng?: number | null
          location?: unknown
          permit_number: string
          permit_verified?: boolean
          profile_photo_url?: string | null
          total_daily_meals?: number | null
          total_weekly_meals?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          active?: boolean
          address?: string | null
          bio?: string | null
          county?: string
          created_at?: string
          cuisine_types?: string[]
          id?: string
          last_meal_reset_date?: string | null
          last_week_reset_date?: string | null
          lat?: number | null
          lng?: number | null
          location?: unknown
          permit_number?: string
          permit_verified?: boolean
          profile_photo_url?: string | null
          total_daily_meals?: number | null
          total_weekly_meals?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cook_profiles_county_fkey"
            columns: ["county"]
            isOneToOne: false
            referencedRelation: "approved_counties"
            referencedColumns: ["name"]
          },
          {
            foreignKeyName: "cook_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          available_qty: number | null
          created_at: string
          description: string | null
          dietary_tags: string[]
          id: string
          menu_id: string
          name: string
          photo_url: string | null
          price: number
          qty_remaining: number | null
          sold_out: boolean
          updated_at: string | null
        }
        Insert: {
          available_qty?: number | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[]
          id?: string
          menu_id: string
          name: string
          photo_url?: string | null
          price: number
          qty_remaining?: number | null
          sold_out?: boolean
          updated_at?: string | null
        }
        Update: {
          available_qty?: number | null
          created_at?: string
          description?: string | null
          dietary_tags?: string[]
          id?: string
          menu_id?: string
          name?: string
          photo_url?: string | null
          price?: number
          qty_remaining?: number | null
          sold_out?: boolean
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          active: boolean
          available_from: string | null
          available_until: string | null
          cook_id: string
          created_at: string
          date: string
          fulfillment_types: string[]
          id: string
          meals_remaining: number
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean
          available_from?: string | null
          available_until?: string | null
          cook_id: string
          created_at?: string
          date: string
          fulfillment_types?: string[]
          id?: string
          meals_remaining?: number
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean
          available_from?: string | null
          available_until?: string | null
          cook_id?: string
          created_at?: string
          date?: string
          fulfillment_types?: string[]
          id?: string
          meals_remaining?: number
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menus_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menus_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "public_cook_listings"
            referencedColumns: ["cook_id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          item_name: string | null
          menu_item_id: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          item_name?: string | null
          menu_item_id: string
          order_id: string
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          item_name?: string | null
          menu_item_id?: string
          order_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_revealed: boolean
          cook_id: string
          cook_payout: number | null
          created_at: string
          customer_id: string
          customer_notes: string | null
          fulfillment_type: string
          id: string
          menu_id: string
          pickup_time: string | null
          platform_fee: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_transfer_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          address_revealed?: boolean
          cook_id: string
          cook_payout?: number | null
          created_at?: string
          customer_id: string
          customer_notes?: string | null
          fulfillment_type: string
          id?: string
          menu_id: string
          pickup_time?: string | null
          platform_fee: number
          status: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          address_revealed?: boolean
          cook_id?: string
          cook_payout?: number | null
          created_at?: string
          customer_id?: string
          customer_notes?: string | null
          fulfillment_type?: string
          id?: string
          menu_id?: string
          pickup_time?: string | null
          platform_fee?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_transfer_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "public_cook_listings"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_checkouts: {
        Row: {
          cart_items: Json
          cook_id: string
          created_at: string
          customer_id: string
          fulfillment_type: string
          id: string
          menu_id: string
          platform_fee: number
          processed: boolean
          processed_at: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
        }
        Insert: {
          cart_items: Json
          cook_id: string
          created_at?: string
          customer_id: string
          fulfillment_type: string
          id?: string
          menu_id: string
          platform_fee: number
          processed?: boolean
          processed_at?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
        }
        Update: {
          cart_items?: Json
          cook_id?: string
          created_at?: string
          customer_id?: string
          fulfillment_type?: string
          id?: string
          menu_id?: string
          platform_fee?: number
          processed?: boolean
          processed_at?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "payment_checkouts_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_checkouts_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "public_cook_listings"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "payment_checkouts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_checkouts_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          cook_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          order_id: string | null
          rating: number
        }
        Insert: {
          comment?: string | null
          cook_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_id?: string | null
          rating: number
        }
        Update: {
          comment?: string | null
          cook_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          order_id?: string | null
          rating?: number
        }
        Relationships: [
          {
            foreignKeyName: "reviews_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "cook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_cook_id_fkey"
            columns: ["cook_id"]
            isOneToOne: false
            referencedRelation: "public_cook_listings"
            referencedColumns: ["cook_id"]
          },
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          role: string
          stripe_account_id: string | null
          stripe_customer_id: string | null
          stripe_onboarding_complete: boolean
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          role: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string
          stripe_account_id?: string | null
          stripe_customer_id?: string | null
          stripe_onboarding_complete?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_cook_listings: {
        Row: {
          bio: string | null
          cook_id: string | null
          cook_name: string | null
          county: string | null
          cuisine_types: string[] | null
          lat: number | null
          lng: number | null
          permit_number: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cook_profiles_county_fkey"
            columns: ["county"]
            isOneToOne: false
            referencedRelation: "approved_counties"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
