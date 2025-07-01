'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd components with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CompanyFormBuilder() {
  const [mounted, setMounted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [previewActiveSection, setPreviewActiveSection] = useState(0);

  const questionTypes = [
    { type: 'short_text' as const, label: 'Short Text', icon: '✍️' },
    { type: 'long_text' as const, label: 'Long Text', icon: '📝' },
    { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: '⭕' },
    { type: 'checkboxes' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown' as const, label: 'Dropdown', icon: '▼' },
    { type: 'file_upload' as const, label: 'File Upload', icon: '📎' }
  ] as const;

  // Initialize on mount
  useEffect(() => {
    const initialSection = {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Enter section description',
      questions: []
    };
    setSections([initialSection]);
    setActiveSection('section-1');
    setMounted(true);
  }, []);

  const addQuestion = (type: Question['type']) => {
    setSections(sections.map(section => {
      if (section.id === activeSection) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `question-${Date.now()}`,
              type,
              questionText: 'New Question',
              required: false,
              options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined
            }
          ]
        };
      }
      return section;
    }));
    setShowQuestionTypes(false);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    setSections(prevSections => {
      const newSections = [...prevSections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);

      if (!sourceSection || !destSection) {
        return prevSections;
      }

      const sourceQuestions = [...sourceSection.questions];
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same section
        sourceQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
      } else {
        // Moving between sections
        const destQuestions = [...destSection.questions];
        destQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
        destSection.questions = destQuestions;
      }

      return newSections;
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(sectionId, question.id, { questionText: e.target.value })}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 flex-grow"
            placeholder="Enter question text"
          />
          <button
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as Question['type'] })}
              className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {questionTypes.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Required</span>
            </label>
          </div>

          {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(sectionId, question.id, { options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="flex gap-6">
        {/* Left sidebar for section navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setPreviewActiveSection(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    previewActiveSection === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                      previewActiveSection === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main form content */}
        <div className="flex-grow max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Form header */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formTitle || 'Untitled Form'}</h2>
              <p className="text-gray-600">{formDescription || 'No description provided'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((previewActiveSection + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((previewActiveSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections[previewActiveSection].title}
                </h3>
                <p className="text-gray-600">
                  {sections[previewActiveSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {sections[previewActiveSection].questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <label className="block font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'short_text' && (
                      <input
                        type="text"
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long_text' && (
                      <textarea
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an option</option>
                        {question.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setPreviewActiveSection(Math.max(0, previewActiveSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={previewActiveSection === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewActiveSection(Math.min(sections.length - 1, previewActiveSection + 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === sections.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {previewActiveSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to render the form builder content
  const renderFormBuilder = () => {
    if (!mounted) return null;

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border ${
                activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
              } p-6`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    ));
                  }}
                  className="mt-2 w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } p-4`}
                  >
                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`bg-white rounded-lg border border-gray-200 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-4 cursor-move hover:bg-gray-50 border-r border-gray-200"
                                >
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-grow">
                                  {renderQuestionEditor(question, section.id)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <div className="mt-6">
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSection}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Section
        </button>
      </DragDropContext>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
              <p className="mt-2 text-gray-600">Loading form builder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
            <p className="mt-2 text-gray-600">Design your application form by adding and arranging questions</p>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isPreview ? 'Edit Form' : 'Preview Form'}</span>
          </button>
        </div>

        {!isPreview ? (
          mounted ? (
            renderFormBuilder()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form builder...</p>
            </div>
          )
        ) : (
          renderPreview()
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Question</h3>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd components with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CompanyFormBuilder() {
  const [mounted, setMounted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [previewActiveSection, setPreviewActiveSection] = useState(0);

  const questionTypes = [
    { type: 'short_text' as const, label: 'Short Text', icon: '✍️' },
    { type: 'long_text' as const, label: 'Long Text', icon: '📝' },
    { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: '⭕' },
    { type: 'checkboxes' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown' as const, label: 'Dropdown', icon: '▼' },
    { type: 'file_upload' as const, label: 'File Upload', icon: '📎' }
  ] as const;

  // Initialize on mount
  useEffect(() => {
    const initialSection = {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Enter section description',
      questions: []
    };
    setSections([initialSection]);
    setActiveSection('section-1');
    setMounted(true);
  }, []);

  const addQuestion = (type: Question['type']) => {
    setSections(sections.map(section => {
      if (section.id === activeSection) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `question-${Date.now()}`,
              type,
              questionText: 'New Question',
              required: false,
              options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined
            }
          ]
        };
      }
      return section;
    }));
    setShowQuestionTypes(false);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    setSections(prevSections => {
      const newSections = [...prevSections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);

      if (!sourceSection || !destSection) {
        return prevSections;
      }

      const sourceQuestions = [...sourceSection.questions];
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same section
        sourceQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
      } else {
        // Moving between sections
        const destQuestions = [...destSection.questions];
        destQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
        destSection.questions = destQuestions;
      }

      return newSections;
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(sectionId, question.id, { questionText: e.target.value })}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 flex-grow"
            placeholder="Enter question text"
          />
          <button
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as Question['type'] })}
              className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {questionTypes.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Required</span>
            </label>
          </div>

          {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(sectionId, question.id, { options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="flex gap-6">
        {/* Left sidebar for section navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setPreviewActiveSection(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    previewActiveSection === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                      previewActiveSection === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main form content */}
        <div className="flex-grow max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Form header */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formTitle || 'Untitled Form'}</h2>
              <p className="text-gray-600">{formDescription || 'No description provided'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((previewActiveSection + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((previewActiveSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections[previewActiveSection].title}
                </h3>
                <p className="text-gray-600">
                  {sections[previewActiveSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {sections[previewActiveSection].questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <label className="block font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'short_text' && (
                      <input
                        type="text"
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long_text' && (
                      <textarea
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an option</option>
                        {question.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setPreviewActiveSection(Math.max(0, previewActiveSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={previewActiveSection === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewActiveSection(Math.min(sections.length - 1, previewActiveSection + 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === sections.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {previewActiveSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to render the form builder content
  const renderFormBuilder = () => {
    if (!mounted) return null;

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border ${
                activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
              } p-6`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    ));
                  }}
                  className="mt-2 w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } p-4`}
                  >
                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`bg-white rounded-lg border border-gray-200 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-4 cursor-move hover:bg-gray-50 border-r border-gray-200"
                                >
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-grow">
                                  {renderQuestionEditor(question, section.id)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <div className="mt-6">
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSection}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Section
        </button>
      </DragDropContext>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
              <p className="mt-2 text-gray-600">Loading form builder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
            <p className="mt-2 text-gray-600">Design your application form by adding and arranging questions</p>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isPreview ? 'Edit Form' : 'Preview Form'}</span>
          </button>
        </div>

        {!isPreview ? (
          mounted ? (
            renderFormBuilder()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form builder...</p>
            </div>
          )
        ) : (
          renderPreview()
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Question</h3>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd components with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CompanyFormBuilder() {
  const [mounted, setMounted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [previewActiveSection, setPreviewActiveSection] = useState(0);

  const questionTypes = [
    { type: 'short_text' as const, label: 'Short Text', icon: '✍️' },
    { type: 'long_text' as const, label: 'Long Text', icon: '📝' },
    { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: '⭕' },
    { type: 'checkboxes' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown' as const, label: 'Dropdown', icon: '▼' },
    { type: 'file_upload' as const, label: 'File Upload', icon: '📎' }
  ] as const;

  // Initialize on mount
  useEffect(() => {
    const initialSection = {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Enter section description',
      questions: []
    };
    setSections([initialSection]);
    setActiveSection('section-1');
    setMounted(true);
  }, []);

  const addQuestion = (type: Question['type']) => {
    setSections(sections.map(section => {
      if (section.id === activeSection) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `question-${Date.now()}`,
              type,
              questionText: 'New Question',
              required: false,
              options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined
            }
          ]
        };
      }
      return section;
    }));
    setShowQuestionTypes(false);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    setSections(prevSections => {
      const newSections = [...prevSections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);

      if (!sourceSection || !destSection) {
        return prevSections;
      }

      const sourceQuestions = [...sourceSection.questions];
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same section
        sourceQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
      } else {
        // Moving between sections
        const destQuestions = [...destSection.questions];
        destQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
        destSection.questions = destQuestions;
      }

      return newSections;
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(sectionId, question.id, { questionText: e.target.value })}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 flex-grow"
            placeholder="Enter question text"
          />
          <button
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as Question['type'] })}
              className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {questionTypes.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Required</span>
            </label>
          </div>

          {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(sectionId, question.id, { options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="flex gap-6">
        {/* Left sidebar for section navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setPreviewActiveSection(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    previewActiveSection === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                      previewActiveSection === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main form content */}
        <div className="flex-grow max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Form header */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formTitle || 'Untitled Form'}</h2>
              <p className="text-gray-600">{formDescription || 'No description provided'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((previewActiveSection + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((previewActiveSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections[previewActiveSection].title}
                </h3>
                <p className="text-gray-600">
                  {sections[previewActiveSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {sections[previewActiveSection].questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <label className="block font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'short_text' && (
                      <input
                        type="text"
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long_text' && (
                      <textarea
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an option</option>
                        {question.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setPreviewActiveSection(Math.max(0, previewActiveSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={previewActiveSection === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewActiveSection(Math.min(sections.length - 1, previewActiveSection + 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === sections.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {previewActiveSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to render the form builder content
  const renderFormBuilder = () => {
    if (!mounted) return null;

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border ${
                activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
              } p-6`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    ));
                  }}
                  className="mt-2 w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } p-4`}
                  >
                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`bg-white rounded-lg border border-gray-200 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-4 cursor-move hover:bg-gray-50 border-r border-gray-200"
                                >
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-grow">
                                  {renderQuestionEditor(question, section.id)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <div className="mt-6">
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSection}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Section
        </button>
      </DragDropContext>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
              <p className="mt-2 text-gray-600">Loading form builder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
            <p className="mt-2 text-gray-600">Design your application form by adding and arranging questions</p>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isPreview ? 'Edit Form' : 'Preview Form'}</span>
          </button>
        </div>

        {!isPreview ? (
          mounted ? (
            renderFormBuilder()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form builder...</p>
            </div>
          )
        ) : (
          renderPreview()
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Question</h3>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd components with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CompanyFormBuilder() {
  const [mounted, setMounted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [previewActiveSection, setPreviewActiveSection] = useState(0);

  const questionTypes = [
    { type: 'short_text' as const, label: 'Short Text', icon: '✍️' },
    { type: 'long_text' as const, label: 'Long Text', icon: '📝' },
    { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: '⭕' },
    { type: 'checkboxes' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown' as const, label: 'Dropdown', icon: '▼' },
    { type: 'file_upload' as const, label: 'File Upload', icon: '📎' }
  ] as const;

  // Initialize on mount
  useEffect(() => {
    const initialSection = {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Enter section description',
      questions: []
    };
    setSections([initialSection]);
    setActiveSection('section-1');
    setMounted(true);
  }, []);

  const addQuestion = (type: Question['type']) => {
    setSections(sections.map(section => {
      if (section.id === activeSection) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `question-${Date.now()}`,
              type,
              questionText: 'New Question',
              required: false,
              options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined
            }
          ]
        };
      }
      return section;
    }));
    setShowQuestionTypes(false);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    setSections(prevSections => {
      const newSections = [...prevSections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);

      if (!sourceSection || !destSection) {
        return prevSections;
      }

      const sourceQuestions = [...sourceSection.questions];
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same section
        sourceQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
      } else {
        // Moving between sections
        const destQuestions = [...destSection.questions];
        destQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
        destSection.questions = destQuestions;
      }

      return newSections;
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(sectionId, question.id, { questionText: e.target.value })}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 flex-grow"
            placeholder="Enter question text"
          />
          <button
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as Question['type'] })}
              className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {questionTypes.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Required</span>
            </label>
          </div>

          {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(sectionId, question.id, { options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="flex gap-6">
        {/* Left sidebar for section navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setPreviewActiveSection(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    previewActiveSection === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                      previewActiveSection === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main form content */}
        <div className="flex-grow max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Form header */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formTitle || 'Untitled Form'}</h2>
              <p className="text-gray-600">{formDescription || 'No description provided'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((previewActiveSection + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((previewActiveSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections[previewActiveSection].title}
                </h3>
                <p className="text-gray-600">
                  {sections[previewActiveSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {sections[previewActiveSection].questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <label className="block font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'short_text' && (
                      <input
                        type="text"
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long_text' && (
                      <textarea
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an option</option>
                        {question.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setPreviewActiveSection(Math.max(0, previewActiveSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={previewActiveSection === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewActiveSection(Math.min(sections.length - 1, previewActiveSection + 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === sections.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {previewActiveSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to render the form builder content
  const renderFormBuilder = () => {
    if (!mounted) return null;

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border ${
                activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
              } p-6`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    ));
                  }}
                  className="mt-2 w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } p-4`}
                  >
                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`bg-white rounded-lg border border-gray-200 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-4 cursor-move hover:bg-gray-50 border-r border-gray-200"
                                >
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-grow">
                                  {renderQuestionEditor(question, section.id)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <div className="mt-6">
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSection}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Section
        </button>
      </DragDropContext>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
              <p className="mt-2 text-gray-600">Loading form builder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
            <p className="mt-2 text-gray-600">Design your application form by adding and arranging questions</p>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isPreview ? 'Edit Form' : 'Preview Form'}</span>
          </button>
        </div>

        {!isPreview ? (
          mounted ? (
            renderFormBuilder()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form builder...</p>
            </div>
          )
        ) : (
          renderPreview()
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Question</h3>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd components with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CompanyFormBuilder() {
  const [mounted, setMounted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [previewActiveSection, setPreviewActiveSection] = useState(0);

  const questionTypes = [
    { type: 'short_text' as const, label: 'Short Text', icon: '✍️' },
    { type: 'long_text' as const, label: 'Long Text', icon: '📝' },
    { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: '⭕' },
    { type: 'checkboxes' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown' as const, label: 'Dropdown', icon: '▼' },
    { type: 'file_upload' as const, label: 'File Upload', icon: '📎' }
  ] as const;

  // Initialize on mount
  useEffect(() => {
    const initialSection = {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Enter section description',
      questions: []
    };
    setSections([initialSection]);
    setActiveSection('section-1');
    setMounted(true);
  }, []);

  const addQuestion = (type: Question['type']) => {
    setSections(sections.map(section => {
      if (section.id === activeSection) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `question-${Date.now()}`,
              type,
              questionText: 'New Question',
              required: false,
              options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined
            }
          ]
        };
      }
      return section;
    }));
    setShowQuestionTypes(false);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    setSections(prevSections => {
      const newSections = [...prevSections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);

      if (!sourceSection || !destSection) {
        return prevSections;
      }

      const sourceQuestions = [...sourceSection.questions];
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same section
        sourceQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
      } else {
        // Moving between sections
        const destQuestions = [...destSection.questions];
        destQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
        destSection.questions = destQuestions;
      }

      return newSections;
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(sectionId, question.id, { questionText: e.target.value })}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 flex-grow"
            placeholder="Enter question text"
          />
          <button
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as Question['type'] })}
              className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {questionTypes.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Required</span>
            </label>
          </div>

          {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(sectionId, question.id, { options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="flex gap-6">
        {/* Left sidebar for section navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setPreviewActiveSection(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    previewActiveSection === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                      previewActiveSection === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main form content */}
        <div className="flex-grow max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Form header */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formTitle || 'Untitled Form'}</h2>
              <p className="text-gray-600">{formDescription || 'No description provided'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((previewActiveSection + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((previewActiveSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections[previewActiveSection].title}
                </h3>
                <p className="text-gray-600">
                  {sections[previewActiveSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {sections[previewActiveSection].questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <label className="block font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'short_text' && (
                      <input
                        type="text"
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long_text' && (
                      <textarea
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an option</option>
                        {question.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setPreviewActiveSection(Math.max(0, previewActiveSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={previewActiveSection === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewActiveSection(Math.min(sections.length - 1, previewActiveSection + 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === sections.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {previewActiveSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to render the form builder content
  const renderFormBuilder = () => {
    if (!mounted) return null;

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border ${
                activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
              } p-6`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    ));
                  }}
                  className="mt-2 w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } p-4`}
                  >
                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`bg-white rounded-lg border border-gray-200 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-4 cursor-move hover:bg-gray-50 border-r border-gray-200"
                                >
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-grow">
                                  {renderQuestionEditor(question, section.id)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <div className="mt-6">
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSection}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Section
        </button>
      </DragDropContext>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
              <p className="mt-2 text-gray-600">Loading form builder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
            <p className="mt-2 text-gray-600">Design your application form by adding and arranging questions</p>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isPreview ? 'Edit Form' : 'Preview Form'}</span>
          </button>
        </div>

        {!isPreview ? (
          mounted ? (
            renderFormBuilder()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form builder...</p>
            </div>
          )
        ) : (
          renderPreview()
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Question</h3>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd components with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CompanyFormBuilder() {
  const [mounted, setMounted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [previewActiveSection, setPreviewActiveSection] = useState(0);

  const questionTypes = [
    { type: 'short_text' as const, label: 'Short Text', icon: '✍️' },
    { type: 'long_text' as const, label: 'Long Text', icon: '📝' },
    { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: '⭕' },
    { type: 'checkboxes' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown' as const, label: 'Dropdown', icon: '▼' },
    { type: 'file_upload' as const, label: 'File Upload', icon: '📎' }
  ] as const;

  // Initialize on mount
  useEffect(() => {
    const initialSection = {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Enter section description',
      questions: []
    };
    setSections([initialSection]);
    setActiveSection('section-1');
    setMounted(true);
  }, []);

  const addQuestion = (type: Question['type']) => {
    setSections(sections.map(section => {
      if (section.id === activeSection) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `question-${Date.now()}`,
              type,
              questionText: 'New Question',
              required: false,
              options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined
            }
          ]
        };
      }
      return section;
    }));
    setShowQuestionTypes(false);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    setSections(prevSections => {
      const newSections = [...prevSections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);

      if (!sourceSection || !destSection) {
        return prevSections;
      }

      const sourceQuestions = [...sourceSection.questions];
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same section
        sourceQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
      } else {
        // Moving between sections
        const destQuestions = [...destSection.questions];
        destQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
        destSection.questions = destQuestions;
      }

      return newSections;
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(sectionId, question.id, { questionText: e.target.value })}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 flex-grow"
            placeholder="Enter question text"
          />
          <button
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as Question['type'] })}
              className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {questionTypes.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Required</span>
            </label>
          </div>

          {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(sectionId, question.id, { options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="flex gap-6">
        {/* Left sidebar for section navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setPreviewActiveSection(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    previewActiveSection === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                      previewActiveSection === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main form content */}
        <div className="flex-grow max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Form header */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formTitle || 'Untitled Form'}</h2>
              <p className="text-gray-600">{formDescription || 'No description provided'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((previewActiveSection + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((previewActiveSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections[previewActiveSection].title}
                </h3>
                <p className="text-gray-600">
                  {sections[previewActiveSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {sections[previewActiveSection].questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <label className="block font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'short_text' && (
                      <input
                        type="text"
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long_text' && (
                      <textarea
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an option</option>
                        {question.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setPreviewActiveSection(Math.max(0, previewActiveSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={previewActiveSection === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewActiveSection(Math.min(sections.length - 1, previewActiveSection + 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === sections.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {previewActiveSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to render the form builder content
  const renderFormBuilder = () => {
    if (!mounted) return null;

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border ${
                activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
              } p-6`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    ));
                  }}
                  className="mt-2 w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } p-4`}
                  >
                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`bg-white rounded-lg border border-gray-200 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-4 cursor-move hover:bg-gray-50 border-r border-gray-200"
                                >
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-grow">
                                  {renderQuestionEditor(question, section.id)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <div className="mt-6">
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSection}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Section
        </button>
      </DragDropContext>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
              <p className="mt-2 text-gray-600">Loading form builder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
            <p className="mt-2 text-gray-600">Design your application form by adding and arranging questions</p>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isPreview ? 'Edit Form' : 'Preview Form'}</span>
          </button>
        </div>

        {!isPreview ? (
          mounted ? (
            renderFormBuilder()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form builder...</p>
            </div>
          )
        ) : (
          renderPreview()
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Question</h3>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd components with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CompanyFormBuilder() {
  const [mounted, setMounted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [previewActiveSection, setPreviewActiveSection] = useState(0);

  const questionTypes = [
    { type: 'short_text' as const, label: 'Short Text', icon: '✍️' },
    { type: 'long_text' as const, label: 'Long Text', icon: '📝' },
    { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: '⭕' },
    { type: 'checkboxes' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown' as const, label: 'Dropdown', icon: '▼' },
    { type: 'file_upload' as const, label: 'File Upload', icon: '📎' }
  ] as const;

  // Initialize on mount
  useEffect(() => {
    const initialSection = {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Enter section description',
      questions: []
    };
    setSections([initialSection]);
    setActiveSection('section-1');
    setMounted(true);
  }, []);

  const addQuestion = (type: Question['type']) => {
    setSections(sections.map(section => {
      if (section.id === activeSection) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `question-${Date.now()}`,
              type,
              questionText: 'New Question',
              required: false,
              options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined
            }
          ]
        };
      }
      return section;
    }));
    setShowQuestionTypes(false);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    setSections(prevSections => {
      const newSections = [...prevSections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);

      if (!sourceSection || !destSection) {
        return prevSections;
      }

      const sourceQuestions = [...sourceSection.questions];
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same section
        sourceQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
      } else {
        // Moving between sections
        const destQuestions = [...destSection.questions];
        destQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
        destSection.questions = destQuestions;
      }

      return newSections;
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(sectionId, question.id, { questionText: e.target.value })}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 flex-grow"
            placeholder="Enter question text"
          />
          <button
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as Question['type'] })}
              className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {questionTypes.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Required</span>
            </label>
          </div>

          {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(sectionId, question.id, { options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="flex gap-6">
        {/* Left sidebar for section navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setPreviewActiveSection(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    previewActiveSection === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                      previewActiveSection === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main form content */}
        <div className="flex-grow max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Form header */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formTitle || 'Untitled Form'}</h2>
              <p className="text-gray-600">{formDescription || 'No description provided'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((previewActiveSection + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((previewActiveSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections[previewActiveSection].title}
                </h3>
                <p className="text-gray-600">
                  {sections[previewActiveSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {sections[previewActiveSection].questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <label className="block font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'short_text' && (
                      <input
                        type="text"
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long_text' && (
                      <textarea
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an option</option>
                        {question.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setPreviewActiveSection(Math.max(0, previewActiveSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={previewActiveSection === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewActiveSection(Math.min(sections.length - 1, previewActiveSection + 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === sections.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {previewActiveSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to render the form builder content
  const renderFormBuilder = () => {
    if (!mounted) return null;

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border ${
                activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
              } p-6`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    ));
                  }}
                  className="mt-2 w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } p-4`}
                  >
                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`bg-white rounded-lg border border-gray-200 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-4 cursor-move hover:bg-gray-50 border-r border-gray-200"
                                >
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-grow">
                                  {renderQuestionEditor(question, section.id)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <div className="mt-6">
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSection}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Section
        </button>
      </DragDropContext>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
              <p className="mt-2 text-gray-600">Loading form builder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
            <p className="mt-2 text-gray-600">Design your application form by adding and arranging questions</p>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isPreview ? 'Edit Form' : 'Preview Form'}</span>
          </button>
        </div>

        {!isPreview ? (
          mounted ? (
            renderFormBuilder()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form builder...</p>
            </div>
          )
        ) : (
          renderPreview()
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Question</h3>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { DropResult, DraggableProvided, DroppableProvided, DraggableStateSnapshot, DroppableStateSnapshot } from 'react-beautiful-dnd';

// Dynamically import react-beautiful-dnd components with ssr disabled
const DragDropContext = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('react-beautiful-dnd').then(mod => mod.Draggable),
  { ssr: false }
);

interface Question {
  id: string;
  type: 'short_text' | 'long_text' | 'multiple_choice' | 'checkboxes' | 'dropdown' | 'file_upload';
  questionText: string;
  required: boolean;
  options?: string[];
}

interface Section {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export default function CompanyFormBuilder() {
  const [mounted, setMounted] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [isPreview, setIsPreview] = useState(false);
  const [showQuestionTypes, setShowQuestionTypes] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [previewActiveSection, setPreviewActiveSection] = useState(0);

  const questionTypes = [
    { type: 'short_text' as const, label: 'Short Text', icon: '✍️' },
    { type: 'long_text' as const, label: 'Long Text', icon: '📝' },
    { type: 'multiple_choice' as const, label: 'Multiple Choice', icon: '⭕' },
    { type: 'checkboxes' as const, label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown' as const, label: 'Dropdown', icon: '▼' },
    { type: 'file_upload' as const, label: 'File Upload', icon: '📎' }
  ] as const;

  // Initialize on mount
  useEffect(() => {
    const initialSection = {
      id: 'section-1',
      title: 'Basic Information',
      description: 'Enter section description',
      questions: []
    };
    setSections([initialSection]);
    setActiveSection('section-1');
    setMounted(true);
  }, []);

  const addQuestion = (type: Question['type']) => {
    setSections(sections.map(section => {
      if (section.id === activeSection) {
        return {
          ...section,
          questions: [
            ...section.questions,
            {
              id: `question-${Date.now()}`,
              type,
              questionText: 'New Question',
              required: false,
              options: type === 'multiple_choice' || type === 'checkboxes' || type === 'dropdown' 
                ? ['Option 1', 'Option 2', 'Option 3'] 
                : undefined
            }
          ]
        };
      }
      return section;
    }));
    setShowQuestionTypes(false);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      description: 'Enter section description',
      questions: []
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    if (!destination) {
      return;
    }

    setSections(prevSections => {
      const newSections = [...prevSections];
      const sourceSection = newSections.find(s => s.id === source.droppableId);
      const destSection = newSections.find(s => s.id === destination.droppableId);

      if (!sourceSection || !destSection) {
        return prevSections;
      }

      const sourceQuestions = [...sourceSection.questions];
      const [movedQuestion] = sourceQuestions.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        // Moving within the same section
        sourceQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
      } else {
        // Moving between sections
        const destQuestions = [...destSection.questions];
        destQuestions.splice(destination.index, 0, movedQuestion);
        sourceSection.questions = sourceQuestions;
        destSection.questions = destQuestions;
      }

      return newSections;
    });
  };

  const updateQuestion = (sectionId: string, questionId: string, updates: Partial<Question>) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map(q => 
            q.id === questionId ? { ...q, ...updates } : q
          )
        };
      }
      return section;
    }));
  };

  const deleteQuestion = (sectionId: string, questionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter(q => q.id !== questionId)
        };
      }
      return section;
    }));
  };

  const renderQuestionEditor = (question: Question, sectionId: string) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex justify-between items-start mb-4">
          <input
            type="text"
            value={question.questionText}
            onChange={(e) => updateQuestion(sectionId, question.id, { questionText: e.target.value })}
            className="text-lg font-medium text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1 flex-grow"
            placeholder="Enter question text"
          />
          <button
            onClick={() => deleteQuestion(sectionId, question.id)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <select
              value={question.type}
              onChange={(e) => updateQuestion(sectionId, question.id, { type: e.target.value as Question['type'] })}
              className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              {questionTypes.map(({ type, label }) => (
                <option key={type} value={type}>{label}</option>
              ))}
            </select>
            <label className="flex items-center space-x-2 text-sm text-gray-900">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => updateQuestion(sectionId, question.id, { required: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Required</span>
            </label>
          </div>

          {(question.type === 'multiple_choice' || question.type === 'checkboxes' || question.type === 'dropdown') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Options:</p>
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(question.options || [])];
                      newOptions[index] = e.target.value;
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 text-sm flex-grow"
                    placeholder={`Option ${index + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newOptions = question.options?.filter((_, i) => i !== index);
                      updateQuestion(sectionId, question.id, { options: newOptions });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newOptions = [...(question.options || []), ''];
                  updateQuestion(sectionId, question.id, { options: newOptions });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Add Option
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    return (
      <div className="flex gap-6">
        {/* Left sidebar for section navigation */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
            <div className="space-y-2">
              {sections.map((section, index) => (
                <button
                  key={section.id}
                  onClick={() => setPreviewActiveSection(index)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    previewActiveSection === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm mr-3 ${
                      previewActiveSection === index
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="truncate">{section.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main form content */}
        <div className="flex-grow max-w-3xl">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Form header */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{formTitle || 'Untitled Form'}</h2>
              <p className="text-gray-600">{formDescription || 'No description provided'}</p>
            </div>

            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(((previewActiveSection + 1) / sections.length) * 100)}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${((previewActiveSection + 1) / sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Active section */}
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {sections[previewActiveSection].title}
                </h3>
                <p className="text-gray-600">
                  {sections[previewActiveSection].description}
                </p>
              </div>

              <div className="space-y-8">
                {sections[previewActiveSection].questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                    <label className="block font-medium text-gray-900 mb-4">
                      {question.questionText}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'short_text' && (
                      <input
                        type="text"
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'long_text' && (
                      <textarea
                        className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        placeholder="Enter your answer"
                      />
                    )}

                    {question.type === 'multiple_choice' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkboxes' && (
                      <div className="space-y-3">
                        {question.options?.map((option, index) => (
                          <label key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'dropdown' && (
                      <select className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option value="">Select an option</option>
                        {question.options?.map((option, index) => (
                          <option key={index} value={option}>{option}</option>
                        ))}
                      </select>
                    )}

                    {question.type === 'file_upload' && (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                        <div className="mb-4">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                            <span>Upload a file</span>
                            <input type="file" className="sr-only" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX up to 10MB</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setPreviewActiveSection(Math.max(0, previewActiveSection - 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  disabled={previewActiveSection === 0}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPreviewActiveSection(Math.min(sections.length - 1, previewActiveSection + 1))}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    previewActiveSection === sections.length - 1
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {previewActiveSection === sections.length - 1 ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this new function to render the form builder content
  const renderFormBuilder = () => {
    if (!mounted) return null;

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Form Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                placeholder="Enter form title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Form Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full text-gray-900 border border-gray-300 rounded-lg px-4 py-2"
                rows={3}
                placeholder="Enter form description"
              />
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`bg-white rounded-lg shadow-sm border ${
                activeSection === section.id ? 'border-blue-500' : 'border-gray-200'
              } p-6`}
              onClick={() => setActiveSection(section.id)}
            >
              <div className="mb-6">
                <input
                  type="text"
                  value={section.title}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, title: e.target.value } : s
                    ));
                  }}
                  className="text-xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section title"
                />
                <textarea
                  value={section.description}
                  onChange={(e) => {
                    setSections(sections.map(s =>
                      s.id === section.id ? { ...s, description: e.target.value } : s
                    ));
                  }}
                  className="mt-2 w-full text-gray-700 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                  placeholder="Enter section description"
                  rows={2}
                />
              </div>

              <Droppable droppableId={section.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[100px] rounded-lg transition-colors ${
                      snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-gray-50'
                    } p-4`}
                  >
                    <div className="space-y-4">
                      {section.questions.map((question, index) => (
                        <Draggable
                          key={question.id}
                          draggableId={question.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={provided.draggableProps.style}
                              className={`bg-white rounded-lg border border-gray-200 ${
                                snapshot.isDragging ? 'shadow-lg' : ''
                              }`}
                            >
                              <div className="flex items-center">
                                <div
                                  {...provided.dragHandleProps}
                                  className="p-4 cursor-move hover:bg-gray-50 border-r border-gray-200"
                                >
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                                  </svg>
                                </div>
                                <div className="flex-grow">
                                  {renderQuestionEditor(question, section.id)}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>

              <div className="mt-6">
                <button
                  onClick={() => setShowQuestionTypes(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Question</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSection}
          className="w-full mt-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
        >
          + Add Section
        </button>
      </DragDropContext>
    );
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
              <p className="mt-2 text-gray-600">Loading form builder...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Application Form</h1>
            <p className="mt-2 text-gray-600">Design your application form by adding and arranging questions</p>
          </div>
          <button
            onClick={() => setIsPreview(!isPreview)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{isPreview ? 'Edit Form' : 'Preview Form'}</span>
          </button>
        </div>

        {!isPreview ? (
          mounted ? (
            renderFormBuilder()
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading form builder...</p>
            </div>
          )
        ) : (
          renderPreview()
        )}

        {/* Question Types Modal */}
        {showQuestionTypes && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Question</h3>
                <button
                  onClick={() => setShowQuestionTypes(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {questionTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => addQuestion(type)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <span className="text-2xl mb-2 block">{icon}</span>
                    <span className="font-medium text-gray-900">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
 
 
 
 
 
 
 
 
 
 
 
 