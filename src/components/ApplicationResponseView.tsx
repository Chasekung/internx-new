'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  UserPlusIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface ApplicationData {
  id: string;
  status: string;
  applied_at: string;
  internship: {
    id: string;
    title: string;
    position: string;
    category: string;
  };
  applicant: {
    id: string;
    name: string;
    email: string;
    school: string;
    graduation_year: number;
    profile_picture?: string;
  };
  form_response: {
    id: string;
    status: string;
    submitted_at: string;
    form: {
      id: string;
      title: string;
      sections: Array<{
        id: string;
        title: string;
        order_index: number;
        questions: Array<{
          id: string;
          type: string;
          question_text: string;
          required: boolean;
          order_index: number;
          options: string[];
          answer: {
            text: string;
            data: any;
          } | null;
        }>;
      }>;
    };
  };
}

interface ApplicationResponseViewProps {
  application: ApplicationData;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ApplicationResponseView({ 
  application, 
  isExpanded, 
  onToggle 
}: ApplicationResponseViewProps) {
  const supabase = createClientComponentClient();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isAddingToTeam, setIsAddingToTeam] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'submitted':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      case 'submitted':
        return <CheckCircleIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handleAddToTeam = async () => {
    if (!teamName.trim()) return;
    
    setIsAddingToTeam(true);
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          company_id: application.internship.id, // This should be the company ID
          intern_id: application.applicant.id,
          team_name: teamName.trim(),
          role: 'member'
        });

      if (error) throw error;
      
      setShowTeamModal(false);
      setTeamName('');
      // You could add a success toast here
    } catch (error) {
      console.error('Error adding to team:', error);
      // You could add an error toast here
    } finally {
      setIsAddingToTeam(false);
    }
  };

  const renderAnswer = (question: any) => {
    const answer = question.answer;
    
    if (!answer) {
      return <p className="text-gray-500 italic">No answer provided</p>;
    }

    switch (question.type) {
      case 'short_text':
      case 'long_text':
        return (
          <div className="bg-white p-3 rounded border">
            <p className="text-gray-900 whitespace-pre-wrap">{answer.text || answer.data}</p>
          </div>
        );
      
      case 'multiple_choice':
        return (
          <div className="bg-white p-3 rounded border">
            <p className="text-gray-900">{answer.text || answer.data}</p>
          </div>
        );
      
      case 'checkboxes':
        const selectedOptions = Array.isArray(answer.data) ? answer.data : [answer.text];
        return (
          <div className="bg-white p-3 rounded border">
            <div className="space-y-1">
              {selectedOptions.map((option: string, index: number) => (
                <div key={index} className="flex items-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-gray-900">{option}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'dropdown':
        return (
          <div className="bg-white p-3 rounded border">
            <p className="text-gray-900">{answer.text || answer.data}</p>
          </div>
        );
      
      case 'file_upload':
        return (
          <div className="bg-white p-3 rounded border">
            {answer.data ? (
              <a 
                href={answer.data} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View uploaded file
              </a>
            ) : (
              <p className="text-gray-500 italic">No file uploaded</p>
            )}
          </div>
        );
      
      case 'video_upload':
        return (
          <div className="bg-white p-3 rounded border">
            {answer.data ? (
              <video 
                controls 
                className="w-full max-w-md"
                src={answer.data}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <p className="text-gray-500 italic">No video uploaded</p>
            )}
          </div>
        );
      
      default:
        return (
          <div className="bg-white p-3 rounded border">
            <p className="text-gray-900">{answer.text || JSON.stringify(answer.data)}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {application.applicant.profile_picture ? (
              <img
                src={application.applicant.profile_picture}
                alt={application.applicant.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {application.applicant.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {application.applicant.name}
              </h3>
              <p className="text-sm text-gray-600">{application.applicant.email}</p>
              <p className="text-sm text-gray-500">
                {application.applicant.school} • Class of {application.applicant.graduation_year}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)}
              <span>{application.status}</span>
            </span>
            <button
              onClick={onToggle}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Applied {formatDate(application.applied_at)}
          </div>
          <button
            onClick={() => setShowTeamModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <UserPlusIcon className="w-4 h-4" />
            <span>Add to Team</span>
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6">
          {/* Section Filter */}
          {application.form_response.form.sections.length > 1 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Filter by Section</h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSection(null)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedSection === null
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Sections
                </button>
                {application.form_response.form.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedSection === section.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Questions and Answers */}
          <div className="space-y-6">
            {application.form_response.form.sections
              .filter(section => selectedSection === null || section.id === selectedSection)
              .map((section) => (
                <div key={section.id} className="space-y-4">
                  {application.form_response.form.sections.length > 1 && selectedSection === null && (
                    <h5 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">
                      {section.title}
                    </h5>
                  )}
                  {section.questions.map((question) => (
                    <div key={question.id} className="bg-gray-50 rounded-lg p-4 border">
                      <div className="flex items-start justify-between mb-2">
                        <h6 className="font-medium text-gray-900">
                          {question.question_text}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </h6>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                          {question.type.replace('_', ' ')}
                        </span>
                      </div>
                      {renderAnswer(question)}
                    </div>
                  ))}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Team Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add {application.applicant.name} to your team
            </h3>
            <div className="mb-4">
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Engineering, Marketing, Sales"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddToTeam();
                  }
                }}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleAddToTeam}
                disabled={isAddingToTeam || !teamName.trim()}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAddingToTeam ? 'Adding...' : 'Add to Team'}
              </button>
              <button
                onClick={() => {
                  setShowTeamModal(false);
                  setTeamName('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 