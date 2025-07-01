'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

// Rich text editor (loaded dynamically to avoid SSR issues)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-50 animate-pulse rounded-lg"></div>
});

// Add required styles for ReactQuill
import 'react-quill/dist/quill.snow.css';

interface ApplicationSection {
  id: string;
  title: string;
  description: string;
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
  answer?: string | string[] | File;
}

// Mock data for testing
const mockApplicationData = {
  title: "Software Engineering Internship Application",
  company: "Tech Corp",
  sections: [
    {
      id: "1",
      title: "Personal Information",
      description: "Please provide your basic details",
      questions: [
        {
          id: "q1",
          type: "short_text" as const,
          questionText: "Full Name",
          required: true
        },
        {
          id: "q2",
          type: "short_text" as const,
          questionText: "Email Address",
          required: true
        }
      ]
    },
    {
      id: "2",
      title: "Education",
      description: "Tell us about your educational background",
      questions: [
        {
          id: "q3",
          type: "short_text" as const,
          questionText: "University/College Name",
          required: true
        },
        {
          id: "q4",
          type: "dropdown" as const,
          questionText: "Expected Graduation Year",
          required: true,
          options: ["2024", "2025", "2026", "2027", "2028"]
        }
      ]
    },
    {
      id: "3",
      title: "Experience",
      description: "Share your relevant experience",
      questions: [
        {
          id: "q5",
          type: "long_text" as const,
          questionText: "Tell us about your most relevant project or experience",
          required: true
        },
        {
          id: "q6",
          type: "file_upload" as const,
          questionText: "Upload your resume (PDF)",
          required: true
        }
      ]
    },
    {
      id: "4",
      title: "Additional Questions",
      description: "Please answer the following questions",
      questions: [
        {
          id: "q7",
          type: "multiple_choice" as const,
          questionText: "Are you authorized to work in the United States?",
          required: true,
          options: ["Yes", "No", "Will require visa sponsorship"]
        },
        {
          id: "q8",
          type: "checkboxes" as const,
          questionText: "Which programming languages are you proficient in?",
          required: true,
          options: ["JavaScript", "Python", "Java", "C++", "Ruby", "Other"]
        }
      ]
    }
  ]
};

export default function ApplicationTest() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSidebar, setShowSidebar] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave functionality
  const saveFormData = useCallback(
    debounce((data: any) => {
      setIsSaving(true);
      try {
        localStorage.setItem('applicationDraft', JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    if (isPreview) {
      return (
        <div className="mt-2 text-gray-700">
          {formData[question.id] ? (
            typeof formData[question.id] === 'object' ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File uploaded: {(formData[question.id] as File).name}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: formData[question.id] }} />
            )
          ) : (
            <span className="text-gray-400">Not answered</span>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
            placeholder="Enter your answer"
          />
        );

      case 'long_text':
        return (
          <div className="quill-wrapper">
            <style jsx global>{`
              .quill-wrapper .quill {
                background: white;
                border-radius: 0.5rem;
              }
              .quill-wrapper .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                background: white;
                min-height: 150px;
              }
              .quill-wrapper .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: white;
                border-color: #E5E7EB;
              }
              .quill-wrapper .ql-editor {
                min-height: 150px;
                font-size: 1rem;
                line-height: 1.5;
              }
              .quill-wrapper .ql-editor:focus {
                outline: 2px solid #3B82F6;
                outline-offset: -2px;
              }
            `}</style>
            <ReactQuill
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              placeholder="Enter your detailed response"
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={question.required}
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="w-full">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(question.id, file);
              }}
              className="hidden"
              id={`file-${question.id}`}
              required={question.required}
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor={`file-${question.id}`}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
            >
              {formData[question.id] ? (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {(formData[question.id] as File).name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange(question.id, null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadProgress[question.id] !== undefined ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress[question.id]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress[question.id]}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </label>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  if (validateSection(currentSection)) {
                    setCurrentSection(index);
                    setShowSidebar(false);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 ${
                  currentSection === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving ? (
                <span className="text-gray-500 text-sm">Saving...</span>
              ) : lastSaved && (
                <span className="text-gray-500 text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to save and exit? You can continue later.')) {
                    router.push('/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{mockApplicationData.title}</h1>
          <p className="text-lg text-gray-600 mt-3">Company: {mockApplicationData.company}</p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Estimated time to complete: 15-20 minutes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between">
              {mockApplicationData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col items-center ${
                    index <= currentSection ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      index <= currentSection
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setIsPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit application
              </button>
            </div>
            {mockApplicationData.sections.map((section, index) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className="font-medium text-gray-900">
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mockApplicationData.sections[currentSection].title}
                </h2>
                <p className="text-gray-600">
                  {mockApplicationData.sections[currentSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {mockApplicationData.sections[currentSection].questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isPreview ? (
            <>
              <button
                onClick={() => setIsPreview(false)}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to editing
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                Submit Application
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ← Previous
              </button>
              
              {currentSection === mockApplicationData.sections.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setIsPreview(true);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Review Application
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Next
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
 
 
 
 

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

// Rich text editor (loaded dynamically to avoid SSR issues)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-50 animate-pulse rounded-lg"></div>
});

// Add required styles for ReactQuill
import 'react-quill/dist/quill.snow.css';

interface ApplicationSection {
  id: string;
  title: string;
  description: string;
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
  answer?: string | string[] | File;
}

// Mock data for testing
const mockApplicationData = {
  title: "Software Engineering Internship Application",
  company: "Tech Corp",
  sections: [
    {
      id: "1",
      title: "Personal Information",
      description: "Please provide your basic details",
      questions: [
        {
          id: "q1",
          type: "short_text" as const,
          questionText: "Full Name",
          required: true
        },
        {
          id: "q2",
          type: "short_text" as const,
          questionText: "Email Address",
          required: true
        }
      ]
    },
    {
      id: "2",
      title: "Education",
      description: "Tell us about your educational background",
      questions: [
        {
          id: "q3",
          type: "short_text" as const,
          questionText: "University/College Name",
          required: true
        },
        {
          id: "q4",
          type: "dropdown" as const,
          questionText: "Expected Graduation Year",
          required: true,
          options: ["2024", "2025", "2026", "2027", "2028"]
        }
      ]
    },
    {
      id: "3",
      title: "Experience",
      description: "Share your relevant experience",
      questions: [
        {
          id: "q5",
          type: "long_text" as const,
          questionText: "Tell us about your most relevant project or experience",
          required: true
        },
        {
          id: "q6",
          type: "file_upload" as const,
          questionText: "Upload your resume (PDF)",
          required: true
        }
      ]
    },
    {
      id: "4",
      title: "Additional Questions",
      description: "Please answer the following questions",
      questions: [
        {
          id: "q7",
          type: "multiple_choice" as const,
          questionText: "Are you authorized to work in the United States?",
          required: true,
          options: ["Yes", "No", "Will require visa sponsorship"]
        },
        {
          id: "q8",
          type: "checkboxes" as const,
          questionText: "Which programming languages are you proficient in?",
          required: true,
          options: ["JavaScript", "Python", "Java", "C++", "Ruby", "Other"]
        }
      ]
    }
  ]
};

export default function ApplicationTest() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSidebar, setShowSidebar] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave functionality
  const saveFormData = useCallback(
    debounce((data: any) => {
      setIsSaving(true);
      try {
        localStorage.setItem('applicationDraft', JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    if (isPreview) {
      return (
        <div className="mt-2 text-gray-700">
          {formData[question.id] ? (
            typeof formData[question.id] === 'object' ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File uploaded: {(formData[question.id] as File).name}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: formData[question.id] }} />
            )
          ) : (
            <span className="text-gray-400">Not answered</span>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
            placeholder="Enter your answer"
          />
        );

      case 'long_text':
        return (
          <div className="quill-wrapper">
            <style jsx global>{`
              .quill-wrapper .quill {
                background: white;
                border-radius: 0.5rem;
              }
              .quill-wrapper .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                background: white;
                min-height: 150px;
              }
              .quill-wrapper .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: white;
                border-color: #E5E7EB;
              }
              .quill-wrapper .ql-editor {
                min-height: 150px;
                font-size: 1rem;
                line-height: 1.5;
              }
              .quill-wrapper .ql-editor:focus {
                outline: 2px solid #3B82F6;
                outline-offset: -2px;
              }
            `}</style>
            <ReactQuill
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              placeholder="Enter your detailed response"
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={question.required}
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="w-full">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(question.id, file);
              }}
              className="hidden"
              id={`file-${question.id}`}
              required={question.required}
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor={`file-${question.id}`}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
            >
              {formData[question.id] ? (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {(formData[question.id] as File).name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange(question.id, null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadProgress[question.id] !== undefined ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress[question.id]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress[question.id]}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </label>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  if (validateSection(currentSection)) {
                    setCurrentSection(index);
                    setShowSidebar(false);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 ${
                  currentSection === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving ? (
                <span className="text-gray-500 text-sm">Saving...</span>
              ) : lastSaved && (
                <span className="text-gray-500 text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to save and exit? You can continue later.')) {
                    router.push('/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{mockApplicationData.title}</h1>
          <p className="text-lg text-gray-600 mt-3">Company: {mockApplicationData.company}</p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Estimated time to complete: 15-20 minutes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between">
              {mockApplicationData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col items-center ${
                    index <= currentSection ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      index <= currentSection
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setIsPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit application
              </button>
            </div>
            {mockApplicationData.sections.map((section, index) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className="font-medium text-gray-900">
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mockApplicationData.sections[currentSection].title}
                </h2>
                <p className="text-gray-600">
                  {mockApplicationData.sections[currentSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {mockApplicationData.sections[currentSection].questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isPreview ? (
            <>
              <button
                onClick={() => setIsPreview(false)}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to editing
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                Submit Application
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ← Previous
              </button>
              
              {currentSection === mockApplicationData.sections.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setIsPreview(true);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Review Application
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Next
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

// Rich text editor (loaded dynamically to avoid SSR issues)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-50 animate-pulse rounded-lg"></div>
});

// Add required styles for ReactQuill
import 'react-quill/dist/quill.snow.css';

interface ApplicationSection {
  id: string;
  title: string;
  description: string;
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
  answer?: string | string[] | File;
}

// Mock data for testing
const mockApplicationData = {
  title: "Software Engineering Internship Application",
  company: "Tech Corp",
  sections: [
    {
      id: "1",
      title: "Personal Information",
      description: "Please provide your basic details",
      questions: [
        {
          id: "q1",
          type: "short_text" as const,
          questionText: "Full Name",
          required: true
        },
        {
          id: "q2",
          type: "short_text" as const,
          questionText: "Email Address",
          required: true
        }
      ]
    },
    {
      id: "2",
      title: "Education",
      description: "Tell us about your educational background",
      questions: [
        {
          id: "q3",
          type: "short_text" as const,
          questionText: "University/College Name",
          required: true
        },
        {
          id: "q4",
          type: "dropdown" as const,
          questionText: "Expected Graduation Year",
          required: true,
          options: ["2024", "2025", "2026", "2027", "2028"]
        }
      ]
    },
    {
      id: "3",
      title: "Experience",
      description: "Share your relevant experience",
      questions: [
        {
          id: "q5",
          type: "long_text" as const,
          questionText: "Tell us about your most relevant project or experience",
          required: true
        },
        {
          id: "q6",
          type: "file_upload" as const,
          questionText: "Upload your resume (PDF)",
          required: true
        }
      ]
    },
    {
      id: "4",
      title: "Additional Questions",
      description: "Please answer the following questions",
      questions: [
        {
          id: "q7",
          type: "multiple_choice" as const,
          questionText: "Are you authorized to work in the United States?",
          required: true,
          options: ["Yes", "No", "Will require visa sponsorship"]
        },
        {
          id: "q8",
          type: "checkboxes" as const,
          questionText: "Which programming languages are you proficient in?",
          required: true,
          options: ["JavaScript", "Python", "Java", "C++", "Ruby", "Other"]
        }
      ]
    }
  ]
};

export default function ApplicationTest() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSidebar, setShowSidebar] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave functionality
  const saveFormData = useCallback(
    debounce((data: any) => {
      setIsSaving(true);
      try {
        localStorage.setItem('applicationDraft', JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    if (isPreview) {
      return (
        <div className="mt-2 text-gray-700">
          {formData[question.id] ? (
            typeof formData[question.id] === 'object' ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File uploaded: {(formData[question.id] as File).name}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: formData[question.id] }} />
            )
          ) : (
            <span className="text-gray-400">Not answered</span>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
            placeholder="Enter your answer"
          />
        );

      case 'long_text':
        return (
          <div className="quill-wrapper">
            <style jsx global>{`
              .quill-wrapper .quill {
                background: white;
                border-radius: 0.5rem;
              }
              .quill-wrapper .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                background: white;
                min-height: 150px;
              }
              .quill-wrapper .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: white;
                border-color: #E5E7EB;
              }
              .quill-wrapper .ql-editor {
                min-height: 150px;
                font-size: 1rem;
                line-height: 1.5;
              }
              .quill-wrapper .ql-editor:focus {
                outline: 2px solid #3B82F6;
                outline-offset: -2px;
              }
            `}</style>
            <ReactQuill
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              placeholder="Enter your detailed response"
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={question.required}
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="w-full">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(question.id, file);
              }}
              className="hidden"
              id={`file-${question.id}`}
              required={question.required}
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor={`file-${question.id}`}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
            >
              {formData[question.id] ? (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {(formData[question.id] as File).name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange(question.id, null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadProgress[question.id] !== undefined ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress[question.id]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress[question.id]}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </label>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  if (validateSection(currentSection)) {
                    setCurrentSection(index);
                    setShowSidebar(false);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 ${
                  currentSection === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving ? (
                <span className="text-gray-500 text-sm">Saving...</span>
              ) : lastSaved && (
                <span className="text-gray-500 text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to save and exit? You can continue later.')) {
                    router.push('/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{mockApplicationData.title}</h1>
          <p className="text-lg text-gray-600 mt-3">Company: {mockApplicationData.company}</p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Estimated time to complete: 15-20 minutes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between">
              {mockApplicationData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col items-center ${
                    index <= currentSection ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      index <= currentSection
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setIsPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit application
              </button>
            </div>
            {mockApplicationData.sections.map((section, index) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className="font-medium text-gray-900">
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mockApplicationData.sections[currentSection].title}
                </h2>
                <p className="text-gray-600">
                  {mockApplicationData.sections[currentSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {mockApplicationData.sections[currentSection].questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isPreview ? (
            <>
              <button
                onClick={() => setIsPreview(false)}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to editing
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                Submit Application
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ← Previous
              </button>
              
              {currentSection === mockApplicationData.sections.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setIsPreview(true);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Review Application
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Next
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
 
 
 
 

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

// Rich text editor (loaded dynamically to avoid SSR issues)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-50 animate-pulse rounded-lg"></div>
});

// Add required styles for ReactQuill
import 'react-quill/dist/quill.snow.css';

interface ApplicationSection {
  id: string;
  title: string;
  description: string;
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
  answer?: string | string[] | File;
}

// Mock data for testing
const mockApplicationData = {
  title: "Software Engineering Internship Application",
  company: "Tech Corp",
  sections: [
    {
      id: "1",
      title: "Personal Information",
      description: "Please provide your basic details",
      questions: [
        {
          id: "q1",
          type: "short_text" as const,
          questionText: "Full Name",
          required: true
        },
        {
          id: "q2",
          type: "short_text" as const,
          questionText: "Email Address",
          required: true
        }
      ]
    },
    {
      id: "2",
      title: "Education",
      description: "Tell us about your educational background",
      questions: [
        {
          id: "q3",
          type: "short_text" as const,
          questionText: "University/College Name",
          required: true
        },
        {
          id: "q4",
          type: "dropdown" as const,
          questionText: "Expected Graduation Year",
          required: true,
          options: ["2024", "2025", "2026", "2027", "2028"]
        }
      ]
    },
    {
      id: "3",
      title: "Experience",
      description: "Share your relevant experience",
      questions: [
        {
          id: "q5",
          type: "long_text" as const,
          questionText: "Tell us about your most relevant project or experience",
          required: true
        },
        {
          id: "q6",
          type: "file_upload" as const,
          questionText: "Upload your resume (PDF)",
          required: true
        }
      ]
    },
    {
      id: "4",
      title: "Additional Questions",
      description: "Please answer the following questions",
      questions: [
        {
          id: "q7",
          type: "multiple_choice" as const,
          questionText: "Are you authorized to work in the United States?",
          required: true,
          options: ["Yes", "No", "Will require visa sponsorship"]
        },
        {
          id: "q8",
          type: "checkboxes" as const,
          questionText: "Which programming languages are you proficient in?",
          required: true,
          options: ["JavaScript", "Python", "Java", "C++", "Ruby", "Other"]
        }
      ]
    }
  ]
};

export default function ApplicationTest() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSidebar, setShowSidebar] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave functionality
  const saveFormData = useCallback(
    debounce((data: any) => {
      setIsSaving(true);
      try {
        localStorage.setItem('applicationDraft', JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    if (isPreview) {
      return (
        <div className="mt-2 text-gray-700">
          {formData[question.id] ? (
            typeof formData[question.id] === 'object' ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File uploaded: {(formData[question.id] as File).name}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: formData[question.id] }} />
            )
          ) : (
            <span className="text-gray-400">Not answered</span>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
            placeholder="Enter your answer"
          />
        );

      case 'long_text':
        return (
          <div className="quill-wrapper">
            <style jsx global>{`
              .quill-wrapper .quill {
                background: white;
                border-radius: 0.5rem;
              }
              .quill-wrapper .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                background: white;
                min-height: 150px;
              }
              .quill-wrapper .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: white;
                border-color: #E5E7EB;
              }
              .quill-wrapper .ql-editor {
                min-height: 150px;
                font-size: 1rem;
                line-height: 1.5;
              }
              .quill-wrapper .ql-editor:focus {
                outline: 2px solid #3B82F6;
                outline-offset: -2px;
              }
            `}</style>
            <ReactQuill
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              placeholder="Enter your detailed response"
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={question.required}
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="w-full">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(question.id, file);
              }}
              className="hidden"
              id={`file-${question.id}`}
              required={question.required}
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor={`file-${question.id}`}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
            >
              {formData[question.id] ? (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {(formData[question.id] as File).name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange(question.id, null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadProgress[question.id] !== undefined ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress[question.id]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress[question.id]}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </label>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  if (validateSection(currentSection)) {
                    setCurrentSection(index);
                    setShowSidebar(false);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 ${
                  currentSection === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving ? (
                <span className="text-gray-500 text-sm">Saving...</span>
              ) : lastSaved && (
                <span className="text-gray-500 text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to save and exit? You can continue later.')) {
                    router.push('/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{mockApplicationData.title}</h1>
          <p className="text-lg text-gray-600 mt-3">Company: {mockApplicationData.company}</p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Estimated time to complete: 15-20 minutes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between">
              {mockApplicationData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col items-center ${
                    index <= currentSection ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      index <= currentSection
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setIsPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit application
              </button>
            </div>
            {mockApplicationData.sections.map((section, index) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className="font-medium text-gray-900">
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mockApplicationData.sections[currentSection].title}
                </h2>
                <p className="text-gray-600">
                  {mockApplicationData.sections[currentSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {mockApplicationData.sections[currentSection].questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isPreview ? (
            <>
              <button
                onClick={() => setIsPreview(false)}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to editing
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                Submit Application
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ← Previous
              </button>
              
              {currentSection === mockApplicationData.sections.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setIsPreview(true);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Review Application
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Next
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

// Rich text editor (loaded dynamically to avoid SSR issues)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-50 animate-pulse rounded-lg"></div>
});

// Add required styles for ReactQuill
import 'react-quill/dist/quill.snow.css';

interface ApplicationSection {
  id: string;
  title: string;
  description: string;
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
  answer?: string | string[] | File;
}

// Mock data for testing
const mockApplicationData = {
  title: "Software Engineering Internship Application",
  company: "Tech Corp",
  sections: [
    {
      id: "1",
      title: "Personal Information",
      description: "Please provide your basic details",
      questions: [
        {
          id: "q1",
          type: "short_text" as const,
          questionText: "Full Name",
          required: true
        },
        {
          id: "q2",
          type: "short_text" as const,
          questionText: "Email Address",
          required: true
        }
      ]
    },
    {
      id: "2",
      title: "Education",
      description: "Tell us about your educational background",
      questions: [
        {
          id: "q3",
          type: "short_text" as const,
          questionText: "University/College Name",
          required: true
        },
        {
          id: "q4",
          type: "dropdown" as const,
          questionText: "Expected Graduation Year",
          required: true,
          options: ["2024", "2025", "2026", "2027", "2028"]
        }
      ]
    },
    {
      id: "3",
      title: "Experience",
      description: "Share your relevant experience",
      questions: [
        {
          id: "q5",
          type: "long_text" as const,
          questionText: "Tell us about your most relevant project or experience",
          required: true
        },
        {
          id: "q6",
          type: "file_upload" as const,
          questionText: "Upload your resume (PDF)",
          required: true
        }
      ]
    },
    {
      id: "4",
      title: "Additional Questions",
      description: "Please answer the following questions",
      questions: [
        {
          id: "q7",
          type: "multiple_choice" as const,
          questionText: "Are you authorized to work in the United States?",
          required: true,
          options: ["Yes", "No", "Will require visa sponsorship"]
        },
        {
          id: "q8",
          type: "checkboxes" as const,
          questionText: "Which programming languages are you proficient in?",
          required: true,
          options: ["JavaScript", "Python", "Java", "C++", "Ruby", "Other"]
        }
      ]
    }
  ]
};

export default function ApplicationTest() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSidebar, setShowSidebar] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave functionality
  const saveFormData = useCallback(
    debounce((data: any) => {
      setIsSaving(true);
      try {
        localStorage.setItem('applicationDraft', JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    if (isPreview) {
      return (
        <div className="mt-2 text-gray-700">
          {formData[question.id] ? (
            typeof formData[question.id] === 'object' ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File uploaded: {(formData[question.id] as File).name}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: formData[question.id] }} />
            )
          ) : (
            <span className="text-gray-400">Not answered</span>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
            placeholder="Enter your answer"
          />
        );

      case 'long_text':
        return (
          <div className="quill-wrapper">
            <style jsx global>{`
              .quill-wrapper .quill {
                background: white;
                border-radius: 0.5rem;
              }
              .quill-wrapper .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                background: white;
                min-height: 150px;
              }
              .quill-wrapper .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: white;
                border-color: #E5E7EB;
              }
              .quill-wrapper .ql-editor {
                min-height: 150px;
                font-size: 1rem;
                line-height: 1.5;
              }
              .quill-wrapper .ql-editor:focus {
                outline: 2px solid #3B82F6;
                outline-offset: -2px;
              }
            `}</style>
            <ReactQuill
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              placeholder="Enter your detailed response"
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={question.required}
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="w-full">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(question.id, file);
              }}
              className="hidden"
              id={`file-${question.id}`}
              required={question.required}
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor={`file-${question.id}`}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
            >
              {formData[question.id] ? (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {(formData[question.id] as File).name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange(question.id, null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadProgress[question.id] !== undefined ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress[question.id]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress[question.id]}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </label>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  if (validateSection(currentSection)) {
                    setCurrentSection(index);
                    setShowSidebar(false);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 ${
                  currentSection === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving ? (
                <span className="text-gray-500 text-sm">Saving...</span>
              ) : lastSaved && (
                <span className="text-gray-500 text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to save and exit? You can continue later.')) {
                    router.push('/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{mockApplicationData.title}</h1>
          <p className="text-lg text-gray-600 mt-3">Company: {mockApplicationData.company}</p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Estimated time to complete: 15-20 minutes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between">
              {mockApplicationData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col items-center ${
                    index <= currentSection ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      index <= currentSection
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setIsPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit application
              </button>
            </div>
            {mockApplicationData.sections.map((section, index) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className="font-medium text-gray-900">
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mockApplicationData.sections[currentSection].title}
                </h2>
                <p className="text-gray-600">
                  {mockApplicationData.sections[currentSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {mockApplicationData.sections[currentSection].questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isPreview ? (
            <>
              <button
                onClick={() => setIsPreview(false)}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to editing
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                Submit Application
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ← Previous
              </button>
              
              {currentSection === mockApplicationData.sections.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setIsPreview(true);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Review Application
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Next
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
 
 
 
 

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

// Rich text editor (loaded dynamically to avoid SSR issues)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-50 animate-pulse rounded-lg"></div>
});

// Add required styles for ReactQuill
import 'react-quill/dist/quill.snow.css';

interface ApplicationSection {
  id: string;
  title: string;
  description: string;
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
  answer?: string | string[] | File;
}

// Mock data for testing
const mockApplicationData = {
  title: "Software Engineering Internship Application",
  company: "Tech Corp",
  sections: [
    {
      id: "1",
      title: "Personal Information",
      description: "Please provide your basic details",
      questions: [
        {
          id: "q1",
          type: "short_text" as const,
          questionText: "Full Name",
          required: true
        },
        {
          id: "q2",
          type: "short_text" as const,
          questionText: "Email Address",
          required: true
        }
      ]
    },
    {
      id: "2",
      title: "Education",
      description: "Tell us about your educational background",
      questions: [
        {
          id: "q3",
          type: "short_text" as const,
          questionText: "University/College Name",
          required: true
        },
        {
          id: "q4",
          type: "dropdown" as const,
          questionText: "Expected Graduation Year",
          required: true,
          options: ["2024", "2025", "2026", "2027", "2028"]
        }
      ]
    },
    {
      id: "3",
      title: "Experience",
      description: "Share your relevant experience",
      questions: [
        {
          id: "q5",
          type: "long_text" as const,
          questionText: "Tell us about your most relevant project or experience",
          required: true
        },
        {
          id: "q6",
          type: "file_upload" as const,
          questionText: "Upload your resume (PDF)",
          required: true
        }
      ]
    },
    {
      id: "4",
      title: "Additional Questions",
      description: "Please answer the following questions",
      questions: [
        {
          id: "q7",
          type: "multiple_choice" as const,
          questionText: "Are you authorized to work in the United States?",
          required: true,
          options: ["Yes", "No", "Will require visa sponsorship"]
        },
        {
          id: "q8",
          type: "checkboxes" as const,
          questionText: "Which programming languages are you proficient in?",
          required: true,
          options: ["JavaScript", "Python", "Java", "C++", "Ruby", "Other"]
        }
      ]
    }
  ]
};

export default function ApplicationTest() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSidebar, setShowSidebar] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave functionality
  const saveFormData = useCallback(
    debounce((data: any) => {
      setIsSaving(true);
      try {
        localStorage.setItem('applicationDraft', JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    if (isPreview) {
      return (
        <div className="mt-2 text-gray-700">
          {formData[question.id] ? (
            typeof formData[question.id] === 'object' ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File uploaded: {(formData[question.id] as File).name}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: formData[question.id] }} />
            )
          ) : (
            <span className="text-gray-400">Not answered</span>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
            placeholder="Enter your answer"
          />
        );

      case 'long_text':
        return (
          <div className="quill-wrapper">
            <style jsx global>{`
              .quill-wrapper .quill {
                background: white;
                border-radius: 0.5rem;
              }
              .quill-wrapper .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                background: white;
                min-height: 150px;
              }
              .quill-wrapper .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: white;
                border-color: #E5E7EB;
              }
              .quill-wrapper .ql-editor {
                min-height: 150px;
                font-size: 1rem;
                line-height: 1.5;
              }
              .quill-wrapper .ql-editor:focus {
                outline: 2px solid #3B82F6;
                outline-offset: -2px;
              }
            `}</style>
            <ReactQuill
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              placeholder="Enter your detailed response"
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={question.required}
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="w-full">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(question.id, file);
              }}
              className="hidden"
              id={`file-${question.id}`}
              required={question.required}
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor={`file-${question.id}`}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
            >
              {formData[question.id] ? (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {(formData[question.id] as File).name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange(question.id, null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadProgress[question.id] !== undefined ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress[question.id]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress[question.id]}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </label>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  if (validateSection(currentSection)) {
                    setCurrentSection(index);
                    setShowSidebar(false);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 ${
                  currentSection === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving ? (
                <span className="text-gray-500 text-sm">Saving...</span>
              ) : lastSaved && (
                <span className="text-gray-500 text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to save and exit? You can continue later.')) {
                    router.push('/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{mockApplicationData.title}</h1>
          <p className="text-lg text-gray-600 mt-3">Company: {mockApplicationData.company}</p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Estimated time to complete: 15-20 minutes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between">
              {mockApplicationData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col items-center ${
                    index <= currentSection ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      index <= currentSection
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setIsPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit application
              </button>
            </div>
            {mockApplicationData.sections.map((section, index) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className="font-medium text-gray-900">
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mockApplicationData.sections[currentSection].title}
                </h2>
                <p className="text-gray-600">
                  {mockApplicationData.sections[currentSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {mockApplicationData.sections[currentSection].questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isPreview ? (
            <>
              <button
                onClick={() => setIsPreview(false)}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to editing
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                Submit Application
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ← Previous
              </button>
              
              {currentSection === mockApplicationData.sections.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setIsPreview(true);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Review Application
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Next
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

// Rich text editor (loaded dynamically to avoid SSR issues)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-50 animate-pulse rounded-lg"></div>
});

// Add required styles for ReactQuill
import 'react-quill/dist/quill.snow.css';

interface ApplicationSection {
  id: string;
  title: string;
  description: string;
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
  answer?: string | string[] | File;
}

// Mock data for testing
const mockApplicationData = {
  title: "Software Engineering Internship Application",
  company: "Tech Corp",
  sections: [
    {
      id: "1",
      title: "Personal Information",
      description: "Please provide your basic details",
      questions: [
        {
          id: "q1",
          type: "short_text" as const,
          questionText: "Full Name",
          required: true
        },
        {
          id: "q2",
          type: "short_text" as const,
          questionText: "Email Address",
          required: true
        }
      ]
    },
    {
      id: "2",
      title: "Education",
      description: "Tell us about your educational background",
      questions: [
        {
          id: "q3",
          type: "short_text" as const,
          questionText: "University/College Name",
          required: true
        },
        {
          id: "q4",
          type: "dropdown" as const,
          questionText: "Expected Graduation Year",
          required: true,
          options: ["2024", "2025", "2026", "2027", "2028"]
        }
      ]
    },
    {
      id: "3",
      title: "Experience",
      description: "Share your relevant experience",
      questions: [
        {
          id: "q5",
          type: "long_text" as const,
          questionText: "Tell us about your most relevant project or experience",
          required: true
        },
        {
          id: "q6",
          type: "file_upload" as const,
          questionText: "Upload your resume (PDF)",
          required: true
        }
      ]
    },
    {
      id: "4",
      title: "Additional Questions",
      description: "Please answer the following questions",
      questions: [
        {
          id: "q7",
          type: "multiple_choice" as const,
          questionText: "Are you authorized to work in the United States?",
          required: true,
          options: ["Yes", "No", "Will require visa sponsorship"]
        },
        {
          id: "q8",
          type: "checkboxes" as const,
          questionText: "Which programming languages are you proficient in?",
          required: true,
          options: ["JavaScript", "Python", "Java", "C++", "Ruby", "Other"]
        }
      ]
    }
  ]
};

export default function ApplicationTest() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSidebar, setShowSidebar] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave functionality
  const saveFormData = useCallback(
    debounce((data: any) => {
      setIsSaving(true);
      try {
        localStorage.setItem('applicationDraft', JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    if (isPreview) {
      return (
        <div className="mt-2 text-gray-700">
          {formData[question.id] ? (
            typeof formData[question.id] === 'object' ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File uploaded: {(formData[question.id] as File).name}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: formData[question.id] }} />
            )
          ) : (
            <span className="text-gray-400">Not answered</span>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
            placeholder="Enter your answer"
          />
        );

      case 'long_text':
        return (
          <div className="quill-wrapper">
            <style jsx global>{`
              .quill-wrapper .quill {
                background: white;
                border-radius: 0.5rem;
              }
              .quill-wrapper .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                background: white;
                min-height: 150px;
              }
              .quill-wrapper .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: white;
                border-color: #E5E7EB;
              }
              .quill-wrapper .ql-editor {
                min-height: 150px;
                font-size: 1rem;
                line-height: 1.5;
              }
              .quill-wrapper .ql-editor:focus {
                outline: 2px solid #3B82F6;
                outline-offset: -2px;
              }
            `}</style>
            <ReactQuill
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              placeholder="Enter your detailed response"
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={question.required}
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="w-full">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(question.id, file);
              }}
              className="hidden"
              id={`file-${question.id}`}
              required={question.required}
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor={`file-${question.id}`}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
            >
              {formData[question.id] ? (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {(formData[question.id] as File).name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange(question.id, null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadProgress[question.id] !== undefined ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress[question.id]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress[question.id]}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </label>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  if (validateSection(currentSection)) {
                    setCurrentSection(index);
                    setShowSidebar(false);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 ${
                  currentSection === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving ? (
                <span className="text-gray-500 text-sm">Saving...</span>
              ) : lastSaved && (
                <span className="text-gray-500 text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to save and exit? You can continue later.')) {
                    router.push('/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{mockApplicationData.title}</h1>
          <p className="text-lg text-gray-600 mt-3">Company: {mockApplicationData.company}</p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Estimated time to complete: 15-20 minutes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between">
              {mockApplicationData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col items-center ${
                    index <= currentSection ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      index <= currentSection
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setIsPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit application
              </button>
            </div>
            {mockApplicationData.sections.map((section, index) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className="font-medium text-gray-900">
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mockApplicationData.sections[currentSection].title}
                </h2>
                <p className="text-gray-600">
                  {mockApplicationData.sections[currentSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {mockApplicationData.sections[currentSection].questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isPreview ? (
            <>
              <button
                onClick={() => setIsPreview(false)}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to editing
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                Submit Application
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ← Previous
              </button>
              
              {currentSection === mockApplicationData.sections.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setIsPreview(true);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Review Application
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Next
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
 
 
 
 

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import debounce from 'lodash/debounce';

// Rich text editor (loaded dynamically to avoid SSR issues)
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <div className="h-32 w-full bg-gray-50 animate-pulse rounded-lg"></div>
});

// Add required styles for ReactQuill
import 'react-quill/dist/quill.snow.css';

interface ApplicationSection {
  id: string;
  title: string;
  description: string;
  questions: ApplicationQuestion[];
}

interface ApplicationQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
  answer?: string | string[] | File;
}

// Mock data for testing
const mockApplicationData = {
  title: "Software Engineering Internship Application",
  company: "Tech Corp",
  sections: [
    {
      id: "1",
      title: "Personal Information",
      description: "Please provide your basic details",
      questions: [
        {
          id: "q1",
          type: "short_text" as const,
          questionText: "Full Name",
          required: true
        },
        {
          id: "q2",
          type: "short_text" as const,
          questionText: "Email Address",
          required: true
        }
      ]
    },
    {
      id: "2",
      title: "Education",
      description: "Tell us about your educational background",
      questions: [
        {
          id: "q3",
          type: "short_text" as const,
          questionText: "University/College Name",
          required: true
        },
        {
          id: "q4",
          type: "dropdown" as const,
          questionText: "Expected Graduation Year",
          required: true,
          options: ["2024", "2025", "2026", "2027", "2028"]
        }
      ]
    },
    {
      id: "3",
      title: "Experience",
      description: "Share your relevant experience",
      questions: [
        {
          id: "q5",
          type: "long_text" as const,
          questionText: "Tell us about your most relevant project or experience",
          required: true
        },
        {
          id: "q6",
          type: "file_upload" as const,
          questionText: "Upload your resume (PDF)",
          required: true
        }
      ]
    },
    {
      id: "4",
      title: "Additional Questions",
      description: "Please answer the following questions",
      questions: [
        {
          id: "q7",
          type: "multiple_choice" as const,
          questionText: "Are you authorized to work in the United States?",
          required: true,
          options: ["Yes", "No", "Will require visa sponsorship"]
        },
        {
          id: "q8",
          type: "checkboxes" as const,
          questionText: "Which programming languages are you proficient in?",
          required: true,
          options: ["JavaScript", "Python", "Java", "C++", "Ruby", "Other"]
        }
      ]
    }
  ]
};

export default function ApplicationTest() {
  const router = useRouter();
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showSidebar, setShowSidebar] = useState(false);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('applicationDraft');
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  // Autosave functionality
  const saveFormData = useCallback(
    debounce((data: any) => {
      setIsSaving(true);
      try {
        localStorage.setItem('applicationDraft', JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error saving draft:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    saveFormData(formData);
  }, [formData, saveFormData]);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  const renderQuestion = (question: ApplicationQuestion) => {
    if (isPreview) {
      return (
        <div className="mt-2 text-gray-700">
          {formData[question.id] ? (
            typeof formData[question.id] === 'object' ? (
              <div className="flex items-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                File uploaded: {(formData[question.id] as File).name}
              </div>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: formData[question.id] }} />
            )
          ) : (
            <span className="text-gray-400">Not answered</span>
          )}
        </div>
      );
    }

    switch (question.type) {
      case 'short_text':
        return (
          <input
            type="text"
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
            placeholder="Enter your answer"
          />
        );

      case 'long_text':
        return (
          <div className="quill-wrapper">
            <style jsx global>{`
              .quill-wrapper .quill {
                background: white;
                border-radius: 0.5rem;
              }
              .quill-wrapper .ql-container {
                border-bottom-left-radius: 0.5rem;
                border-bottom-right-radius: 0.5rem;
                background: white;
                min-height: 150px;
              }
              .quill-wrapper .ql-toolbar {
                border-top-left-radius: 0.5rem;
                border-top-right-radius: 0.5rem;
                background: white;
                border-color: #E5E7EB;
              }
              .quill-wrapper .ql-editor {
                min-height: 150px;
                font-size: 1rem;
                line-height: 1.5;
              }
              .quill-wrapper .ql-editor:focus {
                outline: 2px solid #3B82F6;
                outline-offset: -2px;
              }
            `}</style>
            <ReactQuill
              value={formData[question.id] || ''}
              onChange={(value) => handleInputChange(question.id, value)}
              modules={{
                toolbar: [
                  ['bold', 'italic', 'underline'],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['clean']
                ],
              }}
              placeholder="Enter your detailed response"
            />
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={formData[question.id] === option}
                  onChange={(e) => handleInputChange(question.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  required={question.required}
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-150 cursor-pointer group">
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
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-gray-900 group-hover:text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <select
            value={formData[question.id] || ''}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        );

      case 'file_upload':
        return (
          <div className="w-full">
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(question.id, file);
              }}
              className="hidden"
              id={`file-${question.id}`}
              required={question.required}
              accept=".pdf,.doc,.docx"
            />
            <label
              htmlFor={`file-${question.id}`}
              className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors duration-200"
            >
              {formData[question.id] ? (
                <div className="text-center">
                  <svg className="mx-auto h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {(formData[question.id] as File).name}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleInputChange(question.id, null);
                    }}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : uploadProgress[question.id] !== undefined ? (
                <div className="w-full">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${uploadProgress[question.id]}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-600 text-center">
                    Uploading... {uploadProgress[question.id]}%
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                </div>
              )}
            </label>
            {errors[question.id] && (
              <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out z-20`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav>
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  if (validateSection(currentSection)) {
                    setCurrentSection(index);
                    setShowSidebar(false);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 ${
                  currentSection === index
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-sm mr-3">
                    {index + 1}
                  </span>
                  <span className="text-sm">{section.title}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Top bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowSidebar(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              {isSaving ? (
                <span className="text-gray-500 text-sm">Saving...</span>
              ) : lastSaved && (
                <span className="text-gray-500 text-sm">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to save and exit? You can continue later.')) {
                    router.push('/dashboard');
                  }
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Save and exit
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{mockApplicationData.title}</h1>
          <p className="text-lg text-gray-600 mt-3">Company: {mockApplicationData.company}</p>
          <div className="mt-6 flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="ml-3 text-sm text-gray-500">
              Estimated time to complete: 15-20 minutes
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="relative">
            <div className="overflow-hidden h-2 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between">
              {mockApplicationData.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`flex flex-col items-center ${
                    index <= currentSection ? 'text-blue-600' : 'text-gray-400'
                  }`}
                  style={{ width: '20%' }}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                      index <= currentSection
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-2 text-xs font-medium text-center">
                    {section.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {isPreview ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Preview</h2>
              <button
                onClick={() => setIsPreview(false)}
                className="text-blue-600 hover:text-blue-800"
              >
                Edit application
              </button>
            </div>
            {mockApplicationData.sections.map((section, index) => (
              <div key={section.id} className="mb-8 last:mb-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {section.title}
                </h3>
                <div className="space-y-6">
                  {section.questions.map((question) => (
                    <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <h4 className="font-medium text-gray-900">
                        {question.questionText}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h4>
                      {renderQuestion(question)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Current section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {mockApplicationData.sections[currentSection].title}
                </h2>
                <p className="text-gray-600">
                  {mockApplicationData.sections[currentSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {mockApplicationData.sections[currentSection].questions.map((question) => (
                  <div key={question.id} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                    <label className="block text-lg font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {renderQuestion(question)}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {isPreview ? (
            <>
              <button
                onClick={() => setIsPreview(false)}
                className="px-6 py-3 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
              >
                Back to editing
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                Submit Application
                <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentSection(prev => prev - 1)}
                disabled={currentSection === 0}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  currentSection === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                ← Previous
              </button>
              
              {currentSection === mockApplicationData.sections.length - 1 ? (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setIsPreview(true);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Review Application
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (validateSection(currentSection)) {
                      setCurrentSection(prev => prev + 1);
                    }
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center"
                >
                  Next
                  <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 
 
 
 