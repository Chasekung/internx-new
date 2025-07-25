'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { FiChevronDown, FiMenu, FiX } from 'react-icons/fi';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { checkCompanyAuth } from '@/lib/companyAuth';

export default function CompanyNavbar() {
  const isVisible = useScrollPosition();
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSwitchDropdownOpen, setIsSwitchDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const aboutUsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const switchDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Check if company user is signed in
    const checkAuth = async () => {
      try {
        const { isCompany, user } = await checkCompanyAuth();
        setIsSignedIn(isCompany);
        if (isCompany && user) {
          setCompanyId(user.id);
        } else {
          setCompanyId(null);
        }
      } catch (e) {
        setIsSignedIn(false);
        setCompanyId(null);
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

  const handleSignOut = async () => {
    try {
      console.log('🔄 Starting sign out process...');
      
      // Check current auth state before sign out
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('👤 Current user before sign out:', currentUser?.id);
      
      // Sign out from Supabase Auth
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error('❌ Supabase sign out error:', signOutError);
        throw signOutError;
      }
      
      console.log('✅ Supabase sign out successful');
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('🗑️ localStorage cleared');
      
      // Update state
      setIsSignedIn(false);
      setCompanyId(null);
      console.log('🔄 Component state updated');
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('authStateChange'));
      console.log('📢 Auth state change event dispatched');
      
      // Redirect to sign in page
      router.push('/company-sign-in');
      console.log('🔄 Redirecting to sign in page');
      
    } catch (error) {
      console.error('❌ Error signing out:', error);
      // Still clear localStorage and redirect even if Supabase signout fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsSignedIn(false);
      setCompanyId(null);
      window.dispatchEvent(new Event('authStateChange'));
      router.push('/company-sign-in');
    }
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
              <Link href="/company" className="flex items-center">
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
          
          {/* Desktop Right Side */}
          <div className="hidden lg:ml-6 lg:flex lg:items-center">
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
            <div className="relative" ref={switchDropdownRef}>
              <button
                onClick={() => setIsSwitchDropdownOpen(!isSwitchDropdownOpen)}
                className="ml-4 bg-blue-600 text-white px-5 py-2.5 rounded-md text-base font-medium hover:bg-blue-700 inline-flex items-center"
              >
                For Companies
                <div className={`ml-2 transition-transform duration-200 ${isSwitchDropdownOpen ? 'rotate-180' : ''}`}>
                  <FiChevronDown size={16} />
                </div>
              </button>
              {isSwitchDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 text-sm text-white bg-blue-600 rounded-t-md">
                      For Companies
                    </div>
                    <Link
                      href="/"
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setIsSwitchDropdownOpen(false)}
                    >
                      For Students
                    </Link>
                  </div>
                </div>
              )}
            </div>
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
                href="/company-reviews"
                className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reviews
              </Link>
            )}
            <Link
              href="/company/b2b-pricing"
              className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            {isSignedIn && (
              <>
                <Link
                  href="/company-dash"
                  className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/company/search"
                  className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Find Interns
                </Link>
                <Link
                  href={isSignedIn && companyId ? `/company/opportunities/${companyId}` : "/company/opportunities"}
                  className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Manage Internships
                </Link>
                <Link
                  href={isSignedIn && companyId ? `/company/messaging/${companyId}` : "/company/messaging"}
                  className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Messaging
                </Link>
              </>
            )}
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

            {/* Mobile Auth Section */}
            <div className="pt-4 border-t border-gray-200">
              {isSignedIn ? (
                <div className="space-y-3">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/company/edit-page'); }}
                    className="block w-full text-left text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  >
                    Edit Organization Page
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}
                    className="block w-full text-left text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/company-sign-in"
                  className="block text-gray-700 hover:text-gray-900 text-lg font-medium py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
              
              {/* Mobile Switch Button */}
              <div className="pt-4">
                <Link
                  href="/"
                  className="block w-full bg-blue-600 text-white px-4 py-3 rounded-md text-lg font-medium text-center hover:bg-blue-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Switch to Student View
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 
