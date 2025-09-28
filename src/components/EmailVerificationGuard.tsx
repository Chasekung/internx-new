'use client';

import { useEffect, useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useRouter } from 'next/navigation';
import { checkLegacyUserStatus } from '@/lib/legacyAuthUtils';

interface EmailVerificationGuardProps {
  children: React.ReactNode;
  requireVerification?: boolean; // Only check verification if explicitly required
}

export default function EmailVerificationGuard({ children, requireVerification = false }: EmailVerificationGuardProps) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    console.log('🔐 EmailVerificationGuard: useEffect triggered', { requireVerification, hasSupabase: !!supabase });
    
    // Check for force bypass flag
    if (typeof window !== 'undefined' && localStorage.getItem('forceBypassEmailVerification') === 'true') {
      console.log('🚨 EmailVerificationGuard: Force bypass flag detected, skipping verification');
      setIsVerified(true);
      setIsLoading(false);
      return;
    }
    
    if (requireVerification) {
      console.log('🔍 EmailVerificationGuard: Starting verification check...');
      checkEmailVerification();
    } else {
      console.log('⏭️ EmailVerificationGuard: Verification not required, skipping...');
      setIsVerified(true);
      setIsLoading(false);
    }
  }, [supabase, requireVerification]);

  const checkEmailVerification = async () => {
    console.log('🔍 EmailVerificationGuard: Starting check...');
    if (!supabase) {
      console.log('❌ EmailVerificationGuard: No supabase client');
      setIsLoading(false);
      return;
    }

    try {
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('📅 EmailVerificationGuard: Session check result:', !!session);
      
      if (sessionError || !session) {
        // No session, let them through (not logged in)
        setIsVerified(true);
        setIsLoading(false);
        return;
      }

      // Get user data to check email verification
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      console.log('👤 EmailVerificationGuard: User check result:', !!user, userError?.message);
      
      if (userError || !user) {
        console.log('❌ EmailVerificationGuard: No user found, allowing through');
        setIsVerified(true);
        setIsLoading(false);
        return;
      }

      // Check if email is verified
      const emailVerified = user.email_confirmed_at !== null;
      
      // Check if user is a legacy user who should bypass email verification
      let isLegacyUser = false;
      let legacyReason = '';
      
      if (!emailVerified) {
        try {
          console.log('🔍 EmailVerificationGuard: Checking legacy user status for unverified email...');
          const legacyCheck = await checkLegacyUserStatus(user.id);
          isLegacyUser = legacyCheck.shouldBypassEmailVerification;
          legacyReason = legacyCheck.reason || '';
          
          if (isLegacyUser) {
            console.log(`✅ EmailVerificationGuard: Legacy user detected - ${legacyReason}`);
            
            // Try to automatically confirm their email
            try {
              const confirmResponse = await fetch('/api/auth/legacy-confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
                  email: user.email,
                  userType: 'intern' // Default to intern, could be enhanced to detect type
                })
              });
              
              if (confirmResponse.ok) {
                console.log('✅ EmailVerificationGuard: Successfully confirmed legacy user email');
              } else {
                console.log('⚠️ EmailVerificationGuard: Legacy email confirmation failed, but allowing through');
              }
            } catch (confirmError) {
              console.log('⚠️ EmailVerificationGuard: Legacy email confirmation request failed, but allowing through');
            }
          }
        } catch (legacyError) {
          console.error('❌ EmailVerificationGuard: Error checking legacy status:', legacyError);
        }
      }
      
      console.log('📧 EmailVerificationGuard: Email verification status:', {
        email: user.email,
        emailVerified,
        email_confirmed_at: user.email_confirmed_at,
        userCreatedDate: user.created_at,
        isLegacyUser,
        legacyReason,
        finalVerificationStatus: emailVerified || isLegacyUser
      });
      
      // Final verification status: must be verified OR be a legacy user
      const finalEmailVerified = emailVerified || isLegacyUser;
      
      setUserEmail(user.email || '');
      setIsVerified(finalEmailVerified);
      setIsLoading(false);

      // If not verified (including re-verification needed), show verification screen
      if (!finalEmailVerified) {
        console.log('User email verification required:', 
          needsReVerification ? 'User needs re-verification' : 'Email not confirmed');
        // Don't sign them out immediately, show verification screen first
      }

    } catch (error) {
      console.error('Email verification check error:', error);
      setIsVerified(true); // If there's an error, let them through
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async () => {
    if (!userEmail) return;

    setIsResendingEmail(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });

      const data = await response.json();
      
      if (response.ok) {
        setResendMessage('Verification email sent! Please check your inbox.');
      } else {
        setResendMessage(data.error || 'Failed to resend email');
      }
    } catch (error) {
      setResendMessage('Failed to resend verification email');
    } finally {
      setIsResendingEmail(false);
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/intern-sign-in');
    }
  };

  const optOutOfVerification = async () => {
    if (!supabase) return;
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log('🚪 EmailVerificationGuard: User opted out of email verification');
      
      // Try to confirm their email via legacy API
      try {
        const confirmResponse = await fetch('/api/auth/legacy-confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            email: user.email,
            userType: 'intern' // Default to intern
          })
        });
        
        if (confirmResponse.ok) {
          console.log('✅ EmailVerificationGuard: Successfully confirmed email via opt-out');
        }
      } catch (confirmError) {
        console.log('⚠️ EmailVerificationGuard: Email confirmation failed during opt-out');
      }
      
      // Mark as verified and let them through
      setIsVerified(true);
      
    } catch (error) {
      console.error('❌ EmailVerificationGuard: Error during opt-out:', error);
      // Still let them through
      setIsVerified(true);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Checking account status...</p>
        </div>
      </div>
    );
  }

  // Show email verification required screen
  if (isVerified === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Email Verification Required
            </h2>
            
            <p className="mt-2 text-sm text-gray-600">
              To enhance security, all accounts now require email verification to continue using the platform.
            </p>
            
            <div className="mt-3 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Existing users:</strong> Click "Skip Verification" below to continue without email verification.
              </p>
            </div>
            
            <p className="mt-2 text-sm text-gray-500">
              We sent a verification link to: <span className="font-medium">{userEmail}</span>
            </p>
            
            {resendMessage && (
              <div className={`mt-4 p-3 rounded-md ${resendMessage.includes('sent') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                <p className="text-sm">{resendMessage}</p>
              </div>
            )}
            
            <div className="mt-6 space-y-3">
              <button
                onClick={optOutOfVerification}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Skip Verification (Recommended for Existing Users)
              </button>
              
              <button
                onClick={resendVerificationEmail}
                disabled={isResendingEmail}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isResendingEmail ? 'Sending...' : 'Resend Verification Email'}
              </button>
              
              <button
                onClick={checkEmailVerification}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                I've Verified My Email - Check Again
              </button>
              
              <button
                onClick={signOut}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign Out & Try Different Account
              </button>
            </div>
            
            <div className="mt-4 text-xs text-gray-500">
              <p>Check your spam folder if you don't see the email.</p>
              <p>After clicking the verification link, click "Check Again" above.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Email is verified or user is not logged in, show normal content
  return <>{children}</>;
}