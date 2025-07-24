'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function ApplyLandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{ id: string; status: string } | null>(null);
  const [internshipId, setInternshipId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [internshipDetails, setInternshipDetails] = useState<any>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('internshipId');
    setInternshipId(id);

    if (id) {
      checkExistingApplication(id);
    }
  }, []);

  // Re-check application status when component mounts or URL changes
  useEffect(() => {
    if (internshipId) {
      checkExistingApplication(internshipId);
    }
  }, [internshipId]);

  const checkExistingApplication = async (internshipId: string) => {
    try {
      setIsCheckingStatus(true);
      
      // First check Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      // Also check localStorage as backup
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let user = null;
      
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      console.log('Session check:', { 
        session: !!session, 
        userId: session?.user?.id,
        localStorageToken: !!token,
        localStorageUser: user
      });
      
      // Use either Supabase session or localStorage as fallback
      let isAuthenticated = false;
      let userId = null;
      
      if (session?.user?.id) {
        isAuthenticated = true;
        userId = session.user.id;
        console.log('Using Supabase session for authentication');
      } else if (token && user?.id && user?.role === 'INTERN') {
        isAuthenticated = true;
        userId = user.id;
        console.log('Using localStorage for authentication');
      } else {
        console.log('No valid authentication found');
        setIsCheckingStatus(false);
        setExistingApplication(null);
        setIsAuthenticated(false);
        return;
      }

      console.log('Checking existing application for internship:', internshipId, 'user:', userId);
      setIsAuthenticated(true);

      // Use the API endpoint instead of direct Supabase call
      const response = await fetch('/api/applications/check-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId,
          userId
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);

      if (data.application) {
        console.log('Setting existing application with status:', data.application.status);
        setExistingApplication(data.application);
      } else {
        console.log('No existing application found');
        setExistingApplication(null);
      }

      // Also fetch internship details for display
      const { data: internship, error: internshipError } = await supabase
        .from('internships')
        .select(`
          id,
          title,
          position,
          companies!inner (
            company_name,
            company_logo
          )
        `)
        .eq('id', internshipId)
        .single();

      if (internshipError) {
        console.error('Error fetching internship details:', internshipError);
      } else {
        setInternshipDetails(internship);
      }
    } catch (error) {
      console.error('Error checking existing application:', error);
      setExistingApplication(null);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const startApplication = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated using the same robust method
      const { data: { session } } = await supabase.auth.getSession();
      
      // Also check localStorage as backup
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      let user = null;
      
      if (userStr) {
        try {
          user = JSON.parse(userStr);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      let userId = null;
      let isAuthenticated = false;
      
      if (session?.user?.id) {
        isAuthenticated = true;
        userId = session.user.id;
      } else if (token && user?.id && user?.role === 'INTERN') {
        isAuthenticated = true;
        userId = user.id;
      }
      
      if (!isAuthenticated) {
        // If not authenticated, redirect to sign in
        router.push('/intern-sign-in');
        return;
      }

      // Get the internship ID from URL params
      const urlParams = new URLSearchParams(window.location.search);
      const internshipId = urlParams.get('internshipId');

      if (!internshipId) {
        console.error('No internship ID provided');
        return;
      }

      // Use the API endpoint to start the application
      const response = await fetch('/api/applications/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          internshipId,
          userId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'Application already submitted') {
          setError('You have already submitted an application for this internship.');
          return;
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Application started successfully:', data);

      // Navigate to the application form
      router.push(`/forms/${data.application.id}/${internshipId}`);
    } catch (error) {
      console.error('Error starting application:', error);
      setError('Failed to start application. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openApplication = () => {
    if (existingApplication && internshipId) {
      router.push(`/forms/${existingApplication.id}/${internshipId}`);
    }
  };

  // Listen for page focus to refresh status when user returns from form
  useEffect(() => {
    const handleFocus = () => {
      if (internshipId) {
        checkExistingApplication(internshipId);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [internshipId]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Apply for Internship</h1>
            <p className="mt-2 text-gray-600">Start or continue your application</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Show internship details if available */}
          {internshipDetails && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                {internshipDetails.companies?.company_logo && (
                  <img
                    src={internshipDetails.companies.company_logo}
                    alt={`${internshipDetails.companies.company_name} logo`}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">{internshipDetails.title}</h3>
                  <p className="text-sm text-gray-600">{internshipDetails.companies?.company_name}</p>
                </div>
              </div>
            </div>
          )}

          {/* Show loading state while checking status */}
          {isCheckingStatus ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Checking Application Status</h3>
              <p className="text-gray-600">Please wait while we check your application status...</p>
            </div>
          ) : !isAuthenticated ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In Required</h3>
              <p className="text-gray-600 mb-6">
                You need to sign in to apply for this internship. Please sign in to continue.
              </p>
              <button
                onClick={() => router.push('/intern-sign-in')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </button>
            </div>
          ) : (
            /* Different UI based on application status */
            existingApplication ? (
            existingApplication.status === 'submitted' ? (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Already Submitted</h3>
                <p className="text-gray-600 mb-6">
                  You have already submitted your application for this internship. You cannot submit another application.
                </p>
                <button
                  onClick={() => router.push('/intern-dashboard')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View My Applications
                </button>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Continue Your Application</h3>
                <p className="text-gray-600 mb-6">
                  You have already started an application for this internship. Click below to continue where you left off.
                </p>
              <button
                onClick={openApplication}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Application
              </button>
            </div>
            )
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Application</h3>
              <p className="text-gray-600 mb-6">
                Ready to apply for this internship? Click below to start your application.
              </p>
              <button
                onClick={startApplication}
                disabled={isLoading}
                className={`bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Starting...' : 'Start Application'}
              </button>
            </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}