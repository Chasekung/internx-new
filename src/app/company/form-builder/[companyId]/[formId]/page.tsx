'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import supabase from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { 
  PlusIcon, 
  TrashIcon, 
  ArrowsUpDownIcon,
  Cog6ToothIcon,
  EyeIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  description?: string;
  options?: string[];
  required: boolean;
  order_index: number;
  placeholder?: string;
  hint?: string;
  maxLength?: number;
  fileTypes?: string[];
  maxFileSize?: number;
  maxDuration?: number;
  isConfigured?: boolean;
}

interface Section {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  questions: Question[];
}

interface Theme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  borderRadius: string;
  spacing: string;
}

// Add this new component for handling text inputs
const TextInput = ({ 
  value, 
  onChange, 
  placeholder, 
  className = "", 
  type = "text",
  rows = undefined
}: { 
  value: string; 
  onChange: (value: string) => void; 
  placeholder?: string; 
  className?: string;
  type?: "text" | "textarea";
  rows?: number;
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  const baseClassName = `text-black ${className}`;

  if (type === "textarea") {
    return (
      <textarea
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={baseClassName}
        rows={rows}
      />
    );
  }

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={baseClassName}
    />
  );
};

const QuestionPreview = ({ question }: { question: Question }) => {
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'short_text':
      case 'long_text':
        return (
          <div className="mt-2">
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
            )}
            <div className="relative">
              {question.type === 'short_text' ? (
                <input
                  type="text"
                  disabled
                  placeholder={question.placeholder || 'Enter your answer'}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              ) : (
                <textarea
                  disabled
                  placeholder={question.placeholder || 'Enter your answer'}
                  rows={3}
                  className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              )}
              {question.hint && (
                <p className="mt-1 text-sm text-gray-500">{question.hint}</p>
              )}
            </div>
          </div>
        );
      
      case 'multiple_choice':
        return (
          <div className="mt-2">
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
            )}
            <div className="space-y-2">
              {(question.options || ['Option 1', 'Option 2']).map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    disabled
                    name={`question-${question.id}`}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="ml-2 text-sm text-gray-700">{option}</label>
                </div>
              ))}
            </div>
            {question.hint && (
              <p className="mt-1 text-sm text-gray-500">{question.hint}</p>
            )}
          </div>
        );

      case 'checkboxes':
        return (
          <div className="mt-2">
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
            )}
            <div className="space-y-2">
              {(question.options || ['Option 1', 'Option 2']).map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    disabled
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                  />
                  <label className="ml-2 text-sm text-gray-700">{option}</label>
                </div>
              ))}
            </div>
            {question.hint && (
              <p className="mt-1 text-sm text-gray-500">{question.hint}</p>
            )}
          </div>
        );

      case 'dropdown':
        return (
          <div className="mt-2">
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
            )}
            <select
              disabled
              className="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{question.placeholder || 'Select an option'}</option>
              {(question.options || ['Option 1', 'Option 2']).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {question.hint && (
              <p className="mt-1 text-sm text-gray-500">{question.hint}</p>
            )}
          </div>
        );

      case 'file_upload':
        return (
          <div className="mt-2">
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
            )}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-not-allowed bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    {question.fileTypes?.length 
                      ? `Allowed types: ${question.fileTypes.join(', ')}`
                      : 'All file types accepted'}
                    {question.maxFileSize && ` (Max: ${question.maxFileSize}MB)`}
                  </p>
                </div>
              </label>
            </div>
            {question.hint && (
              <p className="mt-1 text-sm text-gray-500">{question.hint}</p>
            )}
          </div>
        );

      case 'video_upload':
        return (
          <div className="mt-2">
            {question.description && (
              <p className="text-sm text-gray-600 mb-2">{question.description}</p>
            )}
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-not-allowed bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" d="M10 5.757v8.486M5.757 10h8.486M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to record</span> or upload video
                  </p>
                  <p className="text-xs text-gray-500">
                    {question.maxDuration && `Max duration: ${question.maxDuration} seconds`}
                  </p>
                </div>
              </label>
            </div>
            {question.hint && (
              <p className="mt-1 text-sm text-gray-500">{question.hint}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <div className="text-sm text-gray-500">Preview:</div>
      {renderQuestionInput()}
    </div>
  );
};

export default function FormBuilder({ 
  params: { companyId, formId } 
}: { 
  params: { companyId: string, formId: string } 
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'publish'>('build');
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>({
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    spacing: '1rem'
  });
  const [isDragging, setIsDragging] = useState(false);
  const [activeConfigQuestion, setActiveConfigQuestion] = useState<string | null>(null);

  const getIconSize = (type: string) => {
    switch (type) {
      case 'file_upload':
        return 60;
      case 'multiple_choice':
      case 'checkboxes':
      case 'dropdown':
        return 56;
      default:
        return 48;
    }
  };

  const getContainerSize = (type: string) => {
    return type === 'file_upload' ? 'w-[60px] h-[60px]' : 'w-[56px] h-[56px]';
  };

  const questionTypes = [
    { value: 'short_text', label: 'Short Text', icon: '/short-text.png', isImage: true },
    { value: 'long_text', label: 'Long Text', icon: '/long-text.png', isImage: true },
    { value: 'multiple_choice', label: 'Multiple Choice', icon: '/multiple-choice.png', isImage: true },
    { value: 'checkboxes', label: 'Checkboxes', icon: '/checkboxes.png', isImage: true },
    { value: 'dropdown', label: 'Dropdown', icon: '/dropdown.png', isImage: true },
    { value: 'file_upload', label: 'File Upload', icon: '/upload.png', isImage: true },
    { value: 'video_upload', label: 'Video Upload', icon: '/video-upload.png', isImage: true }
  ];

  useEffect(() => {
    loadForm();
    setMounted(true);
  }, []);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        notFound();
      }

      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .eq('company_id', companyId)
        .single();

      if (formError || !form) {
        notFound();
      }

      setFormTitle(form.title);
      setFormDescription(form.description || '');

      const { data: sectionsData, error: sectionsError } = await supabase
        .from('form_sections')
        .select(`
          *,
          form_questions (*)
        `)
        .eq('form_id', formId)
        .order('order_index');

      if (sectionsError) throw sectionsError;

      const formattedSections = sectionsData.map((section: any) => ({
        id: section.id,
        title: section.title,
        description: section.description,
        order_index: section.order_index,
        questions: section.form_questions.sort((a: any, b: any) => a.order_index - b.order_index)
      }));

      setSections(formattedSections);
      if (formattedSections.length > 0) {
        setActiveSection(formattedSections[0].id);
      }
    } catch (error) {
      console.error('Error loading form:', error);
      setError(error instanceof Error ? error.message : 'Failed to load form');
    } finally {
      setIsLoading(false);
    }
  };

  const addSection = () => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: 'New Section',
      description: '',
      order_index: sections.length,
      questions: []
    };
    setSections(prev => [...prev, newSection]);
  };

  const addQuestion = (sectionId: string, type: Question['type'] = 'short_text'): string => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return '';

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      question_text: 'New Question',
      required: false,
      order_index: sections[sectionIndex].questions.length,
      description: '',
      options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' ? ['Option 1'] : undefined,
      placeholder: '',
      hint: '',
      isConfigured: false
    };

    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      questions: [...newSections[sectionIndex].questions, newQuestion]
    };
    setSections([...newSections]);
    return newQuestion.id;
  };

  const onDragEnd = (result: any) => {
    setIsDragging(false);
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    // If dragging from question types to form
    if (source.droppableId === 'question-types') {
      const type = questionTypes[source.index].value as Question['type'];
      const sectionId = destination.droppableId.replace('section-', '');
      const newQuestionId = addQuestion(sectionId, type);
      // Show configuration modal for the new question
      setActiveConfigQuestion(newQuestionId);
      return;
    }

    // If reordering questions within a section
    const sourceSection = sections.find(s => `section-${s.id}` === source.droppableId);
    const destSection = sections.find(s => `section-${s.id}` === destination.droppableId);
    
    if (sourceSection && destSection) {
      const newSections = [...sections];
      const [movedQuestion] = sourceSection.questions.splice(source.index, 1);
      destSection.questions.splice(destination.index, 0, movedQuestion);
      
      // Update order indices
      destSection.questions.forEach((q, idx) => {
        q.order_index = idx;
      });
      
      setSections(newSections);
    }
  };

  const onDragStart = () => {
    setIsDragging(true);
  };

  // Delete handlers
  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(s => s.id !== sectionId));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    const newSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    });
    setSections([...newSections]);
  };

  const getQuestionConfig = (type: Question['type']) => {
    switch (type) {
      case 'multiple_choice':
      case 'checkboxes':
      case 'dropdown':
        return {
          hasOptions: true,
          hasPlaceholder: false,
          hasHint: true,
          hasMaxLength: false,
          hasFileTypes: false,
          hasMaxFileSize: false,
          hasMaxDuration: false,
        };
      case 'short_text':
      case 'long_text':
        return {
          hasOptions: false,
          hasPlaceholder: true,
          hasHint: true,
          hasMaxLength: true,
          hasFileTypes: false,
          hasMaxFileSize: false,
          hasMaxDuration: false,
        };
      case 'file_upload':
        return {
          hasOptions: false,
          hasPlaceholder: false,
          hasHint: true,
          hasMaxLength: false,
          hasFileTypes: true,
          hasMaxFileSize: true,
          hasMaxDuration: false,
        };
      case 'video_upload':
        return {
          hasOptions: false,
          hasPlaceholder: false,
          hasHint: true,
          hasMaxLength: false,
          hasFileTypes: true,
          hasMaxFileSize: true,
          hasMaxDuration: true,
        };
      default:
        return {
          hasOptions: false,
          hasPlaceholder: false,
          hasHint: true,
          hasMaxLength: false,
          hasFileTypes: false,
          hasMaxFileSize: false,
          hasMaxDuration: false,
        };
    }
  };

  const QuestionConfig = ({ question, sectionIndex, questionIndex, onClose }: {
    question: Question;
    sectionIndex: number;
    questionIndex: number;
    onClose: () => void;
  }) => {
    const [localQuestion, setLocalQuestion] = useState<Question>({ ...question });

    useEffect(() => {
      setLocalQuestion(question);
    }, [question]);

    const handleInputChange = (field: keyof Question, value: any) => {
      setLocalQuestion(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const updateQuestion = () => {
      const newSections = [...sections];
      newSections[sectionIndex].questions[questionIndex] = {
        ...localQuestion,
        isConfigured: true
      };
      setSections([...newSections]);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4 text-black">Configure Question</h3>
          
          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <TextInput
              type="textarea"
              value={localQuestion.description || ''}
              onChange={(value) => handleInputChange('description', value)}
              placeholder="Add a description to help users understand this question"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              rows={2}
            />
          </div>

          {/* Options for multiple choice, checkboxes, dropdown */}
          {(localQuestion.type === 'multiple_choice' || localQuestion.type === 'checkboxes' || localQuestion.type === 'dropdown') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Options
              </label>
              <div className="space-y-2">
                {localQuestion.options?.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <TextInput
                      value={option}
                      onChange={(value) => {
                        const newOptions = [...(localQuestion.options || [])];
                        newOptions[index] = value;
                        handleInputChange('options', newOptions);
                      }}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => {
                        const newOptions = localQuestion.options?.filter((_, i) => i !== index);
                        handleInputChange('options', newOptions);
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...(localQuestion.options || []), `Option ${(localQuestion.options?.length || 0) + 1}`];
                    handleInputChange('options', newOptions);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Option
                </button>
              </div>
            </div>
          )}

          {/* Placeholder for text inputs */}
          {(localQuestion.type === 'short_text' || localQuestion.type === 'long_text') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder Text
              </label>
              <TextInput
                value={localQuestion.placeholder || ''}
                onChange={(value) => handleInputChange('placeholder', value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          {/* Hint */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hint Text
            </label>
            <TextInput
              value={localQuestion.hint || ''}
              onChange={(value) => handleInputChange('hint', value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Add a hint to help users answer this question"
            />
          </div>

          {/* File/Video specific fields */}
          {(localQuestion.type === 'file_upload' || localQuestion.type === 'video_upload') && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed File Types
                </label>
                <TextInput
                  value={localQuestion.fileTypes?.join(', ') || ''}
                  onChange={(value) => handleInputChange('fileTypes', value.split(',').map(t => t.trim()))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter file types (e.g., pdf, doc, docx)"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum File Size (MB)
                </label>
                <input
                  type="number"
                  value={localQuestion.maxFileSize || ''}
                  onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value) || undefined)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                  placeholder="Enter maximum file size in MB"
                />
              </div>
              {localQuestion.type === 'video_upload' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={localQuestion.maxDuration || ''}
                    onChange={(e) => handleInputChange('maxDuration', parseInt(e.target.value) || undefined)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                    placeholder="Enter maximum video duration in seconds"
                  />
                </div>
              )}
            </>
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={updateQuestion}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 flex items-center"
              >
                <XMarkIcon className="h-5 w-5 mr-1" />
                Exit
              </button>
              <button
                onClick={() => setActiveTab('build')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'build' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <DocumentTextIcon className="h-5 w-5 inline mr-2" />
                Build
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'settings' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Cog6ToothIcon className="h-5 w-5 inline mr-2" />
                Settings
              </button>
              <button
                onClick={() => setActiveTab('publish')}
                className={`px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeTab === 'publish' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ArrowPathIcon className="h-5 w-5 inline mr-2" />
                Publish
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {}}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <EyeIcon className="h-5 w-5 inline mr-2" />
                Preview
              </button>
              <button
                onClick={() => {}}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container - Starts below fixed nav */}
      <div className="pt-16 relative z-0">
        <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
          <div className="flex mx-auto max-w-[1920px]">
            {/* Left Sidebar - Question Types */}
            <div className="w-64 bg-white/80 backdrop-blur-md p-4 border-r border-gray-200 min-h-screen relative z-10">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Question Types
              </h3>
              <Droppable droppableId="question-types" isDropDisabled={true}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {questionTypes.map((type, index) => (
                      <Draggable
                        key={type.value}
                        draggableId={`type-${type.value}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 rounded-lg border border-gray-200 bg-white shadow-sm cursor-move transition-transform duration-200 ${
                              snapshot.isDragging ? 'scale-105 shadow-md z-50' : ''
                            }`}
                            style={{
                              ...provided.draggableProps.style,
                              zIndex: snapshot.isDragging ? 9999 : 'auto'
                            }}
                          >
                            <div className="flex items-center">
                              {type.isImage ? (
                                <div className={`flex items-center justify-center ${getContainerSize(type.value)}`}>
                                  <Image 
                                    src={type.icon} 
                                    alt={type.label}
                                    width={getIconSize(type.value)} 
                                    height={getIconSize(type.value)} 
                                    className="mr-3"
                                  />
                                </div>
                              ) : (
                                <span className="text-xl mr-3">{type.icon}</span>
                              )}
                              <span className="text-sm text-gray-700">{type.label}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-8 min-h-screen bg-white/50 relative z-0">
              {/* Form Header */}
              <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-lg p-6 mb-6">
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Form Title"
                  className="text-2xl font-bold w-full border-0 focus:ring-0 p-0 mb-4 text-gray-900 bg-transparent"
                />
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Form Description"
                  className="w-full border-0 focus:ring-0 p-0 resize-none text-gray-900 bg-transparent"
                  rows={2}
                />
              </div>

              {/* Sections */}
              <div className="space-y-6 pb-8">
                {sections.map((section, sectionIndex) => (
                  <Droppable key={section.id} droppableId={`section-${section.id}`}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`bg-white/80 backdrop-blur-md shadow-sm rounded-lg p-6 transition-colors duration-200 relative group ${
                          snapshot.isDraggingOver ? 'bg-blue-50/80' : ''
                        }`}
                      >
                        {/* Section Header with Delete Button */}
                        <div className="flex items-center justify-between mb-4">
                          <input
                            type="text"
                            value={section.title}
                            onChange={(e) => {
                              const newSections = [...sections];
                              newSections[sectionIndex].title = e.target.value;
                              setSections(newSections);
                            }}
                            placeholder="Section Title"
                            className="text-lg font-semibold w-full border-0 focus:ring-0 p-0 bg-transparent"
                          />
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            title="Delete Section"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Section Description */}
                        <textarea
                          value={section.description}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[sectionIndex].description = e.target.value;
                            setSections(newSections);
                          }}
                          placeholder="Section Description"
                          className="w-full border-0 focus:ring-0 p-0 mb-6 resize-none text-gray-900 bg-transparent"
                          rows={2}
                        />

                        {/* Questions */}
                        <div className="space-y-4">
                          {section.questions.map((question, questionIndex) => (
                            <Draggable
                              key={question.id}
                              draggableId={question.id}
                              index={questionIndex}
                            >
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 group relative"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <input
                                        type="text"
                                        value={question.question_text}
                                        onChange={(e) => {
                                          const newSections = [...sections];
                                          newSections[sectionIndex].questions[questionIndex].question_text = e.target.value;
                                          setSections(newSections);
                                        }}
                                        placeholder="Question Text"
                                        className="w-full border-0 focus:ring-0 p-0 font-medium text-gray-900 bg-transparent"
                                      />
                                      <div className="mt-1 text-sm text-gray-500">
                                        {question.type}
                                      </div>
                                      
                                      {/* Display configured details */}
                                      {question.isConfigured && <QuestionPreview question={question} />}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => setActiveConfigQuestion(question.id)}
                                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-50 transition-colors duration-200"
                                        title="Configure Question"
                                      >
                                        <Cog6ToothIcon className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => deleteQuestion(section.id, question.id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                                        title="Delete Question"
                                      >
                                        <TrashIcon className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Required Checkbox */}
                                  <div className="flex items-center mt-2">
                                    <label className="flex items-center text-sm text-gray-900">
                                      <input
                                        type="checkbox"
                                        checked={question.required}
                                        onChange={(e) => {
                                          const newSections = [...sections];
                                          newSections[sectionIndex].questions[questionIndex].required = e.target.checked;
                                          setSections(newSections);
                                        }}
                                        className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-4 w-4 mr-2"
                                      />
                                      Required
                                    </label>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          <button
                            onClick={() => addQuestion(section.id)}
                            className={`w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center transition-colors duration-200 ${
                              isDragging ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                          >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Question
                          </button>
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>

              {/* Add Section Button */}
              <div className="flex justify-center items-center mt-4">
                <button
                  onClick={addSection}
                  className="flex items-center justify-center w-full max-w-3xl mx-auto py-6 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <PlusIcon className="h-6 w-6" />
                  <span className="ml-2 text-base font-medium">Add New Section</span>
                </button>
              </div>
            </div>

            {/* Right Sidebar - Theme Customization */}
            <div className="w-64 bg-white/80 backdrop-blur-md p-4 border-l border-gray-200 min-h-screen relative z-10">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Theme Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <input
                    type="color"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={theme.backgroundColor}
                    onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                    className="w-full h-10 rounded-md cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Font Family
                  </label>
                  <select
                    value={theme.fontFamily}
                    onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Border Radius
                  </label>
                  <select
                    value={theme.borderRadius}
                    onChange={(e) => setTheme({ ...theme, borderRadius: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="0">None</option>
                    <option value="0.25rem">Small</option>
                    <option value="0.5rem">Medium</option>
                    <option value="1rem">Large</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Spacing
                  </label>
                  <select
                    value={theme.spacing}
                    onChange={(e) => setTheme({ ...theme, spacing: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="0.5rem">Compact</option>
                    <option value="1rem">Normal</option>
                    <option value="1.5rem">Relaxed</option>
                    <option value="2rem">Spacious</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </DragDropContext>
      </div>

      {/* Configuration Modal */}
      {activeConfigQuestion && (
        <QuestionConfig
          question={sections.flatMap(s => s.questions).find(q => q.id === activeConfigQuestion)!}
          sectionIndex={sections.findIndex(s => s.questions.some(q => q.id === activeConfigQuestion))}
          questionIndex={sections.find(s => s.questions.some(q => q.id === activeConfigQuestion))!.questions.findIndex(q => q.id === activeConfigQuestion)}
          onClose={() => setActiveConfigQuestion(null)}
        />
      )}

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #a78bfa 1px, transparent 1px),
            linear-gradient(to bottom, #a78bfa 1px, transparent 1px);
          background-size: 24px 24px;
        }
        .scale-102 {
          transform: scale(1.02);
        }
        .dragging {
          z-index: 9999 !important;
        }
        /* Ensure the portal container is above everything else */
        div[data-rbd-drag-handle-draggable-id] {
          z-index: 9999;
        }
        div[data-rbd-drag-handle-context-id] {
          z-index: 9999;
        }
        div[data-rbd-portal] {
          z-index: 9999;
        }
      `}</style>
    </div>
  );
} 