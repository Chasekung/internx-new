import { useState, useEffect } from 'react';
import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // Check if environment variables are available
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase environment variables are not configured');
        return;
      }

      const client = createClientComponentClient();
      setSupabase(client);
      setError(null);
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      setError(err instanceof Error ? err.message : 'Failed to create Supabase client');
    }
  }, []);

  return { supabase, error };
} 