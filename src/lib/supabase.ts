import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase: SupabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  // If env vars are missing, don't crash the app in the browser. Use a local placeholder
  // supabase client so the app can render and developers can see the UI. This is safe for
  // local debugging and preview; ensure you set `VITE_SUPABASE_URL` and
  // `VITE_SUPABASE_ANON_KEY` for real development or production environments.
  // eslint-disable-next-line no-console
  console.warn('Missing Supabase envs (VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY). Using placeholder client. Check `.env.local` or `.env` to set your Supabase URL and ANON key.');
  supabase = createClient('http://localhost:54321', 'anon');
} else {
  supabase = createClient<Database>(supabaseUrl as string, supabaseAnonKey as string);
}

export { supabase };
