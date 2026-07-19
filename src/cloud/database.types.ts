export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      game_saves: {
        Row: {
          last_device_id: string | null;
          pull_history: Json;
          revision: number;
          save_data: Json;
          save_version: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          last_device_id?: string | null;
          pull_history?: Json;
          revision?: number;
          save_data?: Json;
          save_version?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          last_device_id?: string | null;
          pull_history?: Json;
          revision?: number;
          save_data?: Json;
          save_version?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      player_profiles: {
        Row: {
          created_at: string;
          public_id: string;
          updated_at: string;
          user_id: string;
          username: string;
          username_changed_at: string | null;
        };
        Insert: {
          created_at?: string;
          public_id?: string;
          updated_at?: string;
          user_id: string;
          username: string;
          username_changed_at?: string | null;
        };
        Update: {
          created_at?: string;
          public_id?: string;
          updated_at?: string;
          user_id?: string;
          username?: string;
          username_changed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      change_username: {
        Args: { candidate: string };
        Returns: {
          created_at: string;
          public_id: string;
          updated_at: string;
          user_id: string;
          username: string;
          username_changed_at: string | null;
        };
        SetofOptions: {
          from: '*';
          to: 'player_profiles';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      is_username_available: {
        Args: { candidate: string };
        Returns: boolean;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
