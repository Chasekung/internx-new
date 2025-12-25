'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
  ChevronLeftIcon,
  SparklesIcon,
  StopIcon,
  CheckIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { 
  LockClosedIcon as LockSolid,
  LockOpenIcon as UnlockSolid 
} from '@heroicons/react/24/solid';
import { Toaster } from 'react-hot-toast';
import { toast } from 'react-hot-toast';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

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

// AIGeneratedQuestion: Complete structure matching what saveForm() expects
// All optional fields have defaults applied during transformation
interface AIGeneratedQuestion {
  type: Question['type'];
  question_text: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  hint?: string;
  options?: string[];  // Required for multiple_choice, checkboxes, dropdown
  maxLength?: number;  // For text fields
  fileTypes?: string[];  // For file_upload
  maxFileSize?: number;  // For file_upload
  maxDuration?: number;  // For video_upload
}

interface AIGeneratedSection {
  title: string;
  description?: string;
  questions: AIGeneratedQuestion[];
}

interface AIFormPreview {
  summary: string;
  matchedOpportunityId: string | null;
  sections: AIGeneratedSection[];
  sourcesUsed: string[];
  companyName: string;
}

interface FormCheckpoint {
  sections: Section[];
  formTitle: string;
  formDescription: string;
  timestamp: number;
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
  const { supabase, error: supabaseError } = useSupabase();

  // AI Assistant Panel State
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelWidth, setPanelWidth] = useState(400);
  const [isWidthLocked, setIsWidthLocked] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [aiFormPreview, setAiFormPreview] = useState<AIFormPreview | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isAiApplying, setIsAiApplying] = useState(false);
  const [aiProgress, setAiProgress] = useState('');
  const [formCheckpoint, setFormCheckpoint] = useState<FormCheckpoint | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);

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
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (supabase) {
      loadForm();
    }
  }, [supabase, supabaseError]);

  // Panel resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isWidthLocked) return;
      
      e.preventDefault();
      
      const newWidth = e.clientX;
      if (newWidth >= 320 && newWidth <= 700) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    if (isResizing) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, isWidthLocked]);

  // Handle ESC key to stop AI
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAiApplying) {
        stopAiExecution();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAiApplying]);

  const loadForm = async () => {
    if (!supabase) return;
    
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

      // First try with company_id
      let { data: form, error: formError } = await supabase
        .from('forms')
        .select('title, description, primary_color, background_color, font_family, border_radius, spacing, published')
        .eq('id', formId)
        .eq('company_id', companyId)
        .single();
      
      // If not found, try without company_id (for auto-generated forms)
      if (formError && formError.code === 'PGRST116') {
        const result = await supabase
          .from('forms')
          .select('title, description, primary_color, background_color, font_family, border_radius, spacing, published')
          .eq('id', formId)
          .single();
        form = result.data;
        formError = result.error;
      }
      
      if (formError || !form) {
        console.error('Form fetch error:', formError);
        notFound();
      }

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

  const saveForm = async (skipToastOrEvent?: boolean | React.MouseEvent) => {
    const startTimestamp = new Date().toISOString();
    
    // Handle both direct calls with boolean and button click events
    const skipToast = typeof skipToastOrEvent === 'boolean' ? skipToastOrEvent : false;
    
    console.debug(`[${startTimestamp}] [FORM-SAVE] 🔧 saveForm() CALLED`);
    console.debug(`[${startTimestamp}] [FORM-SAVE] 📥 saveForm() INPUT:`, { skipToast });
    
    if (isPublished) {
      console.warn(`[${startTimestamp}] [FORM-SAVE] ⚠️ Cannot save published form`);
      if (!skipToast) {
        toast.error('Cannot edit a published form. Please unpublish it first.');
      }
      throw new Error('Cannot save published form');
    }
    
    console.debug(`[${startTimestamp}] [FORM-SAVE] 💾 Starting form save...`);
    console.debug(`[${startTimestamp}] [FORM-SAVE] 📊 REACT STATE BEFORE SAVE:`, {
      formTitle,
      formDescription,
      sectionCount: sections.length,
      questionCount: sections.reduce((acc, s) => acc + s.questions.length, 0),
      sections: sections.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        order_index: s.order_index,
        questionCount: s.questions.length,
        questions: s.questions.map(q => ({
          id: q.id,
          type: q.type,
          question_text: q.question_text,
          required: q.required,
          hasOptions: !!q.options,
          optionCount: q.options?.length
        }))
      })),
      theme,
      deletedSectionIds,
      deletedQuestionIds
    });

    const saveToast = skipToast ? null : toast.loading('Saving form...');
    setIsSaving(true);
    try {
      const timestamp1 = new Date().toISOString();
      
      // Save form theme and metadata
      if (!supabase) {
        console.error(`[${timestamp1}] [FORM-SAVE] ❌ Supabase client not initialized`);
        console.error(`[${timestamp1}] [FORM-SAVE] 📋 Supabase instance:`, supabase);
        if (!skipToast) {
          toast.error('Supabase client not initialized');
        }
        throw new Error('Supabase client not initialized');
      }

      console.debug(`[${timestamp1}] [FORM-SAVE] 📝 Step 1: Updating form metadata...`);
      const formUpdate = {
        title: formTitle,
        description: formDescription,
        primary_color: parseInt(theme.primaryColor.replace('#', ''), 16),
        background_color: parseInt(theme.backgroundColor.replace('#', ''), 16),
        font_family: theme.fontFamily,
        border_radius: theme.borderRadius,
        spacing: theme.spacing
      };
      console.debug(`[${timestamp1}] [FORM-SAVE] 📤 Form update payload:`, formUpdate);
      console.debug(`[${timestamp1}] [FORM-SAVE] 🎯 Updating form with ID: ${formId}`);

      const { data: formData, error: formError } = await supabase
        .from('forms')
        .update(formUpdate)
        .eq('id', formId)
        .select();
      
      const timestamp2 = new Date().toISOString();
      
      if (formError) {
        console.error(`[${timestamp2}] [FORM-SAVE] ❌ Form metadata update error:`, formError);
        console.error(`[${timestamp2}] [FORM-SAVE] 📋 Error details:`, {
          message: formError.message,
          details: formError.details,
          hint: formError.hint,
          code: formError.code
        });
        throw formError;
      }
      
      console.debug(`[${timestamp2}] [FORM-SAVE] ✅ Form metadata updated`);
      console.debug(`[${timestamp2}] [FORM-SAVE] 📥 Supabase response:`, formData);

      const timestamp3 = new Date().toISOString();
      
      // Upsert all sections
      const sectionsToSave = sections.map((section, idx) => ({
        id: section.id,
        form_id: formId,
        title: section.title,
        description: section.description || '',
        order_index: idx
      }));
      
      console.debug(`[${timestamp3}] [FORM-SAVE] 📝 Step 2: Upserting sections...`);
      console.debug(`[${timestamp3}] [FORM-SAVE] 📊 Sections count: ${sectionsToSave.length}`);
      console.debug(`[${timestamp3}] [FORM-SAVE] 📤 Sections payload:`, sectionsToSave);

      const { data: sectionData, error: sectionError } = await supabase
        .from('form_sections')
        .upsert(sectionsToSave, { onConflict: 'id' })
        .select();
      
      const timestamp4 = new Date().toISOString();
      
      if (sectionError) {
        console.error(`[${timestamp4}] [FORM-SAVE] ❌ Sections upsert error:`, sectionError);
        console.error(`[${timestamp4}] [FORM-SAVE] 📋 Error details:`, {
          message: sectionError.message,
          details: sectionError.details,
          hint: sectionError.hint,
          code: sectionError.code
        });
        throw sectionError;
      }
      
      console.debug(`[${timestamp4}] [FORM-SAVE] ✅ Sections upserted successfully`);
      console.debug(`[${timestamp4}] [FORM-SAVE] 📥 Supabase response:`, sectionData);

      const timestamp5 = new Date().toISOString();
      
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

      console.debug(`[${timestamp5}] [FORM-SAVE] 📝 Step 3: Saving questions via API...`);
      console.debug(`[${timestamp5}] [FORM-SAVE] 📊 Questions count: ${allQuestions.length}`);
      console.debug(`[${timestamp5}] [FORM-SAVE] 📤 Questions payload (FULL - for manual review):`, JSON.stringify(allQuestions, null, 2));

      // Save questions to backend API (now with deleted IDs)
      const requestBody = {
        questions: allQuestions,
        deletedSectionIds,
        deletedQuestionIds
      };
      console.debug(`[${timestamp5}] [FORM-SAVE] 📤 API request body summary:`, {
        questionCount: allQuestions.length,
        deletedSections: deletedSectionIds.length,
        deletedQuestions: deletedQuestionIds.length,
        endpoint: `/api/companies/forms/${formId}/questions`
      });

      const res = await fetch(`/api/companies/forms/${formId}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const timestamp6 = new Date().toISOString();
      console.debug(`[${timestamp6}] [FORM-SAVE] 📥 API response status: ${res.status} ${res.statusText}`);
      console.debug(`[${timestamp6}] [FORM-SAVE] 📥 API response headers:`, Object.fromEntries(res.headers.entries()));

      if (!res.ok) {
        const err = await res.json();
        console.error(`[${timestamp6}] [FORM-SAVE] ❌ API error (status ${res.status}):`, err);
        console.error(`[${timestamp6}] [FORM-SAVE] 📋 API error details:`, {
          status: res.status,
          statusText: res.statusText,
          error: err.error,
          details: err.details,
          fullResponse: err
        });
        throw new Error(err.error || 'Failed to save questions');
      }

      const apiResponse = await res.json();
      console.debug(`[${timestamp6}] [FORM-SAVE] ✅ API response received:`, apiResponse);
      console.debug(`[${timestamp6}] [FORM-SAVE] 📊 API success details:`, {
        success: apiResponse.success,
        savedQuestions: apiResponse.questions?.length,
        responseKeys: Object.keys(apiResponse)
      });

      const timestamp7 = new Date().toISOString();
      
      // Clear deleted IDs after successful save
      setDeletedSectionIds([]);
      setDeletedQuestionIds([]);

      console.debug(`[${timestamp7}] [FORM-SAVE] 🧹 Cleared deleted IDs`);
      console.debug(`[${timestamp7}] [FORM-SAVE] ✅ Form saved successfully`);
      console.debug(`[${timestamp7}] [FORM-SAVE] 📊 REACT STATE AFTER SAVE:`, {
        sectionCount: sections.length,
        questionCount: sections.reduce((acc, s) => acc + s.questions.length, 0),
        deletedSectionIds: [],
        deletedQuestionIds: []
      });
      console.debug(`[${timestamp7}] [FORM-SAVE] ⏱️ Total save duration: ${new Date().getTime() - new Date(startTimestamp).getTime()}ms`);
      
      if (!skipToast && saveToast) {
        toast.success('Form saved successfully', {
          id: saveToast,
          duration: 2000,
          icon: '✅',
        });
      }
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      
      console.error(`[${errorTimestamp}] [FORM-SAVE] ❌ Error saving form:`, error);
      console.error(`[${errorTimestamp}] [FORM-SAVE] 📋 Full error object:`, {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      console.error(`[${errorTimestamp}] [FORM-SAVE] 📊 Form state at error:`, {
        sectionCount: sections.length,
        questionCount: sections.reduce((acc, s) => acc + s.questions.length, 0),
        formTitle,
        formId
      });
      console.error(`[${errorTimestamp}] [FORM-SAVE] 📋 Checkpoint state:`, formCheckpoint);
      
      if (!skipToast && saveToast) {
        toast.error('Failed to save form. Please try again.', {
          id: saveToast,
          duration: 3000,
          icon: '❌',
        });
      }
      
      // Re-throw the error so caller can handle it
      throw error;
    } finally {
      const finalTimestamp = new Date().toISOString();
      setIsSaving(false);
      console.debug(`[${finalTimestamp}] [FORM-SAVE] 🏁 Save operation finished`);
    }
  };

  const addSection = (titleOrEvent?: string | React.MouseEvent, description?: string): string => {
    const timestamp = new Date().toISOString();
    
    // Handle both direct calls and button click events
    const title = typeof titleOrEvent === 'string' ? titleOrEvent : undefined;
    
    console.debug(`[${timestamp}] [FORM-BUILDER] 🔧 addSection() CALLED`);
    console.debug(`[${timestamp}] [FORM-BUILDER] 📥 addSection() INPUT:`, {
      title: title || '(default)',
      description: description || '(default)',
      currentSectionCount: sections.length
    });
    
    const newSection: Section = {
      id: crypto.randomUUID(),
      title: title || 'New Section',
      description: description || '',
      order_index: sections.length,
      questions: []
    };
    
    console.debug(`[${timestamp}] [FORM-BUILDER] 📝 addSection() NEW SECTION OBJECT:`, {
      id: newSection.id,
      title: newSection.title,
      description: newSection.description,
      order_index: newSection.order_index,
      questionCount: newSection.questions.length
    });
    
    const newSections = [...sections, newSection];
    setSections(newSections);
    
    // Automatically go to the new section
    setCurrentStep(newSections.length - 1);
    
    console.debug(`[${timestamp}] [FORM-BUILDER] ✅ addSection() SUCCESS`);
    console.debug(`[${timestamp}] [FORM-BUILDER] 📤 addSection() RETURN:`, {
      sectionId: newSection.id,
      newTotalSections: newSections.length
    });
    
    return newSection.id;
  };

  const addQuestion = (sectionId: string, type: Question['type'] = 'short_text', questionData?: Partial<Question>): string => {
    const timestamp = new Date().toISOString();
    
    console.debug(`[${timestamp}] [FORM-BUILDER] 🔧 addQuestion() CALLED`);
    console.debug(`[${timestamp}] [FORM-BUILDER] 📥 addQuestion() INPUT:`, {
      sectionId,
      type,
      hasQuestionData: !!questionData,
      questionData: questionData ? {
        question_text: questionData.question_text,
        required: questionData.required,
        hasOptions: !!questionData.options,
        optionCount: questionData.options?.length
      } : null
    });
    
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) {
      console.error(`[${timestamp}] [FORM-BUILDER] ❌ addQuestion() FAILED: Section not found`);
      console.error(`[${timestamp}] [FORM-BUILDER] 📋 Available sections:`, 
        sections.map(s => ({ id: s.id, title: s.title }))
      );
      return '';
    }

    console.debug(`[${timestamp}] [FORM-BUILDER] ✅ Section found at index ${sectionIndex}`);
    console.debug(`[${timestamp}] [FORM-BUILDER] 📊 Section state:`, {
      sectionTitle: sections[sectionIndex].title,
      currentQuestionCount: sections[sectionIndex].questions.length
    });

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type,
      question_text: questionData?.question_text || 'New Question',
      required: questionData?.required ?? false,
      order_index: sections[sectionIndex].questions.length,
      description: questionData?.description || '',
      options: questionData?.options || (type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' ? ['Option 1'] : undefined),
      placeholder: questionData?.placeholder || '',
      hint: questionData?.hint || '',
      isConfigured: !!questionData
    };

    console.debug(`[${timestamp}] [FORM-BUILDER] 📝 addQuestion() NEW QUESTION OBJECT:`, {
      id: newQuestion.id,
      type: newQuestion.type,
      question_text: newQuestion.question_text,
      required: newQuestion.required,
      order_index: newQuestion.order_index,
      hasOptions: !!newQuestion.options,
      optionCount: newQuestion.options?.length,
      isConfigured: newQuestion.isConfigured
    });

    const newSections = [...sections];
    newSections[sectionIndex] = {
      ...newSections[sectionIndex],
      questions: [...newSections[sectionIndex].questions, newQuestion]
    };
    setSections([...newSections]);
    
    console.debug(`[${timestamp}] [FORM-BUILDER] ✅ addQuestion() SUCCESS`);
    console.debug(`[${timestamp}] [FORM-BUILDER] 📤 addQuestion() RETURN:`, {
      questionId: newQuestion.id,
      sectionNowHasQuestions: newSections[sectionIndex].questions.length
    });
    
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

  // ========== AI ASSISTANT FUNCTIONS ==========

  // Create checkpoint before AI actions
  const createCheckpoint = () => {
    console.debug('[AI-FORM] 💾 Creating checkpoint...');
    const checkpoint: FormCheckpoint = {
      sections: JSON.parse(JSON.stringify(sections)), // Deep copy
      formTitle,
      formDescription,
      timestamp: Date.now(),
    };
    setFormCheckpoint(checkpoint);
    console.debug('[AI-FORM] ✅ Checkpoint created:', {
      sectionCount: checkpoint.sections.length,
      questionCount: checkpoint.sections.reduce((acc, s) => acc + s.questions.length, 0),
      timestamp: new Date(checkpoint.timestamp).toISOString()
    });
  };

  // Restore from checkpoint
  const restoreCheckpoint = () => {
    console.debug('[AI-FORM] ⏮️ Restoring from checkpoint...');
    
    if (!formCheckpoint) {
      console.warn('[AI-FORM] ⚠️ No checkpoint available');
      toast.error('No checkpoint available');
      return;
    }
    
    console.debug('[AI-FORM] 📋 Checkpoint data:', {
      sectionCount: formCheckpoint.sections.length,
      questionCount: formCheckpoint.sections.reduce((acc, s) => acc + s.questions.length, 0),
      timestamp: new Date(formCheckpoint.timestamp).toISOString()
    });
    
    setSections(formCheckpoint.sections);
    setFormTitle(formCheckpoint.formTitle);
    setFormDescription(formCheckpoint.formDescription);
    setFormCheckpoint(null);
    setAiFormPreview(null);
    
    console.debug('[AI-FORM] ✅ Restored to checkpoint state');
    toast.success('Reverted to before AI changes');
  };

  // Generate AI form preview
  const generateAiForm = async () => {
    if (isAiGenerating) {
      console.warn('[AI-FORM] ⚠️ AI generation already in progress');
      return;
    }
    
    console.debug('[AI-FORM] 🤖 Starting AI form generation...');
    console.debug('[AI-FORM] 📤 Request params:', { companyId, formId });
    
    setIsAiGenerating(true);
    setAiProgress('Analyzing company profile and website...');

    try {
      const response = await fetch('/api/companies/forms/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, formId }),
      });

      console.debug('[AI-FORM] 📥 API response status:', response.status);

      const data = await response.json();
      console.debug('[AI-FORM] 📥 API response data:', data);

      if (!response.ok || !data.success) {
        console.error('[AI-FORM] ❌ API error:', data.error || data.details);
        throw new Error(data.error || 'Failed to generate form');
      }

      console.debug('[AI-FORM] ✅ Form generated successfully:', {
        sections: data.sections.length,
        totalQuestions: data.sections.reduce((acc: number, s: any) => acc + s.questions.length, 0),
        sourcesUsed: data.sourcesUsed
      });

      setAiFormPreview(data);
      setAiProgress('');
      toast.success('Form preview generated! Review and click "Apply to Form" to proceed.');

    } catch (error) {
      console.error('[AI-FORM] ❌ AI generation error:', error);
      setAiProgress('');
      toast.error(error instanceof Error ? error.message : 'Failed to generate form');
    } finally {
      setIsAiGenerating(false);
      console.debug('[AI-FORM] 🏁 AI generation finished');
    }
  };

  // Stop AI execution
  const stopAiExecution = () => {
    console.debug('[AI-FORM] ⏹️ Stop requested');
    if (isAiApplying) {
      setIsAiApplying(false);
      setAiProgress('');
      console.warn('[AI-FORM] ⚠️ AI execution stopped by user');
      toast.error('AI execution stopped by user');
    }
  };

  // Apply AI-generated form using the proven memory-build approach
  // CRITICAL: This uses the EXACT SAME pattern as testApplyAiFormWithSave() which works
  const applyAiForm = async () => {
    const startTimestamp = new Date().toISOString();
    
    console.debug(`[${startTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.debug(`[${startTimestamp}] [AI-FORM] 🔧 applyAiForm() CALLED`);
    console.debug(`[${startTimestamp}] [AI-FORM] 💡 Using PROVEN memory-build approach (same as working debug test)`);
    console.debug(`[${startTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    // VALIDATION: Ensure aiFormPreview exists and is valid
    if (!aiFormPreview) {
      console.error(`[${startTimestamp}] [AI-FORM] ❌ VALIDATION FAILED: aiFormPreview is null/undefined`);
      console.error(`[${startTimestamp}] [AI-FORM] 💡 User must first click "Generate Form" to create preview`);
      toast.error('No AI form preview available. Please generate a form first.');
      return;
    }
    
    if (isAiApplying) {
      console.warn(`[${startTimestamp}] [AI-FORM] ⚠️ Already applying - ignoring duplicate call`);
      return;
    }
    
    // VALIDATION: Ensure aiFormPreview has required structure
    if (!aiFormPreview.sections || !Array.isArray(aiFormPreview.sections) || aiFormPreview.sections.length === 0) {
      console.error(`[${startTimestamp}] [AI-FORM] ❌ VALIDATION FAILED: aiFormPreview.sections is invalid`);
      console.error(`[${startTimestamp}] [AI-FORM] 📋 Received:`, aiFormPreview);
      toast.error('AI form preview is invalid. Please try generating again.');
      return;
    }
    
    console.debug(`[${startTimestamp}] [AI-FORM] ✅ VALIDATION PASSED: aiFormPreview is valid`);
    console.debug(`[${startTimestamp}] [AI-FORM] 📋 AI preview data (FULL):`, JSON.stringify(aiFormPreview, null, 2));
    console.debug(`[${startTimestamp}] [AI-FORM] 📊 Current form state BEFORE applying:`, {
      existingSections: sections.length,
      existingQuestions: sections.reduce((acc, s) => acc + s.questions.length, 0)
    });

    // STEP 0: Set form title and description from AI preview (SAME AS TEST FORM)
    // This is what testApplyAiFormWithSave does and we need to match it exactly
    const aiFormTitle = aiFormPreview.companyName 
      ? `${aiFormPreview.companyName} Application Form`
      : 'AI-Generated Application Form';
    const aiFormDescription = aiFormPreview.summary || 'This form was generated by AI based on company profile.';
    
    console.debug(`[${startTimestamp}] [AI-FORM] 📝 STEP 0: Setting form title and description (SAME AS TEST FORM)`);
    console.debug(`[${startTimestamp}] [AI-FORM] 📝 Form title: "${aiFormTitle}"`);
    console.debug(`[${startTimestamp}] [AI-FORM] 📝 Form description: "${aiFormDescription}"`);
    
    setFormTitle(aiFormTitle);
    setFormDescription(aiFormDescription);

    // Create checkpoint before applying
    console.debug(`[${startTimestamp}] [AI-FORM] 💾 Creating checkpoint for undo capability...`);
    createCheckpoint();
    console.debug(`[${startTimestamp}] [AI-FORM] ✅ Checkpoint created`);
    
    setIsAiApplying(true);
    setShowConfirmDialog(false);
    setAiProgress('Validating AI form data...');
    
    // Wait for form title/description state to update (SAME AS TEST FORM)
    await delay(150);

    // Initialize at function scope for catch block access
    let newSections: Section[] = [];
    let totalQuestions = 0;
    
    // CRITICAL FIX: Use a local variable instead of the state for stop detection
    // The isAiApplying state is captured in the closure as FALSE even after setIsAiApplying(true)
    // This caused the loop to break immediately on first iteration
    let shouldContinue = true;

    try {
      console.debug(`[${startTimestamp}] [AI-FORM] 🚀 STEP 1: Building AI-generated form structure IN MEMORY...`);
      console.debug(`[${startTimestamp}] [AI-FORM] 💡 This is the SAME approach as testApplyAiFormWithSave() which works`);
      console.debug(`[${startTimestamp}] [AI-FORM] 📊 Will create ${aiFormPreview.sections.length} sections`);
      console.debug(`[${startTimestamp}] [AI-FORM] ✅ Building complete objects first, then updating state ONCE`);
      console.debug(`[${startTimestamp}] [AI-FORM] ✅ CLOSURE FIX: Using local variable for stop detection`);

      // BUILD ENTIRE AI-GENERATED FORM STRUCTURE IN MEMORY
      // This is the EXACT approach used by testApplyAiFormWithSave() which works
      for (let sIdx = 0; sIdx < aiFormPreview.sections.length; sIdx++) {
        const aiSection = aiFormPreview.sections[sIdx];
        const sectionTimestamp = new Date().toISOString();
        
        // FIXED: Use local variable instead of state (closure issue)
        if (!shouldContinue) {
          console.debug(`[${sectionTimestamp}] [AI-FORM] ⏸️ AI execution stopped by user at section ${sIdx + 1}`);
          break;
        }

        setAiProgress(`Building section ${sIdx + 1}/${aiFormPreview.sections.length}: ${aiSection.title}...`);
        
        console.debug(`[${sectionTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.debug(`[${sectionTimestamp}] [AI-FORM] 📝 Building section ${sIdx + 1}/${aiFormPreview.sections.length} in memory`);
        console.debug(`[${sectionTimestamp}] [AI-FORM] 📋 Section title: "${aiSection.title}"`);
        console.debug(`[${sectionTimestamp}] [AI-FORM] 📋 Section description: "${aiSection.description || '(none)'}"`);
        console.debug(`[${sectionTimestamp}] [AI-FORM] 📋 Questions count: ${aiSection.questions?.length || 0}`);
        
        // Validate section has questions
        if (!aiSection.questions || !Array.isArray(aiSection.questions)) {
          console.warn(`[${sectionTimestamp}] [AI-FORM] ⚠️ Section "${aiSection.title}" has no valid questions array, defaulting to empty`);
        }
        
        // Create section object EXACTLY like testApplyAiFormWithSave does
        // NOTE: Using sIdx as order_index (not sections.length + sIdx) to match test form
        const newSection: Section = {
          id: crypto.randomUUID(),
          title: aiSection.title || `Section ${sIdx + 1}`,
          description: aiSection.description || '',
          order_index: sIdx,  // SAME AS TEST FORM: uses sIdx directly
          questions: []
        };
        
        console.debug(`[${sectionTimestamp}] [AI-FORM] ✅ Section object created (SAME FORMAT AS TEST FORM):`, {
          id: newSection.id,
          title: newSection.title,
          description: newSection.description,
          order_index: newSection.order_index
        });
        
        // Build all questions for this section in memory
        const questionsToAdd = aiSection.questions || [];
        for (let qIdx = 0; qIdx < questionsToAdd.length; qIdx++) {
          const aiQuestion = questionsToAdd[qIdx];
          
          // Skip if user stopped (using local variable, not state - closure fix)
          if (!shouldContinue) {
            console.debug(`[${sectionTimestamp}] [AI-FORM] ⏸️ AI stopped during question ${qIdx + 1}`);
            break;
          }
          
          // Log the raw AI question data for debugging
          console.debug(`[${sectionTimestamp}] [AI-FORM] 📝 Raw AI question ${qIdx + 1}/${questionsToAdd.length}:`, JSON.stringify(aiQuestion));
          
          // Create question object EXACTLY like testApplyAiFormWithSave does
          // CRITICAL: Match the exact same structure the test form uses
          const newQuestion: Question = {
            id: crypto.randomUUID(),
            type: aiQuestion.type,  // Direct assignment like test form
            question_text: aiQuestion.question_text,  // Direct assignment like test form
            required: aiQuestion.required,  // Direct assignment like test form
            order_index: qIdx,
            description: aiQuestion.description || '',
            options: aiQuestion.options,  // Direct assignment like test form (no conditional)
            placeholder: aiQuestion.placeholder || '',
            hint: aiQuestion.hint || '',
            // These match the test form exactly
            maxLength: aiQuestion.type === 'short_text' || aiQuestion.type === 'long_text' ? undefined : undefined,
            fileTypes: aiQuestion.type === 'file_upload' ? undefined : undefined,
            maxFileSize: aiQuestion.type === 'file_upload' ? undefined : undefined,
            maxDuration: aiQuestion.type === 'video_upload' ? undefined : undefined,
            isConfigured: true
          };
          
          newSection.questions.push(newQuestion);
          totalQuestions++;
          
          // Log the complete question object for comparison with test form
          console.debug(`[${sectionTimestamp}] [AI-FORM] ✅ Question ${qIdx + 1} created (SAME FORMAT AS TEST FORM):`, {
            id: newQuestion.id,
            type: newQuestion.type,
            question_text: newQuestion.question_text,
            required: newQuestion.required,
            order_index: newQuestion.order_index,
            description: newQuestion.description,
            options: newQuestion.options,
            placeholder: newQuestion.placeholder,
            hint: newQuestion.hint,
            isConfigured: newQuestion.isConfigured
          });
        }
        
        newSections.push(newSection);
        console.debug(`[${sectionTimestamp}] [AI-FORM] ✅ Section "${newSection.title}" complete: ${newSection.questions.length} questions`);
        console.debug(`[${sectionTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        await delay(100); // Small delay for visual feedback
      }

      // FIXED: Use local variable shouldContinue instead of isAiApplying state
      if (shouldContinue && newSections.length > 0) {
        const completionTimestamp = new Date().toISOString();
        
        console.debug(`[${completionTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.debug(`[${completionTimestamp}] [AI-FORM] ✅✅✅ STEP 2: AI FORM STRUCTURE BUILT IN MEMORY! ✅✅✅`);
        console.debug(`[${completionTimestamp}] [AI-FORM] 📊 AI-generated structure ready:`, {
          totalSections: newSections.length,
          totalQuestions: totalQuestions,
          sectionsDetail: newSections.map(s => ({
            id: s.id,
            title: s.title,
            questionCount: s.questions.length,
            questionIds: s.questions.map(q => q.id)
          }))
        });
        console.debug(`[${completionTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

        // STEP 3: UPDATE STATE ALL AT ONCE (ATOMIC) - EXACTLY like testApplyAiFormWithSave
        console.debug(`[${completionTimestamp}] [AI-FORM] 🔧 STEP 3: Updating React state with complete form structure...`);
        console.debug(`[${completionTimestamp}] [AI-FORM] 💡 Calling setSections() ONCE with ${newSections.length} sections and ${totalQuestions} questions`);
        console.debug(`[${completionTimestamp}] [AI-FORM] 💡 Using setSections(newSections) - SAME as test form (replaces, not appends)`);
        
        setAiProgress('Updating form builder state...');
        
        // CRITICAL: Use setSections(newSections) - SAME AS TEST FORM
        // The test form uses setSections(newSections) which replaces all sections
        // NOT [...sections, ...newSections] which would append
        setSections(newSections);
        
        console.debug(`[${completionTimestamp}] [AI-FORM] ✅ setSections() called with ${newSections.length} sections (REPLACED, not appended)`);
        console.debug(`[${completionTimestamp}] [AI-FORM] 💡 This is EXACTLY what testApplyAiFormWithSave does`);
        
        // Log the complete sections array for verification
        console.debug(`[${completionTimestamp}] [AI-FORM] 📊 Complete sections structure being saved:`, 
          JSON.stringify(newSections.map(s => ({
            id: s.id,
            title: s.title,
            description: s.description,
            order_index: s.order_index,
            questions: s.questions.map(q => ({
              id: q.id,
              type: q.type,
              question_text: q.question_text,
              required: q.required,
              options: q.options
            }))
          })), null, 2)
        );

        // STEP 4: Wait for React state to process - Same timing as testApplyAiFormWithSave
        setAiProgress('Waiting for React state to stabilize...');
        const waitMs = 1500;  // Same delay as working test
        console.debug(`[${new Date().toISOString()}] [AI-FORM] ⏳ STEP 4: Waiting ${waitMs}ms for React to process state update...`);
        console.debug(`[${new Date().toISOString()}] [AI-FORM] 💡 This is the same delay used by testApplyAiFormWithSave()`);
        await delay(waitMs);
        
        console.debug(`[${new Date().toISOString()}] [AI-FORM] ✅ Wait complete. React should have processed the state update.`);

        // STEP 5: Save to Supabase - Same as testApplyAiFormWithSave
        setAiProgress('Saving to Supabase...');
        toast.loading('Saving AI-generated form to database...', { id: 'ai-save' });
        
        const saveStartTimestamp = new Date().toISOString();
        console.debug(`[${saveStartTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.debug(`[${saveStartTimestamp}] [AI-FORM] 💾 STEP 5: Triggering save to Supabase...`);
        console.debug(`[${saveStartTimestamp}] [AI-FORM] 🔧 Calling saveForm(skipToast=true)`);
        console.debug(`[${saveStartTimestamp}] [AI-FORM] 📊 Data to be saved:`, {
          totalSections: newSections.length,
          totalQuestions: totalQuestions,
          sectionIds: newSections.map(s => s.id),
          questionIds: newSections.flatMap(s => s.questions.map(q => q.id)),
          note: 'saveForm() will read the sections state we just set with setSections()'
        });
        console.debug(`[${saveStartTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        // Automatically save to Supabase
        try {
          await saveForm(true);
          
          const saveSuccessTimestamp = new Date().toISOString();
          console.debug(`[${saveSuccessTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.debug(`[${saveSuccessTimestamp}] [AI-FORM] ✅✅✅ AI-GENERATED FORM SAVED TO SUPABASE! ✅✅✅`);
          console.debug(`[${saveSuccessTimestamp}] [AI-FORM] 🎉 Successfully persisted to database!`);
          console.debug(`[${saveSuccessTimestamp}] [AI-FORM] 📊 Final summary:`, {
            sectionsCreated: newSections.length,
            questionsCreated: totalQuestions,
            totalDurationMs: new Date().getTime() - new Date(startTimestamp).getTime()
          });
          console.debug(`[${saveSuccessTimestamp}] [AI-FORM] ⏱️ Total AI process duration: ${new Date().getTime() - new Date(startTimestamp).getTime()}ms`);
          console.debug(`[${saveSuccessTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          
          setAiProgress('');
          toast.success(`✨ Successfully created and saved ${newSections.length} sections with ${totalQuestions} questions!`, {
            id: 'ai-save',
            duration: 4000
          });
          
          setAiFormPreview(null);
          
          // Clear checkpoint since save was successful
          setFormCheckpoint(null);
          console.debug(`[${saveSuccessTimestamp}] [AI-FORM] 🧹 Cleared checkpoint and preview`);
          
        } catch (saveError) {
          const saveErrorTimestamp = new Date().toISOString();
          
          console.error(`[${saveErrorTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.error(`[${saveErrorTimestamp}] [AI-FORM] ❌❌❌ FAILED TO SAVE TO SUPABASE ❌❌❌`);
          console.error(`[${saveErrorTimestamp}] [AI-FORM] 📋 Error object:`, saveError);
          console.error(`[${saveErrorTimestamp}] [AI-FORM] 📋 Error details:`, {
            message: saveError instanceof Error ? saveError.message : 'Unknown error',
            stack: saveError instanceof Error ? saveError.stack : undefined,
            name: saveError instanceof Error ? saveError.name : undefined
          });
          console.error(`[${saveErrorTimestamp}] [AI-FORM] 📊 AI-generated sections created: ${newSections.length}, questions: ${totalQuestions}`);
          console.error(`[${saveErrorTimestamp}] [AI-FORM] 📋 Checkpoint available: ${!!formCheckpoint}`);
          console.error(`[${saveErrorTimestamp}] [AI-FORM] 💡 You can use "Undo AI Changes" to revert, or click "Save" manually`);
          console.error(`[${saveErrorTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          
          toast.error('AI form created but failed to save to database. Use "Undo AI Changes" to revert, or click "Save" manually.', {
            id: 'ai-save',
            duration: 6000
          });
          
          // Don't clear preview so user can see what was generated
          // Keep checkpoint so user can undo if needed
        }
      }

    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      
      console.error(`[${errorTimestamp}] [AI-FORM] ❌ Error applying AI form`);
      console.error(`[${errorTimestamp}] [AI-FORM] 📋 Full error object:`, error);
      console.error(`[${errorTimestamp}] [AI-FORM] 📋 Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
        cause: error instanceof Error ? error.cause : undefined
      });
      console.error(`[${errorTimestamp}] [AI-FORM] 📊 AI structure at time of error:`, {
        sectionsBuiltInMemory: newSections?.length || 0,
        questionsBuiltInMemory: totalQuestions || 0,
        note: 'Error occurred while building or applying AI-generated form'
      });
      console.error(`[${errorTimestamp}] [AI-FORM] 📋 Checkpoint available: ${!!formCheckpoint}`);
      console.error(`[${errorTimestamp}] [AI-FORM] 💡 Restoring from checkpoint to undo partial changes...`);
      console.error(`[${errorTimestamp}] [AI-FORM] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      toast.error('Failed to apply AI form. Restoring previous state...', {
        duration: 4000
      });
      
      console.debug(`[${errorTimestamp}] [AI-FORM] ⏮️ Restoring from checkpoint...`);
      restoreCheckpoint();
    } finally {
      const finalTimestamp = new Date().toISOString();
      setIsAiApplying(false);
      setAiProgress('');
      console.debug(`[${finalTimestamp}] [AI-FORM] 🏁 AI form application finished`);
      console.debug(`[${finalTimestamp}] [AI-FORM] ⏱️ Total execution time: ${new Date().getTime() - new Date(startTimestamp).getTime()}ms`);
    }
  };

  // PREVIEW-ONLY TEST: Build and show preview without saving (lightweight test)
  // NOTE: This uses the same memory-build approach but skips the save step
  const testApplyAiForm = async () => {
    const testTimestamp = new Date().toISOString();
    console.debug(`[${testTimestamp}] [AI-TEST-PREVIEW] 🧪 Starting PREVIEW-ONLY test (no save)`);
    console.debug(`[${testTimestamp}] [AI-TEST-PREVIEW] 💡 Uses memory-build approach, skips Supabase save`);
    
    // Create a small test form structure
    const testFormPreview: AIFormPreview = {
      summary: "Test company for debugging AI form builder",
      matchedOpportunityId: null,
      sections: [
        {
          title: "Test Section 1",
          description: "First test section",
          questions: [
            {
              type: 'short_text',
              question_text: "What is your test name?",
              description: "Test description",
              required: true,
              placeholder: "Enter test name",
              hint: "Test hint"
            },
            {
              type: 'multiple_choice',
              question_text: "Pick a test option",
              description: "",
              required: false,
              placeholder: "",
              hint: "",
              options: ["Test Option A", "Test Option B", "Test Option C"]
            }
          ]
        },
        {
          title: "Test Section 2",
          description: "Second test section",
          questions: [
            {
              type: 'long_text',
              question_text: "Describe your test experience",
              description: "Tell us more",
              required: true,
              placeholder: "Enter details",
              hint: "Be descriptive"
            }
          ]
        }
      ],
      sourcesUsed: ["Test data - preview only"],
      companyName: "Test Company"
    };
    
    console.debug(`[${testTimestamp}] [AI-TEST-PREVIEW] 📋 Test preview created:`, testFormPreview);
    
    // Build sections in memory (same as applyAiForm and testApplyAiFormWithSave)
    const newSections: Section[] = [];
    let totalQuestions = 0;
    
    for (let sIdx = 0; sIdx < testFormPreview.sections.length; sIdx++) {
      const aiSection = testFormPreview.sections[sIdx];
      const newSection: Section = {
        id: crypto.randomUUID(),
        title: aiSection.title,
        description: aiSection.description || '',
        order_index: sections.length + sIdx,
        questions: []
      };
      
      for (let qIdx = 0; qIdx < aiSection.questions.length; qIdx++) {
        const aiQuestion = aiSection.questions[qIdx];
        const newQuestion: Question = {
          id: crypto.randomUUID(),
          type: aiQuestion.type,
          question_text: aiQuestion.question_text,
          required: aiQuestion.required,
          order_index: qIdx,
          description: aiQuestion.description || '',
          options: aiQuestion.options,
          placeholder: aiQuestion.placeholder || '',
          hint: aiQuestion.hint || '',
          isConfigured: true
        };
        newSection.questions.push(newQuestion);
        totalQuestions++;
      }
      newSections.push(newSection);
    }
    
    console.debug(`[${testTimestamp}] [AI-TEST-PREVIEW] ✅ Built ${newSections.length} sections with ${totalQuestions} questions in memory`);
    
    // Update state with new sections (preview only - no save)
    const updatedSections = [...sections, ...newSections];
    setSections(updatedSections);
    
    console.debug(`[${testTimestamp}] [AI-TEST-PREVIEW] ✅ State updated with ${updatedSections.length} total sections`);
    console.debug(`[${testTimestamp}] [AI-TEST-PREVIEW] 💡 Preview only - use "Apply & Save Test Form" to test with Supabase persistence`);
    
    toast.success(`Preview test: Added ${newSections.length} sections (${totalQuestions} questions) - NOT saved to database`);
  };

  // Helper delay function
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // COMPREHENSIVE DEBUG TEST: Force apply and save a test form with full logging
  const testApplyAiFormWithSave = async () => {
    const testTimestamp = new Date().toISOString();
    console.debug(`[${testTimestamp}] [AI-TEST] 🧪 Starting COMPREHENSIVE test with forced state and auto-save`);
    console.debug(`[${testTimestamp}] [AI-TEST] 📋 This test will:`);
    console.debug(`[${testTimestamp}] [AI-TEST]    1. Force aiFormPreview state with test data`);
    console.debug(`[${testTimestamp}] [AI-TEST]    2. Create 2 sections with 3 questions each (6 total)`);
    console.debug(`[${testTimestamp}] [AI-TEST]    3. Use existing addSection() and addQuestion() functions`);
    console.debug(`[${testTimestamp}] [AI-TEST]    4. Track state locally (sections state variable won't update in closure)`);
    console.debug(`[${testTimestamp}] [AI-TEST]    5. Wait for React to re-render with proper delays`);
    console.debug(`[${testTimestamp}] [AI-TEST]    6. Call saveForm(true) to persist to Supabase`);
    console.debug(`[${testTimestamp}] [AI-TEST]    7. Log all steps with timestamps and full state`);
    
    console.debug(`[${testTimestamp}] [AI-TEST] ⚠️ IMPORTANT: sections state variable is captured in closure and won't update`);
    console.debug(`[${testTimestamp}] [AI-TEST] ⚠️ We'll track sections locally and trust addSection()/addQuestion() return values`);
    
    // Create comprehensive test form structure
    const testFormPreview: AIFormPreview = {
      summary: "Test company for debugging AI form builder persistence",
      matchedOpportunityId: null,
      sections: [
        {
          title: "Personal Information",
          description: "Tell us about yourself",
          questions: [
            {
              type: 'short_text',
              question_text: "What is your full name?",
              description: "Please provide your legal name",
              required: true,
              placeholder: "John Doe",
              hint: "First and last name"
            },
            {
              type: 'short_text',
              question_text: "What is your email address?",
              description: "We'll use this to contact you",
              required: true,
              placeholder: "john@example.com",
              hint: "Make sure it's a valid email"
            },
            {
              type: 'multiple_choice',
              question_text: "What is your current status?",
              description: "Select the option that best describes you",
              required: true,
              placeholder: "",
              hint: "",
              options: ["Student", "Recent Graduate", "Working Professional", "Career Changer"]
            }
          ]
        },
        {
          title: "Experience & Skills",
          description: "Share your background and expertise",
          questions: [
            {
              type: 'long_text',
              question_text: "Describe your relevant experience",
              description: "Include internships, projects, coursework, or work history",
              required: true,
              placeholder: "I have experience in...",
              hint: "Be specific about technologies, tools, and achievements"
            },
            {
              type: 'checkboxes',
              question_text: "Select your technical skills",
              description: "Choose all that apply",
              required: false,
              placeholder: "",
              hint: "Select multiple options",
              options: ["JavaScript", "Python", "React", "Node.js", "SQL/Databases", "Git/GitHub", "Cloud (AWS/Azure)", "Machine Learning"]
            },
            {
              type: 'dropdown',
              question_text: "Years of programming experience",
              description: "Approximate total experience",
              required: true,
              placeholder: "",
              hint: "",
              options: ["Less than 1 year", "1-2 years", "3-5 years", "5-10 years", "10+ years"]
            }
          ]
        }
      ],
      sourcesUsed: ["Test data - Generated by debug test function"],
      companyName: "Test Company Inc."
    };
    
    console.debug(`[${testTimestamp}] [AI-TEST] 📋 Test preview created successfully`);
    console.debug(`[${testTimestamp}] [AI-TEST] 📊 Test form structure:`, {
      sectionCount: testFormPreview.sections.length,
      totalQuestions: testFormPreview.sections.reduce((acc, s) => acc + s.questions.length, 0),
      sections: testFormPreview.sections.map(s => ({
        title: s.title,
        questionCount: s.questions.length,
        questionTypes: s.questions.map(q => q.type)
      }))
    });
    
    // FORCE set the preview state
    console.debug(`[${testTimestamp}] [AI-TEST] 🔧 STEP 1: Forcing aiFormPreview state`);
    setAiFormPreview(testFormPreview);
    
    // Set form title and description
    const testFormTitle = "AI Test Application Form";
    const testFormDescription = "This form was auto-generated by the comprehensive AI test function to verify persistence.";
    
    console.debug(`[${testTimestamp}] [AI-TEST] 📝 Setting form title: "${testFormTitle}"`);
    setFormTitle(testFormTitle);
    
    console.debug(`[${testTimestamp}] [AI-TEST] 📝 Setting form description: "${testFormDescription}"`);
    setFormDescription(testFormDescription);
    
    // Wait for state to update
    console.debug(`[${testTimestamp}] [AI-TEST] ⏳ Waiting 150ms for state update...`);
    await delay(150);
    
    console.debug(`[${new Date().toISOString()}] [AI-TEST] ✅ State updated successfully`);
    console.debug(`[${new Date().toISOString()}] [AI-TEST] 📊 Current state snapshot:`, {
      formTitle,
      formDescription,
      aiFormPreviewSet: !!testFormPreview,
      isAiApplying: false,
      currentSections: sections.length,
      currentQuestions: sections.reduce((acc, s) => acc + s.questions.length, 0)
    });
    
    // Create checkpoint before any modifications
    console.debug(`[${new Date().toISOString()}] [AI-TEST] 💾 Creating checkpoint...`);
    createCheckpoint();
    console.debug(`[${new Date().toISOString()}] [AI-TEST] ✅ Checkpoint created`);
    
    // FORCE set applying state
    console.debug(`[${new Date().toISOString()}] [AI-TEST] 🔧 STEP 2: Setting isAiApplying = true`);
    setIsAiApplying(true);
    setAiProgress('Test: Initializing...');
    
    // Initialize these at function scope so they're available in catch block
    let newSections: Section[] = [];
    let totalQuestions = 0;
    
    try {
      const startApplyTimestamp = new Date().toISOString();
      console.debug(`[${startApplyTimestamp}] [AI-TEST] 🚀 STEP 3: Building complete form structure IN MEMORY...`);
      console.debug(`[${startApplyTimestamp}] [AI-TEST] 📊 Will create ${testFormPreview.sections.length} sections with questions`);
      console.debug(`[${startApplyTimestamp}] [AI-TEST] 💡 NEW APPROACH: Build entire structure first, then update state ONCE`);
      console.debug(`[${startApplyTimestamp}] [AI-TEST] ✅ This avoids all async state update timing issues!`);
      
      for (let sIdx = 0; sIdx < testFormPreview.sections.length; sIdx++) {
        const aiSection = testFormPreview.sections[sIdx];
        const sectionTimestamp = new Date().toISOString();
        
        setAiProgress(`Test: Building section ${sIdx + 1}/${testFormPreview.sections.length}: ${aiSection.title}...`);
        
        console.debug(`[${sectionTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.debug(`[${sectionTimestamp}] [AI-TEST] 📝 Building section ${sIdx + 1}/${testFormPreview.sections.length} in memory`);
        console.debug(`[${sectionTimestamp}] [AI-TEST] 📋 Section: "${aiSection.title}" with ${aiSection.questions.length} questions`);
        
        // Create section object
        const newSection: Section = {
          id: crypto.randomUUID(),
          title: aiSection.title,
          description: aiSection.description,
          order_index: sIdx,
          questions: []
        };
        
        console.debug(`[${sectionTimestamp}] [AI-TEST] ✅ Section object created with ID: ${newSection.id}`);
        
        // Build all questions for this section
        for (let qIdx = 0; qIdx < aiSection.questions.length; qIdx++) {
          const aiQuestion = aiSection.questions[qIdx];
          
          console.debug(`[${sectionTimestamp}] [AI-TEST] 📝 Building question ${qIdx + 1}/${aiSection.questions.length}: "${aiQuestion.question_text.slice(0, 40)}..."`);
          
          const newQuestion: Question = {
            id: crypto.randomUUID(),
            type: aiQuestion.type,
            question_text: aiQuestion.question_text,
            required: aiQuestion.required,
            order_index: qIdx,
            description: aiQuestion.description || '',
            options: aiQuestion.options,
            placeholder: aiQuestion.placeholder || '',
            hint: aiQuestion.hint || '',
            maxLength: aiQuestion.type === 'short_text' || aiQuestion.type === 'long_text' ? undefined : undefined,
            fileTypes: aiQuestion.type === 'file_upload' ? undefined : undefined,
            maxFileSize: aiQuestion.type === 'file_upload' ? undefined : undefined,
            maxDuration: aiQuestion.type === 'video_upload' ? undefined : undefined,
            isConfigured: true
          };
          
          newSection.questions.push(newQuestion);
          totalQuestions++;
          
          console.debug(`[${sectionTimestamp}] [AI-TEST] ✅ Question object created with ID: ${newQuestion.id}`);
        }
        
        newSections.push(newSection);
        console.debug(`[${sectionTimestamp}] [AI-TEST] ✅ Section "${aiSection.title}" complete with ${newSection.questions.length} questions`);
        await delay(100); // Small delay for visual feedback
      }
      
      const completionTimestamp = new Date().toISOString();
      console.debug(`[${completionTimestamp}] [AI-TEST] ✅✅✅ ALL FORM STRUCTURE BUILT IN MEMORY! ✅✅✅`);
      console.debug(`[${completionTimestamp}] [AI-TEST] 📊 Structure summary:`, {
        totalSections: newSections.length,
        totalQuestions: totalQuestions,
        sectionsDetail: newSections.map(s => ({
          id: s.id,
          title: s.title,
          questionCount: s.questions.length
        }))
      });
      
      // NOW UPDATE STATE ALL AT ONCE
      console.debug(`[${completionTimestamp}] [AI-TEST] 🔧 STEP 4: Updating React state with complete form structure...`);
      console.debug(`[${completionTimestamp}] [AI-TEST] 💡 Calling setSections() ONCE with ${newSections.length} sections and ${totalQuestions} questions`);
      console.debug(`[${completionTimestamp}] [AI-TEST] ✅ This is atomic - no async state update timing issues!`);
      
      setAiProgress('Test: Updating React state...');
      setSections(newSections);
      
      console.debug(`[${completionTimestamp}] [AI-TEST] ✅ setSections() called with complete structure`);
      console.debug(`[${completionTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      // Wait for React state to fully process the update
      setAiProgress('Test: Waiting for React state to process...');
      const waitMs = 1500;
      console.debug(`[${new Date().toISOString()}] [AI-TEST] ⏳ STEP 5: Waiting ${waitMs}ms for React to process the state update...`);
      console.debug(`[${new Date().toISOString()}] [AI-TEST] ℹ️ Since we called setSections() once, this should be quick`);
      await delay(waitMs);
      
      // TRIGGER SAVE TO SUPABASE
      const saveStartTimestamp = new Date().toISOString();
      console.debug(`[${saveStartTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.debug(`[${saveStartTimestamp}] [AI-TEST] 💾 STEP 6: TRIGGERING SAVE TO SUPABASE...`);
      console.debug(`[${saveStartTimestamp}] [AI-TEST] 🔧 Calling saveForm(skipToast=true)`);
      console.debug(`[${saveStartTimestamp}] [AI-TEST] 📊 Expected data to be saved:`, {
        sections: newSections.length,
        questions: totalQuestions,
        note: 'saveForm() will see the complete structure we just set with setSections()'
      });
      console.debug(`[${saveStartTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      setAiProgress('Test: Saving to Supabase database...');
      toast.loading('Test: Saving form to database...', { id: 'ai-test-save' });
      
      // Call the existing saveForm function
      await saveForm(true);
      
      const saveSuccessTimestamp = new Date().toISOString();
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] ✅✅✅ SAVE COMPLETED SUCCESSFULLY! ✅✅✅`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] 🎉 Test form successfully persisted to Supabase!`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] 📊 Final summary:`, {
        sectionsCreatedAndSaved: newSections.length,
        questionsCreatedAndSaved: totalQuestions,
        totalDurationMs: new Date().getTime() - new Date(testTimestamp).getTime()
      });
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] 💡 Check Supabase dashboard:`, {
        formsTable: 'Verify form metadata updated',
        formSectionsTable: `Should have ${newSections.length} new sections`,
        formQuestionsTable: `Should have ${totalQuestions} new questions`
      });
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      toast.success(`✅ Test successful! Created and saved ${newSections.length} sections and ${totalQuestions} questions!`, {
        id: 'ai-test-save',
        duration: 5000
      });
      
      // Clean up test state
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] 🧹 STEP 6: Cleaning up test state...`);
      setAiFormPreview(null);
      setFormCheckpoint(null);
      setAiProgress('');
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] ✅ Test state cleaned up`);
      
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] 🏁 TEST COMPLETE - VERIFICATION STEPS:`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST]    1. ✅ Built ${newSections.length} sections with ${totalQuestions} questions in memory`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST]    2. ✅ Updated React state with setSections() (atomic, no timing issues)`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST]    3. ✅ Called saveForm() successfully`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST]    4. ✅ Data persisted to Supabase`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST]    5. 🔍 Now check your Supabase dashboard to verify!`);
      console.debug(`[${saveSuccessTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      console.error(`[${errorTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.error(`[${errorTimestamp}] [AI-TEST] ❌❌❌ TEST FAILED ❌❌❌`);
      console.error(`[${errorTimestamp}] [AI-TEST] 📋 Error object:`, error);
      console.error(`[${errorTimestamp}] [AI-TEST] 📋 Error details:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined
      });
      console.error(`[${errorTimestamp}] [AI-TEST] 📊 State at time of error:`, {
        sectionsBuiltInMemory: newSections?.length || 0,
        questionsBuiltInMemory: totalQuestions || 0,
        note: 'Error occurred while building form structure in memory'
      });
      console.error(`[${errorTimestamp}] [AI-TEST] 📋 Checkpoint available:`, !!formCheckpoint);
      console.error(`[${errorTimestamp}] [AI-TEST] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      
      toast.error(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`, {
        id: 'ai-test-save',
        duration: 6000
      });
      
      // Restore checkpoint to undo partial changes
      console.debug(`[${errorTimestamp}] [AI-TEST] ⏮️ Restoring checkpoint to undo partial changes...`);
      restoreCheckpoint();
      console.debug(`[${errorTimestamp}] [AI-TEST] ✅ Checkpoint restored`);
      
    } finally {
      const finalTimestamp = new Date().toISOString();
      setIsAiApplying(false);
      setAiProgress('');
      console.debug(`[${finalTimestamp}] [AI-TEST] 🏁 Test function execution finished`);
      console.debug(`[${finalTimestamp}] [AI-TEST] ⏱️ Total execution time: ${new Date().getTime() - new Date(testTimestamp).getTime()}ms`);
    }
  };

  const QuestionConfig = ({ question, sectionIndex, questionIndex, onClose }: {
    question: Question;
    sectionIndex: number;
    questionIndex: number;
    onClose: () => void;
  }) => {
    const [localQuestion, setLocalQuestion] = useState<Question>({ ...question });
  const { supabase, error: supabaseError } = useSupabase();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);

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
                {!isPublished && (
                  <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors duration-200 ${
                      isPanelOpen
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    title="AI Assistant"
                  >
                    <SparklesIcon className="h-5 w-5" />
                    <span>AI Assistant</span>
                  </button>
                )}
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

        {/* AI Assistant Panel */}
        {isPanelOpen && !isPublished && (
          <div
            className="fixed left-0 bg-white border-r border-gray-200 shadow-xl overflow-hidden"
            style={{
              top: '96px', // Below navbar
              bottom: 0,
              width: `${panelWidth}px`,
              zIndex: 45,
            }}
          >
            {/* Resize Handle */}
            {!isWidthLocked && (
              <div
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 hover:w-1.5 transition-all z-50"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-16 bg-gray-300 rounded-l hover:bg-blue-500 transition-colors"></div>
              </div>
            )}

            {/* Panel Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">AI Form Builder</h2>
                  <p className="text-xs text-gray-600">Generate tailored application forms</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsWidthLocked(!isWidthLocked);
                }}
                className="p-2 hover:bg-white/50 rounded transition-colors"
                title={isWidthLocked ? "Unlock width" : "Lock width"}
              >
                {isWidthLocked ? (
                  <LockSolid className="w-4 h-4 text-gray-600" />
                ) : (
                  <UnlockSolid className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex flex-col h-[calc(100%-80px)] overflow-hidden">
              {!aiFormPreview ? (
                /* Generation UI */
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works</h3>
                      <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                        <li>AI scans your company profile & website</li>
                        <li>Generates a tailored application form</li>
                        <li>Preview before applying to your form</li>
                        <li>Click "Apply" to add sections & questions</li>
                      </ol>
                    </div>

                    {isAiGenerating ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                          <span className="text-sm text-gray-700">{aiProgress || 'Generating...'}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={generateAiForm}
                          disabled={isAiGenerating}
                          className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-md"
                        >
                          <SparklesIcon className="w-5 h-5" />
                          <span>Generate Form</span>
                        </button>
                        
                        {/* Debug Test Buttons */}
                        <div className="pt-3 mt-3 border-t border-purple-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2.5 flex items-center">
                            <span className="mr-1.5">🔧</span>
                            Debug Tools
                          </p>
                          
                          {/* Comprehensive Test Button - Forces state and saves */}
                          <button
                            onClick={testApplyAiFormWithSave}
                            disabled={isAiApplying || isSaving}
                            className="w-full px-3 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm font-semibold flex items-center justify-center space-x-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed mb-2"
                            title="Creates 2 sections with 6 questions total, then automatically saves to Supabase with full logging"
                          >
                            <span className="text-base">🧪</span>
                            <span>Apply & Save Test Form</span>
                          </button>
                          <p className="text-xs text-gray-600 leading-relaxed mb-3 px-1">
                            Creates 2 sections + 6 questions, waits for state to stabilize, then saves to Supabase. Full console logs included.
                          </p>
                          
                          {/* Preview-only Test Button */}
                          <button
                            onClick={testApplyAiForm}
                            disabled={isAiApplying}
                            className="w-full px-3 py-2 bg-yellow-50 text-yellow-800 border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-all duration-200 text-sm font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Test AI preview generation only (no save)"
                          >
                            <span>📋</span>
                            <span>Preview Only Test</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Preview UI */
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <h3 className="text-sm font-semibold text-green-900 mb-1">Company Analysis</h3>
                      <p className="text-xs text-green-800">{aiFormPreview.summary}</p>
                      {aiFormPreview.sourcesUsed.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-green-700 font-medium">Sources used:</p>
                          <ul className="text-xs text-green-700 list-disc list-inside">
                            {aiFormPreview.sourcesUsed.map((source, idx) => (
                              <li key={idx}>{source}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Form Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900">Form Preview</h3>
                        <span className="text-xs text-gray-600">
                          {aiFormPreview.sections.length} sections, {aiFormPreview.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions
                        </span>
                      </div>

                      {aiFormPreview.sections.map((section, sIdx) => (
                        <div key={sIdx} className="bg-white border border-gray-200 rounded-lg p-3">
                          <div className="font-medium text-sm text-gray-900 mb-1">{section.title}</div>
                          {section.description && (
                            <div className="text-xs text-gray-600 mb-2">{section.description}</div>
                          )}
                          <div className="space-y-1.5 mt-2">
                            {section.questions.map((question, qIdx) => (
                              <div key={qIdx} className="flex items-start space-x-2 text-xs">
                                <CheckIcon className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <span className="text-gray-700">{question.question_text}</span>
                                  <span className="ml-1 text-gray-500">({question.type.replace('_', ' ')})</span>
                                  {question.required && <span className="ml-1 text-red-500">*</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowConfirmDialog(true)}
                        disabled={isAiApplying}
                        className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 shadow-md"
                      >
                        <PlayIcon className="w-5 h-5" />
                        <span>Apply to Form</span>
                      </button>

                      <button
                        onClick={() => {
                          setAiFormPreview(null);
                          setAiProgress('');
                        }}
                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Footer */}
              {isAiApplying && (
                <div className="border-t border-gray-200 p-4 bg-yellow-50">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">AI is working...</span>
                      <button
                        onClick={stopAiExecution}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-xs font-medium flex items-center space-x-1"
                      >
                        <StopIcon className="w-3 h-3" />
                        <span>Stop (ESC)</span>
                      </button>
                    </div>
                    <div className="text-xs text-gray-700">{aiProgress}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Undo Footer */}
              {formCheckpoint && !isAiApplying && (
                <div className="border-t border-gray-200 p-4 bg-blue-50">
                  <button
                    onClick={restoreCheckpoint}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <ArrowPathIcon className="w-4 h-4" />
                    <span>Undo AI Changes</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirmDialog && aiFormPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm AI Application</h3>
              <p className="text-sm text-gray-600 mb-4">
                AI will add <strong>{aiFormPreview.sections.length} sections</strong> and{' '}
                <strong>{aiFormPreview.sections.reduce((acc, s) => acc + s.questions.length, 0)} questions</strong> to your form.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                A checkpoint will be created so you can undo these changes if needed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={applyAiForm}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Container - adjust top padding to account for larger navbar */}
        <div 
          className="pt-48 relative transition-all duration-300" 
          style={{ 
            zIndex: 30,
            marginLeft: isPanelOpen && !isPublished ? `${panelWidth}px` : '0px'
          }}
        >
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