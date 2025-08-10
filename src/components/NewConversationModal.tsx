'use client';

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  profile_photo_url?: string;
  logo_url?: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string) => void;
  userType: 'company' | 'intern';
}

export default function NewConversationModal({
  isOpen,
  onClose,
  onConversationCreated,
  userType
}: NewConversationModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Helper to get intern IDs already in a conversation with this company
  const [existingInternIds, setExistingInternIds] = useState<string[]>([]);
  const { supabase, error: supabaseError } = useSupabase();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);
  useEffect(() => {
    if (isOpen && userType === 'company') {
      (async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        // Get company ID from user
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('id', user.id)
          .single();
        if (!company) return;
        // Fetch all conversations for this company
        const response = await fetch('/api/conversations');
        if (response.ok) {
          const { conversations } = await response.json();
          setExistingInternIds(conversations.map((c: any) => c.intern_id));
        }
      })();
    }
  }, [isOpen, userType]);

  // Filter out users already in a conversation (for company)
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (userType !== 'company' || !existingInternIds.includes(user.id))
  );

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users based on user type
      if (userType === 'company') {
        // Companies can only message interns who have submitted applications
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.error('No authenticated user found');
          return;
        }

        // Get company ID from user
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!company) {
          console.error('Company not found for user');
          return;
        }

        // Use the new API to get only eligible interns
        const response = await fetch(`/api/companies/eligible-interns?companyId=${company.id}`);
        const { interns } = await response.json();
        
        if (interns) {
          setUsers(interns.map((intern: any) => ({
            ...intern,
            name: intern.full_name
          })));
        }
      } else {
        // Interns can message companies
        const { data: companies } = await supabase
          .from('companies')
          .select('id, company_name, logo_url')
          .order('company_name');
        
        if (companies) {
          setUsers(companies.map((company: { id: string; company_name: string; logo_url?: string | null }) => ({
            ...company,
            name: company.company_name
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async () => {
    if (!selectedUser || creating) return;

    setCreating(true);
    try {
      let companyId = null;
      let internId = null;
      if (userType === 'company') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert('No authenticated user found');
          setCreating(false);
          return;
        }
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('id', user.id)
          .single();
        companyId = company?.id;
        internId = selectedUser.id;
      } else {
        // userType === 'intern'
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert('No authenticated user found');
          setCreating(false);
          return;
        }
        companyId = selectedUser.id;
        internId = user.id;
      }

      // First validate the conversation
      const validationResponse = await fetch('/api/conversations/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          internId,
        }),
      });

      if (!validationResponse.ok) {
        const errorData = await validationResponse.json();
        console.error('Validation failed:', errorData);
        alert('Failed to validate conversation: ' + (errorData.error || 'Unknown error'));
        return;
      }

      // Create the conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          intern_id: internId,
        }),
      });

      const data = await response.json();
      if (response.ok && data.conversation) {
        console.log('Conversation created/found successfully:', data.conversation);
        onConversationCreated(data.conversation.id);
        onClose();
        setSelectedUser(null);
        setSearchTerm('');
      } else {
        console.error('Error creating conversation:', data);
        alert('Failed to create conversation: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Failed to create conversation. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Start New Conversation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder={`Search ${userType === 'company' ? 'interns' : 'companies'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                {userType === 'company' 
                  ? 'No interns have submitted applications to your company yet. You can only message interns who have applied to your positions.'
                  : 'No companies found'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`p-3 rounded-lg cursor-pointer border ${
                    selectedUser?.id === user.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {user.profile_photo_url || user.logo_url ? (
                        <img
                          src={user.profile_photo_url || user.logo_url}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 text-sm font-medium">
                            {user.name?.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {user.name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={createConversation}
            disabled={!selectedUser || creating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Start Conversation'}
          </button>
        </div>
      </div>
    </div>
  );
} 