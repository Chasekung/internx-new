'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { FiChevronDown, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { Menu } from '@headlessui/react';
import { classNames } from '@/lib/classNames';

// Supabase client will be initialized in useEffect to avoid build-time evaluation

interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  phoneNumber: string;
  location: string;
  highSchool: string;
  gradeLevel: string;
  age: string;
  skills: string[];
  experience: string;
  extracurriculars: string[];
  achievements: string[];
  careerInterests: string[];
  resumeUrl: string;
  profilePhotoUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  bio: string;
  interests: string[];
  languages: string[];
  certifications: string[];
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  location: string;
  highSchool: string;
  gradeLevel: string;
  age: string;
  skills: string[];
  experience: string;
  extracurriculars: string[];
  achievements: string[];
  careerInterests: string[];
  resumeUrl: string;
  bio: string;
  interests: string[];
  languages: string[];
  certifications: string[];
  created_at: string;
  updated_at: string;
  profilePhotoUrl?: string;
}

export default function UserNavbar() {
  const isVisible = useScrollPosition();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitchDropdownOpen, setIsSwitchDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [supabase, setSupabase] = useState<any>(null);
  const router = useRouter();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  const aboutUsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const switchDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const authCheckTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchProfileData = async (token: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    if (!supabase) return;
    
    let lastAuthCheck = 0;
    let isChecking = false; // Prevent concurrent auth checks
    
    const checkAuth = async () => {
      const now = Date.now();
      if (now - lastAuthCheck < 1000) return; // Prevent rapid auth checks
      lastAuthCheck = now;
      
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
      authCheckTimeout.current = setTimeout(async () => {
        isChecking = true;
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.access_token) {
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const user = JSON.parse(userStr);
                if (user.role === 'INTERN') {
                  setIsSignedIn(true);
                  await fetchProfileData(session.access_token);
                }
              } catch (e) {
                console.error('Error parsing user data:', e);
              }
            } else {
              // If no user in localStorage but session exists, try to get user info
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                setIsSignedIn(true);
                await fetchProfileData(session.access_token);
              }
            }
          } else {
            setIsSignedIn(false);
            setProfileData(null);
            // Auto-redirect to sign in if on a protected page
            if (typeof window !== 'undefined') {
              const protectedPaths = ['/intern-dash', '/edit-profile', '/messaging', '/apply'];
              const currentPath = window.location.pathname;
              const isOnProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
              
              if (isOnProtectedPath) {
                console.log('🔄 No valid session found, redirecting to sign in...');
                window.location.href = '/intern-sign-in';
              }
            }
          }
        } catch (error) {
          console.error('Auth check error:', error);
          setIsSignedIn(false);
          setProfileData(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Auto-redirect on any auth error for protected pages
          if (typeof window !== 'undefined') {
            const protectedPaths = ['/intern-dash', '/edit-profile', '/messaging', '/apply'];
            const currentPath = window.location.pathname;
            const isOnProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
            
            if (isOnProtectedPath) {
              console.log('🔄 Auth error occurred, redirecting to sign in...');
              window.location.href = '/intern-sign-in';
            }
          }
        } finally {
          isChecking = false;
        }
      }, 500);
    };

    // Initial auth check
    checkAuth();

    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user.role === 'INTERN') {
              setIsSignedIn(true);
              if (session?.access_token) {
                await fetchProfileData(session.access_token);
              }
            }
          } catch (e) {
            console.error('Error parsing user data:', e);
          }
        } else if (session?.access_token) {
          // If no user in localStorage but session exists, try to get user info
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            setIsSignedIn(true);
            await fetchProfileData(session.access_token);
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setIsSignedIn(false);
        setProfileData(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Auto-redirect to sign in if on a protected page
        if (typeof window !== 'undefined') {
          const protectedPaths = ['/intern-dash', '/edit-profile', '/messaging', '/apply'];
          const currentPath = window.location.pathname;
          const isOnProtectedPath = protectedPaths.some(path => currentPath.startsWith(path));
          
          if (isOnProtectedPath) {
            console.log('🔄 User signed out, redirecting to sign in...');
            window.location.href = '/intern-sign-in';
          }
        }
      }
    });

    // Listen for our custom events with debouncing
    const handleStorageChange = () => {
      console.log('Storage changed, checking auth...');
      // Debounce storage change events
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
      authCheckTimeout.current = setTimeout(checkAuth, 500);
    };

    const handleAuthStateChange = () => {
      console.log('Auth state change event received, checking auth...');
      // Debounce auth state change events
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
      authCheckTimeout.current = setTimeout(checkAuth, 500);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthStateChange);
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
    };
  }, [supabase]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aboutUsRef.current && !aboutUsRef.current.contains(event.target as Node)) {
        setIsAboutUsOpen(false);
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (switchDropdownRef.current && !switchDropdownRef.current.contains(event.target as Node)) {
        setIsSwitchDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  return (
    <nav className={`glass-effect fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/stepupflat.png" 
                  alt="Step Up Logo" 
                  width={360} 
                  height={90} 
                  priority
                  className="w-auto h-[60px] lg:h-[90px] hover:opacity-90 transition-opacity"
                  style={{ width: 'auto', height: '60px' }}
                  sizes="(max-width: 1024px) 240px, 360px"
                />
              </Link>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-8">
            {!isSignedIn && (
              <Link
                href="/user-reviews"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
              >
                Reviews
              </Link>
            )}
            <Link
              href="/opportunities"
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
            >
              Browse Opportunities
            </Link>
            {!isSignedIn && (
              <div 
                className="relative"
                ref={aboutUsRef}
                onMouseEnter={() => setIsAboutUsOpen(true)}
                onMouseLeave={() => setIsAboutUsOpen(false)}
              >
                <button
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
                >
                  About Us
                  <div className={`ml-1 transition-transform duration-200 ${isAboutUsOpen ? 'rotate-180' : ''}`}>
                    <FiChevronDown size={20} />
                  </div>
                </button>
                {isAboutUsOpen && (
                  <div 
                    className="absolute -left-2 right-0 top-full"
                  >
                    {/* Invisible bridge */}
                    <div className="h-2" />
                    <div className="absolute right-0 z-10 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Link
                        href="/about/step-up"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        About Step Up
                      </Link>
                      <Link
                        href="/about/careers"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Careers
                      </Link>
                      <Link
                        href="/about/contact"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Contact Us
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isSignedIn && (
              <Link
                href="/intern-dash"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
              >
                Dashboard
              </Link>
            )}
            {isSignedIn && (
              <Link
                href="/search"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
              >
                Network
              </Link>
            )}
            {isSignedIn && (
              <Link
                href={`/messaging/${profileData?.id || ''}`}
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
              >
                Messaging
              </Link>
            )}
          </div>
          
          {/* Desktop Right Side */}
          <div className="hidden lg:ml-6 lg:flex lg:items-center">
            {isSignedIn ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((open) => !open)}
                    className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-2xl flex items-center"
                    aria-label="Settings"
                  >
                    <FiSettings />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-2" role="menu" aria-orientation="vertical">
                        <button
                          onClick={() => { setIsDropdownOpen(false); router.push('/edit-page'); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Edit Profile
                        </button>
                        <Link
                          href={`/public-profile/${JSON.parse(localStorage.getItem('user') || '{}').id}`}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          View Public Profile
                        </Link>
                        <button
                          onClick={() => { setIsDropdownOpen(false); handleSignOut(); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative" ref={switchDropdownRef}>
                  <button
                    onClick={() => setIsSwitchDropdownOpen(!isSwitchDropdownOpen)}
                    className="ml-4 bg-blue-600 text-white px-5 py-2.5 rounded-md text-base font-medium hover:bg-blue-700 inline-flex items-center"
                  >
                    For Students
                    <div className={`ml-2 transition-transform duration-200 ${isSwitchDropdownOpen ? 'rotate-180' : ''}`}>
                      <FiChevronDown size={16} />
                    </div>
                  </button>
                  {isSwitchDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <div className="px-4 py-2 text-sm text-white bg-blue-600 rounded-t-md">
                          For Students
                        </div>
                        <Link
                          href="/company"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsSwitchDropdownOpen(false)}
                        >
                          For Companies
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/intern-sign-in"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign in
                </Link>
                <div className="relative" ref={switchDropdownRef}>
                  <button
                    onClick={() => setIsSwitchDropdownOpen(!isSwitchDropdownOpen)}
                    className="ml-4 bg-blue-600 text-white px-5 py-2.5 rounded-md text-base font-medium hover:bg-blue-700 inline-flex items-center"
                  >
                    For Students
                    <div className={`ml-2 transition-transform duration-200 ${isSwitchDropdownOpen ? 'rotate-180' : ''}`}>
                      <FiChevronDown size={16} />
                    </div>
                  </button>
                  {isSwitchDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <div className="px-4 py-2 text-sm text-white bg-blue-600 rounded-t-md">
                          For Students
                        </div>
                        <Link
                          href="/company"
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsSwitchDropdownOpen(false)}
                        >
                          For Companies
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-md"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg"
        >
          <div className="px-4 py-6 space-y-4">
            {/* Mobile Navigation Links */}
            {!isSignedIn && (
              <Link
                href="/user-reviews"
                className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reviews
              </Link>
            )}
            <Link
              href="/opportunities"
              className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Opportunities
            </Link>
            {!isSignedIn && (
              <div className="space-y-2">
                <div className="text-gray-700 text-lg font-medium py-2">About Us</div>
                <div className="pl-4 space-y-2">
                  <Link
                    href="/about/step-up"
                    className="block text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    About Step Up
                  </Link>
                  <Link
                    href="/about/careers"
                    className="block text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Careers
                  </Link>
                  <Link
                    href="/about/contact"
                    className="block text-gray-600 hover:text-gray-900 py-1"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            )}
            {isSignedIn && (
              <Link
                href="/intern-dash"
                className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            {isSignedIn && (
              <Link
                href="/search"
                className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Network
              </Link>
            )}
            {isSignedIn && (
              <Link
                href={`/messaging/${profileData?.id || ''}`}
                className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Messaging
              </Link>
            )}

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {isSignedIn ? (
                <div className="space-y-3">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/edit-page'); }}
                    className="block w-full text-left text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  >
                    Edit Profile
                  </button>
                  <Link
                    href={`/public-profile/${JSON.parse(localStorage.getItem('user') || '{}').id}`}
                    className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    View Public Profile
                  </Link>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}
                    className="block w-full text-left text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/intern-sign-in"
                  className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
              
              {/* Mobile Switch Button */}
              <div className="pt-4">
                <Link
                  href="/company"
                  className="block w-full bg-blue-600 text-white px-4 py-3 rounded-md text-lg font-medium text-center hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Switch to Company View
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
