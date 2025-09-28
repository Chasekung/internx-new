'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

export default function DebugUsers() {
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (supabase) {
      fetchUsers();
    }
  }, [supabase]);

  const fetchUsers = async () => {
    try {
      // Get the current user (admin) session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log('No session found');
        setIsLoading(false);
        return;
      }

      // Get interns data to see email verification status
      const { data: internsData, error: internsError } = await supabase
        .from('interns')
        .select('id, email, full_name, username, created_at')
        .limit(10);

      if (internsError) {
        console.error('Error fetching interns:', internsError);
        setIsLoading(false);
        return;
      }

      // For each intern, get their auth user data to check email verification
      const usersWithVerification = [];
      
      for (const intern of internsData || []) {
        try {
          // Try to get user auth data
          const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(intern.id);
          
          usersWithVerification.push({
            ...intern,
            email_confirmed_at: user?.email_confirmed_at || null,
            auth_user_id: user?.id || null,
            auth_error: userError?.message || null
          });
        } catch (error) {
          usersWithVerification.push({
            ...intern,
            email_confirmed_at: null,
            auth_user_id: null,
            auth_error: 'Failed to fetch auth data'
          });
        }
      }

      setUsers(usersWithVerification);
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateUnverifiedUser = async () => {
    try {
      // Create a test user without email verification
      const testEmail = `test-unverified-${Date.now()}@example.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          emailRedirectTo: 'http://localhost:3000/auth/callback',
          data: {
            name: 'Test Unverified User',
            role: 'INTERN',
            username: `test-unverified-${Date.now()}`
          }
        }
      });

      if (error) {
        alert(`Error creating test user: ${error.message}`);
      } else {
        alert(`Test unverified user created: ${testEmail}`);
        fetchUsers(); // Refresh the list
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading users...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Users - Email Verification Status</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Users and Email Verification Status</h2>
            <button
              onClick={testCreateUnverifiedUser}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Create Test Unverified User
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Username</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Full Name</th>
                  <th className="px-4 py-2 text-left">Created At</th>
                  <th className="px-4 py-2 text-left">Email Verified</th>
                  <th className="px-4 py-2 text-left">Verified At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-2">{user.username}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.full_name}</td>
                    <td className="px-4 py-2">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        user.email_confirmed_at 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.email_confirmed_at ? '✅ Verified' : '❌ Not Verified'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {user.email_confirmed_at 
                        ? new Date(user.email_confirmed_at).toLocaleString()
                        : 'Not verified'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {users.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No users found
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>This page shows all users and their email verification status</li>
            <li>Users created before email verification was enabled might show as verified</li>
            <li>Click "Create Test Unverified User" to create a user that requires verification</li>
            <li>Then try signing in with that user to test the verification flow</li>
          </ol>
        </div>
      </div>
    </div>
  );
}