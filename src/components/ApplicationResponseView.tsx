'use client';

import { useState } from 'react';
import { 
  UserCircleIcon, 
  AcademicCapIcon, 
  CalendarIcon, 
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

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
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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
    switch (status) {
      case 'submitted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'in_progress':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'reviewed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4" />;
      case 'reviewed':
        return <EyeIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  const renderAnswer = (question: any) => {
    const answer = question.answer;
    if (!answer || (!answer.text && !answer.data)) {
      return <span className="text-gray-400 italic">No answer provided</span>;
    }

    switch (question.type) {
      case 'short_text':
      case 'long_text':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <p className="text-gray-900 whitespace-pre-wrap">{answer.text}</p>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              <p className="text-gray-900">{answer.text}</p>
            </div>
          </div>
        );

      case 'checkboxes':
        const selectedOptions = Array.isArray(answer.data) ? answer.data : [answer.text];
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <div className="space-y-2">
              {selectedOptions.map((option: string, index: number) => (
                <div key={index} className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-sm mr-2 flex items-center justify-center">
                    <CheckCircleIcon className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-gray-900">{option}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'dropdown':
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center">
              <ChevronDownIcon className="h-4 w-4 text-gray-500 mr-2" />
              <p className="text-gray-900">{answer.text}</p>
            </div>
          </div>
        );

      case 'file_upload':
        if (answer.data && Array.isArray(answer.data)) {
          return (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
              <div className="space-y-2">
                {answer.data.map((file: any, index: number) => (
                  <div key={index} className="flex items-center">
                    <DocumentTextIcon className="h-4 w-4 text-blue-500 mr-2" />
                    <a 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {file.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <p className="text-gray-900">{answer.text}</p>
          </div>
        );

      case 'video_upload':
        if (answer.data && answer.data.url) {
          return (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
              <video 
                controls 
                className="w-full max-w-md rounded-lg"
                src={answer.data.url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          );
        }
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <p className="text-gray-900">{answer.text}</p>
          </div>
        );

      default:
        return (
          <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
            <p className="text-gray-900">{answer.text || JSON.stringify(answer.data)}</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            {application.applicant.profile_picture ? (
              <img
                src={application.applicant.profile_picture}
                alt={application.applicant.name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <UserCircleIcon className="h-10 w-10 text-gray-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {application.applicant.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-1" />
                {application.applicant.email}
              </div>
              <div className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                {application.applicant.school}
              </div>
              <div className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Class of {application.applicant.graduation_year}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getStatusColor(application.form_response.status)}`}>
            {getStatusIcon(application.form_response.status)}
            <span className="capitalize">{application.form_response.status.replace('_', ' ')}</span>
          </div>
          <div className="text-sm text-gray-500">
            {formatDate(application.form_response.submitted_at || application.applied_at)}
          </div>
          <Link
            href={`/company/view-responses/${application.id}`}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
            onClick={(e) => e.stopPropagation()}
          >
            <EyeIcon className="h-4 w-4" />
            <span>View Full Response</span>
            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
          </Link>
          <div className="transform transition-transform">
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="px-6 py-4">
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                {application.form_response.form.title}
              </h4>
              <p className="text-sm text-gray-600">
                Application for {application.internship.position} • {application.internship.category}
              </p>
            </div>

            {/* Section Navigation */}
            {application.form_response.form.sections.length > 1 && (
              <div className="mb-6">
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
        </div>
      )}
    </div>
  );
} 