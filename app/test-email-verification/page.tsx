'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

export default function TestEmailVerification() {
  const { supabase } = useSupabase();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUserStatus();
  }, [supabase]);

  const checkUserStatus = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      setUserInfo({
        session: session ? 'Yes' : 'No',
        user: user ? {
          id: user.id,
          email: user.email,
          emailVerified: user.email_confirmed_at ? 'Yes ✅' : 'No ❌',
          emailVerifiedAt: user.email_confirmed_at,
          createdAt: user.created_at
        } : null
      });
    } catch (error) {
      console.error('Error checking user status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Email Verification Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
          
          <div className="space-y-4">
            <div>
              <strong>Has Session:</strong> {userInfo?.session || 'Unknown'}
            </div>
            
            {userInfo?.user ? (
              <div className="space-y-2">
                <div><strong>User ID:</strong> {userInfo.user.id}</div>
                <div><strong>Email:</strong> {userInfo.user.email}</div>
                <div><strong>Email Verified:</strong> {userInfo.user.emailVerified}</div>
                {userInfo.user.emailVerifiedAt && (
                  <div><strong>Verified At:</strong> {new Date(userInfo.user.emailVerifiedAt).toLocaleString()}</div>
                )}
                <div><strong>Account Created:</strong> {new Date(userInfo.user.createdAt).toLocaleString()}</div>
              </div>
            ) : (
              <div>No user data (not logged in)</div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={checkUserStatus}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Status
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>This page shows your current authentication and email verification status</li>
            <li>If "Email Verified" shows "No ❌", you need to verify your email</li>
            <li>Try accessing protected pages like <a href="/intern-dash" className="text-blue-600 underline">/intern-dash</a> to test the verification guard</li>
            <li>If you're logged in but email is not verified, you should be prompted to verify</li>
          </ol>
        </div>
      </div>
    </div>
  );
}