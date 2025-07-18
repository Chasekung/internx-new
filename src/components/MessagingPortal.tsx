'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

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

interface Announcement {
  id: string;
  title: string;
  content: string;
  sender_id: string;
  sender_type: 'company' | 'intern';
  recipient_id: string;
  recipient_type: 'company' | 'intern';
  created_at: string;
  read: boolean;
  company?: {
    company_name: string;
    logo_url?: string;
  };
  intern?: {
    full_name: string;
    profile_photo_url?: string;
  };
}

export default function MessagingPortal() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'company' | 'intern' | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');

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
        await fetchAnnouncements();
      }
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
        .or(`company_id.eq.${user?.id},intern_id.eq.${user?.id}`);

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:interns(full_name, profile_photo_url),
          company:companies(company_name, logo_url)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          company:companies(company_name, logo_url),
          intern:interns(full_name, profile_photo_url)
        `)
        .eq('recipient_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversation.id,
          content: newMessage.trim(),
          sender_id: user?.id,
          sender_type: userType === 'company' ? 'company' : 'intern'
        })
        .select()
        .single();

      if (error) throw error;

        setNewMessage('');
      await fetchMessages(selectedConversation.id);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to access messaging</p>
      </div>
    );
  }

  return (
    <div className="flex h-[600px] bg-white rounded-lg shadow-lg">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'messages'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'announcements'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Announcements
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'messages' ? (
            // Conversations List
            <div>
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Start a conversation to begin messaging</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getConversationAvatar(conversation) ? (
                          <img
                            src={getConversationAvatar(conversation)!}
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
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {getConversationName(conversation)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(conversation.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            // Announcements List
            <div>
              {announcements.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <p>No announcements yet</p>
                </div>
              ) : (
                announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border-b border-gray-100">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {announcement.company?.logo_url ? (
                          <img
                            src={announcement.company.logo_url}
                            alt="Company"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : announcement.intern?.profile_photo_url ? (
                          <img
                            src={announcement.intern.profile_photo_url}
                            alt="User"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-gray-600 text-xs font-medium">
                              {announcement.sender_type === 'company' ? 'C' : 'I'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {announcement.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {announcement.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(announcement.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeTab === 'messages' && (
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  {getConversationAvatar(selectedConversation) ? (
                    <img
                      src={getConversationAvatar(selectedConversation)!}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {getConversationName(selectedConversation).charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {getConversationName(selectedConversation)}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm mt-1">Choose a conversation from the sidebar to start messaging</p>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <p className="text-lg font-medium">Announcements</p>
            <p className="text-sm mt-1">View all your announcements here</p>
          </div>
        </div>
      )}
    </div>
  );
} 