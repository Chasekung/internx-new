'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  description: string;
  form_sections: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    form_questions: Question[];
  }[];
}

export default function ApplicationForm({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadSavedAnswers();
  }, [applicationId, internshipId]);

  const loadFormData = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Get the form data
      const { data: form, error: formError } = await supabase
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

      // Sort sections and questions by order_index
      const sortedData = {
        ...form,
        form_sections: form.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            form_questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      };

      setFormData(sortedData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', application.form_response_id);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    try {
      setIsSaving(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: application.form_response_id,
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
    try {
      setIsSaving(true);
      
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.form_response_id}/${questionId}.${fileExt}`;
      
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
    try {
      setIsSubmitting(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Update form response status
      const { error: responseError } = await supabase
        .from('form_responses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', application.form_response_id);

      if (responseError) throw responseError;

      // Update application status
      const { error: applicationUpdateError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationUpdateError) throw applicationUpdateError;

      // Redirect to confirmation page
      router.push(`/forms/${applicationId}/${internshipId}/confirmation`);
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

  const currentSectionData = formData.form_sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentSection / formData.form_sections.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / formData.form_sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.form_questions.map((question) => (
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

                {question.type === 'dropdown' && question.options && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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

                {question.type === 'video_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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
                        Video uploaded: {answers[question.id]}
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
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            {currentSection === formData.form_sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  description: string;
  form_sections: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    form_questions: Question[];
  }[];
}

export default function ApplicationForm({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadSavedAnswers();
  }, [applicationId, internshipId]);

  const loadFormData = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Get the form data
      const { data: form, error: formError } = await supabase
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

      // Sort sections and questions by order_index
      const sortedData = {
        ...form,
        form_sections: form.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            form_questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      };

      setFormData(sortedData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', application.form_response_id);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    try {
      setIsSaving(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: application.form_response_id,
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
    try {
      setIsSaving(true);
      
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.form_response_id}/${questionId}.${fileExt}`;
      
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
    try {
      setIsSubmitting(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Update form response status
      const { error: responseError } = await supabase
        .from('form_responses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', application.form_response_id);

      if (responseError) throw responseError;

      // Update application status
      const { error: applicationUpdateError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationUpdateError) throw applicationUpdateError;

      // Redirect to confirmation page
      router.push(`/forms/${applicationId}/${internshipId}/confirmation`);
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

  const currentSectionData = formData.form_sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentSection / formData.form_sections.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / formData.form_sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.form_questions.map((question) => (
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

                {question.type === 'dropdown' && question.options && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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

                {question.type === 'video_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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
                        Video uploaded: {answers[question.id]}
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
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            {currentSection === formData.form_sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  description: string;
  form_sections: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    form_questions: Question[];
  }[];
}

export default function ApplicationForm({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadSavedAnswers();
  }, [applicationId, internshipId]);

  const loadFormData = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Get the form data
      const { data: form, error: formError } = await supabase
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

      // Sort sections and questions by order_index
      const sortedData = {
        ...form,
        form_sections: form.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            form_questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      };

      setFormData(sortedData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', application.form_response_id);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    try {
      setIsSaving(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: application.form_response_id,
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
    try {
      setIsSaving(true);
      
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.form_response_id}/${questionId}.${fileExt}`;
      
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
    try {
      setIsSubmitting(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Update form response status
      const { error: responseError } = await supabase
        .from('form_responses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', application.form_response_id);

      if (responseError) throw responseError;

      // Update application status
      const { error: applicationUpdateError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationUpdateError) throw applicationUpdateError;

      // Redirect to confirmation page
      router.push(`/forms/${applicationId}/${internshipId}/confirmation`);
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

  const currentSectionData = formData.form_sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentSection / formData.form_sections.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / formData.form_sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.form_questions.map((question) => (
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

                {question.type === 'dropdown' && question.options && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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

                {question.type === 'video_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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
                        Video uploaded: {answers[question.id]}
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
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            {currentSection === formData.form_sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  description: string;
  form_sections: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    form_questions: Question[];
  }[];
}

export default function ApplicationForm({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadSavedAnswers();
  }, [applicationId, internshipId]);

  const loadFormData = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Get the form data
      const { data: form, error: formError } = await supabase
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

      // Sort sections and questions by order_index
      const sortedData = {
        ...form,
        form_sections: form.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            form_questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      };

      setFormData(sortedData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', application.form_response_id);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    try {
      setIsSaving(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: application.form_response_id,
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
    try {
      setIsSaving(true);
      
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.form_response_id}/${questionId}.${fileExt}`;
      
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
    try {
      setIsSubmitting(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Update form response status
      const { error: responseError } = await supabase
        .from('form_responses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', application.form_response_id);

      if (responseError) throw responseError;

      // Update application status
      const { error: applicationUpdateError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationUpdateError) throw applicationUpdateError;

      // Redirect to confirmation page
      router.push(`/forms/${applicationId}/${internshipId}/confirmation`);
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

  const currentSectionData = formData.form_sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentSection / formData.form_sections.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / formData.form_sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.form_questions.map((question) => (
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

                {question.type === 'dropdown' && question.options && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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

                {question.type === 'video_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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
                        Video uploaded: {answers[question.id]}
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
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            {currentSection === formData.form_sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  description: string;
  form_sections: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    form_questions: Question[];
  }[];
}

export default function ApplicationForm({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadSavedAnswers();
  }, [applicationId, internshipId]);

  const loadFormData = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Get the form data
      const { data: form, error: formError } = await supabase
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

      // Sort sections and questions by order_index
      const sortedData = {
        ...form,
        form_sections: form.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            form_questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      };

      setFormData(sortedData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', application.form_response_id);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    try {
      setIsSaving(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: application.form_response_id,
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
    try {
      setIsSaving(true);
      
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.form_response_id}/${questionId}.${fileExt}`;
      
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
    try {
      setIsSubmitting(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Update form response status
      const { error: responseError } = await supabase
        .from('form_responses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', application.form_response_id);

      if (responseError) throw responseError;

      // Update application status
      const { error: applicationUpdateError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationUpdateError) throw applicationUpdateError;

      // Redirect to confirmation page
      router.push(`/forms/${applicationId}/${internshipId}/confirmation`);
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

  const currentSectionData = formData.form_sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentSection / formData.form_sections.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / formData.form_sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.form_questions.map((question) => (
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

                {question.type === 'dropdown' && question.options && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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

                {question.type === 'video_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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
                        Video uploaded: {answers[question.id]}
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
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            {currentSection === formData.form_sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  description: string;
  form_sections: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    form_questions: Question[];
  }[];
}

export default function ApplicationForm({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadSavedAnswers();
  }, [applicationId, internshipId]);

  const loadFormData = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Get the form data
      const { data: form, error: formError } = await supabase
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

      // Sort sections and questions by order_index
      const sortedData = {
        ...form,
        form_sections: form.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            form_questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      };

      setFormData(sortedData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', application.form_response_id);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    try {
      setIsSaving(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: application.form_response_id,
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
    try {
      setIsSaving(true);
      
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.form_response_id}/${questionId}.${fileExt}`;
      
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
    try {
      setIsSubmitting(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Update form response status
      const { error: responseError } = await supabase
        .from('form_responses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', application.form_response_id);

      if (responseError) throw responseError;

      // Update application status
      const { error: applicationUpdateError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationUpdateError) throw applicationUpdateError;

      // Redirect to confirmation page
      router.push(`/forms/${applicationId}/${internshipId}/confirmation`);
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

  const currentSectionData = formData.form_sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentSection / formData.form_sections.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / formData.form_sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.form_questions.map((question) => (
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

                {question.type === 'dropdown' && question.options && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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

                {question.type === 'video_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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
                        Video uploaded: {answers[question.id]}
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
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            {currentSection === formData.form_sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  description: string;
  form_sections: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    form_questions: Question[];
  }[];
}

export default function ApplicationForm({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadSavedAnswers();
  }, [applicationId, internshipId]);

  const loadFormData = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Get the form data
      const { data: form, error: formError } = await supabase
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

      // Sort sections and questions by order_index
      const sortedData = {
        ...form,
        form_sections: form.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            form_questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      };

      setFormData(sortedData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', application.form_response_id);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    try {
      setIsSaving(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: application.form_response_id,
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
    try {
      setIsSaving(true);
      
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.form_response_id}/${questionId}.${fileExt}`;
      
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
    try {
      setIsSubmitting(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Update form response status
      const { error: responseError } = await supabase
        .from('form_responses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', application.form_response_id);

      if (responseError) throw responseError;

      // Update application status
      const { error: applicationUpdateError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationUpdateError) throw applicationUpdateError;

      // Redirect to confirmation page
      router.push(`/forms/${applicationId}/${internshipId}/confirmation`);
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

  const currentSectionData = formData.form_sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentSection / formData.form_sections.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / formData.form_sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.form_questions.map((question) => (
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

                {question.type === 'dropdown' && question.options && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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

                {question.type === 'video_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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
                        Video uploaded: {answers[question.id]}
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
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            {currentSection === formData.form_sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  required: boolean;
  options?: string[];
}

interface FormData {
  id: string;
  title: string;
  description: string;
  form_sections: {
    id: string;
    title: string;
    description: string;
    order_index: number;
    form_questions: Question[];
  }[];
}

export default function ApplicationForm({ 
  params: { applicationId, internshipId } 
}: { 
  params: { applicationId: string; internshipId: string } 
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadFormData();
    loadSavedAnswers();
  }, [applicationId, internshipId]);

  const loadFormData = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Get the form response to find the form_id
      const { data: formResponse, error: formResponseError } = await supabase
        .from('form_responses')
        .select('form_id')
        .eq('id', application.form_response_id)
        .single();

      if (formResponseError) throw formResponseError;

      // Get the form data
      const { data: form, error: formError } = await supabase
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

      // Sort sections and questions by order_index
      const sortedData = {
        ...form,
        form_sections: form.form_sections
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((section: any) => ({
            ...section,
            form_questions: section.form_questions
              .sort((a: any, b: any) => a.order_index - b.order_index)
          }))
      };

      setFormData(sortedData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSavedAnswers = async () => {
    try {
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { data: savedAnswers, error } = await supabase
        .from('response_answers')
        .select('question_id, answer_text, answer_data')
        .eq('response_id', application.form_response_id);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    try {
      setIsSaving(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      const { error } = await supabase
        .from('response_answers')
        .upsert({
          response_id: application.form_response_id,
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
    try {
      setIsSaving(true);
      
      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${application.form_response_id}/${questionId}.${fileExt}`;
      
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
    try {
      setIsSubmitting(true);

      // Get the application to find the form_response_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('form_response_id')
        .eq('id', applicationId)
        .single();

      if (applicationError) throw applicationError;

      // Update form response status
      const { error: responseError } = await supabase
        .from('form_responses')
        .update({ 
          status: 'submitted',
          submitted_at: new Date().toISOString()
        })
        .eq('id', application.form_response_id);

      if (responseError) throw responseError;

      // Update application status
      const { error: applicationUpdateError } = await supabase
        .from('applications')
        .update({ status: 'submitted' })
        .eq('id', applicationId);

      if (applicationUpdateError) throw applicationUpdateError;

      // Redirect to confirmation page
      router.push(`/forms/${applicationId}/${internshipId}/confirmation`);
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

  const currentSectionData = formData.form_sections[currentSection];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round((currentSection / formData.form_sections.length) * 100)}%</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentSection / formData.form_sections.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {currentSectionData.title}
          </h2>
          {currentSectionData.description && (
            <p className="text-gray-600 mb-6">{currentSectionData.description}</p>
          )}

          <div className="space-y-6">
            {currentSectionData.form_questions.map((question) => (
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

                {question.type === 'dropdown' && question.options && (
                  <select
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an option</option>
                    {question.options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                )}

                {question.type === 'file_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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

                {question.type === 'video_upload' && (
                  <div className="mt-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(question.id, file);
                        }
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
                        Video uploaded: {answers[question.id]}
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
              className={`px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                currentSection === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Previous
            </button>

            {currentSection === formData.form_sections.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentSection(prev => prev + 1)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Auto-save indicator */}
        {isSaving && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg text-sm">
            Saving...
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 