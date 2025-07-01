'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationDetails {
  company_name: string;
  internship_title: string;
  submitted_at: string;
}

export default function ApplicationConfirmation({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // First get the application to get the internship_id and form_response_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('internship_id, form_response_id')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Then get the internship details
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, company_id')
          .eq('id', application.internship_id)
          .single();

        if (internshipError) throw internshipError;

        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', internship.company_id)
          .single();

        if (companyError) throw companyError;

        // Finally get the form response details
        const { data: formResponse, error: formResponseError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', application.form_response_id)
          .single();

        if (formResponseError) throw formResponseError;

        setDetails({
          company_name: company.company_name,
          internship_title: internship.title,
          submitted_at: formResponse.submitted_at
        });
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationDetails();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {details && (
            <div className="text-lg text-gray-600 mb-8">
              <p>
                Your application for the <span className="font-semibold">{details.internship_title}</span> position at{' '}
                <span className="font-semibold">{details.company_name}</span> has been submitted successfully.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(details.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/intern-dashboard')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/opportunities')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationDetails {
  company_name: string;
  internship_title: string;
  submitted_at: string;
}

export default function ApplicationConfirmation({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // First get the application to get the internship_id and form_response_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('internship_id, form_response_id')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Then get the internship details
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, company_id')
          .eq('id', application.internship_id)
          .single();

        if (internshipError) throw internshipError;

        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', internship.company_id)
          .single();

        if (companyError) throw companyError;

        // Finally get the form response details
        const { data: formResponse, error: formResponseError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', application.form_response_id)
          .single();

        if (formResponseError) throw formResponseError;

        setDetails({
          company_name: company.company_name,
          internship_title: internship.title,
          submitted_at: formResponse.submitted_at
        });
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationDetails();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {details && (
            <div className="text-lg text-gray-600 mb-8">
              <p>
                Your application for the <span className="font-semibold">{details.internship_title}</span> position at{' '}
                <span className="font-semibold">{details.company_name}</span> has been submitted successfully.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(details.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/intern-dashboard')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/opportunities')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationDetails {
  company_name: string;
  internship_title: string;
  submitted_at: string;
}

export default function ApplicationConfirmation({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // First get the application to get the internship_id and form_response_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('internship_id, form_response_id')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Then get the internship details
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, company_id')
          .eq('id', application.internship_id)
          .single();

        if (internshipError) throw internshipError;

        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', internship.company_id)
          .single();

        if (companyError) throw companyError;

        // Finally get the form response details
        const { data: formResponse, error: formResponseError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', application.form_response_id)
          .single();

        if (formResponseError) throw formResponseError;

        setDetails({
          company_name: company.company_name,
          internship_title: internship.title,
          submitted_at: formResponse.submitted_at
        });
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationDetails();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {details && (
            <div className="text-lg text-gray-600 mb-8">
              <p>
                Your application for the <span className="font-semibold">{details.internship_title}</span> position at{' '}
                <span className="font-semibold">{details.company_name}</span> has been submitted successfully.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(details.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/intern-dashboard')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/opportunities')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationDetails {
  company_name: string;
  internship_title: string;
  submitted_at: string;
}

export default function ApplicationConfirmation({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // First get the application to get the internship_id and form_response_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('internship_id, form_response_id')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Then get the internship details
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, company_id')
          .eq('id', application.internship_id)
          .single();

        if (internshipError) throw internshipError;

        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', internship.company_id)
          .single();

        if (companyError) throw companyError;

        // Finally get the form response details
        const { data: formResponse, error: formResponseError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', application.form_response_id)
          .single();

        if (formResponseError) throw formResponseError;

        setDetails({
          company_name: company.company_name,
          internship_title: internship.title,
          submitted_at: formResponse.submitted_at
        });
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationDetails();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {details && (
            <div className="text-lg text-gray-600 mb-8">
              <p>
                Your application for the <span className="font-semibold">{details.internship_title}</span> position at{' '}
                <span className="font-semibold">{details.company_name}</span> has been submitted successfully.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(details.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/intern-dashboard')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/opportunities')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 
 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationDetails {
  company_name: string;
  internship_title: string;
  submitted_at: string;
}

export default function ApplicationConfirmation({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // First get the application to get the internship_id and form_response_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('internship_id, form_response_id')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Then get the internship details
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, company_id')
          .eq('id', application.internship_id)
          .single();

        if (internshipError) throw internshipError;

        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', internship.company_id)
          .single();

        if (companyError) throw companyError;

        // Finally get the form response details
        const { data: formResponse, error: formResponseError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', application.form_response_id)
          .single();

        if (formResponseError) throw formResponseError;

        setDetails({
          company_name: company.company_name,
          internship_title: internship.title,
          submitted_at: formResponse.submitted_at
        });
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationDetails();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {details && (
            <div className="text-lg text-gray-600 mb-8">
              <p>
                Your application for the <span className="font-semibold">{details.internship_title}</span> position at{' '}
                <span className="font-semibold">{details.company_name}</span> has been submitted successfully.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(details.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/intern-dashboard')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/opportunities')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationDetails {
  company_name: string;
  internship_title: string;
  submitted_at: string;
}

export default function ApplicationConfirmation({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // First get the application to get the internship_id and form_response_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('internship_id, form_response_id')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Then get the internship details
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, company_id')
          .eq('id', application.internship_id)
          .single();

        if (internshipError) throw internshipError;

        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', internship.company_id)
          .single();

        if (companyError) throw companyError;

        // Finally get the form response details
        const { data: formResponse, error: formResponseError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', application.form_response_id)
          .single();

        if (formResponseError) throw formResponseError;

        setDetails({
          company_name: company.company_name,
          internship_title: internship.title,
          submitted_at: formResponse.submitted_at
        });
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationDetails();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {details && (
            <div className="text-lg text-gray-600 mb-8">
              <p>
                Your application for the <span className="font-semibold">{details.internship_title}</span> position at{' '}
                <span className="font-semibold">{details.company_name}</span> has been submitted successfully.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(details.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/intern-dashboard')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/opportunities')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationDetails {
  company_name: string;
  internship_title: string;
  submitted_at: string;
}

export default function ApplicationConfirmation({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // First get the application to get the internship_id and form_response_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('internship_id, form_response_id')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Then get the internship details
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, company_id')
          .eq('id', application.internship_id)
          .single();

        if (internshipError) throw internshipError;

        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', internship.company_id)
          .single();

        if (companyError) throw companyError;

        // Finally get the form response details
        const { data: formResponse, error: formResponseError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', application.form_response_id)
          .single();

        if (formResponseError) throw formResponseError;

        setDetails({
          company_name: company.company_name,
          internship_title: internship.title,
          submitted_at: formResponse.submitted_at
        });
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationDetails();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {details && (
            <div className="text-lg text-gray-600 mb-8">
              <p>
                Your application for the <span className="font-semibold">{details.internship_title}</span> position at{' '}
                <span className="font-semibold">{details.company_name}</span> has been submitted successfully.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(details.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/intern-dashboard')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/opportunities')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationDetails {
  company_name: string;
  internship_title: string;
  submitted_at: string;
}

export default function ApplicationConfirmation({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [details, setDetails] = useState<ApplicationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApplicationDetails = async () => {
      try {
        // First get the application to get the internship_id and form_response_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('internship_id, form_response_id')
          .eq('id', applicationId)
          .single();

        if (applicationError) throw applicationError;

        // Then get the internship details
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, company_id')
          .eq('id', application.internship_id)
          .single();

        if (internshipError) throw internshipError;

        // Get company details
        const { data: company, error: companyError } = await supabase
          .from('companies')
          .select('company_name')
          .eq('id', internship.company_id)
          .single();

        if (companyError) throw companyError;

        // Finally get the form response details
        const { data: formResponse, error: formResponseError } = await supabase
          .from('form_responses')
          .select('submitted_at')
          .eq('id', application.form_response_id)
          .single();

        if (formResponseError) throw formResponseError;

        setDetails({
          company_name: company.company_name,
          internship_title: internship.title,
          submitted_at: formResponse.submitted_at
        });
      } catch (error) {
        console.error('Error loading application details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadApplicationDetails();
  }, [applicationId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Application Submitted!
          </h1>

          {details && (
            <div className="text-lg text-gray-600 mb-8">
              <p>
                Your application for the <span className="font-semibold">{details.internship_title}</span> position at{' '}
                <span className="font-semibold">{details.company_name}</span> has been submitted successfully.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Submitted on {new Date(details.submitted_at).toLocaleDateString()}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => router.push('/intern-dashboard')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </button>

            <button
              onClick={() => router.push('/opportunities')}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse More Opportunities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 