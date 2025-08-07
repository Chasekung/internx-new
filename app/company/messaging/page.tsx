'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import MessagingPortal from '@/components/MessagingPortal';
import NewConversationModal from '@/components/NewConversationModal';
import CreateAnnouncementModal from '@/components/CreateAnnouncementModal';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

export default function CompanyMessagingPage() {
  const [user, setUser] = useState<any>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);
  const router = useRouter();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Redirect to company-specific messaging route
        router.replace(`/company/messaging/${user.id}`);
      } else {
        // Redirect to company sign-in if not authenticated
        router.push('/company-sign-in');
        return;
      }
      setLoading(false);
    };

    getUser();
  }, [supabase, router]);

  const handleConversationCreated = (conversationId: string) => {
    // You can add logic here to refresh the messaging portal
    // For now, the portal will refresh automatically when the modal closes
  };

  const handleAnnouncementCreated = () => {
    // Refresh the messaging portal to show new announcements
    // The portal will refresh automatically when the modal closes
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render anything if redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Company Messages</h1>
              <p className="mt-2 text-gray-600">
                Connect with interns through messaging and announcements
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                Message Intern
              </button>
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                Send Announcement
              </button>
            </div>
          </div>
        </div>

        {/* Messaging Portal */}
        <div className={isMobileView ? "h-[calc(100vh-200px)]" : ""}>
          <MessagingPortal />
        </div>

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
          onAnnouncementCreated={handleAnnouncementCreated}
        />
      </div>
    </div>
  );
} 