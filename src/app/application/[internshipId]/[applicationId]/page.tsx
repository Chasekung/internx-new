'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationData {
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
      questionText: string;
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch the form data from Supabase
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
      } catch (error) {
        console.error('Error fetching application data:', error);
        // Handle error (show error message, redirect, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: params.applicationId,
          user_id: user.id,
          status: 'submitted'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: response.id,
            question_id: questionId,
            answer: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });

        if (answerError) throw answerError;
      }

      // Redirect to success page or dashboard
      router.push('/intern-dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (loading || !applicationData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderQuestion = (question: ApplicationData['sections'][0]['questions'][0]) => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            required={question.required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInputChange(question.id, file);
            }}
            className="w-full"
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{applicationData.title}</h1>
        <p className="text-gray-600 mt-2">Company: {applicationData.company}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / applicationData.sections.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Section {currentSection + 1} of {applicationData.sections.length}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {applicationData.sections[currentSection].title}
        </h2>
        <p className="text-gray-600 mb-6">
          {applicationData.sections[currentSection].description}
        </p>

        <div className="space-y-6">
          {applicationData.sections[currentSection].questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block font-medium">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-md ${
            currentSection === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentSection === applicationData.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationData {
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
      questionText: string;
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch the form data from Supabase
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
      } catch (error) {
        console.error('Error fetching application data:', error);
        // Handle error (show error message, redirect, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: params.applicationId,
          user_id: user.id,
          status: 'submitted'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: response.id,
            question_id: questionId,
            answer: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });

        if (answerError) throw answerError;
      }

      // Redirect to success page or dashboard
      router.push('/intern-dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (loading || !applicationData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderQuestion = (question: ApplicationData['sections'][0]['questions'][0]) => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            required={question.required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInputChange(question.id, file);
            }}
            className="w-full"
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{applicationData.title}</h1>
        <p className="text-gray-600 mt-2">Company: {applicationData.company}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / applicationData.sections.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Section {currentSection + 1} of {applicationData.sections.length}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {applicationData.sections[currentSection].title}
        </h2>
        <p className="text-gray-600 mb-6">
          {applicationData.sections[currentSection].description}
        </p>

        <div className="space-y-6">
          {applicationData.sections[currentSection].questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block font-medium">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-md ${
            currentSection === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentSection === applicationData.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationData {
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
      questionText: string;
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch the form data from Supabase
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
      } catch (error) {
        console.error('Error fetching application data:', error);
        // Handle error (show error message, redirect, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: params.applicationId,
          user_id: user.id,
          status: 'submitted'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: response.id,
            question_id: questionId,
            answer: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });

        if (answerError) throw answerError;
      }

      // Redirect to success page or dashboard
      router.push('/intern-dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (loading || !applicationData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderQuestion = (question: ApplicationData['sections'][0]['questions'][0]) => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            required={question.required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInputChange(question.id, file);
            }}
            className="w-full"
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{applicationData.title}</h1>
        <p className="text-gray-600 mt-2">Company: {applicationData.company}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / applicationData.sections.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Section {currentSection + 1} of {applicationData.sections.length}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {applicationData.sections[currentSection].title}
        </h2>
        <p className="text-gray-600 mb-6">
          {applicationData.sections[currentSection].description}
        </p>

        <div className="space-y-6">
          {applicationData.sections[currentSection].questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block font-medium">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-md ${
            currentSection === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentSection === applicationData.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationData {
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
      questionText: string;
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch the form data from Supabase
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
      } catch (error) {
        console.error('Error fetching application data:', error);
        // Handle error (show error message, redirect, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: params.applicationId,
          user_id: user.id,
          status: 'submitted'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: response.id,
            question_id: questionId,
            answer: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });

        if (answerError) throw answerError;
      }

      // Redirect to success page or dashboard
      router.push('/intern-dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (loading || !applicationData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderQuestion = (question: ApplicationData['sections'][0]['questions'][0]) => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            required={question.required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInputChange(question.id, file);
            }}
            className="w-full"
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{applicationData.title}</h1>
        <p className="text-gray-600 mt-2">Company: {applicationData.company}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / applicationData.sections.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Section {currentSection + 1} of {applicationData.sections.length}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {applicationData.sections[currentSection].title}
        </h2>
        <p className="text-gray-600 mb-6">
          {applicationData.sections[currentSection].description}
        </p>

        <div className="space-y-6">
          {applicationData.sections[currentSection].questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block font-medium">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-md ${
            currentSection === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentSection === applicationData.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationData {
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
      questionText: string;
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch the form data from Supabase
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
      } catch (error) {
        console.error('Error fetching application data:', error);
        // Handle error (show error message, redirect, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: params.applicationId,
          user_id: user.id,
          status: 'submitted'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: response.id,
            question_id: questionId,
            answer: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });

        if (answerError) throw answerError;
      }

      // Redirect to success page or dashboard
      router.push('/intern-dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (loading || !applicationData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderQuestion = (question: ApplicationData['sections'][0]['questions'][0]) => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            required={question.required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInputChange(question.id, file);
            }}
            className="w-full"
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{applicationData.title}</h1>
        <p className="text-gray-600 mt-2">Company: {applicationData.company}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / applicationData.sections.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Section {currentSection + 1} of {applicationData.sections.length}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {applicationData.sections[currentSection].title}
        </h2>
        <p className="text-gray-600 mb-6">
          {applicationData.sections[currentSection].description}
        </p>

        <div className="space-y-6">
          {applicationData.sections[currentSection].questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block font-medium">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-md ${
            currentSection === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentSection === applicationData.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationData {
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
      questionText: string;
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch the form data from Supabase
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
      } catch (error) {
        console.error('Error fetching application data:', error);
        // Handle error (show error message, redirect, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: params.applicationId,
          user_id: user.id,
          status: 'submitted'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: response.id,
            question_id: questionId,
            answer: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });

        if (answerError) throw answerError;
      }

      // Redirect to success page or dashboard
      router.push('/intern-dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (loading || !applicationData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderQuestion = (question: ApplicationData['sections'][0]['questions'][0]) => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            required={question.required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInputChange(question.id, file);
            }}
            className="w-full"
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{applicationData.title}</h1>
        <p className="text-gray-600 mt-2">Company: {applicationData.company}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / applicationData.sections.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Section {currentSection + 1} of {applicationData.sections.length}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {applicationData.sections[currentSection].title}
        </h2>
        <p className="text-gray-600 mb-6">
          {applicationData.sections[currentSection].description}
        </p>

        <div className="space-y-6">
          {applicationData.sections[currentSection].questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block font-medium">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-md ${
            currentSection === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentSection === applicationData.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationData {
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
      questionText: string;
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch the form data from Supabase
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
      } catch (error) {
        console.error('Error fetching application data:', error);
        // Handle error (show error message, redirect, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: params.applicationId,
          user_id: user.id,
          status: 'submitted'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: response.id,
            question_id: questionId,
            answer: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });

        if (answerError) throw answerError;
      }

      // Redirect to success page or dashboard
      router.push('/intern-dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (loading || !applicationData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderQuestion = (question: ApplicationData['sections'][0]['questions'][0]) => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            required={question.required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInputChange(question.id, file);
            }}
            className="w-full"
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{applicationData.title}</h1>
        <p className="text-gray-600 mt-2">Company: {applicationData.company}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / applicationData.sections.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Section {currentSection + 1} of {applicationData.sections.length}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {applicationData.sections[currentSection].title}
        </h2>
        <p className="text-gray-600 mb-6">
          {applicationData.sections[currentSection].description}
        </p>

        <div className="space-y-6">
          {applicationData.sections[currentSection].questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block font-medium">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-md ${
            currentSection === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentSection === applicationData.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface ApplicationData {
  title: string;
  company: string;
  sections: {
    id: string;
    title: string;
    description: string;
    questions: {
      id: string;
      type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
      questionText: string;
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export default function Application({ params }: { params: { internshipId: string; applicationId: string } }) {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        // Fetch the form data from Supabase
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
      } catch (error) {
        console.error('Error fetching application data:', error);
        // Handle error (show error message, redirect, etc.)
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationData();
  }, [params.internshipId]);

  const handleInputChange = (questionId: string, value: string | string[] | File) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Save the response
      const { data: response, error: responseError } = await supabase
        .from('form_responses')
        .insert({
          form_id: params.applicationId,
          user_id: user.id,
          status: 'submitted'
        })
        .select()
        .single();

      if (responseError) throw responseError;

      // Save individual answers
      for (const [questionId, value] of Object.entries(formData)) {
        const { error: answerError } = await supabase
          .from('response_answers')
          .insert({
            response_id: response.id,
            question_id: questionId,
            answer: typeof value === 'object' ? JSON.stringify(value) : value.toString()
          });

        if (answerError) throw answerError;
      }

      // Redirect to success page or dashboard
      router.push('/intern-dashboard');
    } catch (error) {
      console.error('Error submitting application:', error);
      // Handle error (show error message, etc.)
    }
  };

  if (loading || !applicationData) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const renderQuestion = (question: ApplicationData['sections'][0]['questions'][0]) => {
    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          />
        );

      case 'long_text':
        return (
          <textarea
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            required={question.required}
          />
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="mr-2"
                  required={question.required}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label key={option} className="block">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[question.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[question.id] || [];
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option);
                    handleInputChange(question.id, newValues);
                  }}
                  className="mr-2"
                />
                {option}
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <input
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInputChange(question.id, file);
            }}
            className="w-full"
            required={question.required}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{applicationData.title}</h1>
        <p className="text-gray-600 mt-2">Company: {applicationData.company}</p>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / applicationData.sections.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 mt-2">
          Section {currentSection + 1} of {applicationData.sections.length}
        </div>
      </div>

      {/* Current section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-semibold mb-2">
          {applicationData.sections[currentSection].title}
        </h2>
        <p className="text-gray-600 mb-6">
          {applicationData.sections[currentSection].description}
        </p>

        <div className="space-y-6">
          {applicationData.sections[currentSection].questions.map((question) => (
            <div key={question.id} className="space-y-2">
              <label className="block font-medium">
                {question.questionText}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestion(question)}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentSection(prev => prev - 1)}
          disabled={currentSection === 0}
          className={`px-4 py-2 rounded-md ${
            currentSection === 0
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        
        {currentSection === applicationData.sections.length - 1 ? (
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        ) : (
          <button
            onClick={() => setCurrentSection(prev => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 