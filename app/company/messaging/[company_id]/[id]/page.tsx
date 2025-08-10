'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender_id: string;
  sender_type: 'company' | 'intern';
  created_at: string;
  sender?: {
    // For interns
    full_name?: string;
    profile_photo_url?: string;
    // For companies
    company_name?: string;
    logo_url?: string;
  };
}

export default function ChatArea() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { supabase, error: supabaseError } = useSupabase();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const conversationId = params.id as string;

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);

  useEffect(() => {
    if (!supabase) return;
    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return;
    }
    
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setError('Unauthorized');
          setLoading(false);
          return;
        }
        setUser(user);
        setLoading(false);
      } catch (error) {
        setError('Auth error');
        setLoading(false);
      }
    };
    checkAuth();

    // Test realtime connection
    console.log('🧪 Testing Supabase realtime connection...');
    const testChannel = supabase
      .channel('test-connection')
      .subscribe((status: any) => {
        console.log('🔗 Realtime connection test status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime is working!');
          supabase.removeChannel(testChannel);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('❌ Realtime connection failed:', status);
        }
      });

    return () => {
      supabase.removeChannel(testChannel);
    };
  }, [supabase, supabaseError]);

  useEffect(() => {
    if (user && conversationId) {
      fetchMessages();
      fetchConversation();
    }
  }, [user, conversationId]);

  // Add real-time subscription for new messages
  useEffect(() => {
    if (!conversationId || !supabase) return;

    console.log('🔄 Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: any) => {
          console.log('🎉 NEW MESSAGE RECEIVED via realtime:', payload);
          
          // Get the complete message data with sender info
          const response = await fetch(`/api/conversations/${conversationId}/messages`, {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            const newMessages = data.messages || [];
            
            console.log('📩 Fetched updated messages, count:', newMessages.length);
            
            // Only update if we have new messages to avoid unnecessary re-renders
            setMessages(prevMessages => {
              if (newMessages.length > prevMessages.length) {
                console.log('✅ Updating messages state with new messages');
                return newMessages;
              }
              console.log('⏭️ No new messages to add');
              return prevMessages;
            });
          } else {
            console.error('❌ Failed to fetch updated messages');
          }
          
          // Update conversation list for proper ordering
          window.dispatchEvent(new CustomEvent('conversation-updated'));
        }
      )
      .subscribe((status: any) => {
        console.log('📡 Realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 Cleaning up real-time subscription for conversation:', conversationId);
      supabase.removeChannel(channel);
    };
  }, [conversationId, supabase]);

  // Add polling fallback if realtime doesn't work
  useEffect(() => {
    if (!conversationId) return;

    console.log('🔄 Starting polling fallback for conversation:', conversationId);
    
    const pollForMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}/messages`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const newMessages = data.messages || [];
          
          setMessages(prevMessages => {
            if (newMessages.length > prevMessages.length) {
              console.log('📬 Polling detected new messages:', newMessages.length - prevMessages.length);
              return newMessages;
            }
            return prevMessages;
          });
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
      }
    };

    // Poll every 3 seconds
    const pollInterval = setInterval(pollForMessages, 3000);

    return () => {
      console.log('🛑 Stopping polling for conversation:', conversationId);
      clearInterval(pollInterval);
    };
  }, [conversationId]);

  const fetchConversation = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setConversation(data.conversation);
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      setError('Error fetching messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      console.log('📤 Sending message to conversationId:', conversationId);
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: newMessage.trim(),
        }),
      });
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Message sent successfully:', result);
        setNewMessage('');
        fetchMessages();
        window.dispatchEvent(new CustomEvent('conversation-updated'));
      } else {
        const errorData = await response.json();
        console.error('❌ Error sending message:', errorData);
        alert('Failed to send message: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Error sending message:', error);
      setError('Error sending message');
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderName = (message: Message) => {
    if (message.sender_type === 'company') {
      return message.sender?.company_name || 'Company';
    } else {
      return message.sender?.full_name || 'User';
    }
  };

  const getSenderAvatar = (message: Message) => {
    if (message.sender_type === 'company') {
      return message.sender?.logo_url;
    } else {
      return message.sender?.profile_photo_url;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center max-h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center max-h-full">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {conversation?.intern?.profile_photo_url ? (
              <img
                src={conversation.intern.profile_photo_url}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-sm font-medium">
                  {conversation?.intern?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {conversation?.intern?.full_name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500">Active conversation</p>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 max-h-full bg-gray-50 border border-gray-200 m-2 rounded-lg">
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
                      : 'bg-white text-gray-900 border border-gray-200'
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
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex space-x-4">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
  );
} 