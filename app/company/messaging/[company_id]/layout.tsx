"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useParams } from "next/navigation";
import NewConversationModal from "@/components/NewConversationModal";
import { checkCompanyAuth } from "@/lib/companyAuth";

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

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
  latest_message?: {
    content: string;
    created_at: string;
    sender_type: 'company' | 'intern';
  };
}

export default function MessagingLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);
  const router = useRouter();
  const params = useParams();
  const companyId = params.company_id as string;
  const conversationId = params.id as string | undefined;

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
    const checkAuth = async () => {
      try {
        const { isCompany, user, error } = await checkCompanyAuth();
        
        if (!isCompany || !user) {
          console.log('Company auth failed:', error);
          router.push("/company-sign-in");
          return;
        }

        // Verify the company ID in the URL matches the authenticated user
        if (user.id !== companyId) {
          console.log('Company ID mismatch');
          router.push("/company-sign-in");
          return;
        }

        setUser(user);
        setLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/company-sign-in");
      }
    };
    checkAuth();
  }, [supabase, router, companyId]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
    // Listen for conversation-updated event to refresh conversations
    const handleUpdate = () => fetchConversations();
    window.addEventListener('conversation-updated', handleUpdate);
    return () => {
      window.removeEventListener('conversation-updated', handleUpdate);
    };
  }, [user]);

  // Add real-time subscription for conversation updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'conversations',
        },
        async (payload) => {
          console.log('Conversation updated:', payload);
          // Refresh conversations when any conversation changes
          await fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          console.log('Message updated:', payload);
          // Refresh conversations when messages change (for latest message preview)
          await fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  const fetchConversations = async () => {
    try {
      const response = await fetch("/api/conversations", {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  };

  const handleConversationCreated = async (conversationId: string) => {
    await fetchConversations();
    router.push(`/company/messaging/${companyId}/${conversationId}`);
  };

  const getConversationName = (conversation: Conversation) => {
    return conversation.intern?.full_name || "Unknown User";
  };

  const getConversationAvatar = (conversation: Conversation) => {
    return conversation.intern?.profile_photo_url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg h-[calc(100vh-12rem)] max-h-[700px] flex overflow-hidden border-2 border-blue-100">
          {/* Conversation List - Left Side */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
            <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
              >
                Start Conversation
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-gray-600 mb-4">Start a new conversation to begin messaging interns</p>
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
                    <button
                      key={conversation.id}
                      onClick={() => router.push(`/company/messaging/${companyId}/${conversation.id}`)}
                      className={`w-full p-4 text-left hover:bg-gray-100 transition-colors duration-150 ${
                        conversationId === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getConversationAvatar(conversation) ? (
                            <img
                              src={getConversationAvatar(conversation)}
                              alt="Avatar"
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
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
                            <p className="text-xs text-gray-500">
                              {conversation.latest_message ? 
                                new Date(conversation.latest_message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                                new Date(conversation.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            </p>
                          </div>
                          {conversation.latest_message && (
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {conversation.latest_message.sender_type === 'company' ? 'You: ' : ''}
                              {conversation.latest_message.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Right Panel: Child Route */}
          <div className="flex-1 flex flex-col overflow-hidden h-full bg-white">
            {children}
          </div>
        </div>
        {/* New Conversation Modal */}
        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onConversationCreated={handleConversationCreated}
          userType="company"
        />
      </div>
    </div>
  );
} 