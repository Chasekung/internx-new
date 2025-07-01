'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      questions: []
    }
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        description: 'Section description',
        questions: []
      }
    ]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: Date.now().toString(),
              type: 'short_text',
              questionText: 'New Question',
              required: false
            }
          ]
        };
      }
      return section;
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          company_id: user.id,
          title: formTitle,
          description: formDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create sections and questions
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: form.id,
            title: section.title,
            description: section.description,
            order_index: sections.indexOf(section)
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create questions for this section
        for (const question of section.questions) {
          const { error: questionError } = await supabase
            .from('form_questions')
            .insert({
              section_id: sectionData.id,
              type: question.type,
              question_text: question.questionText,
              required: question.required,
              options: question.options ? JSON.stringify(question.options) : null,
              order_index: section.questions.indexOf(question)
            });

          if (questionError) throw questionError;
        }
      }

      router.push('/company/opportunities');
    } catch (error) {
      console.error('Error saving form:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Create Application Form</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ));
                }}
                className="text-xl font-semibold w-full border-none"
                placeholder="Section Title"
              />
              <textarea
                value={section.description}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, description: e.target.value } : s
                  ));
                }}
                className="mt-2 w-full border-none"
                placeholder="Section Description"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <div key={question.id} className="border border-gray-100 rounded p-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, questionText: e.target.value } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="w-full mb-2"
                    placeholder="Question Text"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, type: e.target.value as FormQuestion['type'] } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="mr-2"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file_upload">File Upload</option>
                    <option value="video_upload">Video Upload</option>
                  </select>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => {
                        setSections(sections.map(s => {
                          if (s.id === section.id) {
                            return {
                              ...s,
                              questions: s.questions.map(q =>
                                q.id === question.id ? { ...q, required: e.target.checked } : q
                              )
                            };
                          }
                          return s;
                        }));
                      }}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              ))}
              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={addSection}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      questions: []
    }
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        description: 'Section description',
        questions: []
      }
    ]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: Date.now().toString(),
              type: 'short_text',
              questionText: 'New Question',
              required: false
            }
          ]
        };
      }
      return section;
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          company_id: user.id,
          title: formTitle,
          description: formDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create sections and questions
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: form.id,
            title: section.title,
            description: section.description,
            order_index: sections.indexOf(section)
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create questions for this section
        for (const question of section.questions) {
          const { error: questionError } = await supabase
            .from('form_questions')
            .insert({
              section_id: sectionData.id,
              type: question.type,
              question_text: question.questionText,
              required: question.required,
              options: question.options ? JSON.stringify(question.options) : null,
              order_index: section.questions.indexOf(question)
            });

          if (questionError) throw questionError;
        }
      }

      router.push('/company/opportunities');
    } catch (error) {
      console.error('Error saving form:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Create Application Form</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ));
                }}
                className="text-xl font-semibold w-full border-none"
                placeholder="Section Title"
              />
              <textarea
                value={section.description}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, description: e.target.value } : s
                  ));
                }}
                className="mt-2 w-full border-none"
                placeholder="Section Description"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <div key={question.id} className="border border-gray-100 rounded p-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, questionText: e.target.value } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="w-full mb-2"
                    placeholder="Question Text"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, type: e.target.value as FormQuestion['type'] } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="mr-2"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file_upload">File Upload</option>
                    <option value="video_upload">Video Upload</option>
                  </select>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => {
                        setSections(sections.map(s => {
                          if (s.id === section.id) {
                            return {
                              ...s,
                              questions: s.questions.map(q =>
                                q.id === question.id ? { ...q, required: e.target.checked } : q
                              )
                            };
                          }
                          return s;
                        }));
                      }}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              ))}
              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={addSection}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      questions: []
    }
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        description: 'Section description',
        questions: []
      }
    ]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: Date.now().toString(),
              type: 'short_text',
              questionText: 'New Question',
              required: false
            }
          ]
        };
      }
      return section;
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          company_id: user.id,
          title: formTitle,
          description: formDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create sections and questions
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: form.id,
            title: section.title,
            description: section.description,
            order_index: sections.indexOf(section)
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create questions for this section
        for (const question of section.questions) {
          const { error: questionError } = await supabase
            .from('form_questions')
            .insert({
              section_id: sectionData.id,
              type: question.type,
              question_text: question.questionText,
              required: question.required,
              options: question.options ? JSON.stringify(question.options) : null,
              order_index: section.questions.indexOf(question)
            });

          if (questionError) throw questionError;
        }
      }

      router.push('/company/opportunities');
    } catch (error) {
      console.error('Error saving form:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Create Application Form</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ));
                }}
                className="text-xl font-semibold w-full border-none"
                placeholder="Section Title"
              />
              <textarea
                value={section.description}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, description: e.target.value } : s
                  ));
                }}
                className="mt-2 w-full border-none"
                placeholder="Section Description"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <div key={question.id} className="border border-gray-100 rounded p-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, questionText: e.target.value } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="w-full mb-2"
                    placeholder="Question Text"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, type: e.target.value as FormQuestion['type'] } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="mr-2"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file_upload">File Upload</option>
                    <option value="video_upload">Video Upload</option>
                  </select>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => {
                        setSections(sections.map(s => {
                          if (s.id === section.id) {
                            return {
                              ...s,
                              questions: s.questions.map(q =>
                                q.id === question.id ? { ...q, required: e.target.checked } : q
                              )
                            };
                          }
                          return s;
                        }));
                      }}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              ))}
              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={addSection}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      questions: []
    }
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        description: 'Section description',
        questions: []
      }
    ]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: Date.now().toString(),
              type: 'short_text',
              questionText: 'New Question',
              required: false
            }
          ]
        };
      }
      return section;
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          company_id: user.id,
          title: formTitle,
          description: formDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create sections and questions
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: form.id,
            title: section.title,
            description: section.description,
            order_index: sections.indexOf(section)
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create questions for this section
        for (const question of section.questions) {
          const { error: questionError } = await supabase
            .from('form_questions')
            .insert({
              section_id: sectionData.id,
              type: question.type,
              question_text: question.questionText,
              required: question.required,
              options: question.options ? JSON.stringify(question.options) : null,
              order_index: section.questions.indexOf(question)
            });

          if (questionError) throw questionError;
        }
      }

      router.push('/company/opportunities');
    } catch (error) {
      console.error('Error saving form:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Create Application Form</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ));
                }}
                className="text-xl font-semibold w-full border-none"
                placeholder="Section Title"
              />
              <textarea
                value={section.description}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, description: e.target.value } : s
                  ));
                }}
                className="mt-2 w-full border-none"
                placeholder="Section Description"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <div key={question.id} className="border border-gray-100 rounded p-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, questionText: e.target.value } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="w-full mb-2"
                    placeholder="Question Text"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, type: e.target.value as FormQuestion['type'] } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="mr-2"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file_upload">File Upload</option>
                    <option value="video_upload">Video Upload</option>
                  </select>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => {
                        setSections(sections.map(s => {
                          if (s.id === section.id) {
                            return {
                              ...s,
                              questions: s.questions.map(q =>
                                q.id === question.id ? { ...q, required: e.target.checked } : q
                              )
                            };
                          }
                          return s;
                        }));
                      }}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              ))}
              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={addSection}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      questions: []
    }
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        description: 'Section description',
        questions: []
      }
    ]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: Date.now().toString(),
              type: 'short_text',
              questionText: 'New Question',
              required: false
            }
          ]
        };
      }
      return section;
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          company_id: user.id,
          title: formTitle,
          description: formDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create sections and questions
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: form.id,
            title: section.title,
            description: section.description,
            order_index: sections.indexOf(section)
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create questions for this section
        for (const question of section.questions) {
          const { error: questionError } = await supabase
            .from('form_questions')
            .insert({
              section_id: sectionData.id,
              type: question.type,
              question_text: question.questionText,
              required: question.required,
              options: question.options ? JSON.stringify(question.options) : null,
              order_index: section.questions.indexOf(question)
            });

          if (questionError) throw questionError;
        }
      }

      router.push('/company/opportunities');
    } catch (error) {
      console.error('Error saving form:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Create Application Form</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ));
                }}
                className="text-xl font-semibold w-full border-none"
                placeholder="Section Title"
              />
              <textarea
                value={section.description}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, description: e.target.value } : s
                  ));
                }}
                className="mt-2 w-full border-none"
                placeholder="Section Description"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <div key={question.id} className="border border-gray-100 rounded p-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, questionText: e.target.value } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="w-full mb-2"
                    placeholder="Question Text"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, type: e.target.value as FormQuestion['type'] } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="mr-2"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file_upload">File Upload</option>
                    <option value="video_upload">Video Upload</option>
                  </select>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => {
                        setSections(sections.map(s => {
                          if (s.id === section.id) {
                            return {
                              ...s,
                              questions: s.questions.map(q =>
                                q.id === question.id ? { ...q, required: e.target.checked } : q
                              )
                            };
                          }
                          return s;
                        }));
                      }}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              ))}
              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={addSection}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      questions: []
    }
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        description: 'Section description',
        questions: []
      }
    ]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: Date.now().toString(),
              type: 'short_text',
              questionText: 'New Question',
              required: false
            }
          ]
        };
      }
      return section;
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          company_id: user.id,
          title: formTitle,
          description: formDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create sections and questions
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: form.id,
            title: section.title,
            description: section.description,
            order_index: sections.indexOf(section)
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create questions for this section
        for (const question of section.questions) {
          const { error: questionError } = await supabase
            .from('form_questions')
            .insert({
              section_id: sectionData.id,
              type: question.type,
              question_text: question.questionText,
              required: question.required,
              options: question.options ? JSON.stringify(question.options) : null,
              order_index: section.questions.indexOf(question)
            });

          if (questionError) throw questionError;
        }
      }

      router.push('/company/opportunities');
    } catch (error) {
      console.error('Error saving form:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Create Application Form</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ));
                }}
                className="text-xl font-semibold w-full border-none"
                placeholder="Section Title"
              />
              <textarea
                value={section.description}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, description: e.target.value } : s
                  ));
                }}
                className="mt-2 w-full border-none"
                placeholder="Section Description"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <div key={question.id} className="border border-gray-100 rounded p-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, questionText: e.target.value } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="w-full mb-2"
                    placeholder="Question Text"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, type: e.target.value as FormQuestion['type'] } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="mr-2"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file_upload">File Upload</option>
                    <option value="video_upload">Video Upload</option>
                  </select>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => {
                        setSections(sections.map(s => {
                          if (s.id === section.id) {
                            return {
                              ...s,
                              questions: s.questions.map(q =>
                                q.id === question.id ? { ...q, required: e.target.checked } : q
                              )
                            };
                          }
                          return s;
                        }));
                      }}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              ))}
              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={addSection}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      questions: []
    }
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        description: 'Section description',
        questions: []
      }
    ]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: Date.now().toString(),
              type: 'short_text',
              questionText: 'New Question',
              required: false
            }
          ]
        };
      }
      return section;
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          company_id: user.id,
          title: formTitle,
          description: formDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create sections and questions
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: form.id,
            title: section.title,
            description: section.description,
            order_index: sections.indexOf(section)
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create questions for this section
        for (const question of section.questions) {
          const { error: questionError } = await supabase
            .from('form_questions')
            .insert({
              section_id: sectionData.id,
              type: question.type,
              question_text: question.questionText,
              required: question.required,
              options: question.options ? JSON.stringify(question.options) : null,
              order_index: section.questions.indexOf(question)
            });

          if (questionError) throw questionError;
        }
      }

      router.push('/company/opportunities');
    } catch (error) {
      console.error('Error saving form:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Create Application Form</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ));
                }}
                className="text-xl font-semibold w-full border-none"
                placeholder="Section Title"
              />
              <textarea
                value={section.description}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, description: e.target.value } : s
                  ));
                }}
                className="mt-2 w-full border-none"
                placeholder="Section Description"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <div key={question.id} className="border border-gray-100 rounded p-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, questionText: e.target.value } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="w-full mb-2"
                    placeholder="Question Text"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, type: e.target.value as FormQuestion['type'] } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="mr-2"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file_upload">File Upload</option>
                    <option value="video_upload">Video Upload</option>
                  </select>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => {
                        setSections(sections.map(s => {
                          if (s.id === section.id) {
                            return {
                              ...s,
                              questions: s.questions.map(q =>
                                q.id === question.id ? { ...q, required: e.target.checked } : q
                              )
                            };
                          }
                          return s;
                        }));
                      }}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              ))}
              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={addSection}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/lib/supabaseClient';

interface FormSection {
  id: string;
  title: string;
  description: string;
  questions: FormQuestion[];
}

interface FormQuestion {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload' | 'video_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

export default function FormBuilder() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: '1',
      title: 'Basic Information',
      description: 'Please provide your basic information',
      questions: []
    }
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now().toString(),
        title: 'New Section',
        description: 'Section description',
        questions: []
      }
    ]);
  };

  const addQuestion = (sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: Date.now().toString(),
              type: 'short_text',
              questionText: 'New Question',
              required: false
            }
          ]
        };
      }
      return section;
    }));
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create the form
      const { data: form, error: formError } = await supabase
        .from('forms')
        .insert({
          company_id: user.id,
          title: formTitle,
          description: formDescription,
          status: 'draft'
        })
        .select()
        .single();

      if (formError) throw formError;

      // Create sections and questions
      for (const section of sections) {
        const { data: sectionData, error: sectionError } = await supabase
          .from('form_sections')
          .insert({
            form_id: form.id,
            title: section.title,
            description: section.description,
            order_index: sections.indexOf(section)
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        // Create questions for this section
        for (const question of section.questions) {
          const { error: questionError } = await supabase
            .from('form_questions')
            .insert({
              section_id: sectionData.id,
              type: question.type,
              question_text: question.questionText,
              required: question.required,
              options: question.options ? JSON.stringify(question.options) : null,
              order_index: section.questions.indexOf(question)
            });

          if (questionError) throw questionError;
        }
      }

      router.push('/company/opportunities');
    } catch (error) {
      console.error('Error saving form:', error);
      // Handle error (show toast notification, etc.)
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Create Application Form</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Form Description</label>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter form description"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <input
                type="text"
                value={section.title}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, title: e.target.value } : s
                  ));
                }}
                className="text-xl font-semibold w-full border-none"
                placeholder="Section Title"
              />
              <textarea
                value={section.description}
                onChange={(e) => {
                  setSections(sections.map(s => 
                    s.id === section.id ? { ...s, description: e.target.value } : s
                  ));
                }}
                className="mt-2 w-full border-none"
                placeholder="Section Description"
                rows={2}
              />
            </div>

            <div className="space-y-4">
              {section.questions.map((question) => (
                <div key={question.id} className="border border-gray-100 rounded p-3">
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, questionText: e.target.value } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="w-full mb-2"
                    placeholder="Question Text"
                  />
                  <select
                    value={question.type}
                    onChange={(e) => {
                      setSections(sections.map(s => {
                        if (s.id === section.id) {
                          return {
                            ...s,
                            questions: s.questions.map(q =>
                              q.id === question.id ? { ...q, type: e.target.value as FormQuestion['type'] } : q
                            )
                          };
                        }
                        return s;
                      }));
                    }}
                    className="mr-2"
                  >
                    <option value="short_text">Short Text</option>
                    <option value="long_text">Long Text</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="checkboxes">Checkboxes</option>
                    <option value="dropdown">Dropdown</option>
                    <option value="file_upload">File Upload</option>
                    <option value="video_upload">Video Upload</option>
                  </select>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) => {
                        setSections(sections.map(s => {
                          if (s.id === section.id) {
                            return {
                              ...s,
                              questions: s.questions.map(q =>
                                q.id === question.id ? { ...q, required: e.target.checked } : q
                              )
                            };
                          }
                          return s;
                        }));
                      }}
                      className="mr-2"
                    />
                    Required
                  </label>
                </div>
              ))}
              <button
                onClick={() => addQuestion(section.id)}
                className="text-blue-600 hover:text-blue-800"
              >
                + Add Question
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={addSection}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Add Section
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Form
        </button>
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 
 