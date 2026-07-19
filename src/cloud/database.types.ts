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
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
