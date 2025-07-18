'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MessagingPortal from '@/components/MessagingPortal';
import NewConversationModal from '@/components/NewConversationModal';
import CreateAnnouncementModal from '@/components/CreateAnnouncementModal';

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

export default function CompanyMessagingPage() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'company' | 'intern' | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const companyId = params.company_id as string;
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          router.push('/company-sign-in');
          return;
        }

        // Check if user is a company
        const { data: companyProfile } = await supabase
          .from('companies')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!companyProfile) {
          router.push('/company-sign-in');
          return;
        }

        setUser(user);
        setUserType('company');
        setLoading(false);
      } catch (error) {
        console.error('Auth error:', error);
        router.push('/company-sign-in');
      }
    };

    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    if (user && userType === 'company') {
      fetchConversations();
    }
  }, [user, userType]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleConversationCreated = (conversationId: string) => {
    router.push(`/company/messaging/${companyId}/${conversationId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || userType !== 'company') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="mt-2 text-gray-600">Manage your conversations with interns</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Message Intern
              </button>
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Send Announcement
              </button>
            </div>
          </div>
        </div>

        {/* Messaging Portal */}
        <MessagingPortal />

        {/* New Conversation Modal */}
        <NewConversationModal
          isOpen={showNewConversationModal}
          onClose={() => setShowNewConversationModal(false)}
          onConversationCreated={handleConversationCreated}
          userType="company"
        />

        {/* Create Announcement Modal */}
        <CreateAnnouncementModal
          isOpen={showAnnouncementModal}
          onClose={() => setShowAnnouncementModal(false)}
          onAnnouncementCreated={() => {
            // Refresh the messaging portal to show new announcements
            // The portal will refresh automatically when the modal closes
          }}
        />
      </div>
    </div>
  );
} 