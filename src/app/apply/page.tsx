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
          application_id: application.id,
          intern_id: session.user.id,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingApplication ? 'Continue Your Application' : 'Start Your Application'}
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Before you begin:</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your resume ready to upload (PDF format preferred)
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set aside 15-30 minutes to complete the application
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your progress will be automatically saved
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {existingApplication ? (
                <button
                  onClick={openApplication}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Application
                </button>
              ) : (
                <button
                  onClick={startApplication}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Creating your application...
                    </div>
                  ) : (
                    'Start Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 

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
          application_id: application.id,
          intern_id: session.user.id,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingApplication ? 'Continue Your Application' : 'Start Your Application'}
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Before you begin:</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your resume ready to upload (PDF format preferred)
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set aside 15-30 minutes to complete the application
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your progress will be automatically saved
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {existingApplication ? (
                <button
                  onClick={openApplication}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Application
                </button>
              ) : (
                <button
                  onClick={startApplication}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Creating your application...
                    </div>
                  ) : (
                    'Start Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 

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
          application_id: application.id,
          intern_id: session.user.id,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingApplication ? 'Continue Your Application' : 'Start Your Application'}
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Before you begin:</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your resume ready to upload (PDF format preferred)
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set aside 15-30 minutes to complete the application
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your progress will be automatically saved
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {existingApplication ? (
                <button
                  onClick={openApplication}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Application
                </button>
              ) : (
                <button
                  onClick={startApplication}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Creating your application...
                    </div>
                  ) : (
                    'Start Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 

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
          application_id: application.id,
          intern_id: session.user.id,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingApplication ? 'Continue Your Application' : 'Start Your Application'}
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Before you begin:</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your resume ready to upload (PDF format preferred)
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set aside 15-30 minutes to complete the application
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your progress will be automatically saved
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {existingApplication ? (
                <button
                  onClick={openApplication}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Application
                </button>
              ) : (
                <button
                  onClick={startApplication}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Creating your application...
                    </div>
                  ) : (
                    'Start Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 
 

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
          application_id: application.id,
          intern_id: session.user.id,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingApplication ? 'Continue Your Application' : 'Start Your Application'}
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Before you begin:</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your resume ready to upload (PDF format preferred)
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set aside 15-30 minutes to complete the application
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your progress will be automatically saved
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {existingApplication ? (
                <button
                  onClick={openApplication}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Application
                </button>
              ) : (
                <button
                  onClick={startApplication}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Creating your application...
                    </div>
                  ) : (
                    'Start Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 

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
          application_id: application.id,
          intern_id: session.user.id,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingApplication ? 'Continue Your Application' : 'Start Your Application'}
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Before you begin:</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your resume ready to upload (PDF format preferred)
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set aside 15-30 minutes to complete the application
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your progress will be automatically saved
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {existingApplication ? (
                <button
                  onClick={openApplication}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Application
                </button>
              ) : (
                <button
                  onClick={startApplication}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Creating your application...
                    </div>
                  ) : (
                    'Start Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 

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
          application_id: application.id,
          intern_id: session.user.id,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingApplication ? 'Continue Your Application' : 'Start Your Application'}
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Before you begin:</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your resume ready to upload (PDF format preferred)
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set aside 15-30 minutes to complete the application
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your progress will be automatically saved
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {existingApplication ? (
                <button
                  onClick={openApplication}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Application
                </button>
              ) : (
                <button
                  onClick={startApplication}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Creating your application...
                    </div>
                  ) : (
                    'Start Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 

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
          application_id: application.id,
          intern_id: session.user.id,
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            {existingApplication ? 'Continue Your Application' : 'Start Your Application'}
          </h1>
          
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Before you begin:</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Have your resume ready to upload (PDF format preferred)
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Set aside 15-30 minutes to complete the application
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Your progress will be automatically saved
                </li>
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-6">
              {existingApplication ? (
                <button
                  onClick={openApplication}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Open Application
                </button>
              ) : (
                <button
                  onClick={startApplication}
                  disabled={isLoading}
                  className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Creating your application...
                    </div>
                  ) : (
                    'Start Application'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 