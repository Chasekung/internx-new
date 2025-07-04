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
  ArrowPathIcon
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

export default function FormBuilderPreview({ params: { companyId, formId } }: { params: { companyId: string, formId: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'publish'>('publish');
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
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

      // Load sections and questions
      const res = await fetch(`/api/companies/forms/${formId}/questions`);
      if (!res.ok) throw new Error('Failed to fetch form questions');
      const { sections: apiSections } = await res.json();
      setSections(apiSections);

      // Generate preview URL
      const baseUrl = window.location.origin;
      setPreviewUrl(`${baseUrl}/forms/${formId}`);

    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Preview Section */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <EyeIcon className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-black">Form Preview</h2>
                </div>
                
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
                  
                  {/* Preview Questions */}
                  <div className="space-y-4">
                    {sections.map((section, sectionIndex) => (
                      <div key={section.id} className="space-y-4">
                        {section.title && (
                          <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                        )}
                        {section.description && (
                          <p className="text-gray-600 text-sm">{section.description}</p>
                        )}
                        
                        {section.questions.map((question, questionIndex) => (
                          <div key={question.id} className="space-y-2">
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
                                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                                   style={{ 
                                     borderRadius: theme.borderRadius,
                                     borderColor: theme.primaryColor,
                                     borderWidth: '2px'
                                   }}
                                   disabled
                                 />
                               )}
                                                             {question.type === 'long_text' && (
                                 <textarea
                                   placeholder={question.placeholder || 'Enter your answer'}
                                   rows={3}
                                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                                   style={{ 
                                     borderRadius: theme.borderRadius,
                                     borderColor: theme.primaryColor,
                                     borderWidth: '2px'
                                   }}
                                   disabled
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
                                        disabled
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
                                        disabled
                                      />
                                      <span className="text-sm text-gray-700">{option}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                                                             {question.type === 'dropdown' && question.options && (
                                 <select
                                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                                   style={{ 
                                     borderRadius: theme.borderRadius,
                                     borderColor: theme.primaryColor,
                                     borderWidth: '2px'
                                   }}
                                   disabled
                                 >
                                  <option value="">Select an option</option>
                                  {question.options.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
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
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Publish Section */}
            <div className="space-y-6">
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
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
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
    </div>
  );
} 