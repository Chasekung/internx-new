'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
  XMarkIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';

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
  borderRadius: number;
  spacing: number;
}

const ThemeContext = createContext<Theme>({
  primaryColor: '#3b82f6',
  backgroundColor: '#ffffff',
  fontFamily: 'Inter',
  borderRadius: 8,
  spacing: 16
});

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
  const theme = useContext(ThemeContext);
  
  const getThemedInputClass = () => `
    block w-full rounded-md border px-3 py-2 
    text-gray-900 placeholder-gray-500 
    disabled:cursor-not-allowed disabled:opacity-50
  `;

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
                  className={getThemedInputClass()}
                  style={{ 
                    borderRadius: theme.borderRadius,
                    borderColor: theme.primaryColor,
                    borderWidth: '2px'
                  }}
                />
              ) : (
                <textarea
                  disabled
                  placeholder={question.placeholder || 'Enter your answer'}
                  rows={3}
                  className={getThemedInputClass()}
                  style={{ 
                    borderRadius: theme.borderRadius,
                    borderColor: theme.primaryColor,
                    borderWidth: '2px'
                  }}
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
            <div className="space-y-2" style={{ gap: theme.spacing }}>
              {(question.options || ['Option 1', 'Option 2']).map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="radio"
                    disabled
                    name={`question-${question.id}`}
                    className="h-4 w-4 border-gray-300 disabled:cursor-not-allowed"
                    style={{ 
                      accentColor: theme.primaryColor,
                    }}
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
            <div className="space-y-2" style={{ gap: theme.spacing }}>
              {(question.options || ['Option 1', 'Option 2']).map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    disabled
                    className="h-4 w-4 border-gray-300 disabled:cursor-not-allowed"
                    style={{ 
                      accentColor: theme.primaryColor,
                    }}
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
              className={getThemedInputClass()}
              style={{ 
                borderRadius: theme.borderRadius,
                borderColor: theme.primaryColor,
                borderWidth: '2px'
              }}
            >
              <option value="">Select an option</option>
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
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-not-allowed opacity-50"
              style={{ 
                borderRadius: theme.borderRadius,
                borderColor: theme.primaryColor,
              }}
            >
              <div className="flex flex-col items-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="mt-1 text-sm text-gray-600">Click to upload or drag and drop</p>
                {question.fileTypes && (
                  <p className="mt-1 text-xs text-gray-500">
                    {question.fileTypes.join(', ').toUpperCase()}
                  </p>
                )}
                {question.maxFileSize && (
                  <p className="mt-1 text-xs text-gray-500">
                    Max size: {question.maxFileSize}MB
                  </p>
                )}
              </div>
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
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-not-allowed opacity-50"
              style={{ 
                borderRadius: theme.borderRadius,
                borderColor: theme.primaryColor,
              }}
            >
              <div className="flex flex-col items-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="mt-1 text-sm text-gray-600">Click to upload video or drag and drop</p>
                {question.maxDuration && (
                  <p className="mt-1 text-xs text-gray-500">
                    Max duration: {question.maxDuration} seconds
                  </p>
                )}
              </div>
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
    <div className="mt-4 p-4 bg-gray-50 rounded-lg" style={{ borderRadius: theme.borderRadius }}>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
      <div className="font-semibold text-gray-900 mb-2">
        {question.question_text}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </div>
      {renderQuestionInput()}
    </div>
  );
};

const ThemedSection = ({ 
  section, 
  children, 
  onTitleChange, 
  onDescriptionChange,
  onDelete,
  isPublished = false
}: { 
  section: Section, 
  children: React.ReactNode,
  onTitleChange: (value: string) => void,
  onDescriptionChange: (value: string) => void,
  onDelete: () => void,
  isPublished?: boolean
}) => {
  const theme = useContext(ThemeContext);
  
  return (
    <div 
      className="bg-white/80 backdrop-blur-md shadow-sm rounded-lg p-6 mb-6"
      style={{ 
        borderRadius: theme.borderRadius,
        borderColor: `${theme.primaryColor}20`,
        border: '1px solid',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          {isPublished ? (
            <>
              <h2 className="text-xl font-semibold w-full p-0 mb-2 text-gray-900 bg-transparent">
                {section.title || 'Section Title'}
              </h2>
              <p className="w-full p-0 text-gray-600 bg-transparent">
                {section.description || ''}
              </p>
            </>
          ) : (
            <>
              <TextInput
                value={section.title}
                onChange={onTitleChange}
                placeholder="Section Title"
                className="text-xl font-semibold w-full border-0 focus:ring-0 p-0 mb-2 text-gray-900 bg-transparent"
              />
              <TextInput
                type="textarea"
                value={section.description || ''}
                onChange={onDescriptionChange}
                placeholder="Section Description (optional)"
                className="w-full border-0 focus:ring-0 p-0 resize-none text-gray-600 bg-transparent"
                rows={2}
              />
            </>
          )}
        </div>
        {!isPublished && (
          <button
            onClick={onDelete}
            className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
};

const ThemedQuestion = ({ 
  question, 
  children, 
  onDelete,
  onConfigure,
  isPublished = false
}: { 
  question: Question, 
  children: React.ReactNode,
  onDelete: () => void,
  onConfigure: () => void,
  isPublished?: boolean
}) => {
  const theme = useContext(ThemeContext);
  
  return (
    <div 
      className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200"
      style={{ borderRadius: theme.borderRadius }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {!isPublished && (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
              <ArrowsUpDownIcon className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Image
              src={question.type === 'file_upload' ? '/upload.png' : `/${question.type.replace('_', '-')}.png`}
              alt={question.type}
              width={24}
              height={24}
            />
            <span className="text-sm font-medium text-gray-600 capitalize">
              {question.type.replace('_', ' ')}
            </span>
          </div>
        </div>
        {!isPublished && (
          <div className="flex items-center space-x-2">
            <button
              onClick={onConfigure}
              className="p-1 text-gray-400 hover:text-blue-500 transition-colors duration-200"
            >
              <Cog6ToothIcon className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default function FormBuilder({ params: { companyId, formId } }: { params: { companyId: string, formId: string } }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'publish'>('build');
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>({
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    fontFamily: 'Inter',
    borderRadius: 8,
    spacing: 16
  });
  const [isDragging, setIsDragging] = useState(false);
  const [activeConfigQuestion, setActiveConfigQuestion] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(false);
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [userRole, setUserRole] = useState<'COMPANY' | 'INTERN' | null>(null);

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
    
    loadForm();
    setMounted(true);
  }, []);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .single();
      if (companyError || !company) notFound();

      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('title, description, primary_color, background_color, font_family, border_radius, spacing, published')
        .eq('id', formId)
        .eq('company_id', companyId)
        .single();
      if (formError || !form) notFound();

      setFormTitle(form.title || '');
      setFormDescription(form.description || '');
      setIsPublished(form.published || false);
      setTheme({
        primaryColor: form.primary_color !== null && form.primary_color !== undefined ? `#${form.primary_color.toString(16).padStart(6, '0')}` : '#3b82f6',
        backgroundColor: form.background_color !== null && form.background_color !== undefined ? `#${form.background_color.toString(16).padStart(6, '0')}` : '#ffffff',
        fontFamily: form.font_family || 'Inter',
        borderRadius: form.border_radius ?? 8,
        spacing: form.spacing ?? 16
      });

      // Fetch sections and questions from backend API
      const res = await fetch(`/api/companies/forms/${formId}/questions`);
      if (!res.ok) throw new Error('Failed to fetch form questions');
      const { sections: apiSections } = await res.json();
      
      // Map API response to local Section/Question structure
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
          
          // Determine if question is configured based on whether it has any configuration data
          const hasDescription = q.description && q.description.trim() !== '';
          const hasHint = q.hint && q.hint.trim() !== '';
          const hasPlaceholder = q.placeholder && q.placeholder.trim() !== '';
          const hasOptions = options && options.length > 0;
          const hasFileConfig = q.file_types || q.max_file_size || q.max_duration;
          
          const isConfigured = hasDescription || hasHint || hasPlaceholder || hasOptions || hasFileConfig;
          
          return {
            id: q.id,
            type: q.type,
            question_text: q.question_text,
            description: q.description,
            required: q.required,
            order_index: q.order_index,
            placeholder: q.placeholder,
            hint: q.hint,
            options,
            // Add file/video upload fields
            fileTypes: q.file_types ? q.file_types.split(',').map((t: string) => t.trim()) : undefined,
            maxFileSize: q.max_file_size,
            maxDuration: q.max_duration,
            isConfigured,
          };
        })
      }));
      
      setSections(formattedSections);
      
      // Set current step to 0 if we have sections, otherwise keep at 0
      if (formattedSections.length > 0) {
        setCurrentStep(0);
      }
      
      // Preserve active section if it still exists, otherwise set to first section
      if (formattedSections.length > 0) {
        const currentActiveSection = activeSection;
        const sectionStillExists = formattedSections.some((s: Section) => s.id === currentActiveSection);
        
        if (sectionStillExists) {
          setActiveSection(currentActiveSection);
        } else {
          setActiveSection(formattedSections[0].id);
        }
      } else {
        setActiveSection(null);
      }
      
      // Close config modal if the question being configured no longer exists
      if (activeConfigQuestion) {
        const questionStillExists = formattedSections.some((section: Section) => 
          section.questions.some((q: Question) => q.id === activeConfigQuestion)
        );
        if (!questionStillExists) {
          setActiveConfigQuestion(null);
        }
      }
    } catch (error) {
      console.error('Error loading form:', error);
      setError(error instanceof Error ? error.message : 'Failed to load form');
    } finally {
      setIsLoading(false);
    }
  };

  const saveForm = async () => {
    if (isPublished) {
      toast.error('Cannot edit a published form. Please unpublish it first.');
      return;
    }
    
    const saveToast = toast.loading('Saving form...');
    setIsSaving(true);
    try {
      // Save form theme and metadata
      const { error: formError } = await supabase
        .from('forms')
        .update({
          title: formTitle,
          description: formDescription,
          primary_color: parseInt(theme.primaryColor.replace('#', ''), 16),
          background_color: parseInt(theme.backgroundColor.replace('#', ''), 16),
          font_family: theme.fontFamily,
          border_radius: theme.borderRadius,
          spacing: theme.spacing
        })
        .eq('id', formId);
      if (formError) throw formError;

      // Upsert all sections
      const sectionsToSave = sections.map((section, idx) => ({
        id: section.id,
        form_id: formId,
        title: section.title,
        description: section.description || '',
        order_index: idx
      }));
      const { error: sectionError } = await supabase
        .from('form_sections')
        .upsert(sectionsToSave, { onConflict: 'id' });
      if (sectionError) throw sectionError;

      // Gather and format all questions
      const allQuestions = sections.flatMap((section, sectionIdx) =>
        section.questions.map((q, qIdx) => {
          let choices: Record<string, string> = {};
          let dropdowns: Record<string, string> = {};
          if (q.type === 'multiple_choice' || q.type === 'checkboxes') {
            (q.options || []).slice(0, 15).forEach((opt, i) => {
              choices[`choice_${i + 1}`] = opt;
            });
          }
          if (q.type === 'dropdown') {
            (q.options || []).slice(0, 50).forEach((opt, i) => {
              dropdowns[`dropdown_${i + 1}`] = opt;
            });
          }
          return {
            id: q.id,
            section_id: section.id,
            type: q.type,
            question_text: q.question_text,
            required: q.required,
            order_index: qIdx,
            description: q.description || '',
            hint: q.hint || '',
            placeholder: q.placeholder || '',
            ...choices,
            ...dropdowns,
            file_types: q.fileTypes ? q.fileTypes.join(', ') : null,
            max_file_size: q.maxFileSize || null,
            max_duration: q.maxDuration || null,
          };
        })
      );

      // Save questions to backend API (now with deleted IDs)
      const res = await fetch(`/api/companies/forms/${formId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questions: allQuestions,
          deletedSectionIds,
          deletedQuestionIds
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save questions');
      }

      // Clear deleted IDs after successful save
      setDeletedSectionIds([]);
      setDeletedQuestionIds([]);

      toast.success('Form saved successfully', {
        id: saveToast,
        duration: 2000,
        icon: '✅',
      });
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form. Please try again.', {
        id: saveToast,
        duration: 3000,
        icon: '❌',
      });
    } finally {
      setIsSaving(false);
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
    const newSections = [...sections, newSection];
    setSections(newSections);
    // Automatically go to the new section
    setCurrentStep(newSections.length - 1);
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
    const newSections = sections.filter(s => s.id !== sectionId);
    setSections(newSections);
    setDeletedSectionIds(prev => [...prev, sectionId]);
    
    // If we deleted the current section, adjust the current step
    if (newSections.length === 0) {
      setCurrentStep(0);
    } else if (currentStep >= newSections.length) {
      setCurrentStep(newSections.length - 1);
    }
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
    setDeletedQuestionIds(prev => [...prev, questionId]);
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
          <h3 className="text-lg font-semibold mb-2 text-black">Configure Question</h3>

          {/* Question Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Title
            </label>
            <TextInput
              value={localQuestion.question_text || ''}
              onChange={(value) => handleInputChange('question_text', value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter your question here"
            />
          </div>

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

          {/* Required checkbox */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="required-checkbox"
                checked={localQuestion.required}
                onChange={(e) => handleInputChange('required', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="required-checkbox" className="ml-2 block text-sm font-medium text-gray-700">
                Required question
              </label>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Users must answer this question before they can continue
            </p>
          </div>

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

  // Multi-step form navigation functions
  const nextStep = () => {
    if (currentStep < sections.length - 1) {
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

  // Add navigation functions
  const navigateToSettings = () => {
    router.push(`/company/form-builder-settings/${companyId}/${formId}`);
  };

  const navigateToPreview = () => {
    router.push(`/company/form-builder-pnp/${companyId}/${formId}`);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ThemeContext.Provider value={theme}>
      <div className="min-h-screen relative" style={{ fontFamily: theme.fontFamily }}>
        {/* Background elements - lower z-index */}
        <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

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
                    onClick={() => setActiveTab('build')}
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
                    onClick={navigateToPreview}
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
              <div className="flex items-center space-x-4">
                {isPublished && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Published</span>
                  </div>
                )}
                <button
                  onClick={saveForm}
                  disabled={isSaving || isPublished}
                  className={`px-6 py-3 text-white rounded-md transition-colors duration-200 text-lg font-medium flex items-center space-x-2 ${
                    isSaving || isPublished
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isSaving && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  <span>{isSaving ? 'Saving...' : isPublished ? 'Published (Read-only)' : 'Save'}</span>
                </button>
                {isReloading && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Refreshing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Container - adjust top padding to account for larger navbar */}
        <div className="pt-48 relative" style={{ zIndex: 30 }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Progress Bar */}
            {sections.length > 0 && (
              <div className="bg-white/80 backdrop-blur-md shadow-sm rounded-lg p-6 mb-6" style={{ borderRadius: theme.borderRadius }}>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {currentStep + 1} of {sections.length}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(((currentStep + 1) / sections.length) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{ 
                        width: `${((currentStep + 1) / sections.length) * 100}%`,
                        backgroundColor: theme.primaryColor
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2">
                  {sections.map((section, index) => {
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
                        {index + 1}. {section.title || `Section ${index + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form Header */}
            <div 
              className="bg-white/80 backdrop-blur-md shadow-sm rounded-lg p-6 mb-8"
              style={{ 
                borderRadius: theme.borderRadius,
                borderColor: `${theme.primaryColor}20`,
                border: '1px solid',
              }}
            >
              {isPublished ? (
                <>
                  <h1 className="text-2xl font-bold w-full p-0 mb-4 text-gray-900 bg-transparent">
                    {formTitle || 'Form Title'}
                  </h1>
                  <p className="w-full p-0 text-gray-900 bg-transparent">
                    {formDescription || 'Form Description'}
                  </p>
                </>
              ) : (
                <>
                  <TextInput
                    value={formTitle}
                    onChange={setFormTitle}
                    placeholder="Form Title"
                    className="text-2xl font-bold w-full border-0 focus:ring-0 p-0 mb-4 text-gray-900 bg-transparent"
                  />
                  <TextInput
                    type="textarea"
                    value={formDescription}
                    onChange={setFormDescription}
                    placeholder="Form Description"
                    className="w-full border-0 focus:ring-0 p-0 resize-none text-gray-900 bg-transparent"
                    rows={2}
                  />
                </>
              )}
            </div>

            <DragDropContext onDragEnd={isPublished ? () => {} : onDragEnd} onDragStart={isPublished ? () => {} : onDragStart}>
              <div className="flex gap-8">
                {/* Left sidebar - Question types */}
                {!isPublished && (
                  <div 
                    className="w-64 bg-white/80 backdrop-blur-md p-4 rounded-lg shadow-sm self-start sticky top-32"
                    style={{ borderRadius: theme.borderRadius }}
                  >
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                      Question Types
                    </h3>
                    <Droppable droppableId="question-types" isDropDisabled={true}>
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        className="space-y-4"
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
                                className={`flex flex-col items-center p-4 border-2 border-dashed rounded-lg hover:border-blue-500 transition-colors duration-200 cursor-move ${
                                  snapshot.isDragging ? 'scale-105 shadow-md' : ''
                                }`}
                                style={{ 
                                  ...provided.draggableProps.style,
                                  borderRadius: theme.borderRadius,
                                  zIndex: snapshot.isDragging ? 9999 : 'auto'
                                }}
                              >
                                <div className={getContainerSize(type.value)}>
                                  <Image
                                    src={type.icon}
                                    alt={type.label}
                                    width={getIconSize(type.value)}
                                    height={getIconSize(type.value)}
                                  />
                                </div>
                                <div className="mt-1 text-sm text-gray-500">
                                  {type.label}
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
                )}

                {/* Main content area */}
                <div className={`flex-1 ${isPublished ? 'max-w-4xl mx-auto' : ''}`}>
                  <div className="max-w-3xl mx-auto">
                    {sections.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500 mb-4">No sections yet. Add your first section to get started!</p>
                        {!isPublished && (
                          <button
                            onClick={addSection}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                            style={{ borderRadius: theme.borderRadius }}
                          >
                            <PlusIcon className="h-5 w-5 inline mr-2" />
                            Add First Section
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Current Section */}
                        {sections[currentStep] && (
                          <Droppable droppableId={sections[currentStep].id} isDropDisabled={isPublished}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef} 
                                {...provided.droppableProps}
                                className={snapshot.isDraggingOver && !isPublished ? 'bg-blue-50/50 rounded-lg' : ''}
                              >
                                <ThemedSection 
                                  section={sections[currentStep]}
                                  onTitleChange={isPublished ? () => {} : (value) => {
                                    const newSections = [...sections];
                                    newSections[currentStep].title = value;
                                    setSections(newSections);
                                  }}
                                  onDescriptionChange={isPublished ? () => {} : (value) => {
                                    const newSections = [...sections];
                                    newSections[currentStep].description = value;
                                    setSections(newSections);
                                  }}
                                  onDelete={isPublished ? () => {} : () => deleteSection(sections[currentStep].id)}
                                  isPublished={isPublished}
                                >
                                  {sections[currentStep].questions.map((question, questionIndex) => (
                                    <Draggable key={question.id} draggableId={question.id} index={questionIndex} isDragDisabled={isPublished}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                        >
                                          <ThemedQuestion 
                                            question={question}
                                            onDelete={isPublished ? () => {} : () => deleteQuestion(sections[currentStep].id, question.id)}
                                            onConfigure={isPublished ? () => {} : () => setActiveConfigQuestion(question.id)}
                                            isPublished={isPublished}
                                          >
                                            {isPublished ? (
                                              <div className="text-lg font-medium w-full p-0 mb-2">
                                                {question.question_text || 'Question text'}
                                                {question.required && <span className="text-red-500 ml-1">*</span>}
                                              </div>
                                            ) : (
                                              <div className="mb-2">
                                                <TextInput
                                                  value={question.question_text}
                                                  onChange={(value) => {
                                                    const newSections = [...sections];
                                                    newSections[currentStep].questions[questionIndex].question_text = value;
                                                    setSections(newSections);
                                                  }}
                                                  placeholder="Question text"
                                                  className="text-lg font-medium w-full border-0 focus:ring-0 p-0"
                                                />
                                                {question.required && <span className="text-red-500 ml-1">*</span>}
                                              </div>
                                            )}
                                            {question.isConfigured && <QuestionPreview question={question} />}
                                          </ThemedQuestion>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {provided.placeholder}
                                  {!isPublished && (
                                    <button
                                      onClick={() => addQuestion(sections[currentStep].id)}
                                      className={`w-full border-2 border-dashed rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center transition-colors duration-200 ${
                                        snapshot.isDraggingOver ? 'bg-blue-50 border-blue-200' : ''
                                      }`}
                                      style={{ 
                                        borderRadius: theme.borderRadius,
                                        borderColor: `${theme.primaryColor}40`,
                                      }}
                                    >
                                      <PlusIcon className="h-5 w-5 mr-2" />
                                      Add Question
                                    </button>
                                  )}
                                </ThemedSection>
                              </div>
                            )}
                          </Droppable>
                        )}

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center mt-8 mb-4">
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
                              Section {currentStep + 1} of {sections.length}
                            </span>
                          </div>

                          <button
                            onClick={nextStep}
                            disabled={currentStep === sections.length - 1}
                            className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                              currentStep === sections.length - 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                            style={{ 
                              borderRadius: theme.borderRadius,
                              backgroundColor: currentStep === sections.length - 1 ? undefined : theme.primaryColor
                            }}
                          >
                            Next
                            <ChevronRightIcon className="h-5 w-5 ml-2" />
                          </button>
                        </div>

                        {/* Add Section Button */}
                        {!isPublished && (
                          <div className="flex justify-center items-center mt-4">
                            <button
                              onClick={addSection}
                              className="flex items-center justify-center w-full max-w-3xl mx-auto py-6 px-4 border-2 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                              style={{ 
                                borderRadius: theme.borderRadius,
                                borderColor: `${theme.primaryColor}40`,
                              }}
                            >
                              <PlusIcon className="h-6 w-6" />
                              <span className="ml-2 text-base font-medium">Add New Section</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Right Sidebar - Theme Customization */}
                <div 
                  className="w-64 bg-white/80 backdrop-blur-md p-4 rounded-lg shadow-sm self-start sticky top-32"
                  style={{ borderRadius: theme.borderRadius }}
                >
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Theme Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Primary Color
                      </label>
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                        className="w-full h-10 rounded-md cursor-pointer"
                        style={{ borderRadius: theme.borderRadius }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Background Color
                      </label>
                      <input
                        type="color"
                        value={theme.backgroundColor}
                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                        className="w-full h-10 rounded-md cursor-pointer"
                        style={{ borderRadius: theme.borderRadius }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">
                        Font Family
                      </label>
                      <select
                        value={theme.fontFamily}
                        onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-black"
                        style={{ borderRadius: theme.borderRadius }}
                      >
                        <option value="Inter" className="text-black">Inter</option>
                        <option value="Roboto" className="text-black">Roboto</option>
                        <option value="Open Sans" className="text-black">Open Sans</option>
                        <option value="Montserrat" className="text-black">Montserrat</option>
                        <option value="Poppins" className="text-black">Poppins</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Border Radius (px)</label>
                      <input
                        type="number"
                        value={theme.borderRadius}
                        onChange={e => setTheme({ ...theme, borderRadius: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                        min={0}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-1">Spacing (px)</label>
                      <input
                        type="number"
                        value={theme.spacing}
                        onChange={e => setTheme({ ...theme, spacing: parseInt(e.target.value) || 0 })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DragDropContext>
          </div>
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
      </div>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          success: {
            style: {
              background: '#10B981',
              color: 'white',
            },
          },
          error: {
            style: {
              background: '#EF4444',
              color: 'white',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: 'white',
            },
          },
        }}
      />
    </ThemeContext.Provider>
  );
}