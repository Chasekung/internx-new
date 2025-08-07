'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MessagingPortal from '@/components/MessagingPortal';
import NewConversationModal from '@/components/NewConversationModal';

export default function MessagingPage() {
  const [user, setUser] = useState<any>(null);
  const [userType, setUserType] = useState<'company' | 'intern' | null>(null);
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
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

  const handleConversationCreated = async (conversationId: string) => {
    // The MessagingPortal will handle refreshing conversations
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
              <p className="mt-2 text-gray-600">
                Connect with {userType === 'company' ? 'interns' : 'companies'} through messaging
              </p>
            </div>
            {userType === 'company' && (
              <button
                onClick={() => setShowNewConversationModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm sm:text-base"
              >
                Start Conversation
              </button>
            )}
          </div>
        </div>

        {/* Messaging Portal */}
        <div className={isMobileView ? "h-[calc(100vh-200px)]" : ""}>
          <MessagingPortal />
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