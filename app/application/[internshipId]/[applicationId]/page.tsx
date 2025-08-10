'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

interface ApplicationData {
  id?: string;
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: string;
      questionText: string;
      required: boolean;
      options?: any;
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase, error: supabaseError } = useSupabase();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // First get the application to find the form_id
        const { data: application, error: applicationError } = await supabase
          .from('applications')
          .select('form_response_id')
          .eq('id', params.applicationId)
          .single();

        if (applicationError) throw applicationError;
        if (!application?.form_response_id) {
          // Get the form for this internship
          const { data: form, error: formError } = await supabase
            .from('forms')
            .select(`
              id,
              title,
              company:companies(name),
              sections:form_sections(
                id,
                title,
                description,
                questions:form_questions(
                  id,
                  type,
                  question_text,
                  required,
                  options
                )
              )
            `)
            .eq('internship_id', params.internshipId)
            .single();

          if (formError) throw formError;

          if (form) {
            setApplicationData({
              title: form.title,
              company: form.company?.[0]?.name || 'Unknown Company',
              sections: form.sections.map((section: any) => ({
                id: section.id,
                title: section.title,
                description: section.description,
                questions: section.questions.map((q: any) => ({
                  id: q.id,
                  type: q.type,
                  questionText: q.question_text,
                  required: q.required,
                  options: q.options ? JSON.parse(q.options) : undefined
                }))
              }))
            });
          }
        } else {
          // Load existing form response data
          const { data: formResponse, error: formResponseError } = await supabase
            .from('form_responses')
            .select(`
              forms (
                id,
                title,
                company:companies(name),
                sections:form_sections(
                  id,
                  title,
                  description,
                  questions:form_questions(
                    id,
                    type,
                    question_text,
                    required,
                    options
                  )
                )
              ),
              response_answers (
                question_id,
                answer_text,
                answer_data
              )
            `)
            .eq('id', application.form_response_id)
            .single();

          if (formResponseError) throw formResponseError;

          if (formResponse && formResponse.forms) {
            const form = formResponse.forms[0] || formResponse.forms; // Handle both array and single object
            setApplicationData({
              title: form.title,
              company: form.company?.[0]?.name || 'Unknown Company',
              sections: form.sections.map((section: any) => ({
                id: section.id,
                title: section.title,
                description: section.description,
                questions: section.questions.map((q: any) => ({
                  id: q.id,
                  type: q.type,
                  questionText: q.question_text,
                  required: q.required,
                  options: q.options ? JSON.parse(q.options) : undefined
                }))
              }))
            });

            // Set existing answers
            const answersMap = formResponse.response_answers.reduce((acc: Record<string, any>, answer: any) => {
              acc[answer.question_id] = answer.answer_data || answer.answer_text;
              return acc;
            }, {});
            setFormData(answersMap);
          }
        }
      } catch (error) {
        console.error('Error fetching application data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load application data');
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId, params.applicationId, supabase]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // First get or create form response
      let formResponseId = null;
      
      // Check if we already have a form response
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', params.applicationId)
        .single();

      if (applicationError) throw applicationError;

      if (application?.form_response_id) {
        formResponseId = application.form_response_id;
        
        // Update existing form response
        const { error: updateError } = await supabase
          .from('form_responses')
          .update({ 
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', formResponseId);

        if (updateError) throw updateError;
      } else {
        // Create new form response
        const { data: formResponse, error: responseError } = await supabase
          .from('form_responses')
          .insert({
            form_id: applicationData?.id,
            user_id: user.id,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (responseError) throw responseError;
        formResponseId = formResponse.id;

        // Update application with form response ID
        const { error: updateError } = await supabase
          .from('applications')
          .update({ form_response_id: formResponseId })
          .eq('id', params.applicationId);

        if (updateError) throw updateError;
      }

      // Delete existing answers if updating
      if (application?.form_response_id) {
        const { error: deleteError } = await supabase
          .from('response_answers')
          .delete()
          .eq('response_id', formResponseId);

        if (deleteError) throw deleteError;
      }

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: formResponseId,
            question_id: questionId,
            answer_text: typeof value === 'string' ? value : null,
            answer_data: typeof value !== 'string' ? value : null
          });

        if (answerError) throw answerError;
      }

      // Update application status
      const { error: statusError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', params.applicationId);

      if (statusError) throw statusError;

      // Redirect to confirmation page
      router.push(`/forms/application/${params.internshipId}/${params.applicationId}/confirmation`);
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-lg w-full">
          <h2 className="text-red-800 text-lg font-semibold mb-2">Error</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-lg w-full">
          <h2 className="text-yellow-800 text-lg font-semibold mb-2">Application Not Found</h2>
          <p className="text-yellow-600">The application you're looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Add your form rendering logic here */}
    </div>
  );
}