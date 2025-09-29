'use client';

import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { checkLegacyUserStatus } from '@/lib/legacyAuthUtils';

export default function DebugLegacy() {
  const { supabase } = useSupabase();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDebugCheck = async () => {
    setLoading(true);
    try {
      const debugData: any = {
        timestamp: new Date().toISOString(),
        localStorage: {},
        supabaseSession: null,
        supabaseUser: null,
        legacyCheck: null,
        error: null
      };

      // Check localStorage
      if (typeof window !== 'undefined') {
        debugData.localStorage = {
          hasUser: !!localStorage.getItem('user'),
          hasToken: !!localStorage.getItem('token'),
          userData: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
        };
      }

      if (supabase) {
        // Check session
        try {
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          debugData.supabaseSession = {
            hasSession: !!session,
            error: sessionError?.message,
            userId: session?.user?.id,
            emailConfirmed: session?.user?.email_confirmed_at
          };
        } catch (e) {
          debugData.supabaseSession = { error: e instanceof Error ? e.message : 'Unknown error' };
        }

        // Check user
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          debugData.supabaseUser = {
            hasUser: !!user,
            error: userError?.message,
            userId: user?.id,
            email: user?.email,
            emailConfirmed: user?.email_confirmed_at,
            createdAt: user?.created_at
          };

          // Run legacy check if we have a user
          if (user?.id) {
            try {
              const legacyResult = await checkLegacyUserStatus(user.id);
              debugData.legacyCheck = legacyResult;
            } catch (legacyError) {
              debugData.legacyCheck = { error: legacyError instanceof Error ? legacyError.message : 'Unknown error' };
            }
          }
        } catch (e) {
          debugData.supabaseUser = { error: e instanceof Error ? e.message : 'Unknown error' };
        }
      }

      setDebugInfo(debugData);
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDebugCheck();
  }, [supabase]);

  const forceBypass = async () => {
    if (typeof window !== 'undefined') {
      // Set a flag in localStorage to force bypass
      localStorage.setItem('forceBypassEmailVerification', 'true');
      alert('Force bypass flag set. Refresh the page to see if it works.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Legacy Auth Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Debug Information</h2>
            <div className="space-x-2">
              <button
                onClick={runDebugCheck}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Refresh Debug Info'}
              </button>
              <button
                onClick={forceBypass}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Force Bypass (Emergency)
              </button>
            </div>
          </div>
          
          {debugInfo && (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Raw Debug Data:</h3>
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">localStorage Status</h3>
                  <p className="text-sm">
                    Has User: {debugInfo.localStorage?.hasUser ? '✅' : '❌'}<br/>
                    Has Token: {debugInfo.localStorage?.hasToken ? '✅' : '❌'}<br/>
                    User ID: {debugInfo.localStorage?.userData?.id || 'None'}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Supabase Status</h3>
                  <p className="text-sm">
                    Has Session: {debugInfo.supabaseSession?.hasSession ? '✅' : '❌'}<br/>
                    Has User: {debugInfo.supabaseUser?.hasUser ? '✅' : '❌'}<br/>
                    Email Confirmed: {debugInfo.supabaseUser?.emailConfirmed ? '✅' : '❌'}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">Legacy Check Result</h3>
                  {debugInfo.legacyCheck ? (
                    <p className="text-sm">
                      Is Legacy: {debugInfo.legacyCheck.isLegacyUser ? '✅' : '❌'}<br/>
                      Should Bypass: {debugInfo.legacyCheck.shouldBypassEmailVerification ? '✅' : '❌'}<br/>
                      Reason: {debugInfo.legacyCheck.reason || 'None'}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">No legacy check performed</p>
                  )}
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-800 mb-2">Expected Behavior</h3>
                  <p className="text-sm">
                    {debugInfo.legacyCheck?.shouldBypassEmailVerification 
                      ? '✅ Should bypass email verification'
                      : debugInfo.supabaseUser?.emailConfirmed
                      ? '✅ Email verified, should work normally'
                      : '❌ Should require email verification'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Quick Actions:</h3>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>• If you're still seeing the verification screen, click "Skip Verification" button</p>
            <p>• If that doesn't work, try the "Force Bypass (Emergency)" button above</p>
            <p>• Check the browser console for detailed logs starting with 🔍, ✅, or ❌</p>
            <p>• The legacy system should automatically detect existing users</p>
          </div>
        </div>
      </div>
    </div>
  );
}