'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import supabase from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import { PlusIcon, TrashIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline';

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  question_text: string;
  options?: string[];
  required: boolean;
  order_index: number;
  validation_rules?: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
    custom_message?: string;
  };
  conditional_logic?: {
    show_if_question_id?: string;
    show_if_answer?: string | string[];
  };
}

interface Section {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  questions: Question[];
}

export default function FormBuilder({ 
  params: { companyId, formId } 
}: { 
  params: { companyId: string, formId: string } 
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sections, setSections] = useState<Section[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      order_index: 0,
      questions: [
        {
          id: '1',
          type: 'short_text',
          question_text: 'Full Name',
          required: true,
          order_index: 0
        },
        {
          id: '2',
          type: 'long_text',
          question_text: 'Tell us about yourself',
          required: true,
          order_index: 1
        }
      ]
    }
  ]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const questionTypes = [
    { value: 'short_text', label: 'Short Text' },
    { value: 'long_text', label: 'Long Text' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'checkboxes', label: 'Checkboxes' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'file_upload', label: 'File Upload' },
    { value: 'video_upload', label: 'Video Upload' }
  ];

  useEffect(() => {
    loadForm();
    setMounted(true);
  }, []);

  const loadForm = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's company ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get the company details to verify access
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('id')
        .eq('id', companyId)
        .single();

      if (companyError || !company) {
        notFound();
      }

      // Check if the form exists and belongs to this company
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

      // Load sections with questions
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
    setSections([...sections, newSection]);
  };

  const addQuestion = (sectionId: string) => {
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'short_text',
      question_text: 'New Question',
      required: false,
      order_index: sections[sectionIndex].questions.length
    };

    const newSections = [...sections];
    newSections[sectionIndex].questions.push(newQuestion);
    setSections(newSections);
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Form Header */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            placeholder="Form Title"
            className="text-2xl font-bold w-full border-0 focus:ring-0 p-0 mb-4 text-gray-900"
          />
          <textarea
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Form Description"
            className="w-full border-0 focus:ring-0 p-0 resize-none text-gray-900"
            rows={2}
          />
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="bg-white shadow-sm rounded-lg p-6">
              {/* Section Header */}
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
                  className="text-lg font-semibold border-0 focus:ring-0 p-0 text-gray-900"
                />
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <ArrowsUpDownIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-600">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
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
                className="w-full border-0 focus:ring-0 p-0 mb-6 resize-none text-gray-900"
                rows={2}
              />

              {/* Questions */}
              <div className="space-y-6">
                {section.questions.map((question, questionIndex) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
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
                          className="w-full border-0 focus:ring-0 p-0 mb-2 text-gray-900"
                        />
                        <select
                          value={question.type}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[sectionIndex].questions[questionIndex].type = e.target.value as Question['type'];
                            setSections(newSections);
                          }}
                          className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                        >
                          {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <ArrowsUpDownIcon className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600">
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center">
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
                ))}
                <button
                  onClick={() => addQuestion(section.id)}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Question
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Section Button */}
        <button
          onClick={addSection}
          className="mt-6 w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Section
        </button>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={() => {}}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Save Form
          </button>
        </div>
      </div>
    </div>
  );
} 