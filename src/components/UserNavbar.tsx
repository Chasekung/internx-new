'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { FiSettings, FiChevronDown } from 'react-icons/fi';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { Menu } from '@headlessui/react';
import { classNames } from '@/lib/classNames';

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
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const aboutUsRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchProfileData = useCallback(async (token: string) => {
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
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          setIsSignedIn(false);
          setProfileData(null);
          return;
        }

        try {
          const user = JSON.parse(userStr);
          if (user.role !== 'INTERN') {
            setIsSignedIn(false);
            setProfileData(null);
            return;
          }
        } catch (e) {
          console.error('Error parsing user data:', e);
          setIsSignedIn(false);
          setProfileData(null);
          return;
        }

        // Verify token is still valid
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
          console.error('Auth error:', authError);
          setIsSignedIn(false);
          setProfileData(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return;
        }

        setIsSignedIn(true);
        await fetchProfileData(token);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsSignedIn(false);
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      if (event === 'SIGNED_IN') {
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
        }
      } else if (event === 'SIGNED_OUT') {
        setIsSignedIn(false);
        setProfileData(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    });

    // Listen for our custom events
    const handleStorageChange = () => {
      console.log('Storage changed, checking auth...');
      checkAuth();
    };

    const handleAuthStateChange = () => {
      console.log('Auth state change event received, checking auth...');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthStateChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthStateChange);
    };
  }, [fetchProfileData]);

  const handleSignOut = async () => {
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
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
                  className="w-auto h-[90px] hover:opacity-90 transition-opacity"
                  style={{ width: 'auto', height: '90px' }}
                  sizes="360px"
                />
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
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
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
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
                <Link
                  href="/company"
                  className="ml-4 bg-blue-600 text-white px-5 py-2.5 rounded-md text-base font-medium hover:bg-blue-700"
                >
                  For Companies
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/intern-sign-in"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-base font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/company"
                  className="ml-4 bg-blue-600 text-white px-5 py-2.5 rounded-md text-base font-medium hover:bg-blue-700"
                >
                  For Companies
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
