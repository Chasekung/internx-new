'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  UserIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import supabase from '@/lib/supabaseClient';
import Link from 'next/link';

interface Application {
  id: string;
  status: string;
  applied_at: string;
  intern: {
    id: string;
    full_name: string;
    email: string;
    high_school?: string;
    graduation_year?: number;
    profile_photo_url?: string;
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

export default function ViewSingleResponsePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const applicationId = params.id;
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [internshipDetails, setInternshipDetails] = useState<any>(null);
  const [isAddingToTeam, setIsAddingToTeam] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

  // Load applications data
  useEffect(() => {
    if (applicationId) {
      loadApplicationData();
    }
  }, [applicationId]);

  // Handle arrow key navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Update URL
      const prevApp = applications[currentIndex - 1];
      if (prevApp) {
        router.push(`/company/view-responses/${prevApp.id}`);
      }
    } else if (event.key === 'ArrowRight' && currentIndex < applications.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Update URL
      const nextApp = applications[currentIndex + 1];
      if (nextApp) {
        router.push(`/company/view-responses/${nextApp.id}`);
      }
    }
  }, [currentIndex, applications, router]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const loadApplicationData = async () => {
    try {
      setIsLoading(true);
      
      // Check if Supabase client is available
      if (!supabase) {
        console.error('Supabase client not available');
        setError('Database connection not available');
        return;
      }
      
      // Get current user (company)
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        return;
      }

      // First, get the specific application to find the internship
      const { data: targetApp, error: targetError } = await supabase
        .from('applications')
        .select('internship_id')
        .eq('id', applicationId)
        .single();

      if (targetError) throw targetError;

      // Load internship details
      const { data: internship, error: internshipError } = await supabase
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
        .eq('id', targetApp.internship_id)
        .single();

      if (internshipError) throw internshipError;
      setInternshipDetails(internship);

      // Now get all pending applications for this internship (exclude accepted/rejected)
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
        .eq('internship_id', targetApp.internship_id)
        .eq('status', 'pending')
        .order('applied_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match the interface
      const transformedApplications = applications.map((app: any) => ({
        ...app,
        intern: app.interns[0] || app.interns, // Handle both array and single object
        interns: undefined // Remove the original property
      }));
      
      // Find the current application index
      const currentAppIndex = transformedApplications.findIndex(app => app.id === applicationId);
      setCurrentIndex(currentAppIndex >= 0 ? currentAppIndex : 0);
      
      setApplications(transformedApplications);
    } catch (error) {
      console.error('Error loading application data:', error);
      setError('Failed to load application data');
    } finally {
      setIsLoading(false);
    }
  };

  const renderAnswer = (question: Question, answers: Answer[]) => {
    const answer = answers.find(a => a.question_id === question.id);
    if (!answer) return <span className="text-gray-500">No answer provided</span>;

    switch (question.type) {
      case 'short_text':
      case 'long_text':
        return (
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-gray-900 whitespace-pre-wrap">{answer.answer_text}</p>
          </div>
        );

      case 'multiple_choice':
        const choices = [
          question.choice_1, question.choice_2, question.choice_3, question.choice_4, question.choice_5,
          question.choice_6, question.choice_7, question.choice_8, question.choice_9, question.choice_10,
          question.choice_11, question.choice_12, question.choice_13, question.choice_14, question.choice_15
        ].filter(Boolean);
        
        const selectedChoices = answer.answer_data?.selected_choices || [];
        return (
          <div className="space-y-2">
            {choices.map((choice, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedChoices.includes(index)}
                  readOnly
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-gray-900">{choice}</span>
              </div>
            ))}
          </div>
        );

      case 'dropdown':
        const dropdownOptions = [
          question.dropdown_1, question.dropdown_2, question.dropdown_3, question.dropdown_4, question.dropdown_5,
          question.dropdown_6, question.dropdown_7, question.dropdown_8, question.dropdown_9, question.dropdown_10,
          question.dropdown_11, question.dropdown_12, question.dropdown_13, question.dropdown_14, question.dropdown_15,
          question.dropdown_16, question.dropdown_17, question.dropdown_18, question.dropdown_19, question.dropdown_20,
          question.dropdown_21, question.dropdown_22, question.dropdown_23, question.dropdown_24, question.dropdown_25,
          question.dropdown_26, question.dropdown_27, question.dropdown_28, question.dropdown_29, question.dropdown_30,
          question.dropdown_31, question.dropdown_32, question.dropdown_33, question.dropdown_34, question.dropdown_35,
          question.dropdown_36, question.dropdown_37, question.dropdown_38, question.dropdown_39, question.dropdown_40,
          question.dropdown_41, question.dropdown_42, question.dropdown_43, question.dropdown_44, question.dropdown_45,
          question.dropdown_46, question.dropdown_47, question.dropdown_48, question.dropdown_49, question.dropdown_50
        ].filter(Boolean);
        
        const selectedIndex = answer.answer_data?.selected_index;
        return (
          <div className="bg-gray-50 p-3 rounded-md">
            <span className="text-gray-900 font-medium">
              {selectedIndex !== undefined && dropdownOptions[selectedIndex] ? dropdownOptions[selectedIndex] : 'No selection'}
            </span>
          </div>
        );

      case 'file_upload':
          return (
          <div className="bg-gray-50 p-3 rounded-md">
            {answer.answer_data?.file_url ? (
                <a 
                href={answer.answer_data.file_url}
                  target="_blank" 
                  rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                  View uploaded file
                </a>
            ) : (
              <span className="text-gray-500">No file uploaded</span>
            )}
          </div>
        );

      case 'video_upload':
          return (
          <div className="bg-gray-50 p-3 rounded-md">
            {answer.answer_data?.video_url ? (
              <a
                href={answer.answer_data.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline flex items-center"
              >
                <VideoCameraIcon className="h-5 w-5 mr-2" />
                View uploaded video
              </a>
            ) : (
              <span className="text-gray-500">No video uploaded</span>
            )}
          </div>
        );

      default:
        return <span className="text-gray-500">Unsupported question type</span>;
    }
  };

  const navigateToApplication = (index: number) => {
    if (index >= 0 && index < applications.length) {
      setCurrentIndex(index);
      router.push(`/company/view-responses/${applications[index].id}`);
    }
  };

  const handleAddToTeam = async () => {
    if (!teamName.trim() || !applications[currentIndex]) return;
    
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not available');
      return;
    }
    
    setIsAddingToTeam(true);
    try {
      const { error } = await supabase
        .from('interns')
        .update({ team: teamName })
        .eq('id', applications[currentIndex].intern.id);
      
      if (error) throw error;

        setShowTeamModal(false);
        setTeamName('');
      // You could add a success notification here
    } catch (error) {
      console.error('Error adding to team:', error);
      // You could add an error notification here
    } finally {
      setIsAddingToTeam(false);
    }
  };

  const extractTeamNameFromInternship = (title: string): string => {
    // Remove common suffixes and clean up the title
    const cleanTitle = title
      .replace(/\s*-\s*.*$/, '') // Remove everything after dash (e.g., "Finance Intern - Finance" -> "Finance Intern")
      .trim();
    
    // Common patterns to extract team name
    const patterns = [
      /^(.+?)\s+Intern$/i,           // "Finance Intern" -> "Finance"
      /^(.+?)\s+Internship$/i,       // "Finance Internship" -> "Finance"
      /^(.+?)\s+Position$/i,         // "Finance Position" -> "Finance"
      /^(.+?)\s+Role$/i,             // "Finance Role" -> "Finance"
      /^(.+?)\s+Opportunity$/i,      // "Finance Opportunity" -> "Finance"
    ];
    
    for (const pattern of patterns) {
      const match = cleanTitle.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    // If no pattern matches, return the cleaned title
    return cleanTitle;
  };

  const handleAcceptApplication = async () => {
    if (!applications[currentIndex]) {
      alert('No application selected');
      return;
    }
    
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not available');
      return;
    }
    
    // Automatically extract team name from internship title
    const autoTeamName = extractTeamNameFromInternship(internshipDetails?.title || '');
    
    if (!autoTeamName) {
      alert('Could not determine team name from internship title');
      return;
    }
    
    setIsAccepting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to accept applications');
        return;
      }

      const response = await fetch('/api/companies/applications/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          applicationId: applications[currentIndex].id,
          internId: applications[currentIndex].intern.id,
          teamName: autoTeamName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept application');
      }

      // Close modal and reset
      setShowTeamModal(false);
      setTeamName('');
      
      // Reload the applications to get updated status
      await loadApplicationData();
      
      alert(`Application accepted successfully! ${applications[currentIndex].intern.full_name} has been added to the ${autoTeamName} team.`);
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('Failed to accept application. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineApplication = async () => {
    if (!applications[currentIndex]) return;
    
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not available');
      return;
    }
    
    setIsDeclining(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('You must be logged in to decline applications');
        return;
      }

      const response = await fetch('/api/companies/applications/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          applicationId: applications[currentIndex].id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to decline application');
      }

      // Close confirm modal
      setShowDeclineConfirm(false);
      
      // Reload the applications to get updated status
      await loadApplicationData();
      
      alert('Application declined successfully.');
    } catch (error) {
      console.error('Error declining application:', error);
      alert('Failed to decline application. Please try again.');
    } finally {
      setIsDeclining(false);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No applications found</h1>
          <p className="text-gray-600">There are no applications for this internship.</p>
        </div>
      </div>
    );
  }

  const currentApplication = applications[currentIndex];
  if (!currentApplication) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Application not found</h1>
          <p className="text-gray-600">The requested application could not be found.</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/company/view-responses"
                className="text-gray-500 hover:text-gray-700"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {internshipDetails?.title || 'Application Review'}
              </h1>
                <p className="text-gray-600">
                  Application {currentIndex + 1} of {applications.length}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {currentApplication.status === 'pending' ? (
                <>
                  <button
                    onClick={() => setShowTeamModal(true)}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Accept
                  </button>
                  <button
                    onClick={() => setShowDeclineConfirm(true)}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Decline
                  </button>
                </>
              ) : (
                <div className={`px-4 py-2 rounded-md font-medium ${
                  currentApplication.status === 'accepted' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {currentApplication.status === 'accepted' ? 'Accepted' : 'Declined'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
                <button
                  onClick={() => navigateToApplication(currentIndex - 1)}
                  disabled={currentIndex === 0}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
              <ChevronLeftIcon className="h-5 w-5 mr-1" />
              Previous
                </button>
            
            <div className="flex space-x-2">
            {applications.map((app, index) => (
              <button
                key={app.id}
                onClick={() => navigateToApplication(index)}
                  className={`px-3 py-1 rounded-md text-sm ${
                  index === currentIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                  {index + 1}
              </button>
            ))}
      </div>

                <button
                  onClick={() => navigateToApplication(currentIndex + 1)}
                  disabled={currentIndex === applications.length - 1}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
              Next
              <ChevronRightIcon className="h-5 w-5 ml-1" />
                </button>
          </div>
        </div>
      </div>

      {/* Application Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Applicant Info */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {currentApplication.intern.profile_photo_url ? (
                <img
                  src={currentApplication.intern.profile_photo_url}
                  alt="Profile"
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <UserIcon className="h-8 w-8 text-gray-600" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                {currentApplication.intern.full_name}
              </h2>
              <p className="text-gray-600">{currentApplication.intern.email}</p>
              <p className="text-gray-500">
                {currentApplication.intern.high_school}
                {currentApplication.intern.graduation_year && ` • Class of ${currentApplication.intern.graduation_year}`}
                </p>
              </div>
            <div className="text-right">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                currentApplication.status === 'accepted' ? 'bg-green-100 text-green-800' :
                currentApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {currentApplication.status.charAt(0).toUpperCase() + currentApplication.status.slice(1)}
              </span>
              <p className="text-sm text-gray-500 mt-1">
                Applied {new Date(currentApplication.applied_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Form Responses */}
        {currentApplication.form_responses && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentApplication.form_responses.forms.title}
              </h3>
              <p className="text-sm text-gray-600">
                Submitted {new Date(currentApplication.form_responses.submitted_at).toLocaleDateString()}
              </p>
          </div>

            <div className="p-6">
              {currentApplication.form_responses.forms.form_sections
                .sort((a, b) => a.order_index - b.order_index)
                .map((section) => (
                  <div key={section.id} className="mb-8 last:mb-0">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className="text-gray-600 mb-4">{section.description}</p>
                )}

                <div className="space-y-6">
                      {section.form_questions
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((question) => (
                          <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                      <div className="mb-3">
                              <h5 className="text-base font-medium text-gray-900">
                          {question.question_text}
                        </h5>
                              {question.required && (
                                <span className="text-red-500 text-sm ml-1">*</span>
                              )}
                      </div>
                            
                      <div className="ml-4">
                              {renderAnswer(question, currentApplication.form_responses.response_answers)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* Accept Application Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Accept Application
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to accept {currentApplication.intern.full_name}'s application? They will be automatically added to the <span className="font-semibold text-green-600">{extractTeamNameFromInternship(internshipDetails?.title || '')}</span> team.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTeamModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptApplication}
                disabled={isAccepting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAccepting ? 'Accepting...' : 'Accept Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Application Confirmation Modal */}
      {showDeclineConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Decline Application
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to decline the application from {currentApplication.intern.full_name}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeclineConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineApplication}
                disabled={isDeclining}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeclining ? 'Declining...' : 'Decline Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 