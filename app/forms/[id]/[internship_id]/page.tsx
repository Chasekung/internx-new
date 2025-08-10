'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

interface FormData {
  id: string;
  title: string;
  description: string;
  primary_color: number | null;
  background_color: number | null;
  font_family: string;
  border_radius: number | null;
  spacing: number | null;
  accepting_responses: boolean;
  form_privacy: 'public' | 'private' | 'organization';
  published: boolean;
  published_at: string | null;
  share_url: string | null;
}

interface Section {
  id: string;
  title: string;
  description: string;
  order_index: number;
  questions: Question[];
}

interface Question {
  id: string;
  type: string;
  question_text: string;
  required: boolean;
  order_index: number;
  description: string;
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export default function PublicForm({ params: { id, internship_id } }: { params: { id: string, internship_id: string } }) {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [responses, setResponses] = useState<Record<string, any>>({});
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { supabase, error: supabaseError } = useSupabase();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      setIsLoading(true);
      
      // First, verify that the application exists and check its status
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .select('internship_id, status, intern_id')
        .eq('id', id)
        .eq('internship_id', internship_id)
        .single();

      if (applicationError || !application) {
        toast.error('Application not found');
        return;
      }

      // Check if current user owns this application
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || application.intern_id !== user.id) {
        toast.error('You are not authorized to access this application');
        return;
      }

      // If application is already submitted, redirect to a submitted page or show message
      if (application.status === 'submitted') {
        toast.success('This application has already been submitted!');
        setIsSubmitted(true);
        setCurrentStep(999); // Set to a high number to show thank you page
        return;
      }

      // Now find the form associated with this internship
      const { data: form, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('internship_id', application.internship_id)
        .eq('published', true)
        .single();

      if (formError || !form) {
        toast.error('Form not found or not published');
        return;
      }

      setFormData(form);

      // Load sections and questions
      const res = await fetch(`/api/companies/forms/${form.id}/questions`);
      if (!res.ok) throw new Error('Failed to fetch form questions');
      const { sections: apiSections } = await res.json();
      
      // Map API response to local Section/Question structure with proper options extraction
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
          
          return {
            id: q.id,
            type: q.type,
            question_text: q.question_text,
            description: q.description,
            required: q.required,
            order_index: q.order_index,
            placeholder: q.placeholder,
            hint: q.hint,
            options
          };
        })
      }));
      
      setSections(formattedSections);

    } catch (error) {
      console.error('Error loading form data:', error);
      toast.error('Failed to load form data');
    } finally {
      setIsLoading(false);
    }
  };

  const theme = {
    primaryColor: formData?.primary_color !== null ? `#${formData?.primary_color?.toString(16).padStart(6, '0')}` : '#3b82f6',
    backgroundColor: formData?.background_color !== null ? `#${formData?.background_color?.toString(16).padStart(6, '0')}` : '#ffffff',
    fontFamily: formData?.font_family || 'Inter',
    borderRadius: formData?.border_radius ?? 8,
    spacing: formData?.spacing ?? 16
  };

  // Create allSections with thank you section appended
  const thankYouSection = {
    id: 'thank-you',
    title: '',
    description: '',
    order_index: sections.length,
    questions: []
  };
  const allSections = [...sections, thankYouSection];

  // Function to check if current section is completed
  const isSectionCompleted = (sectionIndex: number) => {
    if (sectionIndex >= allSections.length - 1) return true; // Thank you section is always "completed"
    
    const section = allSections[sectionIndex];
    if (!section || !section.questions) return true;
    
    // Check if all required questions in this section are answered
    return section.questions.every(question => {
      if (!question.required) return true; // Optional questions don't block progress
      
      const response = responses[question.id];
      
      // Check based on question type
      switch (question.type) {
        case 'short_text':
        case 'long_text':
        case 'dropdown':
          return response && response.trim() !== '';
        case 'multiple_choice':
          return response && response !== '';
        case 'checkboxes':
          return Array.isArray(response) && response.length > 0;
        case 'file_upload':
        case 'video_upload':
          return response !== undefined && response !== null;
        default:
          return true;
      }
    });
  };

  // Multi-step form navigation functions
  const nextStep = () => {
    // Check if current section is completed before allowing next step
    if (!isSectionCompleted(currentStep)) {
      toast.error('Please complete all required fields before proceeding to the next section.');
      return;
    }
    
    if (currentStep < allSections.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    // High schoolers can only go to steps they've completed or the next step
    // Check if all previous sections are completed
    for (let i = 0; i < step; i++) {
      if (!isSectionCompleted(i)) {
        toast.error('Please complete all previous sections before jumping ahead.');
        return;
      }
    }
    
    if (step <= currentStep + 1) {
      setCurrentStep(step);
    }
  };

  const handleInputChange = (questionId: string, value: any) => {
    console.log('📝 Input change detected:', { questionId, value, type: typeof value });
    
    setResponses(prev => {
      const newResponses = {
        ...prev,
        [questionId]: value
      };
      console.log('📊 Updated responses state:', newResponses);
      return newResponses;
    });
  };

  // Test function to verify data URLs work correctly
  const testDataUrl = (dataUrl: string) => {
    console.log('🧪 Testing data URL:', {
      isValid: dataUrl.startsWith('data:'),
      length: dataUrl.length,
      mimeType: dataUrl.split(';')[0],
      canDisplay: true
    });
    
    // Create a test link to verify the data URL works
    const testLink = document.createElement('a');
    testLink.href = dataUrl;
    testLink.download = 'test-file';
    testLink.textContent = 'Test Data URL';
    testLink.style.display = 'block';
    testLink.style.color = 'blue';
    testLink.style.textDecoration = 'underline';
    testLink.style.margin = '10px';
    
    console.log('🔗 Data URL test link created. Check if it can be downloaded.');
    
    // You can also test by creating an image element
    if (dataUrl.startsWith('data:image/')) {
      const testImg = document.createElement('img');
      testImg.src = dataUrl;
      testImg.style.maxWidth = '100px';
      testImg.style.maxHeight = '100px';
      testImg.style.border = '1px solid green';
      testImg.style.margin = '10px';
      
      console.log('🖼️ Data URL image element created. Check if it displays properly.');
    }
  };

  const handleFileUpload = async (questionId: string, file: File, isVideo: boolean = false) => {
    console.log('📎 File upload detected:', { 
      questionId, 
      fileName: file.name, 
      fileSize: file.size, 
      fileSizeMB: Math.round(file.size / 1024 / 1024),
      fileType: file.type,
      isVideo 
    });
    
    try {
      // Check for browser/JavaScript limitations with large files
      if (file.size > 500 * 1024 * 1024) { // 500MB
        console.warn('⚠️ Very large file detected - this may cause browser limitations');
        console.log('🔍 Browser memory check:', {
          availableMemory: (performance as any).memory?.usedJSHeapSize || 'Unknown',
          fileSize: file.size
        });
      }
      
      // Check authentication before upload
      console.log('🔐 Checking user authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('You must be signed in to upload files');
      }
      console.log('✅ User authenticated for upload:', user.id);
      
      // Check file size (10MB for files, 1GB for videos)
      console.log('📏 Checking file size limits...');
      const maxSize = isVideo ? 1073741824 : 10485760;
      const maxSizeMB = isVideo ? 1000 : 10;
      
      console.log('📊 Size validation:', {
        fileSize: file.size,
        fileSizeMB: Math.round(file.size / 1024 / 1024),
        maxSize: maxSize,
        maxSizeMB: maxSizeMB,
        isWithinLimit: file.size <= maxSize
      });
      
      if (file.size > maxSize) {
        throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds the ${maxSizeMB}MB limit.`);
      }

      console.log('✅ File size validation passed');

      // Additional validation checks
      console.log('🔍 Performing additional validation checks...');
      
      if (!file.name || file.name.trim() === '') {
        throw new Error('Invalid file: File name is empty');
      }
      
      if (file.size === 0) {
        throw new Error('Invalid file: File is empty (0 bytes)');
      }
      
      if (!file.type && !file.name.includes('.')) {
        throw new Error('Invalid file: No file type or extension detected');
      }
      
      console.log('✅ Additional validation checks passed');

      console.log(`🔄 Uploading ${isVideo ? 'video' : 'file'} to Supabase storage (mime types fixed!)...`);
      
      // Upload file to storage using proper buckets with user ID in path
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown';
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
      const fileName = `${user.id}/${questionId}_${timestamp}_${safeName}`;
      const bucketName = isVideo ? 'application-videos' : 'application-files';
      
      console.log('📤 Uploading file to storage:', { 
        bucketName, 
        fileName, 
        fileSize: file.size,
        maxSize,
        isVideo
      });

      console.log('⬆️ Starting file upload...');
      
      // Create a timeout promise for large files
      const uploadWithTimeout = async (uploadPromise: Promise<any>, timeoutMs: number) => {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Upload timeout after ${timeoutMs/1000} seconds`)), timeoutMs);
        });
        
        return Promise.race([uploadPromise, timeoutPromise]);
      };
      
      // Use different upload strategies based on file size
      let uploadError, uploadData;
      
      if (file.size > 100 * 1024 * 1024) { // 100MB+
        console.log('📦 Large file detected - using optimized upload settings');
        
        // For very large files, use longer timeout and optimized settings
        const uploadPromise = supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '31536000', // 1 year cache for large files
            upsert: true,
            duplex: 'half' // Optimize for large uploads
          });
          
        try {
          const uploadResult = await uploadWithTimeout(uploadPromise, 300000); // 5 minute timeout
          uploadError = uploadResult.error;
          uploadData = uploadResult.data;
        } catch (timeoutError) {
          console.log('⏰ Upload timeout, trying with standard approach...');
          
          // Fallback: Try with smaller cache control and shorter timeout
          const retryPromise = supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
            
          const retryResult = await uploadWithTimeout(retryPromise, 120000); // 2 minute timeout
          uploadError = retryResult.error;
          uploadData = retryResult.data;
        }
      } else {
        // Standard upload for smaller files
        const uploadPromise = supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        const result = await uploadWithTimeout(uploadPromise, 60000); // 1 minute timeout
        uploadError = result.error;
        uploadData = result.data;
      }

      if (uploadError) {
        console.error('❌ Upload error details:', {
          error: uploadError,
          message: uploadError.message
        });
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('✅ File uploaded successfully:', uploadData);

      // Get the public URL
      console.log('🔗 Generating public URL...');
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Failed to generate public URL for uploaded file');
      }

      console.log('✅ Generated public URL:', publicUrl);
      console.log('💾 Saving URL to form responses (not file path)');

      // Save the URL (not the file) to responses - this will be stored in database as URL
      handleInputChange(questionId, publicUrl);
      
      console.log(`✅ ${isVideo ? 'Video' : 'File'} successfully uploaded and URL saved to form state`);
      return publicUrl;
    } catch (error) {
      console.error('❌ Complete file upload error:', error);
      
      // Show specific error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to process ${file.name}: ${errorMessage}`);
      
      // Don't block the form, just skip this file
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData) {
        toast.error('Form data not available');
        return;
      }

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to submit the form');
        return;
      }

      // Check if application already exists and get its status
      const { data: existingApplication, error: appError } = await supabase
        .from('applications')
        .select('id, form_response_id, status')
        .eq('intern_id', user.id)
        .eq('internship_id', internship_id)
        .maybeSingle();

      if (appError && appError.code !== 'PGRST116') {
        throw appError;
      }

      // Prevent resubmission of already submitted applications
      if (existingApplication && existingApplication.status === 'submitted') {
        toast.error('This application has already been submitted and cannot be resubmitted.');
        return;
      }

      let formResponseId: string;
      let applicationId: string;

      if (existingApplication) {
        // Update existing application to submitted status
        applicationId = existingApplication.id;
        
        // Update application status to submitted
        const { error: updateAppStatusError } = await supabase
          .from('applications')
          .update({ 
            status: 'submitted',
            applied_at: new Date().toISOString()
          })
          .eq('id', applicationId);

        if (updateAppStatusError) throw updateAppStatusError;
        
        if (existingApplication.form_response_id) {
          // Update existing form response
          formResponseId = existingApplication.form_response_id;
          
          const { error: updateError } = await supabase
            .from('form_responses')
            .update({
              status: 'submitted',
              submitted_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', formResponseId);

          if (updateError) throw updateError;

          // Delete existing answers
          const { error: deleteError } = await supabase
            .from('response_answers')
            .delete()
            .eq('response_id', formResponseId);

          if (deleteError) throw deleteError;
        } else {
          // Create new form response
          const { data: newFormResponse, error: responseError } = await supabase
            .from('form_responses')
            .insert({
              form_id: formData.id,
              applicant_id: user.id,
              status: 'submitted',
              submitted_at: new Date().toISOString()
            })
            .select()
            .single();

          if (responseError) throw responseError;
          formResponseId = newFormResponse.id;

          // Update application with form response ID
          const { error: updateAppError } = await supabase
            .from('applications')
            .update({ form_response_id: formResponseId })
            .eq('id', applicationId);

          if (updateAppError) throw updateAppError;
        }
      } else {
        // Create new application
        const { data: newApplication, error: appCreateError } = await supabase
          .from('applications')
          .insert({
            intern_id: user.id,
            internship_id: internship_id,
            status: 'submitted',
            applied_at: new Date().toISOString()
          })
          .select()
          .single();

        if (appCreateError) throw appCreateError;
        applicationId = newApplication.id;

        // Create new form response
        const { data: newFormResponse, error: responseError } = await supabase
          .from('form_responses')
          .insert({
            form_id: formData.id,
            applicant_id: user.id,
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (responseError) throw responseError;
        formResponseId = newFormResponse.id;

        // Update application with form response ID
        const { error: updateAppError } = await supabase
          .from('applications')
          .update({ form_response_id: formResponseId })
          .eq('id', applicationId);

        if (updateAppError) throw updateAppError;
      }

      // Save all answers with detailed debugging
      console.log('🔍 Debug: Starting answer collection...');
      console.log('📝 Current responses state:', responses);
      console.log('🆔 Form response ID:', formResponseId);
      
      const answersToInsert = [];
      for (const [questionId, answer] of Object.entries(responses)) {
        const isFileUrl = typeof answer === 'string' && (answer.includes('/storage/') || answer.startsWith('http'));
        const isDataUrl = typeof answer === 'string' && answer.startsWith('data:');
        console.log(`🔍 Processing question ${questionId}:`, { 
          answer: isDataUrl ? `[DATA URL - ${answer.substring(0, 50)}...]` : (isFileUrl ? `[STORAGE URL - ${answer}]` : answer), 
          type: typeof answer, 
          isFileUrl,
          isDataUrl,
          isFile: answer instanceof File
        });
        
        if (answer !== null && answer !== undefined && answer !== '') {
          const answerRecord = {
            response_id: formResponseId,
            question_id: questionId,
            answer_text: typeof answer === 'string' ? answer : null,
            answer_data: typeof answer !== 'string' ? answer : null
          };
          
          if (isFileUrl || isDataUrl) {
            console.log('📎 File/Video being saved to database as answer_text:', answerRecord);
            if (isDataUrl) {
              console.log('✅ File converted to data URL and ready for database storage!');
            } else if (isFileUrl) {
              console.log('✅ File uploaded to storage and URL ready for database storage!');
            }
          } else {
            console.log('✅ Adding answer record:', answerRecord);
          }
          answersToInsert.push(answerRecord);
        } else {
          console.log('❌ Skipping empty answer for question:', questionId);
        }
      }

      console.log('📊 Total answers to insert:', answersToInsert.length);
      console.log('📝 Answers array:', answersToInsert);

      if (answersToInsert.length > 0) {
        console.log('💾 Attempting to insert answers into database (one by one to handle large data URLs)...');
        
        let successCount = 0;
        let failureCount = 0;
        const insertResults = [];
        
        // Insert answers one by one to avoid timeout with large data URLs
        for (let i = 0; i < answersToInsert.length; i++) {
          const answerRecord = answersToInsert[i];
          const isLargeDataUrl = typeof answerRecord.answer_text === 'string' && 
                                answerRecord.answer_text.startsWith('data:') && 
                                answerRecord.answer_text.length > 1000000; // 1MB+ (adjusted for larger files)
          
          console.log(`📝 Inserting answer ${i + 1}/${answersToInsert.length}:`, {
            questionId: answerRecord.question_id,
            isLargeDataUrl,
            answerSize: answerRecord.answer_text ? answerRecord.answer_text.length : 'N/A',
            isDataUrl: answerRecord.answer_text ? answerRecord.answer_text.startsWith('data:') : false,
            preview: answerRecord.answer_text ? answerRecord.answer_text.substring(0, 50) + '...' : 'N/A'
          });
          
          try {
            const { data: insertResult, error: answerError } = await supabase
          .from('response_answers')
              .insert(answerRecord)
          .select();

            if (answerError) {
              console.error(`❌ Error inserting answer ${i + 1}:`, answerError);
              failureCount++;
              // Continue with other answers instead of failing completely
            } else {
              console.log(`✅ Successfully inserted answer ${i + 1}:`, insertResult);
              
              // Verify what was actually stored
              if (insertResult && insertResult[0] && insertResult[0].answer_text) {
                const storedAnswer = insertResult[0].answer_text;
                console.log('🔍 Verification - what was stored:', {
                  isDataUrl: storedAnswer.startsWith('data:'),
                  storedLength: storedAnswer.length,
                  originalLength: answerRecord.answer_text ? answerRecord.answer_text.length : 'N/A',
                  truncated: answerRecord.answer_text ? storedAnswer.length !== answerRecord.answer_text.length : false,
                  preview: storedAnswer.substring(0, 50) + '...'
                });
              }
              
              insertResults.push(insertResult);
              successCount++;
            }
          } catch (error) {
            console.error(`❌ Exception inserting answer ${i + 1}:`, error);
            failureCount++;
            // Continue with other answers
          }
          
          // Add delay between inserts to avoid overwhelming the database
          if (isLargeDataUrl && i < answersToInsert.length - 1) {
            const delayMs = answerRecord.answer_text && answerRecord.answer_text.length > 10000000 ? 500 : 200; // 500ms for very large files (10MB+), 200ms for others
            await new Promise(resolve => setTimeout(resolve, delayMs));
          }
        }
        
        console.log(`📊 Insertion complete: ${successCount} successful, ${failureCount} failed`);
        
        if (successCount === 0) {
          throw new Error('All answer insertions failed');
        } else if (failureCount > 0) {
          console.warn(`⚠️ ${failureCount} answers failed to insert, but continuing with ${successCount} successful insertions`);
        }
        
        console.log('✅ Answer insertion process completed:', insertResults);
      } else {
        console.warn('⚠️ No answers to insert - answersToInsert array is empty');
      }

      toast.success('Form submitted successfully!');
      setIsSubmitted(true);
      setCurrentStep(allSections.length - 1); // Go to thank you page
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Form not found</h2>
          <p className="text-gray-600 mt-2">This form is not available or has been unpublished.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />
      
      {/* Main Container */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Form Section */}
          <div className="bg-white shadow rounded-lg p-6">
            
            {/* Progress Bar */}
            {allSections.length > 0 && (
              <div className="mb-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Progress: {currentStep + 1} of {allSections.length}
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.round(((currentStep + 1) / allSections.length) * 100)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{ 
                        width: `${((currentStep + 1) / allSections.length) * 100}%`,
                        backgroundColor: theme.primaryColor
                      }}
                    ></div>
                  </div>
                </div>
                
                {/* Section Tabs */}
                <div className="flex flex-wrap gap-2">
                  {allSections.map((section, index) => {
                    const isCompleted = index < currentStep || (index === currentStep && isSectionCompleted(index));
                    const isCurrent = index === currentStep;
                    // Allow access to current step, previous completed steps, and next step if current is completed
                    const isAccessible = index <= currentStep || (index === currentStep + 1 && isSectionCompleted(currentStep));
                    
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
                        {index + 1}. {section.id === 'thank-you' ? 'Thank You' : section.title || `Section ${index + 1}`}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Form Content */}
            <div 
              className="border rounded-lg p-6 mb-4"
              style={{ 
                backgroundColor: theme.backgroundColor,
                borderRadius: theme.borderRadius,
                fontFamily: theme.fontFamily
              }}
            >
              <h1 className="text-2xl font-bold mb-4 text-gray-900">
                {formData.title || 'Untitled Form'}
              </h1>
              {formData.description && (
                <p className="text-gray-600 mb-6">{formData.description}</p>
              )}
              
              {/* Current Section Content */}
              {allSections.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No sections available.</p>
                </div>
              ) : currentStep === allSections.length - 1 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                  <h2 className="text-2xl font-bold mb-2">Thank you for submitting!</h2>
                  <p className="text-gray-700 text-lg">Check your dashboard for updates.</p>
                </div>
              ) : allSections[currentStep] ? (
                <div className="space-y-4">
                  <div key={allSections[currentStep].id} className="space-y-4">
                    {allSections[currentStep].title && (
                      <h3 className="text-lg font-semibold text-gray-900">{allSections[currentStep].title}</h3>
                    )}
                    {allSections[currentStep].description && (
                      <p className="text-gray-600 text-sm">{allSections[currentStep].description}</p>
                    )}
                    
                    {allSections[currentStep].questions.map((question, questionIndex) => (
                      <div 
                        key={question.id} 
                        className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-gray-200 mb-4"
                        style={{ 
                          borderRadius: theme.borderRadius,
                          fontFamily: theme.fontFamily,
                          marginBottom: theme.spacing
                        }}
                      >
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            {question.question_text}
                            {question.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {question.description && (
                            <p className="text-sm text-gray-500">{question.description}</p>
                          )}
                          
                          {/* Question Input */}
                          <div className="mt-2">
                            {question.type === 'short_text' && (
                              <input
                                type="text"
                                placeholder={question.placeholder || 'Enter your answer'}
                                value={responses[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black bg-white"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor,
                                  borderWidth: '2px'
                                }}
                              />
                            )}
                            {question.type === 'long_text' && (
                              <textarea
                                placeholder={question.placeholder || 'Enter your answer'}
                                rows={3}
                                value={responses[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black bg-white"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor,
                                  borderWidth: '2px'
                                }}
                              />
                            )}
                            {question.type === 'multiple_choice' && question.options && (
                              <div className="space-y-2">
                                {question.options.map((option, index) => (
                                  <label key={index} className="flex items-center">
                                    <input
                                      type="radio"
                                      name={`question-${question.id}`}
                                      value={option}
                                      checked={responses[question.id] === option}
                                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                                      className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            {question.type === 'checkboxes' && question.options && (
                              <div className="space-y-2">
                                {question.options.map((option, index) => (
                                  <label key={index} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      value={option}
                                      checked={(responses[question.id] || []).includes(option)}
                                      onChange={(e) => {
                                        const current = responses[question.id] || [];
                                        if (e.target.checked) {
                                          handleInputChange(question.id, [...current, option]);
                                        } else {
                                          handleInputChange(question.id, current.filter((item: string) => item !== option));
                                        }
                                      }}
                                      className="mr-2"
                                    />
                                    <span className="text-sm text-gray-700">{option}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                            {question.type === 'dropdown' && question.options && (
                              <select
                                value={responses[question.id] || ''}
                                onChange={(e) => handleInputChange(question.id, e.target.value)}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-gray-900"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor,
                                  borderWidth: '2px'
                                }}
                              >
                                <option value="" className="text-gray-900">Select an option</option>
                                {question.options.map((option, index) => (
                                  <option key={index} value={option} className="text-gray-900">{option}</option>
                                ))}
                              </select>
                            )}
                            {question.type === 'file_upload' && (
                              <div 
                                className="border-2 border-dashed rounded-md p-4 text-center"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor
                                }}
                              >
                                <input
                                  type="file"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      console.log('📄 File selected:', {
                                        name: file.name,
                                        size: file.size,
                                        sizeMB: Math.round(file.size / 1024 / 1024),
                                        type: file.type
                                      });
                                      
                                      // Show immediate feedback for large files
                                      if (file.size > 5 * 1024 * 1024) {
                                        toast.loading(`Uploading file (${Math.round(file.size / 1024 / 1024)}MB)... Please wait.`, {
                                          id: `upload-${question.id}`,
                                          duration: 30000
                                        });
                                      }
                                      
                                      try {
                                        const result = await handleFileUpload(question.id, file, false);
                                        if (result) {
                                          toast.success('File uploaded successfully!', {
                                            id: `upload-${question.id}`
                                          });
                                        }
                                      } catch (error) {
                                        toast.error('File upload failed', {
                                          id: `upload-${question.id}`
                                        });
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id={`file-${question.id}`}
                                />
                                <label htmlFor={`file-${question.id}`} className="cursor-pointer">
                                  <p className="text-sm text-gray-500">Click to upload file (max 10MB)</p>
                                  <p className="text-xs text-gray-400 mt-1">Documents, images, PDFs, etc.</p>
                                  {responses[question.id] && (
                                    <p className="text-xs text-green-600 mt-1">File uploaded successfully!</p>
                                  )}
                                </label>
                              </div>
                            )}
                            {question.type === 'video_upload' && (
                              <div 
                                className="border-2 border-dashed rounded-md p-4 text-center"
                                style={{ 
                                  borderRadius: theme.borderRadius,
                                  borderColor: theme.primaryColor
                                }}
                              >
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      console.log('🎬 Video file selected:', {
                                        name: file.name,
                                        size: file.size,
                                        sizeMB: Math.round(file.size / 1024 / 1024),
                                        type: file.type
                                      });
                                      
                                      // Show immediate feedback for large files
                                      if (file.size > 100 * 1024 * 1024) {
                                        toast.loading(`Uploading large video (${Math.round(file.size / 1024 / 1024)}MB)... This may take a while.`, {
                                          id: `upload-${question.id}`,
                                          duration: 60000
                                        });
                                      }
                                      
                                      try {
                                        const result = await handleFileUpload(question.id, file, true);
                                        if (result) {
                                          toast.success('Video uploaded successfully!', {
                                            id: `upload-${question.id}`
                                          });
                                        }
                                      } catch (error) {
                                        toast.error('Video upload failed', {
                                          id: `upload-${question.id}`
                                        });
                                      }
                                    }
                                  }}
                                  className="hidden"
                                  id={`video-${question.id}`}
                                />
                                <label htmlFor={`video-${question.id}`} className="cursor-pointer">
                                  <p className="text-sm text-gray-500">Click to upload video (max 1GB)</p>
                                  <p className="text-xs text-gray-400 mt-1">Supported formats: MP4, MOV, AVI, etc.</p>
                                  {responses[question.id] && (
                                    <p className="text-xs text-green-600 mt-1">Video uploaded successfully!</p>
                                  )}
                                </label>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No content available.</p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {allSections.length > 0 && !isSubmitted && (
              <div className="flex justify-between items-center mt-6">
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
                    Section {currentStep + 1} of {allSections.length}
                  </span>
                </div>

                {currentStep === allSections.length - 2 ? (
                  <button
                    onClick={handleSubmit}
                    className="flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-200 bg-green-600 text-white hover:bg-green-700"
                    style={{ borderRadius: theme.borderRadius }}
                  >
                    Submit Application
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    disabled={currentStep === allSections.length - 1 || !isSectionCompleted(currentStep)}
                    className={`flex items-center px-6 py-3 rounded-md font-medium transition-colors duration-200 ${
                      currentStep === allSections.length - 1 || !isSectionCompleted(currentStep)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    style={{ 
                      borderRadius: theme.borderRadius,
                      backgroundColor: (currentStep === allSections.length - 1 || !isSectionCompleted(currentStep)) ? undefined : theme.primaryColor
                    }}
                  >
                    Next
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 