import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const migrationUrl = new URL(
  '../../supabase/migrations/20260719183618_create_player_profiles.sql',
  import.meta.url
);
const sql = readFileSync(migrationUrl, 'utf8');

assert.match(sql, /create table public\.player_profiles/i);
assert.match(sql, /user_id uuid primary key references auth\.users\s*\(id\) on delete cascade/i);
assert.match(sql, /username text not null/i);
assert.match(sql, /public_id text not null/i);
assert.match(sql, /create unique index player_profiles_username_lower_key[\s\S]*lower\s*\(username\)/i);
assert.match(sql, /username ~ '\^\[A-Za-z0-9_\]\{3,20\}\$'/i);
assert.match(sql, /public_id ~ '\^AETH-\[A-F0-9\]\{12\}\$'/i);
assert.match(sql, /insert into public\.player_profiles[\s\S]*from auth\.users/i);

assert.match(sql, /create schema if not exists private/i);
assert.match(sql, /create (?:or replace )?function private\.handle_new_auth_user\(\)/i);
assert.match(sql, /security definer/i);
assert.match(sql, /set search_path = ''/i);
assert.match(sql, /new\.raw_user_meta_data\s*->>\s*'username'/i);
assert.match(sql, /create trigger on_auth_user_created_player_profile/i);

assert.match(sql, /alter table public\.player_profiles enable row level security/i);
assert.match(sql, /revoke all on table public\.player_profiles from anon, authenticated/i);
assert.match(sql, /grant select on table public\.player_profiles to authenticated/i);
assert.match(sql, /create policy "select_own_player_profile"[\s\S]*to authenticated[\s\S]*\(select auth\.uid\(\)\) = user_id/i);

assert.match(sql, /create (?:or replace )?function public\.is_username_available\(candidate text\)/i);
assert.match(sql, /returns boolean/i);
assert.match(sql, /revoke all on function public\.is_username_available\(text\) from public/i);
assert.match(sql, /grant execute on function public\.is_username_available\(text\) to anon, authenticated/i);
assert.doesNotMatch(sql, /grant\s+(?:insert|update|delete)[^;]*player_profiles\s+to\s+(?:anon|authenticated)/i);

console.log('player profile migration security contract ok');
