import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const sql = readFileSync(
  new URL('../../supabase/migrations/20260719224945_add_username_change_cooldown.sql', import.meta.url),
  'utf8'
);

assert.match(sql, /alter table public\.player_profiles[\s\S]*add column username_changed_at timestamptz/i);
assert.match(sql, /create (?:or replace )?function private\.change_username_candidate\(candidate text\)/i);
assert.match(sql, /returns public\.player_profiles/i);
assert.match(sql, /security definer/i);
assert.match(sql, /set search_path = ''/i);
assert.match(sql, /auth\.uid\(\)/i);
assert.match(sql, /from public\.player_profiles[\s\S]*for update/i);
assert.match(sql, /username_changed_at[\s\S]*interval '24 hours'/i);
assert.match(sql, /candidate = btrim\(candidate\)/i);
assert.match(sql, /candidate ~ '\^\[A-Za-z0-9_\]\{3,20\}\$'/i);
assert.match(sql, /lower\(candidate\)[\s\S]*lower\([\w.]*username\)/i);
assert.match(sql, /when unique_violation[\s\S]*username_taken/i);
assert.match(sql, /username_change_cooldown/i);
assert.match(sql, /username_unchanged/i);
assert.match(sql, /update public\.player_profiles[\s\S]*username_changed_at = timezone\('utc', now\(\)\)/i);

assert.match(sql, /create (?:or replace )?function public\.change_username\(candidate text\)/i);
assert.match(sql, /security invoker/i);
assert.match(sql, /revoke all on function public\.change_username\(text\) from public, anon/i);
assert.match(sql, /grant execute on function public\.change_username\(text\) to authenticated/i);
assert.doesNotMatch(sql, /grant\s+update[^;]*player_profiles\s+to\s+(?:anon|authenticated)/i);

console.log('username change migration security contract ok');
