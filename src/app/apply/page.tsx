'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

export default function ApplyLandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [existingApplication, setExistingApplication] = useState<{ id: string } | null>(null);
  const [internshipId, setInternshipId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

      const { data: application, error } = await supabase
        .from('applications')
        .select('id')
        .eq('internship_id', internshipId)
        .eq('intern_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }

      if (application) {
        setExistingApplication(application);
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

      // Create application record
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          internship_id: internshipId,
          intern_id: session.user.id,
          status: 'in_progress',
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

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
      setExistingApplication(application);

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
          {existingApplication ? (
            <div>
              <p className="text-gray-600 mb-6">You have already started an application for this internship.</p>
              <button
                onClick={openApplication}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Application
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-6">Click below to start your application.</p>
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