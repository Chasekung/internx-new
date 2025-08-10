'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/hooks/useSupabase';

interface TranscriptEntry {
  timestamp: string;
  speaker: 'AI' | 'STUDENT';
  content: string;
  isTyping?: boolean;
}

interface SimpleAIInterviewProps {
  sessionId: string;
  onComplete: (scores: any) => void;
  onExit: () => void;
  onSessionIdChange?: (newSessionId: string) => void;
}

export default function SimpleAIInterview({ sessionId, onComplete, onExit, onSessionIdChange }: SimpleAIInterviewProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interviewStep, setInterviewStep] = useState<'welcome' | 'interviewing' | 'complete'>('welcome');
  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [totalQuestionsAsked, setTotalQuestionsAsked] = useState(0);
  const [categoriesCovered, setCategoriesCovered] = useState<string[]>([]);
  const [canFinishInterview, setCanFinishInterview] = useState(false);
  const { supabase, error: supabaseError } = useSupabase();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }

    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  // Helper function to compress audio for faster processing
  const compressAudio = async (audioBlob: Blob): Promise<Blob> => {
    try {
      // Simple compression by reducing quality if the file is too large
      if (audioBlob.size < 1000000) return audioBlob; // Under 1MB, no compression needed
      
      // For larger files, we could implement audio compression here
      // For now, just return the original blob but in the future could use
      // WebCodecs API or similar for compression
      return audioBlob;
    } catch (error) {
      console.error('Audio compression failed:', error);
      return audioBlob; // Return original if compression fails
    }
  };

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Restart interview
  const restartInterview = async () => {
    setIsLoading(true);
    try {
      // Reset interview session
      const resetResponse = await makeAuthenticatedRequest('/api/interview/restart-session', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!resetResponse.ok) {
        const errorData = await resetResponse.json();
        throw new Error(`Failed to restart interview: ${errorData.error || 'Unknown error'}`);
      }

      const resetData = await resetResponse.json();
      
      // Update session ID with the new session
      if (resetData.new_session_id) {
        // Update the sessionId prop by calling the callback
        if (onSessionIdChange) {
          onSessionIdChange(resetData.new_session_id);
        }
        console.log('New session ID:', resetData.new_session_id);
      }

      // Reset component state
      setTranscript([]);
      setCurrentQuestion('');
      setInterviewStep('welcome');
      setShowRestartConfirm(false);
    } catch (error) {
      console.error('Error restarting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start interview
  const startInterview = async () => {
    setIsLoading(true);
    try {
      // Get first question
      const questionResponse = await makeAuthenticatedRequest('/api/interview/ai-conversation', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          action: 'get_next_question'
        })
      });

      if (!questionResponse.ok) {
        throw new Error('Failed to get question');
      }

      const questionData = await questionResponse.json();
      console.log('Question response:', questionData);
      
      // Check if interview is complete
      if (questionData.action === 'interview_complete') {
        console.log('Interview complete detected in startInterview');
        setInterviewStep('complete');
        setTranscript(prev => [...prev, {
          timestamp: new Date().toISOString(),
          speaker: 'AI',
          content: questionData.message
        }]);
        onComplete({ total_questions: questionData.total_questions });
        return;
      }

      setCurrentQuestion(questionData.question);
      setTotalQuestionsAsked(prev => prev + 1);

      // Add AI question to transcript with typing effect
      const aiMessage = {
        timestamp: new Date().toISOString(),
        speaker: 'AI' as const,
        content: questionData.question,
        isTyping: true
      };

      setTranscript([aiMessage]);

      // Simulate typing effect then play audio
      setTimeout(async () => {
        setTranscript(prev => prev.map(msg => 
          msg.isTyping ? { ...msg, isTyping: false } : msg
        ));
        
        // Play AI question as speech after typing effect
        await playAISpeech(questionData.question);
      }, Math.min(questionData.question.length * 15, 2000)); // Faster typing: 15ms per character, max 2 seconds

      setInterviewStep('interviewing');
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Play AI speech with optimizations
  const playAISpeech = async (text: string) => {
    if (!audioContextRef.current) return;

    setIsPlaying(true);
    try {
      const response = await fetch('/api/interview/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          voice: 'alloy',
          // Add speed optimization
          speed: 1.1 // Slightly faster speech
        }),
        // Add timeout for faster failure
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      // Preload for faster playback and start immediately
      audio.preload = 'auto';
      
      // Start playing as soon as possible
      audio.oncanplaythrough = () => {
        audio.play().catch(console.error);
      };

      // Fallback: start playing after a short delay if canplaythrough doesn't fire
      setTimeout(() => {
        if (audio.paused) {
          audio.play().catch(console.error);
        }
      }, 100);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error('Error playing AI speech:', error);
      // Fallback: just wait a bit and continue
      setTimeout(() => {
        setIsPlaying(false);
      }, 500); // Reduced from 1000ms
    }
  };

  // Start recording user response
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processUserResponse(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  // Stop recording and process response
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Process user response with optimizations
  const processUserResponse = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Transcribe speech with timeout and better error handling
      const formData = new FormData();
      
      // Optimize audio file for faster processing
      const optimizedBlob = audioBlob.size > 1000000 ? 
        await compressAudio(audioBlob) : audioBlob;
      
      formData.append('audio', new File([optimizedBlob], 'recording.wav', { type: 'audio/wav' }));

      // Add timeout for STT request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const transcriptResponse = await fetch('/api/interview/voice/stt', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!transcriptResponse.ok) {
        const errorData = await transcriptResponse.json();
        console.error('STT API error:', errorData);
        throw new Error(`Transcription failed: ${errorData.error || 'Unknown error'}`);
      }

      const result = await transcriptResponse.json();
      const userTranscript = result.transcript;
      
      if (!userTranscript || userTranscript.trim() === '') {
        throw new Error('No speech detected. Please try speaking louder or closer to your microphone.');
      }

      // Add user response to transcript
      setTranscript(prev => [...prev, {
        timestamp: new Date().toISOString(),
        speaker: 'STUDENT',
        content: userTranscript
      }]);

      // Analyze response and get next question with intelligent follow-up logic
      const analysisResponse = await makeAuthenticatedRequest('/api/interview/ai-conversation', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          action: 'analyze_and_respond',
          response_text: userTranscript,
          current_question: currentQuestion
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze response');
      }

      const analysisData = await analysisResponse.json();
      console.log('Analysis response:', analysisData);
      
      // Check if interview is complete
      if (analysisData.interview_complete) {
        console.log('Interview complete detected');
        setInterviewStep('complete');
        setTranscript(prev => [...prev, {
          timestamp: new Date().toISOString(),
          speaker: 'AI',
          content: 'Thank you for completing the interview! Your responses have been analyzed and your personalized match scores are being calculated.'
        }]);
        onComplete({ total_questions: totalQuestionsAsked });
        return;
      }

      // Update categories covered
      if (analysisData.category) {
        setCategoriesCovered(prev => {
          if (!prev.includes(analysisData.category)) {
            return [...prev, analysisData.category];
          }
          return prev;
        });
      }

      // Check if we can finish the interview (at least 3 categories covered)
      const canFinish = categoriesCovered.length >= 3;
      setCanFinishInterview(canFinish);

      setCurrentQuestion(analysisData.next_question);
      setTotalQuestionsAsked(prev => prev + 1); // Increment question counter

      // Add AI acknowledgment and next question to transcript with typing effect
      const aiMessage = {
        timestamp: new Date().toISOString(),
        speaker: 'AI' as const,
        content: analysisData.acknowledgment ? 
          `${analysisData.acknowledgment}\n\n${analysisData.next_question}` : 
          analysisData.next_question,
        isTyping: true
      };

      setTranscript(prev => [...prev, aiMessage]);

      // Simulate typing effect then play audio
      setTimeout(async () => {
        setTranscript(prev => prev.map((msg, index) => 
          index === prev.length - 1 && msg.isTyping ? { ...msg, isTyping: false } : msg
        ));
        
        // Play AI response after typing effect
        await playAISpeech(analysisData.next_question);
      }, Math.min(analysisData.next_question.length * 15, 2000)); // Faster typing: 15ms per character, max 2 seconds

    } catch (error) {
      console.error('Error processing user response:', error);
      
      // Add error message to transcript
      const errorMessage = `Sorry, I had trouble understanding that. ${error instanceof Error ? error.message : 'Please try speaking again.'}`;
      
      setTranscript(prev => [...prev, {
        timestamp: new Date().toISOString(),
        speaker: 'AI',
        content: errorMessage
      }]);
      
      // Speak the error message
      await playAISpeech(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete interview
  const completeInterview = async () => {
    if (!canFinishInterview) {
      alert(`You need to cover at least 3 categories before finishing. Currently: ${categoriesCovered.length}/3`);
      return;
    }

    setIsLoading(true);
    try {
      // Call the completion API
      const completionResponse = await makeAuthenticatedRequest('/api/interview/complete-session', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: sessionId,
          total_questions: totalQuestionsAsked,
          categories_covered: categoriesCovered
        })
      });

      if (!completionResponse.ok) {
        throw new Error('Failed to complete interview');
      }

      const completionData = await completionResponse.json();
      
      setInterviewStep('complete');
      setTranscript(prev => [...prev, {
        timestamp: new Date().toISOString(),
        speaker: 'AI',
        content: 'Thank you for completing the interview! Your responses have been analyzed and your personalized match scores are being calculated.'
      }]);

      onComplete(completionData);
    } catch (error) {
      console.error('Error completing interview:', error);
      alert('Failed to complete interview. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white z-50">
      <div className="flex h-full">
        {/* Main Interview Section */}
        <div className="flex-1 flex flex-col">
          {/* AI Avatar Section */}
          <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg m-4 relative overflow-hidden">
            {interviewStep === 'welcome' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center relative">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Alex - AI Interviewer</h2>
                  <p className="text-gray-400">Ready to begin your AI-powered interview</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{ 
                      scale: isPlaying ? [1, 1.2, 1] : 1,
                      backgroundColor: isPlaying ? "#3b82f6" : "#6b7280"
                    }}
                    transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0 }}
                    className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center"
                  >
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                  <h2 className="text-xl font-semibold mb-2">Alex</h2>
                  <p className="text-gray-400">
                    {isPlaying ? 'Speaking...' : isLoading ? 'Thinking...' : 'Listening'}
                  </p>
                </div>
              </div>
            )}
            
            {/* Current question display */}
            {currentQuestion && (
              <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-1">Current Question:</p>
                <p className="text-white">{currentQuestion}</p>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 flex justify-center space-x-4">
            {interviewStep === 'welcome' && (
              <>
                <button
                  onClick={startInterview}
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50 text-lg"
                >
                  {isLoading ? 'Starting...' : 'Start Interview'}
                </button>
                
                {transcript.length > 0 && (
                  <button
                    onClick={() => setShowRestartConfirm(true)}
                    className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold"
                  >
                    Restart Interview
                  </button>
                )}
              </>
            )}

            {interviewStep === 'interviewing' && (
              <>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading || isPlaying}
                  className={`px-6 py-3 rounded-lg font-semibold disabled:opacity-50 ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isRecording ? '🛑 Stop Recording' : '🎤 Start Recording'}
                </button>

                <button
                  onClick={() => setShowRestartConfirm(true)}
                  className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold"
                >
                  Restart Interview
                </button>

                <button
                  onClick={completeInterview}
                  disabled={!canFinishInterview}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    canFinishInterview
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-gray-500 cursor-not-allowed'
                  }`}
                  title={
                    canFinishInterview
                      ? 'Complete the interview and get your results'
                      : `Need at least 3 categories covered. Currently: ${categoriesCovered.length}/3`
                  }
                >
                  Finish Interview
                </button>

                <button
                  onClick={onExit}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold"
                >
                  Exit Interview
                </button>
              </>
            )}

            {interviewStep === 'complete' && (
              <button
                onClick={onExit}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-lg"
              >
                View Results
              </button>
            )}
          </div>
        </div>

        {/* Interview Progress */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg p-3 text-white text-sm">
          <div className="flex items-center space-x-4">
            <div>
              <span className="font-semibold">Questions: </span>
              <span>{totalQuestionsAsked}/20</span>
            </div>
            <div>
              <span className="font-semibold">Categories: </span>
              <span>{categoriesCovered.length}/5</span>
            </div>
            <div>
              <span className="font-semibold">Can Finish: </span>
              <span className={canFinishInterview ? 'text-green-400' : 'text-yellow-400'}>
                {canFinishInterview ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          {categoriesCovered.length > 0 && (
            <div className="mt-2 text-xs">
              <span className="text-gray-300">Covered: </span>
              <span className="text-blue-300">{categoriesCovered.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Live Transcript Section */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h3 className="text-lg font-semibold">Live Transcript</h3>
            <p className="text-sm text-gray-400">Real-time conversation log</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 max-h-[calc(100vh-200px)]">
            {transcript.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg ${
                  entry.speaker === 'AI'
                    ? 'bg-blue-600 ml-2 mr-8'
                    : 'bg-gray-700 ml-8 mr-2'
                }`}
              >
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-sm">
                    {entry.speaker === 'AI' ? '🤖 Alex' : '👤 You'}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm leading-relaxed break-words">
                  {entry.isTyping ? (
                    <span className="animate-pulse">Typing...</span>
                  ) : (
                    entry.content
                  )}
                </p>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-blue-600 ml-2 mr-8"
              >
                <div className="flex items-center">
                  <div className="animate-pulse text-sm">🤖 Alex is thinking...</div>
                </div>
              </motion.div>
            )}

            {/* Auto-scroll to bottom reference */}
            <div ref={(el) => {
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              }
            }} />
          </div>
        </div>
      </div>

      {/* Restart Confirmation Modal */}
      {showRestartConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-lg font-semibold mb-4">Restart Interview?</h3>
            <p className="text-gray-300 mb-6">
              This will reset your current progress and start the interview from the beginning. 
              Are you sure you want to continue?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={restartInterview}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Restarting...' : 'Yes, Restart'}
              </button>
              <button
                onClick={() => setShowRestartConfirm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 