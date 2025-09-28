'use client';

import { useState } from 'react';
import { checkLegacyUserStatus } from '@/lib/legacyAuthUtils';
import { useSupabase } from '@/hooks/useSupabase';

export default function TestLegacyAuth() {
  const { supabase } = useSupabase();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const testLegacyStatus = async () => {
    if (!userId.trim()) {
      alert('Please enter a user ID');
      return;
    }

    setLoading(true);
    try {
      const result = await checkLegacyUserStatus(userId.trim());
      setTestResults(result);
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUser = async () => {
    if (!supabase) return;
    
    setLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        setTestResults({ error: error.message });
      } else if (user) {
        setUserId(user.id);
        const result = await checkLegacyUserStatus(user.id);
        setTestResults({
          currentUser: {
            id: user.id,
            email: user.email,
            email_confirmed_at: user.email_confirmed_at,
            created_at: user.created_at
          },
          legacyCheck: result
        });
      } else {
        setTestResults({ message: 'No user currently signed in' });
      }
    } catch (error) {
      setTestResults({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorage = () => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    setTestResults({
      localStorage: {
        hasUser: !!storedUser,
        hasToken: !!storedToken,
        userData: storedUser ? JSON.parse(storedUser) : null
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Legacy Auth Testing</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Legacy User Status</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID to test:
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter user UUID"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={testLegacyStatus}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Legacy Status'}
              </button>
              
              <button
                onClick={getCurrentUser}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Check Current User'}
              </button>
              
              <button
                onClick={checkLocalStorage}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Check localStorage
              </button>
            </div>
          </div>
        </div>

        {testResults && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">How it works:</h3>
          <ul className="text-yellow-700 space-y-1 text-sm">
            <li>• <strong>Legacy users</strong> are identified by having existing localStorage data or valid sessions</li>
            <li>• Users created more than 1 hour ago are considered legacy</li>
            <li>• Legacy users can bypass email verification requirements</li>
            <li>• The system attempts to automatically confirm their emails</li>
            <li>• This ensures existing users aren't locked out by new email verification requirements</li>
          </ul>
        </div>
      </div>
    </div>
  );
}