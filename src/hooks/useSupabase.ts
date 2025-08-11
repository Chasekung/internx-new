import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';

export function useSupabase(): { supabase: SupabaseClient; error: string | null } {
  // Create the client synchronously in client components
  const supabase = createClientComponentClient();
  // Optionally surface an error if envs are missing, but still return a usable client
  const envMissing = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const error = envMissing ? 'Supabase environment variables are not configured' : null;
  return { supabase, error };
}