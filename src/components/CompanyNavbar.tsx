'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { FiChevronDown } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

export default function CompanyNavbar() {
  const isVisible = useScrollPosition();
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Check if company user is signed in
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        let isAuthenticated = false;
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            isAuthenticated = user.role === 'COMPANY';
          } catch (e) {
            isAuthenticated = false;
          }
        }
        setIsSignedIn(isAuthenticated);
      }
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('authStateChange', checkAuth);
    window.addEventListener('login', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChange', checkAuth);
      window.removeEventListener('login', checkAuth);
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCompanyId(user?.id || null);
    };
    fetchUser();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsSignedIn(false);
    window.dispatchEvent(new Event('authStateChange'));
    router.push('/company-sign-in');
  };

  useEffect(() => {
    // Close dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (aboutUsRef.current && !aboutUsRef.current.contains(event.target as Node)) {
        setIsAboutUsOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
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
              <Link href="/company" className="flex items-center">
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
                href="/company-reviews"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
              >
                Reviews
              </Link>
            )}
            <Link
              href="/company/b2b-pricing"
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
            >
              Pricing
            </Link>
            {isSignedIn && (
              <>
                <Link
                  href="/company-dash"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/company/search"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
                >
                  Find Interns
                </Link>
                <Link
                  href={isSignedIn && companyId ? `/company/opportunities/${companyId}` : "/company/opportunities"}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
                >
                  Manage Internships
                </Link>
                <Link
                  href={isSignedIn && companyId ? `/company/messaging/${companyId}` : "/company/messaging"}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
                >
                  Messaging
                </Link>
              </>
            )}
            {!isSignedIn && (
              <div 
                className="relative" 
                ref={aboutUsRef}
              >
                <button
                  onMouseEnter={() => setIsAboutUsOpen(true)}
                  onMouseLeave={() => setIsAboutUsOpen(false)}
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-base font-medium"
                >
                  About Us
                  <div className={`ml-1 transition-transform duration-200 ${isAboutUsOpen ? 'rotate-180' : ''}`}>
                    <FiChevronDown size={20} />
                  </div>
                </button>
                {isAboutUsOpen && (
                  <>
                    <div 
                      className="absolute w-full h-2 -bottom-2"
                      onMouseEnter={() => setIsAboutUsOpen(true)}
                      onMouseLeave={() => setIsAboutUsOpen(false)}
                    />
                    <div 
                      className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                      onMouseEnter={() => setIsAboutUsOpen(true)}
                      onMouseLeave={() => setIsAboutUsOpen(false)}
                    >
                      <div className="py-2" role="menu" aria-orientation="vertical">
                        <Link
                          href="/about/step-up"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          About Step Up
                        </Link>
                        <Link
                          href="/about/careers"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Careers
                        </Link>
                        <Link
                          href="/about/contact"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                        >
                          Contact Us
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isSignedIn ? (
              <div className="relative" ref={settingsRef}>
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
                  aria-label="Settings"
                >
                  <Cog6ToothIcon className="h-7 w-7 text-gray-600" />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <button
                        onClick={() => router.push('/company/edit-page')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Edit Organization Page
                      </button>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/company-sign-in"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-base font-medium"
              >
                Sign in
              </Link>
            )}
            <Link
              href="/"
              className="ml-4 bg-blue-600 text-white px-5 py-2.5 rounded-md text-base font-medium hover:bg-blue-700"
            >
              For Students
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 
