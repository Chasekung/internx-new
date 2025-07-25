'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  latest_message?: {
    content: string;
    created_at: string;
    sender_type: 'company' | 'intern';
  };
}

export default function MessagingPage() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'company' | 'intern' | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          setLoading(false);
          return;
        }
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
        
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        setLoading(false);
      }
    };
    checkAuth();
  }, [supabase]);

  useEffect(() => {
    if (user && userType) {
      fetchConversations();
    }
    // Listen for conversation-updated event to refresh conversations
    const handleUpdate = () => fetchConversations();
    window.addEventListener('conversation-updated', handleUpdate);
    return () => {
      window.removeEventListener('conversation-updated', handleUpdate);
    };
  }, [user, userType]);

  // Add real-time subscription for conversation updates
  useEffect(() => {
    if (!user || !userType) return;

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
  }, [user, userType, supabase]);

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
    // Auto-select the new conversation
    setTimeout(() => {
      const newConv = conversations.find(c => c.id === conversationId);
      if (newConv) {
        setSelectedConversation(newConv);
      }
    }, 100);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="mt-2 text-gray-600">
                Connect with {userType === 'company' ? 'interns' : 'companies'} through messaging
              </p>
            </div>
            {userType === 'company' && (
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Conversation
              </button>
            )}
          </div>
        </div>

        {/* Messaging Interface */}
        <div className="bg-white rounded-lg shadow-lg h-[600px] flex">
          {/* Conversation List - Left Side */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
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
                  <p className="text-gray-600 mb-4">
                    {userType === 'company' 
                      ? 'Start a new conversation to begin messaging interns' 
                      : 'Companies will reach out to you here when they are interested in your application'
                    }
                  </p>
                  {userType === 'company' && (
                    <button
                      onClick={() => setShowNewConversationModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Start Conversation
                    </button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`w-full p-4 text-left hover:bg-gray-50 transition-colors duration-150 ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
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
                              {conversation.latest_message.sender_type === userType ? 'You: ' : ''}
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

          {/* Chat Area - Right Side */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <ChatArea 
                conversation={selectedConversation} 
                user={user} 
                userType={userType} 
                onMessageSent={() => {
                  fetchConversations();
                  window.dispatchEvent(new CustomEvent('conversation-updated'));
                }}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
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

// Chat Area Component
function ChatArea({ 
  conversation, 
  user, 
  userType,
  onMessageSent
}: { 
  conversation: Conversation; 
  user: any; 
  userType: 'company' | 'intern' | null;
  onMessageSent: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
  }, [conversation]);

  // Add real-time subscription for new messages
  useEffect(() => {
    if (!conversation || !conversation.id) return;

    console.log('🔄 INTERN: Setting up real-time subscription for conversation:', conversation.id);

    const supabase = createClientComponentClient();
    const channel = supabase
      .channel(`messages-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation.id}`,
        },
        async (payload) => {
          console.log('🎉 INTERN: NEW MESSAGE RECEIVED via realtime:', payload);
          
          // Get the complete message data with sender info
          const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
            credentials: 'include'
          });
          if (response.ok) {
            const data = await response.json();
            const newMessages = data.messages || [];
            
            console.log('📩 INTERN: Fetched updated messages, count:', newMessages.length);
            
            // Only update if we have new messages to avoid unnecessary re-renders
            setMessages(prevMessages => {
              if (newMessages.length > prevMessages.length) {
                console.log('✅ INTERN: Updating messages state with new messages');
                return newMessages;
              }
              console.log('⏭️ INTERN: No new messages to add');
              return prevMessages;
            });
          } else {
            console.error('❌ INTERN: Failed to fetch updated messages');
          }
          
          // Update conversation list
          onMessageSent();
        }
      )
      .subscribe((status) => {
        console.log('📡 INTERN: Realtime subscription status:', status);
      });

    return () => {
      console.log('🔌 INTERN: Cleaning up real-time subscription for conversation:', conversation.id);
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  // Add polling fallback if realtime doesn't work
  useEffect(() => {
    if (!conversation || !conversation.id) return;

    console.log('🔄 INTERN: Starting polling fallback for conversation:', conversation.id);
    
    const pollForMessages = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const newMessages = data.messages || [];
          
          setMessages(prevMessages => {
            if (newMessages.length > prevMessages.length) {
              console.log('📬 INTERN: Polling detected new messages:', newMessages.length - prevMessages.length);
              return newMessages;
            }
            return prevMessages;
          });
        }
      } catch (error) {
        console.error('❌ INTERN: Polling error:', error);
      }
    };

    // Poll every 3 seconds
    const pollInterval = setInterval(pollForMessages, 3000);

    return () => {
      console.log('🛑 INTERN: Stopping polling for conversation:', conversation.id);
      clearInterval(pollInterval);
    };
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/conversations/${conversation.id}/messages`, {
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
        setNewMessage('');
        await fetchMessages();
        onMessageSent();
      } else {
        const errorData = await response.json();
        console.error('Error sending message:', errorData);
        alert('Failed to send message: ' + (errorData.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSenderName = (message: any) => {
    if (message.sender_type === 'company') {
      return message.sender?.company_name || 'Company';
    } else {
      return message.sender?.full_name || 'User';
    }
  };

  const getSenderAvatar = (message: any) => {
    if (message.sender_type === 'company') {
      return message.sender?.logo_url;
    } else {
      return message.sender?.profile_photo_url;
    }
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

  return (
    <div className="h-full flex flex-col max-h-full">
      {/* Chat Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getConversationAvatar(conversation) ? (
              <img
                src={getConversationAvatar(conversation)}
                alt="Profile"
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
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {getConversationName(conversation)}
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
                    <p className={`text-sm ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>{message.content}</p>
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