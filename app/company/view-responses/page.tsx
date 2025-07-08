'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhotoIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';

interface Application {
  id: string;
  status: string;
  applied_at: string;
  intern: {
    id: string;
    name: string;
    email: string;
    school?: string;
    graduation_year?: number;
    profile_picture?: string;
  };
  form_responses: {
    id: string;
    status: string;
    submitted_at: string;
    forms: {
      title: string;
      form_sections: Section[];
    };
    response_answers: Answer[];
  };
}



interface Section {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  form_questions: Question[];
}

interface Question {
  id: string;
  type: string;
  question_text: string;
  required: boolean;
  order_index: number;
  // Multiple choice options
  choice_1?: string; choice_2?: string; choice_3?: string; choice_4?: string; choice_5?: string;
  choice_6?: string; choice_7?: string; choice_8?: string; choice_9?: string; choice_10?: string;
  choice_11?: string; choice_12?: string; choice_13?: string; choice_14?: string; choice_15?: string;
  // Dropdown options
  dropdown_1?: string; dropdown_2?: string; dropdown_3?: string; dropdown_4?: string; dropdown_5?: string;
  dropdown_6?: string; dropdown_7?: string; dropdown_8?: string; dropdown_9?: string; dropdown_10?: string;
  dropdown_11?: string; dropdown_12?: string; dropdown_13?: string; dropdown_14?: string; dropdown_15?: string;
  dropdown_16?: string; dropdown_17?: string; dropdown_18?: string; dropdown_19?: string; dropdown_20?: string;
  dropdown_21?: string; dropdown_22?: string; dropdown_23?: string; dropdown_24?: string; dropdown_25?: string;
  dropdown_26?: string; dropdown_27?: string; dropdown_28?: string; dropdown_29?: string; dropdown_30?: string;
  dropdown_31?: string; dropdown_32?: string; dropdown_33?: string; dropdown_34?: string; dropdown_35?: string;
  dropdown_36?: string; dropdown_37?: string; dropdown_38?: string; dropdown_39?: string; dropdown_40?: string;
  dropdown_41?: string; dropdown_42?: string; dropdown_43?: string; dropdown_44?: string; dropdown_45?: string;
  dropdown_46?: string; dropdown_47?: string; dropdown_48?: string; dropdown_49?: string; dropdown_50?: string;
}

interface Answer {
  id: string;
  question_id: string;
  answer_text: string | null;
  answer_data: any;
}

export default function ViewResponsesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const internshipId = searchParams.get('internshipId');
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internshipDetails, setInternshipDetails] = useState<any>(null);

  // Load applications data
  useEffect(() => {
    if (internshipId) {
      loadApplications();
      loadInternshipDetails();
    }
  }, [internshipId]);

  // Handle arrow key navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (event.key === 'ArrowRight' && currentIndex < applications.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, applications.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const loadInternshipDetails = async () => {
    try {
      const { data: internship, error } = await supabase
        .from('internships')
        .select(`
          id,
          title,
          position,
          companies (
            company_name,
            company_logo
          )
        `)
        .eq('id', internshipId)
        .single();

      if (error) throw error;
      setInternshipDetails(internship);
    } catch (error) {
      console.error('Error loading internship details:', error);
    }
  };

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      
      // Get current user (company)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('🚨 No authenticated user found');
        setError('Please sign in to view applications. Redirecting to login...');
        // Redirect to company sign in page after a short delay
        setTimeout(() => {
          window.location.href = '/company-sign-in';
        }, 2000);
        return;
      }

      console.log('🔍 Debug: Loading applications for internshipId:', internshipId);
      console.log('🔍 Debug: Current user (company):', user.id);

      // First verify this company owns this internship
      const { data: internship, error: internshipError } = await supabase
        .from('internships')
        .select('id, company_id, title')
        .eq('id', internshipId)
        .eq('company_id', user.id)
        .single();

      if (internshipError || !internship) {
        console.error('🚨 Internship verification failed:', internshipError);
        setError('Internship not found or you do not have permission to view it.');
        return;
      }

      console.log('✅ Internship verified:', internship);

      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          applied_at,
          intern_id,
          form_response_id,
          interns (
            id,
            full_name,
            email,
            high_school,
            graduation_year,
            profile_photo_url
          ),
          form_responses!inner (
            id,
            status,
            submitted_at,
            forms (
              title,
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
                  order_index,
                  choice_1, choice_2, choice_3, choice_4, choice_5,
                  choice_6, choice_7, choice_8, choice_9, choice_10,
                  choice_11, choice_12, choice_13, choice_14, choice_15,
                  dropdown_1, dropdown_2, dropdown_3, dropdown_4, dropdown_5,
                  dropdown_6, dropdown_7, dropdown_8, dropdown_9, dropdown_10,
                  dropdown_11, dropdown_12, dropdown_13, dropdown_14, dropdown_15,
                  dropdown_16, dropdown_17, dropdown_18, dropdown_19, dropdown_20,
                  dropdown_21, dropdown_22, dropdown_23, dropdown_24, dropdown_25,
                  dropdown_26, dropdown_27, dropdown_28, dropdown_29, dropdown_30,
                  dropdown_31, dropdown_32, dropdown_33, dropdown_34, dropdown_35,
                  dropdown_36, dropdown_37, dropdown_38, dropdown_39, dropdown_40,
                  dropdown_41, dropdown_42, dropdown_43, dropdown_44, dropdown_45,
                  dropdown_46, dropdown_47, dropdown_48, dropdown_49, dropdown_50
                )
              )
            ),
            response_answers (
              id,
              question_id,
              answer_text,
              answer_data
            )
          )
        `)
        .eq('internship_id', internshipId)
        .eq('status', 'submitted')
        .eq('form_responses.status', 'submitted')
        .not('form_response_id', 'is', null)
        .not('form_responses.submitted_at', 'is', null)
        .order('applied_at', { ascending: true }); // Order by application date

      if (error) {
        console.error('🚨 Database query error:', error);
        throw error;
      }

      console.log('📊 Raw applications data:', applications);
      console.log('📊 Number of applications found:', applications?.length);

      // Debug each application in detail
      (applications || []).forEach((app, index) => {
        const formResponseData = Array.isArray(app.form_responses) ? app.form_responses[0] : app.form_responses;
        const internData = Array.isArray(app.interns) ? app.interns[0] : app.interns;
        
        console.log(`🔍 Application ${index + 1} detailed analysis:`, {
          id: app.id,
          status: app.status,
          form_response_id: app.form_response_id,
          hasFormResponses: !!formResponseData,
          formResponsesType: typeof app.form_responses,
          isFormResponsesArray: Array.isArray(app.form_responses),
          formResponsesLength: Array.isArray(app.form_responses) ? app.form_responses.length : 'Not array',
          formResponsesDetails: formResponseData ? {
            id: formResponseData.id,
            status: formResponseData.status,
            submitted_at: formResponseData.submitted_at,
            hasResponseAnswers: formResponseData.response_answers?.length > 0
          } : 'No form_responses',
          intern: internData ? {
            id: internData.id,
            name: internData.full_name,
            email: internData.email
          } : 'No intern data'
        });
      });

      // Filter out applications without form responses and sort by submission time
      const validApplications = applications
        .filter(app => {
          const formResponseData = Array.isArray(app.form_responses) ? app.form_responses[0] : app.form_responses;
          const isValid = formResponseData && 
                         formResponseData.status === 'submitted' && 
                         formResponseData.submitted_at &&
                         app.status === 'submitted';
          
          console.log(`📋 Filtering application ${app.id}:`, {
            hasFormResponses: !!formResponseData,
            formResponseStatus: formResponseData?.status,
            applicationStatus: app.status,
            hasSubmittedAt: !!formResponseData?.submitted_at,
            isValid
          });
          
          return isValid;
        })
        .map(app => {
          const internData = Array.isArray(app.interns) ? app.interns[0] : app.interns;
          const formResponseData = Array.isArray(app.form_responses) ? app.form_responses[0] : app.form_responses;
          const formsData = Array.isArray(formResponseData.forms) ? formResponseData.forms[0] : formResponseData.forms;
          
          return {
            id: app.id,
            status: app.status,
            applied_at: app.applied_at,
            intern: {
              id: internData.id,
              name: internData.full_name,
              email: internData.email,
              school: internData.high_school,
              graduation_year: internData.graduation_year,
              profile_picture: internData.profile_photo_url
            },
            form_responses: {
              id: formResponseData.id,
              status: formResponseData.status,
              submitted_at: formResponseData.submitted_at,
              forms: {
                title: formsData.title,
                form_sections: formsData.form_sections
              },
              response_answers: formResponseData.response_answers
            }
          };
        })
        .sort((a, b) => {
          // Sort by form submission time (earliest first)
          const aTime = new Date(a.form_responses.submitted_at).getTime();
          const bTime = new Date(b.form_responses.submitted_at).getTime();
          return aTime - bTime;
        });

      console.log('✅ Valid applications after filtering:', validApplications);
      console.log('✅ Number of valid applications:', validApplications.length);

      setApplications(validApplications);
      
      if (validApplications.length === 0) {
        console.warn('⚠️ No applications found after filtering');
        setError('No submitted applications found for this internship.');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const getQuestionOptions = (question: Question): string[] => {
    if (question.type === 'multiple_choice' || question.type === 'checkboxes') {
      return Array.from({ length: 15 }, (_, i) => question[`choice_${i + 1}` as keyof Question] as string).filter(Boolean);
    }
    if (question.type === 'dropdown') {
      return Array.from({ length: 50 }, (_, i) => question[`dropdown_${i + 1}` as keyof Question] as string).filter(Boolean);
    }
    return [];
  };

  const renderAnswer = (question: Question, answers: Answer[]) => {
    const answer = answers.find(a => a.question_id === question.id);
    if (!answer) {
      return <p className="text-gray-400 italic">No answer provided</p>;
    }

    const answerValue = answer.answer_text || answer.answer_data;

    switch (question.type) {
      case 'short_text':
      case 'long_text':
        return (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-gray-900 whitespace-pre-wrap">{answerValue}</p>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-blue-900 font-medium">{answerValue}</p>
          </div>
        );

      case 'checkboxes':
        const checkboxAnswers = Array.isArray(answerValue) ? answerValue : [answerValue];
        return (
          <div className="space-y-2">
            {checkboxAnswers.map((item, index) => (
              <div key={index} className="bg-green-50 p-2 rounded border border-green-200">
                <p className="text-green-900">{item}</p>
              </div>
            ))}
          </div>
        );

      case 'dropdown':
        return (
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <p className="text-purple-900 font-medium">{answerValue}</p>
          </div>
        );

      case 'file_upload':
        if (typeof answerValue === 'string' && answerValue.startsWith('http')) {
          return (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex items-center space-x-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-600" />
                <a 
                  href={answerValue} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View uploaded file
                </a>
              </div>
            </div>
          );
        }
        return (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-gray-600">File uploaded</p>
          </div>
        );

      case 'video_upload':
        if (typeof answerValue === 'string' && answerValue.startsWith('http')) {
          return (
            <div className="bg-gray-50 p-3 rounded-lg border">
              <div className="flex items-center space-x-2 mb-2">
                <VideoCameraIcon className="h-5 w-5 text-gray-600" />
                <span className="text-gray-700">Video response:</span>
              </div>
              <video 
                controls 
                className="w-full max-w-md rounded border"
                src={answerValue}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }
        return (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <div className="flex items-center space-x-2">
              <VideoCameraIcon className="h-5 w-5 text-gray-600" />
              <p className="text-gray-600">Video uploaded</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 p-3 rounded-lg border">
            <p className="text-gray-900">{JSON.stringify(answerValue)}</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/company-dash"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Applications</h2>
          <p className="text-gray-600 mb-4">No submitted applications found for this internship.</p>
          <Link
            href="/company-dash"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const currentApplication = applications[currentIndex];
  const formData = currentApplication.form_responses.forms;
  const answers = currentApplication.form_responses.response_answers;

  // Sort sections and questions by order_index
  const sortedSections = formData.form_sections
    .sort((a, b) => a.order_index - b.order_index)
    .map(section => ({
      ...section,
      form_questions: section.form_questions.sort((a, b) => a.order_index - b.order_index)
    }));

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/company-dash"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </Link>
              <div className="h-6 border-l border-gray-300"></div>
              <h1 className="text-lg font-semibold text-gray-900">
                {internshipDetails?.title || 'Application Responses'}
              </h1>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {currentIndex + 1} of {applications.length} responses
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className={`p-2 rounded-md ${
                    currentIndex === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentIndex(Math.min(applications.length - 1, currentIndex + 1))}
                  disabled={currentIndex === applications.length - 1}
                  className={`p-2 rounded-md ${
                    currentIndex === applications.length - 1
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 overflow-x-auto py-2">
            {applications.map((app, index) => (
              <button
                key={app.id}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  index === currentIndex
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {app.intern.profile_picture ? (
                    <img
                      src={app.intern.profile_picture}
                      alt={app.intern.name}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5" />
                  )}
                  <span>{app.intern.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Response Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Applicant Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentApplication.intern.profile_picture ? (
                <img
                  src={currentApplication.intern.profile_picture}
                  alt={currentApplication.intern.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentApplication.intern.name}</h2>
                <p className="text-gray-600">{currentApplication.intern.email}</p>
                {currentApplication.intern.school && (
                  <p className="text-sm text-gray-500">
                    {currentApplication.intern.school}
                    {currentApplication.intern.graduation_year && ` • Class of ${currentApplication.intern.graduation_year}`}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Submitted: {new Date(currentApplication.form_responses.submitted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            {/* View Profile Button */}
            <Link
              href={`/public-profile/${currentApplication.intern.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              View Profile
            </Link>
          </div>
        </div>

        {/* Form Responses */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{formData.title}</h3>
          </div>

          <div className="p-6 space-y-8">
            {sortedSections.map((section) => (
              <div key={section.id}>
                {section.title && (
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{section.title}</h4>
                    {section.description && (
                      <p className="text-gray-600 text-sm">{section.description}</p>
                    )}
                  </div>
                )}

                <div className="space-y-6">
                  {section.form_questions.map((question) => (
                    <div key={question.id} className="border-l-4 border-gray-200 pl-4">
                      <div className="mb-3">
                        <h5 className="font-medium text-gray-900 mb-1">
                          {question.question_text}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </h5>
                        <p className="text-xs text-gray-500 capitalize">{question.type.replace('_', ' ')}</p>
                      </div>
                      <div className="ml-4">
                        {renderAnswer(question, answers)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Use ← → arrow keys to navigate between responses
          </p>
        </div>
      </div>
    </div>
  );
} 