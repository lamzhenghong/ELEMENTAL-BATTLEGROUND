import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migrationUrl = new URL('../../supabase/migrations/20260719172056_create_game_saves.sql', import.meta.url);
const sql = readFileSync(migrationUrl, 'utf8');

assert.match(sql, /create table if not exists public\.game_saves/i);
assert.match(sql, /user_id uuid primary key references auth\.users\s*\(id\) on delete cascade/i);
assert.match(sql, /jsonb_typeof\(save_data\) = 'object'/i);
assert.match(sql, /jsonb_typeof\(pull_history\) = 'array'/i);
assert.match(sql, /alter table public\.game_saves enable row level security/i);
assert.match(sql, /revoke all on table public\.game_saves from anon/i);
assert.match(sql, /grant select, insert, update, delete on table public\.game_saves to authenticated/i);

for (const policy of ['select_own_game_save', 'insert_own_game_save', 'update_own_game_save', 'delete_own_game_save']) {
  assert.match(sql, new RegExp(`create policy "${policy}"`, 'i'));
}

assert.match(
  sql,
  /create policy "update_own_game_save"[\s\S]*using\s*\(\(select auth\.uid\(\)\) = user_id\)[\s\S]*with check\s*\(\(select auth\.uid\(\)\) = user_id\)/i
);

assert.doesNotMatch(sql, /service_role|security definer/i);

console.log('cloud database migration security contract ok');
