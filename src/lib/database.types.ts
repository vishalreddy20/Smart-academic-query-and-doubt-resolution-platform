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
          email: string
          full_name: string
          role: 'student' | 'faculty' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role?: 'student' | 'faculty' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: 'student' | 'faculty' | 'admin'
          created_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          name: string
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_at?: string
        }
      }
      doubts: {
        Row: {
          id: string
          student_id: string
          subject_id: string
          title: string
          description: string
          priority: 'low' | 'medium' | 'high'
          status: 'open' | 'in_progress' | 'resolved' | 'reopened'
          faculty_id: string | null
          answer: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          subject_id: string
          title: string
          description: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'open' | 'in_progress' | 'resolved' | 'reopened'
          faculty_id?: string | null
          answer?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          subject_id?: string
          title?: string
          description?: string
          priority?: 'low' | 'medium' | 'high'
          status?: 'open' | 'in_progress' | 'resolved' | 'reopened'
          faculty_id?: string | null
          answer?: string | null
          created_at?: string
          updated_at?: string
          resolved_at?: string | null
        }
      }
      ratings: {
        Row: {
          id: string
          doubt_id: string
          student_id: string
          rating: number
          feedback: string
          created_at: string
        }
        Insert: {
          id?: string
          doubt_id: string
          student_id: string
          rating: number
          feedback?: string
          created_at?: string
        }
        Update: {
          id?: string
          doubt_id?: string
          student_id?: string
          rating?: number
          feedback?: string
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type Doubt = Database['public']['Tables']['doubts']['Row'];
export type Rating = Database['public']['Tables']['ratings']['Row'];

export interface DoubtWithDetails extends Doubt {
  student?: Profile;
  faculty?: Profile;
  subject?: Subject;
  ratings?: Rating[];
}
