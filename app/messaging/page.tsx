'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import MessagingPortal from '@/components/MessagingPortal';
import NewConversationModal from '@/components/NewConversationModal';

export default function MessagingPage() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'company' | 'intern' | null>(null);
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
      } else {
        // Redirect to intern sign-in if not authenticated
        router.push('/intern-sign-in');
        return;
      }
      setLoading(false);
    };

    getUser();
  }, [router]);

  const handleConversationCreated = (conversationId: string) => {
    // You can add logic here to refresh the messaging portal
    // For now, the portal will refresh automatically when the modal closes
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
            <button
              onClick={() => setShowNewConversationModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              New Conversation
            </button>
          </div>
        </div>

        {/* Messaging Portal */}
        <MessagingPortal />

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