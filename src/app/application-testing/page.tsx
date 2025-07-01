'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const mockApplicationData = {
  title: 'Software Engineering Internship Application',
  sections: [
    {
      title: 'Personal Information',
      description: 'Please provide your basic information',
      questions: [
        {
          id: 'name',
          type: 'text',
          label: 'Full Name',
          required: true,
          placeholder: 'Enter your full name'
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          placeholder: 'Enter your email address'
        }
      ]
    },
    {
      title: 'Education',
      description: 'Tell us about your educational background',
      questions: [
        {
          id: 'university',
          type: 'text',
          label: 'University/College',
          required: true,
          placeholder: 'Enter your university name'
        },
        {
          id: 'major',
          type: 'text',
          label: 'Major/Field of Study',
          required: true,
          placeholder: 'Enter your major'
        }
      ]
    }
  ]
};

export default function ApplicationTesting() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isPreview, setIsPreview] = useState(false);

  const validateSection = (sectionIndex: number): boolean => {
    const newErrors: { [key: string]: string } = {};
    const section = mockApplicationData.sections[sectionIndex];
    
    section.questions.forEach(question => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (questionId: string, value: string | string[] | File | null) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [questionId]: value
      };
      return newData;
    });
    
    // Clear error when user types
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (questionId: string, file: File) => {
    setUploadProgress(prev => ({ ...prev, [questionId]: 0 }));
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress(prev => ({ ...prev, [questionId]: i }));
    }

    handleInputChange(questionId, file);
  };

  const handleSubmit = async () => {
    // Validate all sections before submission
    let isValid = true;
    for (let i = 0; i < mockApplicationData.sections.length; i++) {
      if (!validateSection(i)) {
        setCurrentSection(i);
        isValid = false;
        break;
      }
    }

    if (!isValid) {
      return;
    }

    if (isPreview) {
      // Proceed with actual submission
      console.log('Form submitted:', formData);
      localStorage.removeItem('applicationDraft');
      alert('Application submitted successfully!');
      router.push('/dashboard');
    } else {
      // Show preview first
      setIsPreview(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {mockApplicationData.title}
        </h1>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {mockApplicationData.sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setCurrentSection(index)}
                className={`flex-1 text-sm font-medium ${
                  index === currentSection ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full transition-all duration-300"
              style={{
                width: `${((currentSection + 1) / mockApplicationData.sections.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Current section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {mockApplicationData.sections[currentSection].title}
          </h2>
          <p className="text-gray-600 mb-6">
            {mockApplicationData.sections[currentSection].description}
          </p>

          <div className="space-y-6">
            {mockApplicationData.sections[currentSection].questions.map((question) => (
              <div key={question.id}>
                <label
                  htmlFor={question.id}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {question.label}
                  {question.required && <span className="text-red-500">*</span>}
                </label>

                {question.type === 'text' || question.type === 'email' ? (
                  <input
                    type={question.type}
                    id={question.id}
                    value={formData[question.id] || ''}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    placeholder={question.placeholder}
                    className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${
                      errors[question.id]
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                    }`}
                  />
                ) : null}

                {errors[question.id] && (
                  <p className="mt-1 text-sm text-red-600">{errors[question.id]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setCurrentSection(currentSection - 1)}
            disabled={currentSection === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              currentSection === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Previous
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateSection(currentSection)) {
                if (currentSection === mockApplicationData.sections.length - 1) {
                  handleSubmit();
                } else {
                  setCurrentSection(currentSection + 1);
                }
              }
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            {currentSection === mockApplicationData.sections.length - 1
              ? (isPreview ? 'Submit Application' : 'Review Application')
              : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 