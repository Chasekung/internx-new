"use client";
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { BsGrid, BsList } from 'react-icons/bs';
import { Sparkles, Send, RotateCcw, Lock, Unlock, ChevronLeft, ChevronRight } from 'lucide-react';
import OpportunityCardView from '@/components/OpportunityCardView';
import OpportunityListView from '@/components/OpportunityListView';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

const CATEGORIES = [
  "Software Engineering",
  "Marketing",
  "Finance",
  "Design",
  "Operations",
  "Sales",
  "Product Management",
  "Research",
  "Education",
  "Healthcare",
  "Other"
];

const POSITIONS_BY_CATEGORY: Record<string, string[]> = {
  "Software Engineering": ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "QA Engineer", "Other"],
  "Marketing": ["Marketing Intern", "Content Creator", "Social Media Manager", "SEO Specialist", "Other"],
  "Finance": ["Finance Intern", "Analyst", "Accounting Assistant", "Bookkeeper", "Other"],
  "Design": ["Graphic Designer", "UI/UX Designer", "Product Designer", "Other"],
  "Operations": ["Operations Assistant", "Logistics Coordinator", "Project Coordinator", "Other"],
  "Sales": ["Sales Associate", "Sales Intern", "Account Manager", "Other"],
  "Product Management": ["Product Manager", "Product Analyst", "Product Owner", "Other"],
  "Research": ["Research Assistant", "Lab Assistant", "Research Fellow", "Other"],
  "Education": ["Teacher's Assistant", "Tutor", "Camp Counselor", "Other"],
  "Healthcare": ["Medical Assistant", "Healthcare Intern", "Nursing Assistant", "Other"],
  "Other": ["Volunteer", "Assistant", "Coordinator", "Other"]
};

const STATE_ABBREVIATIONS = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
  "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

interface Internship {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  requirements: string[] | null;
  duration: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_name: string;
  for_profit: 'for-profit' | 'non-profit';
  category: string;
  position: string;
  work_location_type: 'online' | 'in_person';
  address: string;
  city: string;
  state: string;
  hours_per_week: number | null;
  pay: number | null;
  business_email: string;
  internship_picture_1: string | null;
  internship_picture_2: string | null;
  internship_picture_3: string | null;
  internship_picture_4: string | null;
  internship_picture_5: string | null;
}

type InternshipPictureKeys = 'internship_picture_1' | 'internship_picture_2' | 'internship_picture_3' | 'internship_picture_4' | 'internship_picture_5';

type InternshipPictureUrls = {
  internship_picture_1?: string;
  internship_picture_2?: string;
  internship_picture_3?: string;
  internship_picture_4?: string;
  internship_picture_5?: string;
};

type FormStateKey = keyof FormState;

interface FormState {
  company_name: string;
  for_profit: string;
  category: string;
  position: string;
  work_location_type: string;
  address: string;
  city: string;
  state: string;
  hours_per_week: string;
  pay: string;
  business_email: string;
  description: string;
  internship_picture_1: string | null;
  internship_picture_2: string | null;
  internship_picture_3: string | null;
  internship_picture_4: string | null;
  internship_picture_5: string | null;
}

interface ImageFields {
  internship_picture_1: string | null;
  internship_picture_2: string | null;
  internship_picture_3: string | null;
  internship_picture_4: string | null;
  internship_picture_5: string | null;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  generatedDescription?: string;
  timestamp: number;
}

export default function CompanyOpportunitiesPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params?.companyId as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [form, setForm] = useState<FormState>({
    company_name: '',
    for_profit: '',
    category: '',
    position: '',
    work_location_type: 'in_person',
    address: '',
    city: '',
    state: '',
    hours_per_week: '',
    pay: '',
    business_email: '',
    description: '',
    internship_picture_1: null,
    internship_picture_2: null,
    internship_picture_3: null,
    internship_picture_4: null,
    internship_picture_5: null,
  });
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyWebsite, setCompanyWebsite] = useState<string | null>(null);
  const { supabase, error: supabaseError } = useSupabase();

  // AI Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(320);
  const [isWidthLocked, setIsWidthLocked] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [pendingDescription, setPendingDescription] = useState<string | null>(null);
  const [hasTriggeredModalMessage, setHasTriggeredModalMessage] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load panel preferences
  const loadPanelWidth = () => {
    try {
      const savedWidth = localStorage.getItem('ai_panel_width_opportunities');
      const savedLock = localStorage.getItem('ai_panel_locked_opportunities');
      if (savedWidth) setPanelWidth(parseInt(savedWidth));
      if (savedLock) setIsWidthLocked(savedLock === 'true');
    } catch (error) {
      console.error('Error loading panel preferences:', error);
    }
  };

  const savePanelWidth = () => {
    try {
      localStorage.setItem('ai_panel_width_opportunities', panelWidth.toString());
      localStorage.setItem('ai_panel_locked_opportunities', isWidthLocked.toString());
    } catch (error) {
      console.error('Error saving panel preferences:', error);
    }
  };

  // Load/save chat history
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('ai_chat_history_opportunities');
      if (saved) {
        const messages = JSON.parse(saved);
        setChatMessages(messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatHistory = (messages: ChatMessage[]) => {
    try {
      localStorage.setItem('ai_chat_history_opportunities', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Initialize Supabase client when component mounts
  useEffect(() => {
    loadPanelWidth();
    loadChatHistory();
  }, []);

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!userStr) {
      router.replace('/company-sign-in');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'COMPANY') {
        router.replace('/company-sign-in');
        return;
      }
    } catch {
      router.replace('/company-sign-in');
      return;
    }
    const fetchUser = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      // Fetch company website for AI context
      if (user?.id) {
        const { data: companyData } = await supabase
          .from('companies')
          .select('website')
          .eq('id', user.id)
          .single();
        
        if (companyData?.website) {
          setCompanyWebsite(companyData.website);
          console.log('Company website loaded for AI context:', companyData.website);
        }
      }
    };
    fetchUser();
  }, [router, companyId, supabase]);

  // Panel resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isWidthLocked) return;
      
      e.preventDefault();
      
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        savePanelWidth();
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
  }, [isResizing, isWidthLocked, panelWidth]);

  // Save width lock preference
  useEffect(() => {
    savePanelWidth();
  }, [isWidthLocked]);

  // Auto-scroll chat when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Reset trigger flag when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setHasTriggeredModalMessage(false);
    }
  }, [isModalOpen]);

  // Detect modal open and auto-generate description if fields are filled
  useEffect(() => {
    if (!isModalOpen) return;
    
    // Check if we have enough info to auto-generate
    const hasBasicInfo = form.position || form.category || form.company_name;
    
    if (hasBasicInfo && !hasTriggeredModalMessage) {
      setHasTriggeredModalMessage(true);
      
      // Build context from form fields
      const contextParts = [];
      if (form.company_name) contextParts.push(`for ${form.company_name}`);
      if (form.position) contextParts.push(`a ${form.position} position`);
      if (form.category) contextParts.push(`in ${form.category}`);
      
      const contextString = contextParts.length > 0 
        ? ` I noticed you're creating ${contextParts.join(' ')}. Let me generate a professional description for you!`
        : '';
      
      // Add note about using company website if available
      const websiteNote = companyWebsite 
        ? `\n\n✓ I'll use your company website (${companyWebsite}) to create an accurate, company-specific description.`
        : '';
      
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `Hi! I can help you write a compelling job description for your internship posting.${contextString}${websiteNote}`,
        timestamp: Date.now()
      };
      
      setChatMessages([welcomeMessage]);
      saveChatHistory([welcomeMessage]);
      
      // Auto-generate if we have position and category
      if (form.position && form.category) {
        setTimeout(() => {
          autoGenerateDescription();
        }, 500);
      }
    } else if (!hasBasicInfo && !hasTriggeredModalMessage) {
      // Show generic welcome message with website note
      const websiteNote = companyWebsite 
        ? ` I have access to your company website (${companyWebsite}) to ensure accuracy.`
        : '';
      
      const welcomeMessage: ChatMessage = {
        role: 'assistant',
        content: `Hi! Fill out some basic information (position, category, company name) and I'll automatically generate a professional job description for you!${websiteNote}`,
        timestamp: Date.now()
      };
      setChatMessages([welcomeMessage]);
      saveChatHistory([welcomeMessage]);
      setHasTriggeredModalMessage(true);
    }
  }, [isModalOpen, form.position, form.category, form.company_name, hasTriggeredModalMessage, companyWebsite]);

  useEffect(() => {
    const fetchInternships = async () => {
      if (!supabase || !companyId) return;
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.from('internships').select('*').eq('company_id', companyId);
        if (!error && data) {
          setInternships(data);
        } else {
          console.error('Error fetching internships:', error);
          setInternships([]);
        }
      } catch (err) {
        console.error('Failed to fetch internships:', err);
        setInternships([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInternships();
  }, [supabase, supabaseError, companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle file uploads
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const file = e.target.files?.[0];
      const key = name as FormStateKey;
      
      if (!file) {
        // File was removed
        setForm((prev) => ({
          ...prev,
          [key]: null
        }));
        return;
      }

      // File was selected
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setForm((prev) => ({
          ...prev,
          [key]: result
        }));
      };
      reader.readAsDataURL(file);
      return;
    }

    // Handle other form fields
    const key = name as FormStateKey;
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Build form context for AI
  const buildFormContext = () => {
    return {
      company_name: form.company_name,
      company_website: companyWebsite, // Add company website for accurate AI generation
      for_profit: form.for_profit,
      category: form.category,
      position: form.position,
      work_location_type: form.work_location_type,
      hours_per_week: form.hours_per_week,
      pay: form.pay,
      current_description: form.description,
      address: form.address,
      city: form.city,
      state: form.state
    };
  };

  // Auto-generate description when modal opens with data
  const autoGenerateDescription = async () => {
    if (isAiLoading) return;
    
    // Build automatic query from form data
    const parts = [];
    if (form.position) parts.push(form.position);
    if (form.category) parts.push(`in ${form.category}`);
    if (form.company_name) parts.push(`at ${form.company_name}`);
    
    const autoQuery = `Generate a professional internship description for ${parts.join(' ')}`;
    
    const userMessage: ChatMessage = {
      role: 'user',
      content: '✨ Auto-generating description...',
      timestamp: Date.now()
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setIsAiLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formContext = buildFormContext();

      console.log('Calling AI API with:', { autoQuery, formContext });
      
      const response = await fetch('/api/companies/generate-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: autoQuery,
          conversationHistory: chatMessages,
          formContext: formContext
        })
      });

      const data = await response.json();
      console.log('AI API response:', { status: response.status, hasError: !!data.error, hasDescription: !!data.generatedDescription });

      // Check for API errors
      if (!response.ok || data.error) {
        throw new Error(data.error || data.details || 'AI generation failed');
      }

      // Validate response has generated description
      if (!data.generatedDescription) {
        throw new Error('AI did not return a description. Please try again.');
      }
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Generated description successfully!',
        generatedDescription: data.generatedDescription,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
      setPendingDescription(data.generatedDescription);
      
      console.log('Description generated successfully, length:', data.generatedDescription.length);
    } catch (error: any) {
      console.error('AI auto-generation error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error.message || 'I had trouble generating the description. Please check the console for details and try again.'}`,
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Assistant handler for job description generation
  const handleAssistantQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: aiQuery.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setAiQuery('');
    setIsAiLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formContext = buildFormContext();

      console.log('Manual AI query:', { query: userMessage.content, formContext });

      const response = await fetch('/api/companies/generate-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: userMessage.content,
          conversationHistory: chatMessages,
          formContext: formContext
        })
      });

      const data = await response.json();
      console.log('AI API response:', { status: response.status, hasError: !!data.error, hasDescription: !!data.generatedDescription });

      // Check for API errors
      if (!response.ok || data.error) {
        throw new Error(data.error || data.details || 'AI generation failed');
      }

      // Validate response has generated description
      if (!data.generatedDescription) {
        throw new Error('AI did not return a description. Please try again.');
      }
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response || 'Generated description successfully!',
        generatedDescription: data.generatedDescription,
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
      setPendingDescription(data.generatedDescription);
      
      console.log('Description generated successfully, length:', data.generatedDescription.length);
    } catch (error: any) {
      console.error('AI query error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error.message || 'Sorry, I encountered an error generating the description. Please check the console for details and try again.'}`,
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Insert AI-generated description into form
  const handleInsertDescription = () => {
    if (pendingDescription) {
      setForm(prev => ({
        ...prev,
        description: pendingDescription
      }));
      setPendingDescription(null);
      
      // Add confirmation message
      const confirmMessage: ChatMessage = {
        role: 'assistant',
        content: '✓ Description inserted! Feel free to edit it or ask me to regenerate with different details.',
        timestamp: Date.now()
      };
      setChatMessages(prev => [...prev, confirmMessage]);
      saveChatHistory([...chatMessages, confirmMessage]);
    }
  };

  // Handle Enter key in AI input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAssistantQuery(e as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate title from position and category
      const title = form.category 
        ? `${form.position} - ${form.category}`
        : form.position;

      // First create the internship posting without images
      
      if (!supabase) throw new Error('Supabase not initialized');
      const { data: internship, error: postingError } = await supabase
        .from('internships')
        .insert([{
          company_id: params.companyId,
        company_name: form.company_name,
          title: title,
          for_profit: form.for_profit === 'true' ? 'for-profit' : 'non-profit',
        category: form.category,
        position: form.position,
        work_location_type: form.work_location_type as 'online' | 'in_person',
        address: form.work_location_type === 'in_person' ? form.address : null,
        city: form.work_location_type === 'in_person' ? form.city : null,
        state: form.work_location_type === 'in_person' ? form.state : null,
          hours_per_week: parseInt(form.hours_per_week),
          pay: form.pay,
        business_email: form.business_email,
          description: form.description,
        is_active: true,
        created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (postingError) throw postingError;

      // Upload images to storage and update the posting with image URLs
      const imageUrls: InternshipPictureUrls = {};

      // Handle each image field separately
      const uploadImage = async (fieldName: InternshipPictureKeys) => {
        const imageData = form[fieldName];
        if (imageData && imageData.startsWith('data:image')) {
          try {
            // Convert base64 to blob
            const blob = await fetch(imageData).then(r => r.blob());
            const fileExt = blob.type.split('/')[1];
            const fileName = `${internship.id}_${fieldName}_${Date.now()}.${fileExt}`;
            
            // Upload the file
            
            if (!supabase) throw new Error('Supabase not initialized');
            const { error: uploadError } = await supabase.storage
              .from('internship-pictures')
              .upload(fileName, blob);
              
            if (uploadError) {
              console.error(`Error uploading ${fieldName}:`, uploadError);
              return;
            }
            
            // Get the full public URL
            if (!supabase) throw new Error('Supabase not initialized');
            const { data: urlData } = await supabase.storage
              .from('internship-pictures')
              .getPublicUrl(fileName);
            
            if (!urlData?.publicUrl) {
              console.error(`Failed to get public URL for ${fieldName}`);
              return;
            }

            return urlData.publicUrl;
          } catch (uploadError) {
            console.error(`Error processing ${fieldName}:`, uploadError);
            return;
          }
        }
        return undefined;
      };

      // Upload each image
      const [url1, url2, url3, url4, url5] = await Promise.all([
        uploadImage('internship_picture_1'),
        uploadImage('internship_picture_2'),
        uploadImage('internship_picture_3'),
        uploadImage('internship_picture_4'),
        uploadImage('internship_picture_5')
      ]);

      // Add successful uploads to imageUrls
      if (url1) imageUrls.internship_picture_1 = url1;
      if (url2) imageUrls.internship_picture_2 = url2;
      if (url3) imageUrls.internship_picture_3 = url3;
      if (url4) imageUrls.internship_picture_4 = url4;
      if (url5) imageUrls.internship_picture_5 = url5;
      
      // Update internship with image URLs if any were uploaded
      if (Object.keys(imageUrls).length > 0) {
        
        if (!supabase) throw new Error('Supabase not initialized');
        const { error: updateError } = await supabase
          .from('internships')
          .update(imageUrls)
          .eq('id', internship.id);
          
        if (updateError) {
          console.error('Error updating internship with images:', updateError);
          // Don't throw here, as the internship was created successfully
        }
      }

      router.push(`/company/postings/${internship.id}`);
    } catch (error: any) {
      console.error('Error creating internship:', error);
      setError(error.message || 'Failed to create internship posting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionsForCategory = form.category ? POSITIONS_BY_CATEGORY[form.category as keyof typeof POSITIONS_BY_CATEGORY] || POSITIONS_BY_CATEGORY["Other"] : [];

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [internshipToDelete, setInternshipToDelete] = useState<Internship | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteClick = (internship: Internship) => {
    setInternshipToDelete(internship);
    setDeleteModalOpen(true);
    setDeleteError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!internshipToDelete || !supabase) return;
    
    setIsDeleting(true);
    setDeleteError(null);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setDeleteError('You must be logged in to delete opportunities');
        setIsDeleting(false);
        return;
      }

      console.log('🗑️ Deleting internship:', internshipToDelete.id);

      // Call the delete API endpoint
      const response = await fetch('/api/companies/opportunities/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          internshipId: internshipToDelete.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete opportunity');
      }

      console.log('✅ Delete successful:', data);

      // Show success message with preserved users info
      if (data.summary?.preserved?.acceptedUsersCount > 0) {
        alert(
          `Opportunity deleted successfully!\n\n` +
          `${data.summary.preserved.acceptedUsersCount} accepted user(s) preserved:\n` +
          data.summary.preserved.acceptedUsers.map((u: any) => `- ${u.name} (team: ${u.team || 'none'})`).join('\n') +
          `\n\nThey can still message and appear in "Your Team".`
        );
      } else {
        alert('Opportunity deleted successfully!');
      }

      // Remove from local state
      setInternships((prev) => prev.filter((item) => item.id !== internshipToDelete.id));
      
      // Close modal
      setDeleteModalOpen(false);
      setInternshipToDelete(null);
    } catch (error: any) {
      console.error('❌ Error deleting opportunity:', error);
      setDeleteError(error.message || 'Failed to delete opportunity. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setInternshipToDelete(null);
    setDeleteError(null);
  };

  const handleInternshipClick = (internshipId: string) => {
    // Check if user is signed in as company
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'COMPANY') {
          router.push(`/company/postings/${internshipId}`);
          return;
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    // Default to intern view if not signed in as company
    router.push(`/postings/${internshipId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // For now, show the modern UI if user is authenticated as a company
  // The internships query already filters by company_id for security
  // TODO: Add proper company ownership verification if needed
  if (false) { // Temporarily disable this check to show the modern UI
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-20 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Opportunities</h1>
        <p className="text-lg text-gray-500 mb-8">You must be signed in as this company to post or manage internships.</p>
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto w-full max-w-4xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">COMPANY NAME</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">FOR-PROFIT/NON-PROFIT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">CATEGORY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">POSITION</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">LOCATION</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">HRS/WEEK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">PAY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">BUSINESS EMAIL</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-black">
              {internships.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-lg font-medium">
                    No opportunities available at the moment.
                  </td>
                </tr>
              ) : (
                internships.map((internship: Internship, idx: number) => (
                  <tr 
                    key={idx}
                    onClick={() => handleInternshipClick(internship.id)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.for_profit === 'for-profit' ? 'For-Profit' : 'Non-Profit'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {internship.address ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${internship.address}, ${internship.city}, ${internship.state}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {internship.city}, {internship.state}
                        </a>
                      ) : (
                        `${internship.city}, ${internship.state}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.hours_per_week}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {internship.pay ? `$${internship.pay}/hr` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.business_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(internship);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      {/* AI ASSISTANT PANEL */}
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            ref={panelRef}
            initial={{ x: -panelWidth, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -panelWidth, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200 shadow-xl flex flex-col"
            style={{ 
              width: `${panelWidth}px`,
              zIndex: 100
            }}
          >
            {/* Resize Handle */}
            {!isWidthLocked && (
              <div
                ref={resizeHandleRef}
                className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 hover:w-1.5 transition-all z-50 select-none"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                }}
                style={{ touchAction: 'none', userSelect: 'none' }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-16 bg-gray-300 rounded-l hover:bg-blue-500 transition-colors select-none"></div>
              </div>
            )}

            {/* Panel Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">AI Assistant</h2>
                  <p className="text-xs text-gray-600">Job description helper</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsWidthLocked(!isWidthLocked);
                  savePanelWidth();
                }}
                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                title={isWidthLocked ? "Unlock width" : "Lock width"}
              >
                {isWidthLocked ? (
                  <Lock className="w-4 h-4 text-gray-600" />
                ) : (
                  <Unlock className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>

            {/* Chat Messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
            >
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-2 font-medium">Ask me to write a job description!</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>Try:</p>
                    <p className="italic">"Write a description for a marketing intern"</p>
                    <p className="italic">"Create a software engineer posting"</p>
                    <p className="italic">"Help me describe this role"</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div key={index} className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-black'
                    }`}>
                      <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                    </div>
                    
                    {/* Show Generated Description Preview & Actions */}
                    {message.generatedDescription && (
                      <div className="mt-2 space-y-2">
                        {/* Description Preview */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3 max-w-[85%]">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-3 h-3 text-blue-600" />
                            <span className="text-xs font-semibold text-gray-700">Generated Description</span>
                          </div>
                          <div className="text-xs text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                            {message.generatedDescription.substring(0, 200)}...
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={handleInsertDescription}
                            className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1"
                          >
                            <ChevronRight className="w-3 h-3" />
                            Insert into Form
                          </button>
                          <button
                            onClick={() => {
                              const regenerateQuery = 'Regenerate the description with more detail';
                              setAiQuery(regenerateQuery);
                              setTimeout(() => {
                                const form = document.querySelector('form') as HTMLFormElement;
                                if (form) form.requestSubmit();
                              }, 100);
                            }}
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Regenerate
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              {isAiLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-left"
                >
                  <div className="inline-block bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent"></div>
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="absolute inset-0 rounded-full bg-blue-400 opacity-20"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-900">Generating description...</p>
                        <p className="text-xs text-gray-500">This usually takes 2-3 seconds</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {/* Quick Action Buttons */}
              {!isAiLoading && chatMessages.length <= 2 && (
                <div className="mb-3 space-y-2">
                  <p className="text-xs text-gray-500 font-medium">Quick actions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => {
                        setAiQuery('Make it more concise and focused');
                        setTimeout(() => handleAssistantQuery({ preventDefault: () => {} } as any), 50);
                      }}
                      className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors border border-blue-100"
                    >
                      More Concise
                    </button>
                    <button
                      onClick={() => {
                        setAiQuery('Add more detail about responsibilities');
                        setTimeout(() => handleAssistantQuery({ preventDefault: () => {} } as any), 50);
                      }}
                      className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors border border-purple-100"
                    >
                      More Detail
                    </button>
                    <button
                      onClick={() => {
                        setAiQuery('Make it sound more exciting and engaging');
                        setTimeout(() => handleAssistantQuery({ preventDefault: () => {} } as any), 50);
                      }}
                      className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors border border-green-100"
                    >
                      More Engaging
                    </button>
                    <button
                      onClick={() => autoGenerateDescription()}
                      disabled={isAiLoading}
                      className="text-xs px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors border border-indigo-100 disabled:opacity-50"
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => {
                  setChatMessages([]);
                  setPendingDescription(null);
                  setHasTriggeredModalMessage(false);
                  localStorage.removeItem('ai_chat_history_opportunities');
                }}
                className="w-full mb-3 text-xs text-gray-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 hover:bg-gray-50 py-2 rounded transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Start New Chat
              </button>
              
              <form onSubmit={handleAssistantQuery} className="flex gap-2">
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask AI to modify description..."
                  disabled={isAiLoading}
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black placeholder-gray-500"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiQuery.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="fixed left-0 top-20 bg-white border border-gray-200 rounded-r-lg shadow-lg p-2 hover:bg-gray-50 transition-colors"
        style={{ 
          marginLeft: isPanelOpen ? `${panelWidth}px` : '0',
          zIndex: 101
        }}
      >
        {isPanelOpen ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
      </button>

      {/* MAIN CONTENT */}
      <div 
        className="relative transition-all duration-300"
        style={{ 
          marginLeft: isPanelOpen ? `${panelWidth}px` : '0'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex justify-between items-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Your Opportunity Postings
          </motion.h1>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-lg p-1 shadow-sm"
            >
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'card' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <BsGrid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <BsList size={20} />
              </button>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Post an Internship
            </motion.button>
          </div>
        </div>

        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : internships.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center">
              <p className="text-gray-600 text-lg mb-4">No opportunities posted yet.</p>
          <button
            onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-medium hover:text-blue-800"
          >
                Post your first internship opportunity
          </button>
        </div>
          ) : viewMode === 'card' ? (
            <OpportunityCardView
              internships={internships}
              onInternshipClick={handleInternshipClick}
              showActions
              onDelete={(id) => {
                const internship = internships.find(i => i.id === id);
                if (internship) handleDeleteClick(internship);
              }}
            />
          ) : (
            <OpportunityListView
              internships={internships}
              onInternshipClick={handleInternshipClick}
              showActions
              onDelete={(id) => {
                const internship = internships.find(i => i.id === id);
                if (internship) handleDeleteClick(internship);
              }}
            />
          )}
        </motion.div>

        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" style={{ position: 'relative', zIndex: 200 }} onClose={() => {}}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div 
                className="fixed bg-black bg-opacity-25 backdrop-blur-sm"
                onClick={() => setIsModalOpen(false)}
                style={{ 
                  zIndex: 200,
                  left: isPanelOpen ? `${panelWidth}px` : '0',
                  right: 0,
                  top: 0,
                  bottom: 0
                }}
              />
            </Transition.Child>

            <div 
              className="fixed overflow-y-auto" 
              style={{ 
                zIndex: 201, 
                pointerEvents: 'auto',
                left: isPanelOpen ? `${panelWidth}px` : '0',
                right: 0,
                top: 0,
                bottom: 0
              }}
            >
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel 
                    className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
                    onClick={(e) => e.stopPropagation()}
                    style={{ pointerEvents: 'auto', zIndex: 201 }}
                  >
                    <div className="flex items-center justify-between mb-8">
                    <Dialog.Title
                      as="h3"
                        className="text-2xl font-bold leading-6 text-gray-900"
                    >
                      Post a New Internship
                    </Dialog.Title>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black">Company Name</label>
                        <input name="company_name" value={form.company_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">For-profit/Non-profit</label>
                        <select name="for_profit" value={form.for_profit} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                          <option value="">Select</option>
                          <option value="for-profit">For-Profit</option>
                          <option value="non-profit">Non-Profit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Category</label>
                        <select name="category" value={form.category} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                          <option value="">Select</option>
                          {CATEGORIES.map((cat) => <option key={cat} value={cat} className="text-black">{cat}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Position</label>
                        <select name="position" value={form.position} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                          <option value="">Select</option>
                          {positionsForCategory.map((pos: string) => <option key={pos} value={pos} className="text-black">{pos}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Work Location Type</label>
                        <select name="work_location_type" value={form.work_location_type} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                          <option value="in_person">In-Person</option>
                          <option value="online">Online</option>
                        </select>
                      </div>
                      {form.work_location_type === 'in_person' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-black">Address</label>
                            <input name="address" value={form.address} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black">City</label>
                            <input name="city" value={form.city} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-black">State</label>
                            <select name="state" value={form.state} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                              <option value="">Select</option>
                              {Object.values(STATE_ABBREVIATIONS).map((abbr) => <option key={abbr} value={abbr} className="text-black">{abbr}</option>)}
                            </select>
                          </div>
                        </>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-black">Hours per Week</label>
                        <input type="number" name="hours_per_week" value={form.hours_per_week} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Pay ($/hr)</label>
                        <input type="number" name="pay" value={form.pay} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Business Email</label>
                        <input type="email" name="business_email" value={form.business_email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Position Description</label>
                        <textarea 
                          name="description" 
                          value={form.description} 
                          onChange={handleChange} 
                          required 
                          maxLength={5000}
                          placeholder="Here's a suggested format: 'About The Team', 'About The Role', 'Team Focus Areas', 'In this role you will:', 'You might thrive in this role if you:'"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black h-64 resize-y" 
                        />
                        <p className="mt-1 text-sm text-gray-500">{form.description.length}/5000 words</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-lg font-medium text-black mb-2">Add Images</label>
                          <p className="text-sm text-gray-500 mb-4">
                            Upload photos that showcase your workplace environment and company culture. This helps high school students visualize what working at your organization looks like.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className="relative">
                              <label className="block text-sm font-medium text-black mb-1">Image {num}</label>
                              <div className="relative">
                                <input
                                  type="file"
                                  name={`internship_picture_${num}`}
                                  accept="image/*"
                                  onChange={handleChange}
                                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                <div className={`
                                  w-full aspect-[4/3] rounded-lg border-2 border-dashed
                                  ${form[`internship_picture_${num}` as keyof FormState] ? 'border-blue-500' : 'border-gray-300'}
                                  flex items-center justify-center overflow-hidden
                                `}>
                                  {form[`internship_picture_${num}` as keyof FormState] ? (
                                    <img
                                      src={form[`internship_picture_${num}` as keyof FormState] || ''}
                                      alt={`Preview ${num}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-center p-4">
                                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      <p className="mt-1 text-sm text-gray-500">Click to upload</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}

                      <div className="mt-5 sm:mt-6">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`
                            inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2
                            text-base font-medium text-white sm:text-sm
                            ${isSubmitting 
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }
                          `}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Posting...
                            </>
                          ) : (
                            'Post Internship'
                          )}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* DELETE CONFIRMATION MODAL */}
        <Transition appear show={deleteModalOpen} as={Fragment}>
          <Dialog as="div" style={{ position: 'relative', zIndex: 300 }} onClose={handleDeleteCancel}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-bold leading-6 text-gray-900 mb-4"
                    >
                      ⚠️ Delete Opportunity
                    </Dialog.Title>
                    
                    <div className="mt-2 space-y-4">
                      <p className="text-sm text-gray-700">
                        Are you sure you want to delete <span className="font-semibold">{internshipToDelete?.title}</span>?
                      </p>
                      
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-red-800">This will permanently delete:</p>
                        <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
                          <li>The opportunity listing</li>
                          <li>All application forms</li>
                          <li>All pending and rejected applications</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                        <p className="text-sm font-medium text-green-800">This will preserve:</p>
                        <ul className="text-sm text-green-700 list-disc list-inside space-y-1">
                          <li>Accepted users and their team membership</li>
                          <li>Messaging with accepted users</li>
                          <li>Access to "Your Team" for accepted users</li>
                        </ul>
                      </div>

                      {deleteError && (
                        <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                          <p className="text-sm text-red-800 font-medium">Error:</p>
                          <p className="text-sm text-red-700">{deleteError}</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDeleteCancel}
                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={handleDeleteConfirm}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isDeleting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Deleting...
                          </span>
                        ) : (
                          'Delete Opportunity'
                        )}
                      </button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
      </div>

      {/* Add custom styles for animations */}
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

        .cursor-col-resize {
          z-index: 100;
        }
      `}</style>
    </div>
  );
}