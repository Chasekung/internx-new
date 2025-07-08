'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function ApplyLandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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

  const checkExistingApplication = async (internshipId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) return;

      // Check for existing application and get its status, including form response status
      const { data: application, error } = await supabase
        .from('applications')
        .select(`
          id, 
          status,
          form_response_id,
          form_responses (
            id,
            status,
            submitted_at
          )
        `)
        .eq('internship_id', internshipId)
        .eq('intern_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (application) {
        // Check if either the application OR form response is submitted
        const appSubmitted = application.status === 'submitted';
        const formResponse = Array.isArray(application.form_responses) ? application.form_responses[0] : application.form_responses;
        const formSubmitted = formResponse?.status === 'submitted' && formResponse?.submitted_at;
        
        // If either is submitted, consider the whole application submitted
        const isActuallySubmitted = appSubmitted || formSubmitted;
        
        console.log('Application status check:', {
          applicationId: application.id,
          appStatus: application.status,
          formStatus: formResponse?.status,
          formSubmittedAt: formResponse?.submitted_at,
          isActuallySubmitted
        });

        // If there's a mismatch, fix it by updating both to be consistent
        if (isActuallySubmitted && (!appSubmitted || !formSubmitted)) {
          console.log('Status mismatch detected, fixing...');
          
          // Update application status to submitted if it's not
          if (!appSubmitted) {
            await supabase
              .from('applications')
              .update({ status: 'submitted' })
              .eq('id', application.id);
          }
          
          // Update form response status to submitted if it exists and isn't submitted
          if (application.form_response_id && !formSubmitted) {
            await supabase
              .from('form_responses')
              .update({ 
                status: 'submitted',
                submitted_at: new Date().toISOString()
              })
              .eq('id', application.form_response_id);
          }
        }

        setExistingApplication({
          id: application.id,
          status: isActuallySubmitted ? 'submitted' : application.status
        });
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
    }
  };

  const startApplication = async () => {
    try {
      setIsLoading(true);

      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
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

      // Double-check that no submitted application exists (security check)
      const { data: existingApp, error: checkError } = await supabase
        .from('applications')
        .select(`
          id, 
          status,
          form_response_id,
          form_responses (
            status,
            submitted_at
          )
        `)
        .eq('internship_id', internshipId)
        .eq('intern_id', session.user.id)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingApp) {
        const appSubmitted = existingApp.status === 'submitted';
        const formResponse = Array.isArray(existingApp.form_responses) ? existingApp.form_responses[0] : existingApp.form_responses;
        const formSubmitted = formResponse?.status === 'submitted' && formResponse?.submitted_at;
        
        if (appSubmitted || formSubmitted) {
          setError('You have already submitted an application for this internship.');
          return;
        }
      }

      // Get internship details
      const { data: internship, error: internshipError } = await supabase
        .from('internships')
        .select(`
          *,
          company:company_id (
            company_name,
            company_logo
          )
        `)
        .eq('id', internshipId)
        .single();

      if (internshipError) throw internshipError;

      // Get the company's form template
      const { data: formTemplate, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('internship_id', internshipId)
        .eq('company_id', internship.company_id)
        .single();

      if (formError) {
        throw new Error('No application form template found for this internship. Please contact the company.');
      }

      // Create or update application record
      let application;
      if (existingApp) {
        // Update existing application to in_progress if it was draft
        const { data: updatedApp, error: updateError } = await supabase
          .from('applications')
          .update({ status: 'in_progress' })
          .eq('id', existingApp.id)
          .select()
          .single();

        if (updateError) throw updateError;
        application = updatedApp;
      } else {
        // Create new application record
        const { data: newApp, error: applicationError } = await supabase
          .from('applications')
          .insert({
            internship_id: internshipId,
            intern_id: session.user.id,
            status: 'in_progress',
          })
          .select()
          .single();

        if (applicationError) throw applicationError;
        application = newApp;
      }

      // Create form response record
      const { data: formResponse, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: formTemplate.id,
          applicant_id: session.user.id,
          status: 'in_progress'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Update application with form response ID
      const { error: updateError } = await supabase
        .from('applications')
        .update({ form_response_id: formResponse.id })
        .eq('id', application.id);

      if (updateError) throw updateError;

      // Set the existing application
      setExistingApplication({ id: application.id, status: application.status });

      router.push(`/forms/${application.id}/${internshipId}`);
    } catch (error) {
      console.error('Error starting application:', error);
      setError(error instanceof Error ? error.message : 'Failed to start application');
    } finally {
      setIsLoading(false);
    }
  };

  const openApplication = () => {
    if (existingApplication && internshipId) {
      router.push(`/forms/${existingApplication.id}/${internshipId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Apply for Internship</h1>
            <p className="mt-2 text-gray-600">Start or continue your application</p>
          </div>
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

          {/* Different UI based on application status */}
          {existingApplication ? (
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
          )}
        </div>
      </div>
    </div>
  );
} 