import type { SupabaseClient } from '@supabase/supabase-js';
import type { CloudSaveDataSource, GameSaveRow, GameSaveUpdate, NewGameSaveRow } from './cloudSaveRepository';
import type { Database, Json } from './database.types';

const asJson = (value: unknown) => value as Json;
const asGameSaveRow = (value: Database['public']['Tables']['game_saves']['Row']) => value as GameSaveRow;

export const createSupabaseCloudSaveDataSource = (
  client: SupabaseClient<Database>
): CloudSaveDataSource => ({
  async selectByUserId(userId: string) {
    const { data, error } = await client
      .from('game_saves')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? asGameSaveRow(data) : null;
  },

  async insert(values: NewGameSaveRow) {
    const { data, error } = await client
      .from('game_saves')
      .insert({
        ...values,
        save_data: asJson(values.save_data),
        pull_history: asJson(values.pull_history),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();
    if (error) throw error;
    return asGameSaveRow(data);
  },

  async updateIfRevisionMatches(userId: string, expectedRevision: number, values: GameSaveUpdate) {
    const { data, error } = await client
      .from('game_saves')
      .update({
        ...values,
        save_data: asJson(values.save_data),
        pull_history: asJson(values.pull_history),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('revision', expectedRevision)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data ? asGameSaveRow(data) : null;
  },

  async deleteByUserId(userId: string) {
    const { error } = await client
      .from('game_saves')
      .delete()
      .eq('user_id', userId);
    if (error) throw error;
  }
});
