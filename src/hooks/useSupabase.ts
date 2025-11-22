import { useState, useEffect } from 'react';
import { createClientComponentClient, SupabaseClient } from '@supabase/auth-helpers-nextjs';

export function useSupabase() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔍 [useSupabase] Hook initializing...');
    console.log('🔍 [useSupabase] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('🔍 [useSupabase] Key exists?', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.error('❌ [useSupabase] Environment variables missing');
        setError('Supabase environment variables are not configured');
        setSupabase(null);
        return;
      }

      console.log('🔍 [useSupabase] Creating client...');
      const client = createClientComponentClient();
      console.log('✅ [useSupabase] Client created:', !!client);
      setSupabase(client);
      setError(null);
    } catch (err) {
      console.error('❌ [useSupabase] Failed to create Supabase client:', err);
      setError(err instanceof Error ? err.message : 'Failed to create Supabase client');
      setSupabase(null);
    }
  }, []);

  console.log('🔍 [useSupabase] Returning supabase:', !!supabase, 'error:', error);
  return { supabase, error };
}