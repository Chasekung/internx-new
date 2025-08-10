'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

export default function ApplicationConfirmation({ 
  params: { internshipId, applicationId } 
}: { 
  params: { internshipId: string; applicationId: string } 
}) {
  const router = useRouter();
  
  const [internshipDetails, setInternshipDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { supabase, error: supabaseError } = useSupabase();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);

  useEffect(() => {
    const fetchInternshipDetails = async () => {
      try {
        const { data: internship, error } = await supabase
          .from('internships')
          .select(`
            title,
            companies (
              company_name,
              logo_url
            )
          `)
          .eq('id', internshipId)
          .single();

        if (error) throw error;
        setInternshipDetails(internship);
      } catch (error) {
        console.error('Error fetching internship details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternshipDetails();
  }, [internshipId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Application Submitted!
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for applying to {internshipDetails?.title} at {internshipDetails?.companies?.company_name}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">What's Next?</h3>
          <ul className="space-y-4 text-left">
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600">
                The company will review your application and reach out if they'd like to move forward
              </span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600">
                You can track your application status in your dashboard
              </span>
            </li>
            <li className="flex items-start">
              <svg className="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-600">
                Keep applying to other opportunities to increase your chances
              </span>
            </li>
          </ul>
        </div>

        <div className="flex space-x-4">
          <Link
            href="/intern-dashboard"
            className="flex-1 justify-center inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            View Dashboard
          </Link>
          <Link
            href="/opportunities"
            className="flex-1 justify-center inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Browse More Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}