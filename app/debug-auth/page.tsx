'use client';

import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { syncAuthState } from '@/lib/authSync';

export default function DebugAuth() {
  const { supabase } = useSupabase();
  const [status, setStatus] = useState('Ready');
  const [sessionData, setSessionData] = useState<any>(null);
  const [localStorageData, setLocalStorageData] = useState<any>(null);

  const checkCurrentState = async () => {
    setStatus('Checking...');
    try {
      if (!supabase) {
        setStatus('Supabase not available');
        return;
      }

      // Get Supabase session
      const { data: { session }, error } = await supabase.auth.getSession();
      setSessionData(session);

      // Get localStorage data
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let user = null;
      try {
        user = userStr ? JSON.parse(userStr) : null;
      } catch (e) {
        user = 'Invalid JSON';
      }

      setLocalStorageData({ token, user });
      setStatus('State checked');
    } catch (error) {
      setStatus(`Error: ${error}`);
    }
  };

  const syncAuth = async () => {
    setStatus('Syncing...');
    try {
      const result = await syncAuthState();
      setStatus(result ? 'Sync successful' : 'Sync failed');
      // Refresh state
      await checkCurrentState();
    } catch (error) {
      setStatus(`Sync error: ${error}`);
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setStatus('Cleared localStorage');
    checkCurrentState();
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setStatus('Signed out');
      checkCurrentState();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status: {status}</h2>
          
          <div className="space-x-4">
            <button
              onClick={checkCurrentState}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Check Current State
            </button>
            
            <button
              onClick={syncAuth}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Sync Auth State
            </button>
            
            <button
              onClick={clearAuth}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Clear localStorage
            </button>
            
            <button
              onClick={signOut}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Supabase Session</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(sessionData, null, 2)}
            </pre>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">localStorage Data</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(localStorageData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Check Current State</strong> - See what's currently stored in both Supabase session and localStorage</li>
            <li><strong>Sync Auth State</strong> - Automatically synchronize the authentication state between Supabase and localStorage</li>
            <li><strong>Clear localStorage</strong> - Remove all auth data from localStorage (useful for testing)</li>
            <li><strong>Sign Out</strong> - Sign out from Supabase (clears session)</li>
          </ol>
          
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <p className="text-blue-800">
              <strong>Common Issue:</strong> If you're signed in to Supabase but the website doesn't recognize you, 
              click "Sync Auth State" to fix the mismatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}