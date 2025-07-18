'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NewConversationModal from '@/components/NewConversationModal';

interface Conversation {
  id: string;
  company_id: string;
  intern_id: string;
  created_at: string;
  updated_at: string;
  company?: {
    company_name: string;
    logo_url?: string;
  };
  intern?: {
    full_name: string;
    profile_photo_url?: string;
  };
}

export default function MessagingPage() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'company' | 'intern' | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Determine user type by checking both tables
        try {
          const { data: company, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
          
          if (company && !companyError) {
            setUserType('company');
          } else {
            // If not a company, check if they're an intern
            const { data: intern, error: internError } = await supabase
              .from('interns')
              .select('id')
              .eq('id', user.id)
              .maybeSingle();
            
            if (intern && !internError) {
              setUserType('intern');
            } else {
              // Default to intern if we can't determine
              setUserType('intern');
            }
          }
        } catch (error) {
          console.error('Error determining user type:', error);
          // Default to intern if there's an error
          setUserType('intern');
        }
        
        await fetchConversations();
      }
      setLoading(false);
    };

    getUser();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          company:companies(company_name, logo_url),
          intern:interns(full_name, profile_photo_url)
        `)
        .or(`company_id.eq.${user?.id},intern_id.eq.${user?.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleConversationCreated = (conversationId: string) => {
    // Refresh conversations after creating a new one
    fetchConversations();
  };

  const getConversationName = (conversation: Conversation) => {
    if (userType === 'company') {
      return conversation.intern?.full_name || 'Unknown User';
    } else {
      return conversation.company?.company_name || 'Unknown Company';
    }
  };

  const getConversationAvatar = (conversation: Conversation) => {
    if (userType === 'company') {
      return conversation.intern?.profile_photo_url;
    } else {
      return conversation.company?.logo_url;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  useEffect(() => {
    if (user && userType) {
      router.replace(`/messaging/${user.id}`);
    }
  }, [user, userType, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show "not signed in" message if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to access messaging</h2>
            <p className="text-gray-600 mb-6">
              You need to be signed in to view and send messages. Please sign in to continue.
            </p>
            <Link
              href="/intern-sign-in"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="mt-2 text-gray-600">
                Connect with {userType === 'company' ? 'interns' : 'companies'} through messaging
              </p>
            </div>
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              New Conversation
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="bg-white rounded-lg shadow">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">Start a new conversation to begin messaging</p>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Conversation
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={`/messaging/${userType === 'company' ? conversation.intern_id : conversation.company_id}/${conversation.id}`}
                  className="block hover:bg-gray-50 transition-colors duration-150"
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getConversationAvatar(conversation) ? (
                          <img
                            src={getConversationAvatar(conversation)}
                            alt="Avatar"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">
                              {getConversationName(conversation).charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {getConversationName(conversation)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(conversation.updated_at)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          Last updated: {formatTime(conversation.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* New Conversation Modal */}
        {userType && (
          <NewConversationModal
            isOpen={showNewConversationModal}
            onClose={() => setShowNewConversationModal(false)}
            onConversationCreated={handleConversationCreated}
            userType={userType}
          />
        )}
      </div>
    </div>
  );
} 