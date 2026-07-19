import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getSupabaseConfiguration } from './supabaseClient';

assert.equal(getSupabaseConfiguration({}), null);
assert.equal(getSupabaseConfiguration({ VITE_SUPABASE_URL: 'https://example.supabase.co' }), null);
assert.deepEqual(
  getSupabaseConfiguration({
    VITE_SUPABASE_URL: 'https://example.supabase.co',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test'
  }),
  {
    url: 'https://example.supabase.co',
    publishableKey: 'sb_publishable_test'
  }
);
assert.equal(
  getSupabaseConfiguration({
    VITE_SUPABASE_URL: 'not-a-url',
    VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test'
  }),
  null
);

const dataSource = readFileSync(new URL('./supabaseCloudSaveDataSource.ts', import.meta.url), 'utf8');
assert.match(dataSource, /from\(['"]game_saves['"]\)/);
assert.match(dataSource, /eq\(['"]user_id['"],\s*userId\)/);
assert.match(dataSource, /eq\(['"]revision['"],\s*expectedRevision\)/);
assert.match(dataSource, /maybeSingle\(\)/);
assert.match(dataSource, /updated_at:\s*new Date\(\)\.toISOString\(\)/);

console.log('supabase client configuration and data source contract ok');
