'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { calculateProfileCompleteness, ProfileData, ProfileCompletenessResult } from '@/lib/profileCompleteness';

const MINIMUM_PROFILE_PERCENTAGE = 50;

interface UseProfileGateResult {
  isLoading: boolean;
  isAuthenticated: boolean;
  meetsRequirement: boolean;
  completeness: ProfileCompletenessResult | null;
  profile: ProfileData | null;
  error: string | null;
}

/**
 * Transform raw profile data to ProfileData format
 */
function transformProfileData(profileData: any): ProfileData {
  return {
    fullName: profileData.full_name || '',
    email: profileData.email || '',
    username: profileData.username || '',
    phoneNumber: profileData.phone || '',
    address: profileData.location || '',
    state: profileData.state || '',
    highSchool: profileData.high_school || '',
    gradeLevel: profileData.grade_level || '',
    age: profileData.age ? profileData.age.toString() : '',
    skills: profileData.skills || '',
    experience: profileData.experience || '',
    extracurriculars: profileData.extracurriculars || '',
    achievements: profileData.achievements || '',
    careerInterests: profileData.career_interests || '',
    resumeUrl: profileData.resume_url || '',
    bio: profileData.bio || '',
    headline: profileData.headline || '',
    interests: profileData.interests || '',
    languages: profileData.languages || '',
    certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],
    profilePhotoUrl: profileData.profile_photo_url || '',
    linkedinUrl: profileData.linkedin_url || '',
    githubUrl: profileData.github_url || '',
    portfolioUrl: profileData.portfolio_url || '',
  };
}

/**
 * Hook to check if user meets profile completion requirements
 * Redirects to edit-page if requirements are not met
 */
export function useProfileGate(redirectOnFail: boolean = true): UseProfileGateResult {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [meetsRequirement, setMeetsRequirement] = useState(false);
  const [completeness, setCompleteness] = useState<ProfileCompletenessResult | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkProfileCompletion = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClientComponentClient();
      
      // First, try to get/refresh the Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Use session token if available, otherwise fall back to localStorage
      let token = session?.access_token || localStorage.getItem('token');
      
      // Sync fresh token to localStorage
      if (session?.access_token) {
        localStorage.setItem('token', session.access_token);
      }

      if (!token) {
        setIsAuthenticated(false);
        if (redirectOnFail) {
          router.push('/intern-sign-in');
        }
        return;
      }

      setIsAuthenticated(true);

      // Fetch profile data
      let response = await fetch('/api/interns/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If 401, try to refresh the session and retry
      if (response.status === 401) {
        console.log('Token expired, attempting to refresh session...');
        
        const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession?.access_token) {
          // Truly not authenticated
          console.log('Session refresh failed, redirecting to sign in');
          setIsAuthenticated(false);
          if (redirectOnFail) {
            router.push('/intern-sign-in');
          }
          return;
        }
        
        // Update token and retry
        token = refreshedSession.access_token;
        localStorage.setItem('token', token);
        
        response = await fetch('/api/interns/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          setIsAuthenticated(false);
          if (redirectOnFail) {
            router.push('/intern-sign-in');
          }
          return;
        }
      } else if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const { data: profileData } = await response.json();
      const transformedProfile = transformProfileData(profileData);

      setProfile(transformedProfile);

      // Calculate completeness
      const result = calculateProfileCompleteness(transformedProfile);
      setCompleteness(result);

      const meets = result.percentage >= MINIMUM_PROFILE_PERCENTAGE;
      setMeetsRequirement(meets);

      // Redirect if requirements not met
      if (!meets && redirectOnFail) {
        // Store the intended destination for redirect after profile completion
        sessionStorage.setItem('profileGateRedirect', window.location.pathname);
        router.push('/edit-page?incomplete=true');
      }
    } catch (err) {
      console.error('Profile gate error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Don't redirect on network errors - just show error state
    } finally {
      setIsLoading(false);
    }
  }, [router, redirectOnFail]);

  useEffect(() => {
    checkProfileCompletion();
  }, [checkProfileCompletion]);

  return {
    isLoading,
    isAuthenticated,
    meetsRequirement,
    completeness,
    profile,
    error,
  };
}

/**
 * Get the minimum required profile percentage
 */
export function getMinimumProfilePercentage(): number {
  return MINIMUM_PROFILE_PERCENTAGE;
}
