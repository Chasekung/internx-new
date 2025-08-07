'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

export default function InternSignIn() {
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastLoginAttempt, setLastLoginAttempt] = useState<number>(0);
  const redirectTimeout = useRef<NodeJS.Timeout | null>(null);
  const authChecked = useRef(false);

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  // Clear any expired tokens on page load
  useEffect(() => {
    if (!supabase) return;
    const clearExpiredTokens = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (user && error) {
          // If we get an error, the token is likely expired
          console.log('Clearing expired token');
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.log('Clearing invalid session');
        await supabase.auth.signOut();
      }
    };
    
    clearExpiredTokens();
  }, [supabase]);

  useEffect(() => {
    if (error === 'COMPANY_USER') {
      // Redirect after 5 seconds
      redirectTimeout.current = setTimeout(() => {
        router.push('/company-sign-in');
      }, 5000);
    }
    return () => {
      if (redirectTimeout.current) clearTimeout(redirectTimeout.current);
    };
  }, [error, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase) {
      setError('Authentication system not ready. Please try again.');
      return;
    }
    
    // Prevent rapid successive login attempts (debounce)
    const now = Date.now();
    if (now - lastLoginAttempt < 3000) { // 3 second cooldown (increased from 2s)
      console.log('Login attempt too soon, please wait...');
      setError('Please wait 3 seconds between login attempts');
      return;
    }
    setLastLoginAttempt(now);
    
    setIsLoading(true);
    setError('');

    try {
      console.log('Attempting to sign in...');
      console.log('Form data:', formData);

      // Determine if identifier is email or username
      const isEmail = formData.identifier.includes('@');
      let userEmail = formData.identifier;
      let userType = 'intern'; // Track if user is intern or company
      let profile: any = null; // Store profile data

      // If not email, check both interns and companies tables in one go
      if (!isEmail) {
        console.log('Looking up username:', formData.identifier);
        
        // Check both tables simultaneously to reduce requests
        const [internResult, companyResult] = await Promise.all([
          supabase
            .from('interns')
            .select('email, id, full_name')
            .eq('username', formData.identifier)
            .single(),
          supabase
            .from('companies')
            .select('email, id, company_name')
            .eq('username', formData.identifier)
            .single()
        ]);

        // Determine which user type we found
        if (internResult.data && !internResult.error) {
          userEmail = internResult.data.email;
          userType = 'intern';
          // Store profile data for later use
          profile = internResult.data;
        } else if (companyResult.data && !companyResult.error) {
          userEmail = companyResult.data.email;
          userType = 'company';
        } else {
          throw new Error('Invalid username or password');
        }
      }

      // Single auth sign in with timeout
      const authPromise = supabase.auth.signInWithPassword({
        email: userEmail,
        password: formData.password,
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout')), 10000)
      );
      
      const { data, error } = await Promise.race([
        authPromise,
        timeoutPromise
      ]) as any;

      if (error) throw error;

      if (!data.session) {
        throw new Error('No session data returned');
      }

      // Handle based on user type
      if (userType === 'company') {
        setError('COMPANY_USER');
        await supabase.auth.signOut();
        return;
      }

      // For interns, we need to get profile data if not already retrieved
      if (!profile && isEmail) {
        // For email login, get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('interns')
          .select('id, full_name')
          .eq('id', data.user.id)
          .single();
        
        if (profileError) {
          throw new Error('User profile not found');
        }
        profile = profileData;
      }

      // Ensure we have valid profile data
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Store auth data
      localStorage.setItem('token', data.session.access_token);
      localStorage.setItem('user', JSON.stringify({
        ...data.user,
        role: 'INTERN',
        id: profile.id,  // Store the user's ID
        full_name: profile.full_name  // Store the user's name
      }));
      
      // Dispatch both auth state change events
      window.dispatchEvent(new Event('authStateChange'));
      window.dispatchEvent(new Event('storage')); // This triggers localStorage listeners
      
      // Redirect to intern-dash page
      console.log('Redirecting to intern-dash page...');
      router.push('/intern-dash');
    } catch (error) {
      if (error === 'COMPANY_USER') return;
      console.error('Sign in error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

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
            <Link href="/" className="flex justify-center">
              <img src="/stepupnologo.png" alt="Step Up Logo" className="h-12 w-auto mx-auto" />
            </Link>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Or{' '}
              <Link href="/intern-get-started" className="font-medium text-blue-600 hover:text-blue-500">
                create a new account
              </Link>
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error === 'COMPANY_USER' ? (
                        <>
                          This account is registered as a company.<br />
                          Please <Link href="/company-sign-in" className="underline text-blue-700">sign in through the company portal</Link>.<br />
                          <span className="text-xs text-gray-500">Redirecting...</span>
                        </>
                      ) : error}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="identifier" className="sr-only">
                  Email or Username
                </label>
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email or Username"
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
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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