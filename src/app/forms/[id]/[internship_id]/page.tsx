'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import supabase from '@/lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

interface FormData {
  id: string;
  title: string;
  description: string;
  primary_color: number | null;
  background_color: number | null;
  font_family: string;
  border_radius: number | null;
  spacing: number | null;
  accepting_responses: boolean;
  form_privacy: 'public' | 'private' | 'organization';
  published: boolean;
  published_at: string | null;
  share_url: string | null;
}

interface Section {
  id: string;
  title: string;
  description: string;
  order_index: number;
  questions: Question[];
}

interface Question {
  id: string;
  type: string;
  question_text: string;
  required: boolean;
  order_index: number;
  description: string;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export default function PublicForm({ params: { id, internship_id } }: { params: { id: string, internship_id: string } }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setIsLoading(true);
      
      // First, verify that the application exists and get the internship_id
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('internship_id')
        .eq('id', id)
        .eq('internship_id', internship_id)
        .single();

      if (applicationError || !application) {
        toast.error('Application not found');
        return;
      }

      // Now find the form associated with this internship
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('internship_id', application.internship_id)
        .eq('published', true)
        .single();

      if (formError || !form) {
        toast.error('Form not found or not published');
        return;
      }

      setFormData(form);

      // Load sections and questions
      const res = await fetch(`/api/companies/forms/${form.id}/questions`);
      if (!res.ok) throw new Error('Failed to fetch form questions');
      const { sections: apiSections } = await res.json();
      
      // Map API response to local Section/Question structure with proper options extraction
      const formattedSections = apiSections.map((section: any) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        questions: (section.questions || []).map((q: any) => {
          const options = (() => {
            if (q.type === 'multiple_choice' || q.type === 'checkboxes') {
              return Array.from({ length: 15 }, (_, i) => q[`choice_${i + 1}`]).filter(Boolean);
            }
            if (q.type === 'dropdown') {
              return Array.from({ length: 50 }, (_, i) => q[`dropdown_${i + 1}`]).filter(Boolean);
            }
            return undefined;
          })();
          
          return {
            id: q.id,
            type: q.type,
            question_text: q.question_text,
            description: q.description,
            required: q.required,
            order_index: q.order_index,
            placeholder: q.placeholder,
            hint: q.hint,
            options
          };
        })
      }));
      
      setSections(formattedSections);

    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  const theme = {
    primaryColor: formData?.primary_color !== null ? `#${formData?.primary_color?.toString(16).padStart(6, '0')}` : '#3b82f6',
    backgroundColor: formData?.background_color !== null ? `#${formData?.background_color?.toString(16).padStart(6, '0')}` : '#ffffff',
    fontFamily: formData?.font_family || 'Inter',
    borderRadius: formData?.border_radius ?? 8,
    spacing: formData?.spacing ?? 16
  };

  // Create allSections with thank you section appended
  const thankYouSection = {
    id: 'thank-you',
    title: '',
    description: '',
    order_index: sections.length,
    questions: []
  };
  const allSections = [...sections, thankYouSection];

  // Multi-step form navigation functions
  const nextStep = () => {
    if (currentStep < allSections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // High schoolers can only go to steps they've completed or the next step
    if (step <= currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    // TODO: Implement form submission to database
    console.log('Form responses:', responses);
    toast.success('Form submitted successfully!');
    setIsSubmitted(true);
    setCurrentStep(allSections.length - 1); // Go to thank you page
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Form not found</h2>
          <p className="text-gray-600 mt-2">This form is not available or has been unpublished.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />
      
      {/* Main Container */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Form Section */}
          <div className="bg-white shadow rounded-lg p-6">
            
            {/* Progress Bar */}
            {allSections.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {currentStep + 1} of {allSections.length}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(((currentStep + 1) / allSections.length) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{ 
                        width: `${((currentStep + 1) / allSections.length) * 100}%`,
                        backgroundColor: theme.primaryColor
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2">
                  {allSections.map((section, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;
                    const isAccessible = index <= currentStep + 1;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => goToStep(index)}
                        disabled={!isAccessible}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          isCurrent
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                            : isCompleted
                            ? 'bg-green-100 text-green-700 border-2 border-green-300'
                            : isAccessible
                            ? 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                        }`}
                        style={{ borderRadius: theme.borderRadius }}
                      >
                        {index + 1}. {section.id === 'thank-you' ? 'Thank You' : section.title || `Section ${index + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Form Content */}
            <div 
              className="border rounded-lg p-6 mb-4"
              style={{ 
                backgroundColor: theme.backgroundColor,
                borderRadius: theme.borderRadius,
                fontFamily: theme.fontFamily
              }}
            >
              <h1 className="text-2xl font-bold mb-4 text-gray-900">
                {formData.title || 'Untitled Form'}
              </h1>
              {formData.description && (
                <p className="text-gray-600 mb-6">{formData.description}</p>
              )}
              
              {/* Current Section Content */}
              {allSections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sections available.</p>
                </div>
              ) : currentStep === allSections.length - 1 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Thank you for submitting!</h2>
                  <p className="text-gray-700 text-lg">Check your dashboard for updates.</p>
                </div>
              ) : allSections[currentStep] ? (
                <div className="space-y-4">
                  <div key={allSections[currentStep].id} className="space-y-4">
                    {allSections[currentStep].title && (
                      <h3 className="text-lg font-semibold text-gray-900">{allSections[currentStep].title}</h3>
                    )}
                    {allSections[currentStep].description && (
                      <p className="text-gray-600 text-sm">{allSections[currentStep].description}</p>
                    )}
                    
                    {allSections[currentStep].questions.map((question, questionIndex) => (
                      <div 
                        key={question.id} 
                        className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200 mb-4"
                        style={{ 
                          borderRadius: theme.borderRadius,
                          fontFamily: theme.fontFamily,
                          marginBottom: theme.spacing
                        }}
                      >
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            {question.question_text}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {question.description && (
                            <p className="text-sm text-gray-500">{question.description}</p>
                          )}
                          
                          {/* Question Input */}
                          <div className="mt-2">
                            {question.type === 'short_text' && (
                              <input
                                type="text"
                                placeholder={question.placeholder || 'Enter your answer'}
                                value={responses[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black bg-white"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor,
                                  borderWidth: '2px'
                                }}
                              />
                            )}
                            {question.type === 'long_text' && (
                              <textarea
                                placeholder={question.placeholder || 'Enter your answer'}
                                rows={3}
                                value={responses[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black bg-white"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor,
                                  borderWidth: '2px'
                                }}
                              />
                            )}
                            {question.type === 'multiple_choice' && question.options && (
                              <div className="space-y-2">
                                {question.options.map((option, index) => (
                                  <label key={index} className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      value={option}
                                      checked={responses[question.id] === option}
                                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                                      className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            {question.type === 'checkboxes' && question.options && (
                              <div className="space-y-2">
                                {question.options.map((option, index) => (
                                  <label key={index} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      value={option}
                                      checked={(responses[question.id] || []).includes(option)}
                                      onChange={(e) => {
                                        const current = responses[question.id] || [];
                                        if (e.target.checked) {
                                          handleInputChange(question.id, [...current, option]);
                                        } else {
                                          handleInputChange(question.id, current.filter((item: string) => item !== option));
                                        }
                                      }}
                                      className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            {question.type === 'dropdown' && question.options && (
                              <select
                                value={responses[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor,
                                  borderWidth: '2px'
                                }}
                              >
                                <option value="" className="text-gray-900">Select an option</option>
                                {question.options.map((option, index) => (
                                  <option key={index} value={option} className="text-gray-900">{option}</option>
                                ))}
                              </select>
                            )}
                            {question.type === 'file_upload' && (
                              <div 
                                className="border-2 border-dashed rounded-md p-4 text-center"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor
                                }}
                              >
                                <input
                                  type="file"
                                  onChange={(e) => handleInputChange(question.id, e.target.files?.[0])}
                                  className="hidden"
                                  id={`file-${question.id}`}
                                />
                                <label htmlFor={`file-${question.id}`} className="cursor-pointer">
                                  <p className="text-sm text-gray-500">Click to upload file</p>
                                </label>
                              </div>
                            )}
                            {question.type === 'video_upload' && (
                              <div 
                                className="border-2 border-dashed rounded-md p-4 text-center"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor
                                }}
                              >
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) => handleInputChange(question.id, e.target.files?.[0])}
                                  className="hidden"
                                  id={`video-${question.id}`}
                                />
                                <label htmlFor={`video-${question.id}`} className="cursor-pointer">
                                  <p className="text-sm text-gray-500">Click to upload video</p>
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No content available.</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {allSections.length > 0 && !isSubmitted && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                    currentStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{ borderRadius: theme.borderRadius }}
                >
                  <ChevronLeftIcon className="h-5 w-5 mr-2" />
                  Previous
                </button>

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Section {currentStep + 1} of {allSections.length}
                  </span>
                </div>

                {currentStep === allSections.length - 2 ? (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-200 bg-green-600 text-white hover:bg-green-700"
                    style={{ borderRadius: theme.borderRadius }}
                  >
                    Submit Application
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={currentStep === allSections.length - 1}
                    className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                      currentStep === allSections.length - 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    style={{ 
                      borderRadius: theme.borderRadius,
                      backgroundColor: currentStep === allSections.length - 1 ? undefined : theme.primaryColor
                    }}
                  >
                    Next
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 