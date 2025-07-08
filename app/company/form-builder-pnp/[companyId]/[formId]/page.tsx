'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Cog6ToothIcon, 
  DocumentTextIcon, 
  EyeIcon, 
  XMarkIcon,
  GlobeAltIcon,
  ShareIcon,
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
  internship_id: string;
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

export default function FormBuilderPreview({ params: { companyId, formId } }: { params: { companyId: string, formId: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'publish'>('publish');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [userRole, setUserRole] = useState<'COMPANY' | 'INTERN' | null>(null);

  useEffect(() => {
    // Detect user role
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
    
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setIsLoading(true);
      
      // Load form data
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('company_id', companyId)
        .single();

      if (formError || !form) {
        toast.error('Form not found');
        router.push('/company-dash');
        return;
      }

      setFormData(form);

      // Generate preview URL - point to internship posting instead of form
      const baseUrl = window.location.origin;
      setPreviewUrl(`${baseUrl}/postings/${form.internship_id || 'unknown'}`);

      // Load sections and questions
      const res = await fetch(`/api/companies/forms/${formId}/questions`);
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
      
      // Set current step to 0 if we have sections
      if (apiSections.length > 0) {
        setCurrentStep(0);
      }

      // After loading and setting sections, append a virtual thank you section for preview
      const thankYouSection = {
        id: 'thank-you',
        title: '',
        description: '',
        order_index: formattedSections.length,
        questions: []
      };
      const allSections = [...formattedSections, thankYouSection];

    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

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
    // Only allow employers to jump to any step
    if (userRole === 'COMPANY') {
      setCurrentStep(step);
    } else {
      // High schoolers can only go to steps they've completed or the next step
      if (step <= currentStep + 1) {
        setCurrentStep(step);
      }
    }
  };

  const publishForm = async () => {
    if (!formData) return;

    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('forms')
        .update({
          published: true,
          published_at: new Date().toISOString(),
          share_url: previewUrl
        })
        .eq('id', formId);

      if (error) throw error;

      setFormData(prev => prev ? {
        ...prev,
        published: true,
        published_at: new Date().toISOString(),
        share_url: previewUrl
      } : null);

      toast.success('Form published successfully!');
    } catch (error) {
      console.error('Error publishing form:', error);
      toast.error('Failed to publish form');
    } finally {
      setIsPublishing(false);
    }
  };

  const unpublishForm = async () => {
    if (!formData) return;

    setIsPublishing(true);
    try {
      const { error } = await supabase
        .from('forms')
        .update({
          published: false,
          published_at: null
        })
        .eq('id', formId);

      if (error) throw error;

      setFormData(prev => prev ? {
        ...prev,
        published: false,
        published_at: null
      } : null);

      toast.success('Form unpublished successfully!');
    } catch (error) {
      console.error('Error unpublishing form:', error);
      toast.error('Failed to unpublish form');
    } finally {
      setIsPublishing(false);
    }
  };

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(previewUrl);
      toast.success('Share URL copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  // Navigation functions
  const navigateToBuild = () => {
    router.push(`/company/form-builder/${companyId}/${formId}`);
  };

  const navigateToSettings = () => {
    router.push(`/company/form-builder-settings/${companyId}/${formId}`);
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
          <p className="text-gray-600 mt-2">The form you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const theme = {
    primaryColor: formData.primary_color !== null ? `#${formData.primary_color.toString(16).padStart(6, '0')}` : '#3b82f6',
    backgroundColor: formData.background_color !== null ? `#${formData.background_color.toString(16).padStart(6, '0')}` : '#ffffff',
    fontFamily: formData.font_family || 'Inter',
    borderRadius: formData.border_radius ?? 8,
    spacing: formData.spacing ?? 16
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />
      
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm" style={{ zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-10">
              <button
                onClick={() => router.push('/company-dash')}
                className="text-gray-600 hover:text-gray-900"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
              <div className="flex space-x-6">
                <button
                  onClick={navigateToBuild}
                  className={`px-6 py-3 rounded-md text-lg font-medium ${
                    activeTab === 'build'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <DocumentTextIcon className="h-6 w-6 inline-block mr-3" />
                  Build
                </button>
                <button
                  onClick={navigateToSettings}
                  className={`px-6 py-3 rounded-md text-lg font-medium ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Cog6ToothIcon className="h-6 w-6 inline-block mr-3" />
                  Settings
                </button>
                <button
                  onClick={() => setActiveTab('publish')}
                  className={`px-6 py-3 rounded-md text-lg font-medium ${
                    activeTab === 'publish'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <EyeIcon className="h-6 w-6 inline-block mr-3" />
                  Preview & Publish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="pt-48 pb-16 relative" style={{ zIndex: 30 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Preview Section - Full Width */}
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <EyeIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-black">Form Preview</h2>
              </div>
              
              {/* Progress Bar - Under Form Preview Header */}
              {allSections.length > 0 && (
                <div className="mb-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Preview Progress: {currentStep + 1} of {allSections.length}
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
                      const isAccessible = userRole === 'COMPANY' || index <= currentStep + 1;
                      
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
              
              {/* Form Preview */}
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
                
                {/* Preview Current Section Only */}
                {allSections.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No sections to preview. Add sections in the Build tab.</p>
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
                            
                            {/* Question Preview */}
                            <div className="mt-2">
                              {question.type === 'short_text' && (
                                <input
                                  type="text"
                                  placeholder={question.placeholder || 'Enter your answer'}
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
                                        className="mr-2"
                                      />
                                      <span className="text-sm text-gray-700">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                              {question.type === 'dropdown' && question.options && (
                                <select
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
                                  <p className="text-sm text-gray-500">File upload area</p>
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
                                  <p className="text-sm text-gray-500">Video upload area</p>
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
                    <p className="text-gray-500">No sections to preview.</p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              {allSections.length > 0 && (
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
                </div>
              )}
            </div>
          </div>

          {/* Publish Section - Underneath Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <GlobeAltIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-black">Publish Form</h2>
              </div>
              
              {/* Form Status */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  {formData.published ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      <span className="text-green-700 font-medium">Published</span>
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                      <span className="text-yellow-700 font-medium">Draft</span>
                    </>
                  )}
                </div>
                {formData.published && formData.published_at && (
                  <p className="text-sm text-gray-500">
                    Published on {new Date(formData.published_at).toLocaleDateString()}
                  </p>
                )}
              </div>

              {/* Form Settings Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Accepting Responses:</span>
                  <span className={`text-sm font-medium ${formData.accepting_responses ? 'text-green-600' : 'text-red-600'}`}>
                    {formData.accepting_responses ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Privacy:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {formData.form_privacy}
                  </span>
                </div>
              </div>

              {/* Publish Actions */}
              <div className="space-y-4">
                {!formData.published ? (
                  <button
                    onClick={publishForm}
                    disabled={isPublishing}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      isPublishing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Form'}
                  </button>
                ) : (
                  <button
                    onClick={unpublishForm}
                    disabled={isPublishing}
                    className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                      isPublishing
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    {isPublishing ? 'Unpublishing...' : 'Unpublish Form'}
                  </button>
                )}
              </div>
            </div>

            {/* Share Section */}
            {formData.published && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ShareIcon className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-black">Share Form</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Share URL
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={previewUrl}
                        readOnly
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-black"
                      />
                      <button
                        onClick={copyShareUrl}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500">
                    <p>Share this URL with your audience to collect responses.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 