export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      communities: {
        Row: {
          id: string
          name: string
          address: string | null
          city: string | null
          state: string | null
          zip: string | null
          units: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          units: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          city?: string | null
          state?: string | null
          zip?: string | null
          units?: number
          created_at?: string
          updated_at?: string
        }
      }
      staff: {
        Row: {
          id: string
          auth_id: string | null
          name: string
          email: string
          role: string
          phone: string | null
          avatar_url: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          name: string
          email: string
          role: string
          phone?: string | null
          avatar_url?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          name?: string
          email?: string
          role?: string
          phone?: string | null
          avatar_url?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      staff_communities: {
        Row: {
          id: string
          staff_id: string
          community_id: string
          role: string
          created_at: string
        }
        Insert: {
          id?: string
          staff_id: string
          community_id: string
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          staff_id?: string
          community_id?: string
          role?: string
          created_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          due_date: string
          community_id: string
          assigned_to: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status: string
          priority: string
          due_date: string
          community_id: string
          assigned_to?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          due_date?: string
          community_id?: string
          assigned_to?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      task_updates: {
        Row: {
          id: string
          task_id: string
          user_id: string | null
          content: string
          update_type: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id?: string | null
          content: string
          update_type: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string | null
          content?: string
          update_type?: string
          created_at?: string
        }
      }
      task_attachments: {
        Row: {
          id: string
          task_id: string
          file_name: string
          file_size: string
          file_url: string
          file_type: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          task_id: string
          file_name: string
          file_size: string
          file_url: string
          file_type?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          task_id?: string
          file_name?: string
          file_size?: string
          file_url?: string
          file_type?: string | null
          created_at?: string
          created_by?: string | null
        }
      }
      residents: {
        Row: {
          id: string
          auth_id: string | null
          name: string
          email: string
          phone: string | null
          community_id: string
          unit_number: string | null
          avatar_url: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          name: string
          email: string
          phone?: string | null
          community_id: string
          unit_number?: string | null
          avatar_url?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          name?: string
          email?: string
          phone?: string | null
          community_id?: string
          unit_number?: string | null
          avatar_url?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      maintenance_requests: {
        Row: {
          id: string
          title: string
          description: string
          status: string
          priority: string
          community_id: string
          resident_id: string
          assigned_to: string | null
          unit_number: string
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: string
          priority?: string
          community_id: string
          resident_id: string
          assigned_to?: string | null
          unit_number: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: string
          priority?: string
          community_id?: string
          resident_id?: string
          assigned_to?: string | null
          unit_number?: string
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      maintenance_updates: {
        Row: {
          id: string
          request_id: string
          user_id: string | null
          user_type: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          user_id?: string | null
          user_type: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          user_id?: string | null
          user_type?: string
          content?: string
          created_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          community_id: string
          created_by: string | null
          created_at: string
          updated_at: string
          published_at: string | null
          expires_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          community_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          community_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
          expires_at?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          name: string
          description: string | null
          file_url: string
          file_type: string
          file_size: string
          community_id: string
          category: string
          is_public: boolean
          uploaded_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          file_url: string
          file_type: string
          file_size: string
          community_id: string
          category: string
          is_public?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          file_url?: string
          file_type?: string
          file_size?: string
          community_id?: string
          category?: string
          is_public?: boolean
          uploaded_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          location: string | null
          start_time: string
          end_time: string
          community_id: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          location?: string | null
          start_time: string
          end_time: string
          community_id: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          location?: string | null
          start_time?: string
          end_time?: string
          community_id?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          user_type: string
          title: string
          content: string
          type: string
          reference_id: string | null
          reference_type: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_type: string
          title: string
          content: string
          type: string
          reference_id?: string | null
          reference_type?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_type?: string
          title?: string
          content?: string
          type?: string
          reference_id?: string | null
          reference_type?: string | null
          is_read?: boolean
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
