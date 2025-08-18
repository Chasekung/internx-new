'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

export default function CompanySignIn() {
  console.log('Loaded company sign-in page!');
  const router = useRouter();
  const { supabase, error: supabaseError } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);
  const authChecked = useRef(false);

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);

  useEffect(() => {
    if (error === 'INTERN_USER') {
      // Redirect after 5 seconds
      redirectTimeout.current = setTimeout(() => {
        router.push('/intern-sign-in');
      }, 5000);
    }
    return () => {
      if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
    };
  }, [error, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    if (!supabase) {
      setError('Authentication system not ready. Please try again.');
      setIsLoading(false);
      return;
    }
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      // First, authenticate with Supabase Auth with timeout
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([
        authPromise,
        timeoutPromise
      ]) as any;

      if (error) throw error;

      if (!data.session || !data.user) {
        setError('Sign in failed: No session returned.');
        return;
      }

      // CRITICAL: Verify user exists in companies table
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (companyError || !companyData) {
        // Check if this user is an intern
        const { data: internProfile, error: internError } = await supabase
          .from('interns')
          .select('id')
          .eq('id', data.user.id)
          .single();
        if (internProfile && !internError) {
          setError('INTERN_USER');
          await supabase.auth.signOut();
          return;
        }
        // User is authenticated but not a company - sign them out
        await supabase.auth.signOut();
        setError('Access denied. This account is not authorized for company access.');
        return;
      }

      // User is both authenticated AND a company - proceed
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('user', JSON.stringify({
        id: data.user?.id,
        email: data.user?.email,
        role: 'COMPANY',
        companyName: companyData.company_name,
        contactName: companyData.contact_name
      }));
      window.dispatchEvent(new Event('authStateChange'));
      router.push('/company-dash');
    } catch (err: any) {
      if (err === 'INTERN_USER') return;
      setError(err.message || 'Sign in failed');
      console.error('Sign in error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Clear any expired tokens on page load
  useEffect(() => {
    const clearExpiredTokens = async () => {
      try {
        if (!supabase) return;
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && error) {
          // If we get an error, the token is likely expired
          console.log('Clearing expired token');
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.log('Clearing invalid session');
        if (supabase) {
          await supabase.auth.signOut();
        }
      }
    };
    
    clearExpiredTokens();
  }, []);
  
  useEffect(() => {
    if (!supabase) return;
    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return;
    }
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === 'SIGNED_IN') {
        console.log('Company user signed in:', session?.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('Company user signed out');
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, supabaseError]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl"
        >
          <div>
            <Link href="/company" className="flex justify-center">
              <img src="/stepupnologo.png" alt="Step Up Logo" className="h-12 w-auto mx-auto" />
            </Link>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your company account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/company-get-started" className="font-medium text-blue-600 hover:text-blue-500">
                create a new company account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 mb-2">
                <p className="text-red-700 text-sm">
                  {error === 'INTERN_USER' ? (
                    <>
                      This account is registered as an intern.<br />
                      Please <Link href="/intern-sign-in" className="underline text-blue-700">sign in through the intern portal</Link>.<br />
                      <span className="text-xs text-gray-500">Redirecting...</span>
                    </>
                  ) : error}
                </p>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link href="/company-forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, #a78bfa 1px, transparent 1px),
            linear-gradient(to bottom, #a78bfa 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
}