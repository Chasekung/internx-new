import { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';

export function useSupabase(): { supabase: SupabaseClient; error: string | null } {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stubClient = useMemo(() => {
    const message = 'Supabase client is not initialized';
    // Create a proxy that throws on any access; typed as SupabaseClient to avoid null unions in consumers
    return new Proxy({} as SupabaseClient, {
      get() {
        throw new Error(message);
      },
      apply() {
        throw new Error(message);
      }
    });
  }, []);

  useEffect(() => {
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Supabase environment variables are not configured');
        setClient(null);
        return;
      }

      const created = createClientComponentClient();
      setClient(created);
      setError(null);
    } catch (err) {
      console.error('Failed to create Supabase client:', err);
      setError(err instanceof Error ? err.message : 'Failed to create Supabase client');
      setClient(null);
    }
  }, []);

  return { supabase: client ?? stubClient, error };
}