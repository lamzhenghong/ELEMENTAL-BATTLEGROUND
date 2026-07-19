import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { mapPlayerProfileRow, type PlayerProfileDataSource } from './playerProfile';

export const createSupabasePlayerProfileDataSource = (
  client: SupabaseClient<Database>
): PlayerProfileDataSource => ({
  async fetch(userId: string) {
    const { data, error } = await client
      .from('player_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapPlayerProfileRow(data) : null;
  },

  async isUsernameAvailable(username: string) {
    const { data, error } = await client.rpc('is_username_available', { candidate: username });
    if (error) throw error;
    return data === true;
  },

  async changeUsername(username: string) {
    const { data, error } = await client.rpc('change_username', { candidate: username });
    if (error) throw error;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) throw new Error('profile_missing');
    return mapPlayerProfileRow(row);
  }
});
