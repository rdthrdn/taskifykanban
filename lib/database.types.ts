// Simplified database types untuk Supabase
// Bisa di-generate dengan: supabase gen types typescript --project-id <project-id>

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
      profiles: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          created_at?: string
        }
      }
      boards: {
        Row: {
          id: string
          title: string
          owner_id: string
          members: string[]
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          owner_id: string
          members?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          owner_id?: string
          members?: string[]
          created_at?: string
        }
      }
      columns: {
        Row: {
          id: string
          board_id: string
          title: string
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          board_id: string
          title: string
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          board_id?: string
          title?: string
          order?: number
          created_at?: string
        }
      }
      cards: {
        Row: {
          id: string
          column_id: string
          title: string
          description: string
          labels: string[]
          due_date: string | null
          assignees: string[]
          order: number
          created_at: string
        }
        Insert: {
          id?: string
          column_id: string
          title: string
          description?: string
          labels?: string[]
          due_date?: string | null
          assignees?: string[]
          order: number
          created_at?: string
        }
        Update: {
          id?: string
          column_id?: string
          title?: string
          description?: string
          labels?: string[]
          due_date?: string | null
          assignees?: string[]
          order?: number
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          card_id: string
          author_id: string
          body: string
          created_at: string
        }
        Insert: {
          id?: string
          card_id: string
          author_id: string
          body: string
          created_at?: string
        }
        Update: {
          id?: string
          card_id?: string
          author_id?: string
          body?: string
          created_at?: string
        }
      }
    }
  }
}

