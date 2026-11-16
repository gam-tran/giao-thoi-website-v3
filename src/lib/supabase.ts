import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Supabase client expects the project root URL, not the PostgREST endpoint.
// Normalize a mistakenly configured /rest/v1 suffix before creating the client.
const supabaseUrl = rawSupabaseUrl
  ?.trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
