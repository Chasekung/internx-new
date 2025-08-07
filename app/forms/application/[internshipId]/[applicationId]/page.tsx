'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

interface FormData {
  title: string;
  description?: string;
  sections: Section[];
}

export default function ApplicationForm({ 
  params: { internshipId, applicationId } 
}: { 
  params: { internshipId: string; applicationId: string } 
}) {
  const router = useRouter();
  
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formResponseId, setFormResponseId] = useState<string | null>(null);
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  useEffect(() => {
    loadFormData();
  }, [internshipId, applicationId]);

  const loadFormData = async () => {
    try {
      // First get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;
      if (!application?.form_response_id) throw new Error('No form response found');

      setFormResponseId(application.form_response_id);

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Now get the actual form data
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select(`
          id,
          title,
          description,
          form_sections (
            id,
            title,
            description,
            order_index,
            form_questions (
              id,
              type,
              question_text,
              required,
              options,
              order_index
            )
          )
        `)
        .eq('id', formResponse.form_id)
        .single();

      if (formError) throw formError;

      // Sort sections and questions by order_index and map to the correct interface
      const sortedData: FormData = {
        title: formData.title,
        description: formData.description,
        sections: formData.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            id: section.id,
            title: section.title,
            description: section.description,
            questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
              .map((q: any) => ({
                id: q.id,
                type: q.type,
                question_text: q.question_text,
                required: q.required,
                options: q.options ? JSON.parse(q.options) : undefined
              }))
          }))
      };

      setFormData(sortedData);

      // Load saved answers after form data is loaded
      await loadSavedAnswers(application.form_response_id);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async (responseId: string) => {
    try {
      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', responseId);

      if (error) throw error;

      const answersMap = savedAnswers.reduce((acc: Record<string, any>, answer) => {
        acc[answer.question_id] = answer.answer_data || answer.answer_text;
        return acc;
      }, {});

      setAnswers(answersMap);
    } catch (error) {
      console.error('Error loading saved answers:', error);
    }
  };

  const handleAnswerChange = async (questionId: string, value: any) => {
    if (!formResponseId) return;
    
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-save the answer
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: formResponseId,
          question_id: questionId,
          answer_text: typeof value === 'string' ? value : null,
          answer_data: typeof value !== 'string' ? value : null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving answer:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    if (!formResponseId) return;
    
    try {
      setIsSaving(true);
      
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${formResponseId}/${questionId}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('application-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save file URL to answers
      const { data: { publicUrl } } = supabase.storage
        .from('application-files')
        .getPublicUrl(fileName);

      await handleAnswerChange(questionId, publicUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!formResponseId) return;
    
    try {
      setIsSubmitting(true);

      // Update form response status
      const { error: statusError } = await supabase
        .from('form_responses')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', formResponseId);

      if (statusError) throw statusError;

      // Update application status
      const { error: applicationError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationError) throw applicationError;

      // Redirect to confirmation page
      router.push(`/forms/application/${internshipId}/${applicationId}/confirmation`);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentSectionData = formData.sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(((currentSection + 1) / formData.sections.length) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / formData.sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{formData.title}</h1>
          {formData.description && (
            <p className="text-gray-600">{formData.description}</p>
          )}
        </div>

        {/* Section content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.questions.map((question) => (
              <div key={question.id} className="border-b border-gray-200 pb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {question.question_text}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>

                {question.type === 'short_text' && (
                  <input
                    type="text"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                )}

                {question.type === 'long_text' && (
                  <textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                )}

                {question.type === 'multiple_choice' && question.options && (
                  <div className="mt-2 space-y-2">
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          id={`${question.id}-${index}`}
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label
                          htmlFor={`${question.id}-${index}`}
                          className="ml-3 block text-sm text-gray-700"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'checkboxes' && question.options && (
                  <div className="mt-2 space-y-2">
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`${question.id}-${index}`}
                          value={option}
                          checked={(answers[question.id] || []).includes(option)}
                          onChange={(e) => {
                            const currentAnswers = answers[question.id] || [];
                            const newAnswers = e.target.checked
                              ? [...currentAnswers, option]
                              : currentAnswers.filter((a: string) => a !== option);
                            handleAnswerChange(question.id, newAnswers);
                          }}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`${question.id}-${index}`}
                          className="ml-3 block text-sm text-gray-700"
                        >
                          {option}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-2">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(question.id, file);
                      }}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    {answers[question.id] && (
                      <div className="mt-2 text-sm text-gray-500">
                        File uploaded: {answers[question.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="mt-8 flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentSection(prev => prev - 1)}
              disabled={currentSection === 0}
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium 
                ${currentSection === 0
                  ? 'text-gray-400 bg-gray-50'
                  : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
            >
              Previous
            </button>

            {currentSection === formData.sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                  ${isSubmitting
                    ? 'bg-blue-400'
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Saving indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 