import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export interface SupabaseEnvironment {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

export const getSupabaseConfiguration = (environment: SupabaseEnvironment) => {
  const url = environment.VITE_SUPABASE_URL?.trim();
  const publishableKey = environment.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || !publishableKey) return null;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) return null;
  } catch {
    return null;
  }
  return { url, publishableKey };
};

const viteEnvironment = (import.meta as ImportMeta & { env?: SupabaseEnvironment }).env ?? {};
export const supabaseConfiguration = getSupabaseConfiguration(viteEnvironment);
export const isSupabaseConfigured = supabaseConfiguration !== null;

export const supabase = supabaseConfiguration
  ? createClient<Database>(supabaseConfiguration.url, supabaseConfiguration.publishableKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    })
  : null;
