/**
 * TypeScript types for Supabase database schema
 * These types provide type safety when querying the database
 * 
 * Note: You can generate these automatically using the Supabase CLI:
 * npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts
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
          name: string | null
          phone: string | null
          language: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          phone?: string | null
          language?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          phone?: string | null
          language?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      disease_history: {
        Row: {
          id: string
          user_id: string
          crop: string
          symptoms: string[]
          diagnosis: string
          confidence: number | null
          treatment: string | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          crop: string
          symptoms: string[]
          diagnosis: string
          confidence?: number | null
          treatment?: string | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          crop?: string
          symptoms?: string[]
          diagnosis?: string
          confidence?: number | null
          treatment?: string | null
          image_url?: string | null
          created_at?: string
        }
      }
      prices: {
        Row: {
          id: string
          crop: string
          market: string
          state: string
          district: string
          price: number
          unit: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          crop: string
          market: string
          state: string
          district: string
          price: number
          unit?: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          crop?: string
          market?: string
          state?: string
          district?: string
          price?: number
          unit?: string
          date?: string
          created_at?: string
        }
      }
      schemes: {
        Row: {
          id: string
          title: string
          description: string
          eligibility: string
          benefits: string
          how_to_apply: string
          link: string | null
          language: string
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          eligibility: string
          benefits: string
          how_to_apply: string
          link?: string | null
          language?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          eligibility?: string
          benefits?: string
          how_to_apply?: string
          link?: string | null
          language?: string
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      assistant_queries: {
        Row: {
          id: string
          user_id: string
          query: string
          response: string
          language: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          response: string
          language?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          query?: string
          response?: string
          language?: string
          created_at?: string
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
