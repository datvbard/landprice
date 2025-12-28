/**
 * Land Price App - Supabase Database Types
 * Auto-generated based on schema: supabase/migrations/001_initial_schema.sql
 *
 * These types match the PostgreSQL tables for type-safe database operations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone: string | null
          password_hash: string
          role: 'admin' | 'user'
          full_name: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string | null
          password_hash: string
          role?: 'admin' | 'user'
          full_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string | null
          password_hash?: string
          role?: 'admin' | 'user'
          full_name?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      districts: {
        Row: {
          id: string
          code: string
          name: string
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          sort_order?: number
          created_at?: string
        }
      }
      streets: {
        Row: {
          id: string
          district_id: string
          code: string | null
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          district_id: string
          code?: string | null
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          district_id?: string
          code?: string | null
          name?: string
          created_at?: string
        }
      }
      segments: {
        Row: {
          id: string
          street_id: string
          segment_from: string
          segment_to: string
          base_price_min: number
          base_price_max: number
          government_price: number
          adjustment_coef_min: number
          adjustment_coef_max: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          street_id: string
          segment_from: string
          segment_to: string
          base_price_min?: number
          base_price_max?: number
          government_price?: number
          adjustment_coef_min?: number
          adjustment_coef_max?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          street_id?: string
          segment_from?: string
          segment_to?: string
          base_price_min?: number
          base_price_max?: number
          government_price?: number
          adjustment_coef_min?: number
          adjustment_coef_max?: number
          created_at?: string
          updated_at?: string
        }
      }
      land_type_coefficients: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          coefficient: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
      }
      location_coefficients: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          width_min: number
          width_max: number
          coefficient: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          width_min?: number
          width_max?: number
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          width_min?: number
          width_max?: number
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
      }
      area_coefficients: {
        Row: {
          id: string
          code: string
          name: string
          area_min: number
          area_max: number
          coefficient: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          area_min?: number
          area_max?: number
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          area_min?: number
          area_max?: number
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
      }
      depth_coefficients: {
        Row: {
          id: string
          code: string
          name: string
          depth_min: number
          depth_max: number
          coefficient: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          depth_min?: number
          depth_max?: number
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          depth_min?: number
          depth_max?: number
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
      }
      feng_shui_coefficients: {
        Row: {
          id: string
          code: string
          name: string
          description: string | null
          coefficient: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          description?: string | null
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          description?: string | null
          coefficient?: number
          sort_order?: number
          created_at?: string
        }
      }
      search_history: {
        Row: {
          id: string
          user_id: string | null
          district_name: string | null
          street_name: string | null
          segment_desc: string | null
          area: number | null
          total_price: number | null
          coefficients_json: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          district_name?: string | null
          street_name?: string | null
          segment_desc?: string | null
          area?: number | null
          total_price?: number | null
          coefficients_json?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          district_name?: string | null
          street_name?: string | null
          segment_desc?: string | null
          area?: number | null
          total_price?: number | null
          coefficients_json?: Json | null
          created_at?: string
        }
      }
      brand_settings: {
        Row: {
          id: string
          key: string
          value: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string | null
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// ============================================================================
// Convenience Type Aliases
// ============================================================================

// Row types (for SELECT queries)
export type User = Database['public']['Tables']['users']['Row']
export type District = Database['public']['Tables']['districts']['Row']
export type Street = Database['public']['Tables']['streets']['Row']
export type Segment = Database['public']['Tables']['segments']['Row']
export type LandTypeCoefficient = Database['public']['Tables']['land_type_coefficients']['Row']
export type LocationCoefficient = Database['public']['Tables']['location_coefficients']['Row']
export type AreaCoefficient = Database['public']['Tables']['area_coefficients']['Row']
export type DepthCoefficient = Database['public']['Tables']['depth_coefficients']['Row']
export type FengShuiCoefficient = Database['public']['Tables']['feng_shui_coefficients']['Row']
export type SearchHistory = Database['public']['Tables']['search_history']['Row']
export type BrandSetting = Database['public']['Tables']['brand_settings']['Row']

// Insert types (for INSERT queries)
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type DistrictInsert = Database['public']['Tables']['districts']['Insert']
export type StreetInsert = Database['public']['Tables']['streets']['Insert']
export type SegmentInsert = Database['public']['Tables']['segments']['Insert']
export type SearchHistoryInsert = Database['public']['Tables']['search_history']['Insert']

// Update types (for UPDATE queries)
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type SegmentUpdate = Database['public']['Tables']['segments']['Update']
export type BrandSettingUpdate = Database['public']['Tables']['brand_settings']['Update']

// ============================================================================
// Joined Types (for queries with relations)
// ============================================================================

export interface StreetWithDistrict extends Street {
  district: District
}

export interface SegmentWithStreet extends Segment {
  street: Street
}

export interface SegmentWithFullPath extends Segment {
  street: Street & {
    district: District
  }
}

// ============================================================================
// Search/Calculation Types
// ============================================================================

export interface PriceCalculationInput {
  segmentId: string
  area: number
  landTypeCode: string
  locationCode: string
  areaCode: string
  depthCode: string
  fengShuiCode: string
}

export interface PriceCalculationResult {
  basePrice: number
  basePriceMin: number
  basePriceMax: number
  governmentPrice: number
  coefficients: {
    landType: number
    location: number
    area: number
    depth: number
    fengShui: number
    total: number
  }
  pricePerM2: {
    min: number
    max: number
    avg: number
  }
  totalPrice: {
    min: number
    max: number
    avg: number
  }
}

export interface SearchHistoryWithDetails extends SearchHistory {
  coefficients: {
    landType: { code: string; name: string; coefficient: number }
    location: { code: string; name: string; coefficient: number }
    area: { code: string; name: string; coefficient: number }
    depth: { code: string; name: string; coefficient: number }
    fengShui: { code: string; name: string; coefficient: number }
  }
}
