'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { FiChevronDown, FiSettings, FiMenu, FiX } from 'react-icons/fi';
import { useSupabase } from '@/hooks/useSupabase';
import { useTheme } from '@/contexts/ThemeContext';

// Lightbulb icon for dark mode toggle
const LightbulbIcon = ({ isOn }: { isOn: boolean }) => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className="transition-all duration-300"
  >
    {isOn ? (
      // Lightbulb on (light mode)
      <>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 2v1" />
        <path d="M12 6a4 4 0 0 1 4 4c0 1.5-.5 2.5-1.5 3.5L14 14a2 2 0 0 1-4 0l-.5-.5C8.5 12.5 8 11.5 8 10a4 4 0 0 1 4-4Z" fill="currentColor" />
        <path d="M4.22 10H2" />
        <path d="M22 10h-2.22" />
        <path d="M6.34 4.34l1.42 1.42" />
        <path d="M17.66 4.34l-1.42 1.42" />
      </>
    ) : (
      // Lightbulb off (dark mode)
      <>
        <path d="M9 18h6" />
        <path d="M10 22h4" />
        <path d="M12 6a4 4 0 0 1 4 4c0 1.5-.5 2.5-1.5 3.5L14 14a2 2 0 0 1-4 0l-.5-.5C8.5 12.5 8 11.5 8 10a4 4 0 0 1 4-4Z" />
      </>
    )}
  </svg>
);

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

// Discord icon
const DiscordIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export default function UserNavbar() {
  const isVisible = useScrollPosition();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitchDropdownOpen, setIsSwitchDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { supabase, error: supabaseError } = useSupabase();
  const { theme, toggleTheme, isThemeEnabled } = useTheme();
  const router = useRouter();

  // Track scroll position to shrink navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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
    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return;
    }
    
    let lastAuthCheck = 0;
    
    const checkAuth = async () => {
      const now = Date.now();
      if (now - lastAuthCheck < 1000) return;
      lastAuthCheck = now;
      
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
      authCheckTimeout.current = setTimeout(async () => {
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
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                setIsSignedIn(true);
                await fetchProfileData(session.access_token);
              }
            }
          } else {
            setIsSignedIn(false);
            setProfileData(null);
          }
        } catch (error) {
          console.error('Auth check error:', error);
          setIsSignedIn(false);
          setProfileData(null);
        }
      }, 500);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
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
        }
      } else if (event === 'SIGNED_OUT') {
        setIsSignedIn(false);
        setProfileData(null);
      }
    });

    const handleStorageChange = () => {
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
      authCheckTimeout.current = setTimeout(checkAuth, 500);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleStorageChange);
      if (authCheckTimeout.current) {
        clearTimeout(authCheckTimeout.current);
      }
    };
  }, [supabase, supabaseError]);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [router]);

  return (
    <nav 
      className={`fixed left-4 right-4 z-50 glass-nav rounded-2xl transition-all duration-300 ease-out ${
        isScrolled ? 'top-2' : 'top-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className={`flex justify-between transition-all duration-300 ${
          isScrolled ? 'h-12' : 'h-16'
        }`}>
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <Image 
                src="/stepupflat.png" 
                alt="Step Up" 
                width={280} 
                height={70} 
                priority
                className={`w-auto transition-all duration-300 group-hover:opacity-80 ${
                  isScrolled ? 'h-[36px]' : 'h-[50px]'
                }`}
                style={{ width: 'auto' }}
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:space-x-1">
            {!isSignedIn && (
              <Link
                href="/user-reviews"
                className="nav-link px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
              >
                Reviews
              </Link>
            )}
            <Link
              href="/opportunities"
              className="nav-link px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
            >
              Opportunities
            </Link>
            {!isSignedIn && (
              <div 
                className="relative"
                ref={aboutUsRef}
                onMouseEnter={() => setIsAboutUsOpen(true)}
                onMouseLeave={() => setIsAboutUsOpen(false)}
              >
                <button
                  className="nav-link px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors flex items-center gap-1"
                >
                  About
                  <FiChevronDown 
                    size={14} 
                    className={`transition-transform duration-200 ${isAboutUsOpen ? 'rotate-180' : ''}`} 
                  />
                </button>
                {isAboutUsOpen && (
                  <div className="absolute left-0 top-full pt-2">
                    <div className="glass-card py-2 min-w-[180px] shadow-lg">
                      <Link
                        href="/about/step-up"
                        className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        About Step Up
                      </Link>
                      <Link
                        href="/about/careers"
                        className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        Careers
                      </Link>
                      <Link
                        href="/about/contact"
                        className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isSignedIn && (
              <>
                <Link
                  href="/intern-dash"
                  className="nav-link px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/search"
                  className="nav-link px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  Network
                </Link>
                <Link
                  href={`/messaging/${profileData?.id || ''}`}
                  className="nav-link px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
                >
                  Messages
                </Link>
              </>
            )}
          </div>
          
          {/* Desktop Right Side */}
          <div className="hidden lg:flex lg:items-center lg:space-x-2">
            {/* Dark Mode Toggle - Lightbulb (only on student pages) */}
            {isThemeEnabled && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <LightbulbIcon isOn={theme === 'light'} />
              </button>
            )}

            {/* Discord Button */}
            <a
              href="https://discord.gg/FNrTcndpc9"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
              title="Join our Discord community"
            >
              <DiscordIcon />
              <span className="hidden sm:inline">Discord</span>
            </a>

            {isSignedIn ? (
              <>
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((open) => !open)}
                    className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-all"
                    aria-label="Settings"
                  >
                    <FiSettings size={20} />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 glass-card py-2 min-w-[200px] shadow-lg">
                      <button
                        onClick={() => { setIsDropdownOpen(false); router.push('/edit-page'); }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <Link
                        href={`/public-profile/${JSON.parse(localStorage.getItem('user') || '{}').id}`}
                        className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        View Public Profile
                      </Link>
                      <div className="my-1 border-t border-slate-200/50 dark:border-slate-700/50" />
                      <button
                        onClick={() => { setIsDropdownOpen(false); handleSignOut(); }}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative" ref={switchDropdownRef}>
                  <button
                    onClick={() => setIsSwitchDropdownOpen(!isSwitchDropdownOpen)}
                    className="btn-glass px-4 py-2 text-sm font-medium flex items-center gap-1.5"
                  >
                    For Students
                    <FiChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${isSwitchDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {isSwitchDropdownOpen && (
                    <div className="absolute right-0 mt-2 glass-card py-2 min-w-[180px] shadow-lg">
                      <div className="px-4 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Switch view
                      </div>
                      <div className="px-4 py-2 text-sm text-slate-900 dark:text-white font-medium bg-slate-100/50 dark:bg-slate-700/50">
                        For Students ✓
                      </div>
                      <Link
                        href="/company"
                        className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => setIsSwitchDropdownOpen(false)}
                      >
                        For Companies
                      </Link>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/intern-sign-in"
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <div className="relative" ref={switchDropdownRef}>
                  <button
                    onClick={() => setIsSwitchDropdownOpen(!isSwitchDropdownOpen)}
                    className="btn-primary px-4 py-2 text-sm font-medium flex items-center gap-1.5"
                  >
                    For Students
                    <FiChevronDown 
                      size={14} 
                      className={`transition-transform duration-200 ${isSwitchDropdownOpen ? 'rotate-180' : ''}`} 
                    />
                  </button>
                  {isSwitchDropdownOpen && (
                    <div className="absolute right-0 mt-2 glass-card py-2 min-w-[180px] shadow-lg">
                      <div className="px-4 py-2 text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Switch view
                      </div>
                      <div className="px-4 py-2 text-sm text-slate-900 dark:text-white font-medium bg-slate-100/50 dark:bg-slate-700/50">
                        For Students ✓
                      </div>
                      <Link
                        href="/company"
                        className="block px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors"
                        onClick={() => setIsSwitchDropdownOpen(false)}
                      >
                        For Companies
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile: Theme toggle, Discord, and Menu */}
          <div className="lg:hidden flex items-center gap-1">
            {isThemeEnabled && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <LightbulbIcon isOn={theme === 'light'} />
              </button>
            )}
            <a
              href="https://discord.gg/FNrTcndpc9"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all"
              title="Join Discord"
            >
              <DiscordIcon />
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div 
          ref={mobileMenuRef}
          className="lg:hidden border-t border-slate-200/30 dark:border-slate-700/30"
        >
          <div className="px-4 py-6 space-y-3">
            {!isSignedIn && (
              <Link
                href="/user-reviews"
                className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reviews
              </Link>
            )}
            <Link
              href="/opportunities"
              className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Opportunities
            </Link>
            {!isSignedIn && (
              <>
                <Link
                  href="/about/step-up"
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About Us
                </Link>
              </>
            )}
            {isSignedIn && (
              <>
                <Link
                  href="/intern-dash"
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/search"
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Network
                </Link>
                <Link
                  href={`/messaging/${profileData?.id || ''}`}
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Messages
                </Link>
              </>
            )}

            <div className="pt-4 border-t border-slate-200/30 dark:border-slate-700/30">
              {isSignedIn ? (
                <div className="space-y-2">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); router.push('/edit-page'); }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link
                  href="/intern-sign-in"
                  className="block px-4 py-3 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
              )}
              
              <div className="mt-4">
                <Link
                  href="/company"
                  className="block w-full btn-glass px-4 py-3 text-base font-medium text-center rounded-xl"
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
