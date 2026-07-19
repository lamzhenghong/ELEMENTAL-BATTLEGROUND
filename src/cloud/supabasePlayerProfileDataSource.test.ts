import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import { createSupabasePlayerProfileDataSource } from './supabasePlayerProfileDataSource';

const calls: Array<[string, ...unknown[]]> = [];
const profileRow: Database['public']['Tables']['player_profiles']['Row'] = {
  user_id: 'user-123',
  username: 'Aether_Hero',
  public_id: 'AETH-ABCDEF123456',
  created_at: '2026-07-20T00:00:00.000Z',
  updated_at: '2026-07-20T00:00:00.000Z'
};

const query = {
  select(columns: string) {
    calls.push(['select', columns]);
    return this;
  },
  eq(column: string, value: string) {
    calls.push(['eq', column, value]);
    return this;
  },
  async maybeSingle() {
    calls.push(['maybeSingle']);
    return { data: profileRow, error: null };
  }
};

const client = {
  from(table: string) {
    calls.push(['from', table]);
    return query;
  },
  async rpc(name: string, args: { candidate: string }) {
    calls.push(['rpc', name, args]);
    return { data: args.candidate === 'Free_Name', error: null };
  }
} as unknown as SupabaseClient<Database>;

const dataSource = createSupabasePlayerProfileDataSource(client);
assert.deepEqual(await dataSource.fetch('user-123'), {
  userId: 'user-123',
  username: 'Aether_Hero',
  publicId: 'AETH-ABCDEF123456',
  createdAt: '2026-07-20T00:00:00.000Z',
  updatedAt: '2026-07-20T00:00:00.000Z'
});
assert.equal(await dataSource.isUsernameAvailable('Free_Name'), true);
assert.deepEqual(calls, [
  ['from', 'player_profiles'],
  ['select', '*'],
  ['eq', 'user_id', 'user-123'],
  ['maybeSingle'],
  ['rpc', 'is_username_available', { candidate: 'Free_Name' }]
]);

console.log('Supabase player profile data source contract ok');
