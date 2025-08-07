'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

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
}

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  sender_type: 'company' | 'intern';
  created_at: string;
  sender?: {
    full_name: string;
    profile_photo_url?: string;
  };
  company?: {
    company_name: string;
    logo_url?: string;
  };
}

export default function ConversationPage() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'company' | 'intern' | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const params = useParams();
  const { intern_id, id: conversationId } = params;
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
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
      }
      setLoading(false);
    };

    getUser();
  }, []);

  useEffect(() => {
    const fetchConversation = async () => {
      if (!user || !conversationId) return;

      try {
        const { data, error } = await supabase
          .from('conversations')
          .select(`
            *,
            company:companies(company_name, logo_url),
            intern:interns(full_name, profile_photo_url)
          `)
          .eq('id', conversationId)
          .single();

        if (error) {
          setError('Conversation not found');
          return;
        }

        // Check if user has access to this conversation
        if (data.company_id !== user.id && data.intern_id !== user.id) {
          setError('You do not have access to this conversation');
          return;
        }

        setConversation(data);
      } catch (error) {
        console.error('Error fetching conversation:', error);
        setError('Failed to load conversation');
      }
    };

    if (user && conversationId) {
      fetchConversation();
    }
  }, [user, conversationId]);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
    }
  }, [conversation]);

  const fetchMessages = async () => {
    if (!conversation) return;

    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });

      if (response.ok) {
        setNewMessage('');
        await fetchMessages(); // Refresh messages
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderName = (message: Message) => {
    if (message.sender_type === 'company') {
      return message.company?.company_name || 'Company';
    } else {
      return message.sender?.full_name || 'User';
    }
  };

  const getSenderAvatar = (message: Message) => {
    if (message.sender_type === 'company') {
      return message.company?.logo_url;
    } else {
      return message.sender?.profile_photo_url;
    }
  };

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/messaging"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Messages
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/messaging"
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {userType === 'company' 
                    ? conversation.intern?.full_name || 'Unknown User'
                    : conversation.company?.company_name || 'Unknown Company'
                  }
                </h1>
                <p className="text-gray-600">Conversation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="bg-white rounded-lg shadow-lg h-96 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.sender_id === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className="flex-shrink-0">
                        {getSenderAvatar(message) ? (
                          <img
                            src={getSenderAvatar(message)}
                            alt="Avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-medium">
                              {getSenderName(message).charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${
                        isOwnMessage 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 