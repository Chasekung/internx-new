'use client';

import { useState, useEffect, createContext, useContext } from 'react';
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
                    borderColor: `${theme.primaryColor}40`,
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
                    borderColor: `${theme.primaryColor}40`,
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
                    className="h-4 w-4 rounded border-gray-300 disabled:cursor-not-allowed"
                    style={{ 
                      accentColor: theme.primaryColor,
                      borderRadius: theme.borderRadius,
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
                borderColor: `${theme.primaryColor}40`,
              }}
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
              <label 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed cursor-not-allowed bg-gray-50"
                style={{ 
                  borderRadius: theme.borderRadius,
                  borderColor: `${theme.primaryColor}40`,
                }}
              >
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
              <label 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed cursor-not-allowed bg-gray-50"
                style={{ 
                  borderRadius: theme.borderRadius,
                  borderColor: `${theme.primaryColor}40`,
                }}
              >
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
    <div 
      className="mt-4 border-t pt-4"
      style={{ borderColor: `${theme.primaryColor}20` }}
    >
      <div className="text-sm text-gray-500">Preview:</div>
      {renderQuestionInput()}
    </div>
  );
};

const ThemedSection = ({ 
  section, 
  children, 
  onTitleChange, 
  onDescriptionChange,
  onDelete
}: { 
  section: Section, 
  children: React.ReactNode,
  onTitleChange: (value: string) => void,
  onDescriptionChange: (value: string) => void,
  onDelete: () => void
}) => {
  const theme = useContext(ThemeContext);
  
  return (
    <div 
      className="bg-white shadow-sm rounded-lg overflow-hidden mb-4 group"
      style={{
        backgroundColor: theme.backgroundColor,
        borderRadius: theme.borderRadius,
        fontFamily: theme.fontFamily,
        marginBottom: theme.spacing,
      }}
    >
      <div 
        className="border-b p-4 flex justify-between items-start"
        style={{ borderColor: theme.primaryColor }}
      >
        <div className="flex-1">
          <TextInput
            value={section.title}
            onChange={onTitleChange}
            placeholder="Section Title"
            className={`text-xl font-semibold mb-2 w-full bg-transparent border-none focus:ring-0 hover:bg-gray-50/50`}
          />
          <TextInput
            value={section.description || ''}
            onChange={onDescriptionChange}
            placeholder="Section Description"
            className="text-gray-600 w-full bg-transparent border-none focus:ring-0 hover:bg-gray-50/50"
          />
        </div>
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200 opacity-0 group-hover:opacity-100"
          title="Delete Section"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="p-4" style={{ gap: theme.spacing }}>
        {children}
      </div>
    </div>
  );
};

const ThemedQuestion = ({ 
  question, 
  children, 
  onDelete,
  onConfigure
}: { 
  question: Question, 
  children: React.ReactNode,
  onDelete: () => void,
  onConfigure: () => void
}) => {
  const theme = useContext(ThemeContext);
  
  return (
    <div 
      className="bg-white shadow-sm rounded-lg p-4 mb-4 group"
      style={{
        borderRadius: theme.borderRadius,
        marginBottom: theme.spacing,
        border: `1px solid ${theme.primaryColor}20`,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {children}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onConfigure}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-50 transition-colors duration-200"
            title="Configure Question"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors duration-200 opacity-0 group-hover:opacity-100"
            title="Delete Question"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FormBuilder({ params: { companyId, formId } }: { params: { companyId: string, formId: string } }) {
  const router = useRouter();
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
        .select('title, description, primary_color, background_color, font_family, border_radius, spacing')
        .eq('id', formId)
        .eq('company_id', companyId)
        .single();
      if (formError || !form) notFound();

      setFormTitle(form.title || '');
      setFormDescription(form.description || '');
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
    setDeletedSectionIds(prev => [...prev, sectionId]);
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

  // Add navigation functions
  const navigateToSettings = () => {
    router.push(`/company/form-builder-settings/${companyId}/${formId}`);
  };

  const navigateToPreview = () => {
    // TODO: Implement preview route
    console.log('Navigate to preview');
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
                <button
                  onClick={saveForm}
                  disabled={isSaving}
                  className={`px-6 py-3 text-white rounded-md transition-colors duration-200 text-lg font-medium flex items-center space-x-2 ${
                    isSaving 
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
                  <span>{isSaving ? 'Saving...' : 'Save'}</span>
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
            {/* Form Header */}
            <div 
              className="bg-white/80 backdrop-blur-md shadow-sm rounded-lg p-6 mb-8"
              style={{ 
                borderRadius: theme.borderRadius,
                borderColor: `${theme.primaryColor}20`,
                border: '1px solid',
              }}
            >
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
            </div>

            <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
              <div className="flex gap-8">
                {/* Left sidebar - Question types */}
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

                {/* Main content area */}
                <div className="flex-1">
                  <div className="max-w-3xl mx-auto">
                    {sections.map((section, sectionIndex) => (
                      <Droppable key={section.id} droppableId={section.id}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef} 
                            {...provided.droppableProps}
                            className={snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg' : ''}
                          >
                            <ThemedSection 
                              section={section}
                              onTitleChange={(value) => {
                                const newSections = [...sections];
                                newSections[sectionIndex].title = value;
                                setSections(newSections);
                              }}
                              onDescriptionChange={(value) => {
                                const newSections = [...sections];
                                newSections[sectionIndex].description = value;
                                setSections(newSections);
                              }}
                              onDelete={() => deleteSection(section.id)}
                            >
                              {section.questions.map((question, questionIndex) => (
                                <Draggable key={question.id} draggableId={question.id} index={questionIndex}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <ThemedQuestion 
                                        question={question}
                                        onDelete={() => deleteQuestion(section.id, question.id)}
                                        onConfigure={() => setActiveConfigQuestion(question.id)}
                                      >
                                        <TextInput
                                          value={question.question_text}
                                          onChange={(value) => {
                                            const newSections = [...sections];
                                            newSections[sectionIndex].questions[questionIndex].question_text = value;
                                            setSections(newSections);
                                          }}
                                          placeholder="Question text"
                                          className="text-lg font-medium w-full border-0 focus:ring-0 p-0 mb-2"
                                        />
                                        {question.isConfigured && <QuestionPreview question={question} />}
                                      </ThemedQuestion>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              <button
                                onClick={() => addQuestion(section.id)}
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
                            </ThemedSection>
                          </div>
                        )}
                      </Droppable>
                    ))}
                  </div>

                  {/* Add Section Button */}
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