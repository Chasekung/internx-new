'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useProfileGate } from '@/hooks/useProfileGate';
import { getInterviewBySlug, CATEGORY_COLORS } from '@/lib/interviewData';
import InterviewWorkspace, { type WorkspaceTab } from '@/components/interview/InterviewWorkspace';
import { convertMathWorkToLatex } from '@/lib/mathToLatex';
import { type MathStep } from '@/components/interview/MathEditorEnhanced';
import { devLogger } from '@/lib/devLogger';

interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface DevInfo {
  currentQuestion: string;
  nextCategory: string;
  strategy: string;
  progress: { current: number; total: number };
  lastAnalysis?: string;
}

export default function InterviewSessionPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const sessionId = params.sessionId as string;
  
  const { isLoading: profileLoading, isAuthenticated, meetsRequirement } = useProfileGate(true);
  
  const interview = getInterviewBySlug(slug);
  
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [devInfo, setDevInfo] = useState<DevInfo>({
    currentQuestion: '',
    nextCategory: 'introduction',
    strategy: 'Starting interview...',
    progress: { current: 0, total: 12 }
  });
  const messageIdCounter = useRef(0);
  const questionCounter = useRef(0); // Local progress tracking
  
  // Generate unique message IDs
  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };
  const [userInput, setUserInput] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true); // Voice ON by default
  const [currentlySpeaking, setCurrentlySpeaking] = useState('');
  const [voiceFeedback, setVoiceFeedback] = useState<{
    clarity: number;
    confidence: number;
    pacing: string;
    tone: string;
    fillerCount: number;
    suggestions: string[];
  } | null>(null);

  // Workspace state
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<WorkspaceTab>('whiteboard');
  const [workspaceSubmissions, setWorkspaceSubmissions] = useState<Array<{
    type: WorkspaceTab;
    content: string | object;
    timestamp: Date;
  }>>([]);
  const latestMathStepsRef = useRef<MathStep[] | null>(null); // Track latest math submission for API

  // Smart auto-scroll - only scroll if user was near bottom already
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  
  // Check if user is near the bottom of chat
  const checkScrollPosition = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // If within 150px of bottom, auto-scroll is enabled
      shouldAutoScrollRef.current = scrollHeight - scrollTop - clientHeight < 150;
    }
  }, []);
  
  // Auto-scroll only when appropriate
  useEffect(() => {
    if (shouldAutoScrollRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Keep auth session alive during long interviews
  useEffect(() => {
    const refreshSession = async () => {
      try {
        const supabase = createClientComponentClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.access_token) {
          // Update localStorage with fresh token
          const currentToken = localStorage.getItem('token');
          if (currentToken !== session.access_token) {
            localStorage.setItem('token', session.access_token);
            console.log('Session token refreshed');
          }
        } else {
          // Try to refresh the session
          const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
          if (refreshedSession?.access_token) {
            localStorage.setItem('token', refreshedSession.access_token);
            console.log('Session refreshed successfully');
          }
        }
      } catch (error) {
        console.error('Session refresh error:', error);
      }
    };

    // Refresh session every 5 minutes during interview
    const sessionRefreshInterval = setInterval(refreshSession, 5 * 60 * 1000);
    
    // Also refresh immediately on mount
    refreshSession();

    return () => {
      clearInterval(sessionRefreshInterval);
    };
  }, []);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Play AI voice - optimized for speed
  const playAIVoice = useCallback(async (text: string) => {
    if (!voiceEnabled || !text?.trim()) return;
    
    // Add to queue
    audioQueueRef.current.push(text);
    
    // If already playing, the queue will be processed
    if (isPlayingRef.current) return;
    
    const processQueue = async () => {
      while (audioQueueRef.current.length > 0) {
        const nextText = audioQueueRef.current.shift();
        if (!nextText) continue;
        
        isPlayingRef.current = true;
        setIsAISpeaking(true);
        setCurrentlySpeaking(nextText);
        
        try {
          // Start fetching audio immediately
          const response = await fetch('/api/interview/voice/tts-stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              text: nextText.slice(0, 500), // Limit for faster response
              voice: 'nova' // More natural voice
            })
          });

          if (!response.ok) throw new Error('TTS failed');

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Play the audio
          await new Promise<void>((resolve, reject) => {
            const audio = new Audio(audioUrl);
            audioPlayerRef.current = audio;
            
            audio.onended = () => {
              URL.revokeObjectURL(audioUrl);
              resolve();
            };
            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl);
              reject(new Error('Audio playback failed'));
            };
            
            audio.play().catch(reject);
          });
        } catch (error) {
          console.error('Voice playback error:', error);
        }
      }
      
      isPlayingRef.current = false;
      setIsAISpeaking(false);
      setCurrentlySpeaking('');
    };
    
    processQueue();
  }, [voiceEnabled]);

  // Stop current audio playback
  const stopSpeaking = useCallback(() => {
    audioQueueRef.current = [];
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    isPlayingRef.current = false;
    setIsAISpeaking(false);
    setCurrentlySpeaking('');
  }, []);

  // Handle workspace submission - uses a ref to access streamAIResponse
  const streamAIResponseRef = useRef<((userResponse: string, currentQuestion: string) => Promise<void>) | null>(null);
  
  const handleWorkspaceSubmit = useCallback((type: WorkspaceTab, content: string | object | MathStep[]) => {
    setWorkspaceSubmissions(prev => [...prev, { type, content, timestamp: new Date() }]);
    
    // Format submission message based on type and content
    let submissionMessage = '';
    let submissionData: any = { type, content };
    
    if (type === 'code') {
      submissionMessage = 'I\'ve submitted my code solution.';
    } else if (type === 'math') {
      // Handle new MathStep[] format
      if (Array.isArray(content) && content.length > 0 && 'content' in content[0]) {
        const mathSteps = content as MathStep[];
        
        // Convert structured math to LaTeX internally (user never sees this)
        const { latex, stepCount, hasExplanations } = convertMathWorkToLatex(mathSteps);
        
        // Create user-friendly message (NO LaTeX visible)
        const stepDescriptions = mathSteps.map((step, idx) => {
          // Render math in user-friendly format
          const mathDisplay = step.content.parts.map(part => {
            if (part.type === 'number' || part.type === 'variable' || part.type === 'text') {
              return part.value;
            } else if (part.type === 'operator') {
              const opMap: Record<string, string> = {
                '+': '+', '-': '−', '*': '×', '/': '÷', '=': '=',
                '<=': '≤', '>=': '≥', '!=': '≠'
              };
              return opMap[part.value] || part.value;
            } else if (part.type === 'fraction' && part.numerator && part.denominator) {
              const num = part.numerator.map(p => p.value).join('');
              const den = part.denominator.map(p => p.value).join('');
              return `(${num})/(${den})`;
            } else if (part.type === 'power' && part.base && part.exponent) {
              const base = part.base.map(p => p.value).join('');
              const exp = part.exponent.map(p => p.value).join('');
              return `${base}^${exp}`;
            } else if (part.type === 'root' && part.radicand) {
              const rad = part.radicand.map(p => p.value).join('');
              return `√(${rad})`;
            }
            return '';
          }).filter(Boolean).join(' ');
          
          return `Step ${idx + 1}: ${mathDisplay}${step.explanation ? ` (${step.explanation})` : ''}`;
        }).join('\n');
        
        submissionMessage = `I've submitted my mathematical work with ${stepCount} step(s):\n\n${stepDescriptions}`;
        
        // Store LaTeX internally for AI processing
        submissionData.math_steps = mathSteps;
        submissionData.latex = latex; // Internal only - never shown to user
        submissionData.step_count = stepCount;
        submissionData.has_explanations = hasExplanations;
        
        // Store math steps in ref for API call
        latestMathStepsRef.current = mathSteps;
        
        // Dev logging
        devLogger.logMathConverted(latex, stepCount);
      } else {
        // Fallback for old format
        submissionMessage = 'I\'ve submitted my mathematical work.';
        latestMathStepsRef.current = null;
      }
    } else if (type === 'code') {
      // Dev logging for code
      const codeContent = content as any;
      const language = codeContent.language || 'unknown';
      const codeLines = codeContent.code ? codeContent.code.split('\n').length : 0;
      devLogger.logCodeDetected(language, codeLines);
    } else if (type === 'whiteboard') {
      submissionMessage = 'I\'ve completed my whiteboard diagram.';
      latestMathStepsRef.current = null;
    } else {
      submissionMessage = 'I\'ve reviewed the media content.';
      latestMathStepsRef.current = null;
    }
    
    // Add user message directly (user-friendly, no LaTeX)
    const msgId = generateMessageId();
    setMessages(prev => [...prev, {
      id: msgId,
      role: 'user',
      content: submissionMessage,
      timestamp: new Date()
    }]);
    
    // Trigger AI response via ref (will include LaTeX internally)
    if (devInfo.currentQuestion && streamAIResponseRef.current) {
      streamAIResponseRef.current(submissionMessage, devInfo.currentQuestion);
    }
  }, [devInfo.currentQuestion, generateMessageId]);

  // Auto-switch workspace tab based on question type
  useEffect(() => {
    if (interview?.taskType) {
      const typeToTab: Record<string, WorkspaceTab> = {
        'coding': 'code',
        'math': 'math',
        'whiteboard': 'whiteboard',
        'design': 'whiteboard',
        'writing': 'code', // Use code editor for writing too
      };
      const newTab = typeToTab[interview.taskType];
      if (newTab) setActiveWorkspaceTab(newTab);
    }
  }, [interview?.taskType]);

  // Initialize interview with first question - with voice
  // Track if session has been initialized
  const sessionInitialized = useRef(false);
  
  // Load previous responses and restore session
  useEffect(() => {
    if (!isAuthenticated || !meetsRequirement || !interview || sessionInitialized.current) return;
    
    sessionInitialized.current = true;
    
    const loadPreviousResponses = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch previous responses for this session
        const response = await fetch(`/api/interview/session-responses?session_id=${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          const previousResponses = data.responses || [];
          
          if (previousResponses.length > 0) {
            // Restore chat history from previous responses
            const restoredMessages: Message[] = [];
            
            // Add a resume message
            restoredMessages.push({
              id: generateMessageId(),
              role: 'ai',
              content: `Welcome back! You've answered ${previousResponses.length} question(s) so far. Let's continue where we left off.`,
              timestamp: new Date()
            });
            
            // Add the last exchange for context
            const lastResponse = previousResponses[previousResponses.length - 1];
            if (lastResponse.question_text) {
              restoredMessages.push({
                id: generateMessageId(),
                role: 'ai',
                content: `Previous question: "${lastResponse.question_text}"`,
                timestamp: new Date()
              });
            }
            if (lastResponse.response_text) {
              restoredMessages.push({
                id: generateMessageId(),
                role: 'user',
                content: `Your answer: "${lastResponse.response_text}"`,
                timestamp: new Date()
              });
            }
            
            // Generate next question
            const nextQuestion = `Great! Let's move on. Based on your previous answers, tell me more about your experience and skills.`;
            restoredMessages.push({
              id: generateMessageId(),
              role: 'ai',
              content: nextQuestion,
              timestamp: new Date()
            });
            
            setMessages(restoredMessages);
            
            // Update counters
            questionCounter.current = previousResponses.length;
            setDevInfo(prev => ({
              ...prev,
              currentQuestion: nextQuestion,
              progress: { current: previousResponses.length, total: 12 },
              strategy: 'Resuming interview from previous session.'
            }));
            
            // Speak welcome back message
            if (voiceEnabled) {
              setTimeout(() => {
                playAIVoice(`Welcome back! Let's continue where we left off.`);
              }, 500);
            }
            
            return; // Exit early - session restored
          }
        }
      } catch (error) {
        console.error('Error loading previous responses:', error);
      }
      
      // No previous responses - start fresh
      const greeting = `Hello! I'm your AI interviewer for the ${interview.title} practice session. Let's begin!`;
      const firstQuestion = `Tell me about yourself and what interests you about ${interview.category.toLowerCase()}.`;
      
      setMessages([
        { id: generateMessageId(), role: 'ai', content: greeting, timestamp: new Date() },
        { id: generateMessageId(), role: 'ai', content: firstQuestion, timestamp: new Date() }
      ]);
      
      setDevInfo(prev => ({
        ...prev,
        currentQuestion: firstQuestion,
        strategy: 'Starting with introduction to establish rapport and understand background.'
      }));

      // Speak the greeting and first question
      setTimeout(() => {
        if (voiceEnabled) {
          playAIVoice(greeting);
          setTimeout(() => {
            playAIVoice(firstQuestion);
          }, 2500);
        }
      }, 500);
    };
    
    loadPreviousResponses();
  }, [isAuthenticated, meetsRequirement, interview, sessionId, voiceEnabled, playAIVoice]);

  // Get AI response (no raw streaming to avoid showing AI thinking)
  const streamAIResponse = useCallback(async (userResponse: string, currentQuestion: string) => {
    setIsProcessing(true);
    
    // Increment local question counter immediately
    questionCounter.current += 1;
    const currentQuestionNum = questionCounter.current;
    
    // Update progress immediately (local tracking)
    setDevInfo(prev => ({
      ...prev,
      progress: { current: currentQuestionNum, total: 12 }
    }));
    
    const aiMessageId = generateMessageId();
    // Add a placeholder message while processing
    setMessages(prev => [...prev, {
      id: aiMessageId,
      role: 'ai',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    }]);

    try {
      const token = localStorage.getItem('token');
      
      // Prepare payload
      const payload = {
        session_id: sessionId,
        user_response: userResponse,
        current_question: currentQuestion,
        interview_type: interview?.slug,
        interview_category: interview?.category,
        interview_subcategory: interview?.subcategory,
        difficulty_level: interview?.difficulty?.toLowerCase() || 'medium',
        math_steps: latestMathStepsRef.current || undefined // Include structured math if available
      };
      
      // Dev logging for AI payload (before sending)
      const payloadSize = JSON.stringify(payload).length;
      const hasMath = !!latestMathStepsRef.current;
      const hasCode = userResponse.includes('I\'ve submitted my code solution');
      
      devLogger.logAIPayload(hasMath, hasCode, payloadSize);
      
      const response = await fetch('/api/interview/stream-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to get AI response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'start') {
                // Only update category from server, NOT progress (we track progress locally)
                if (data.category) {
                  setDevInfo(prev => ({
                    ...prev,
                    nextCategory: data.category
                  }));
                }
              } else if (data.type === 'done') {
                // Check if interview is complete (12 questions answered)
                if (currentQuestionNum >= 12) {
                  setIsInterviewComplete(true);
                  const completionMessage = `${data.acknowledgment}\n\nThank you for completing the interview! You've answered all 12 questions. Click below to view your results.`;
                  setMessages(prev => prev.map(m => 
                    m.id === aiMessageId 
                      ? { ...m, content: completionMessage, isStreaming: false }
                      : m
                  ));
                  
                  if (voiceEnabled) {
                    playAIVoice("Thank you for completing the interview! Click view results to see your feedback.");
                  }
                } else {
                  // Update with final parsed content (clean, no AI thinking shown)
                  const finalContent = `${data.acknowledgment}\n\n${data.next_question}`;
                  setMessages(prev => prev.map(m => 
                    m.id === aiMessageId 
                      ? { ...m, content: finalContent, isStreaming: false }
                      : m
                  ));
                  
                  // Update current question (progress already updated at start)
                  setDevInfo(prev => ({
                    ...prev,
                    currentQuestion: data.next_question,
                    nextCategory: data.category
                  }));

                  // Play voice if enabled
                  if (voiceEnabled) {
                    if (data.acknowledgment) {
                      playAIVoice(data.acknowledgment);
                    }
                    setTimeout(() => {
                      playAIVoice(data.next_question);
                    }, data.acknowledgment ? 1500 : 0);
                  }
                }
              } else if (data.type === 'complete') {
                setIsInterviewComplete(true);
                setMessages(prev => prev.map(m => 
                  m.id === aiMessageId 
                    ? { ...m, content: data.message, isStreaming: false }
                    : m
                ));
                
                if (voiceEnabled) {
                  playAIVoice(data.message);
                }
              } else if (data.type === 'error') {
                throw new Error(data.error);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      setMessages(prev => prev.map(m => 
        m.id === aiMessageId 
          ? { ...m, content: 'I apologize, but I encountered an error. Could you please repeat your response?', isStreaming: false }
          : m
      ));
    } finally {
      setIsProcessing(false);
      // Clear math steps ref after processing (whether success or error)
      latestMathStepsRef.current = null;
    }
  }, [sessionId, interview?.slug, voiceEnabled, playAIVoice]);

  // Update ref for workspace submission handler
  useEffect(() => {
    streamAIResponseRef.current = streamAIResponse;
  }, [streamAIResponse]);

  // Handle text submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message with unique ID
    setMessages(prev => [...prev, {
      id: generateMessageId(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    await streamAIResponse(userMessage, devInfo.currentQuestion);
  };

  // Start voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio visualization
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(avg / 255);
        }
        animationRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        stream.getTracks().forEach(track => track.stop());
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioLevel(0);
    }
  };

  // Process recorded audio with voice analysis
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setVoiceFeedback(null);
    
    try {
      // Transcribe audio with analysis
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('analyze', 'true');
      
      const sttResponse = await fetch('/api/interview/voice/stt', {
        method: 'POST',
        body: formData
      });

      if (!sttResponse.ok) throw new Error('Transcription failed');
      
      const sttData = await sttResponse.json();
      const { transcript, voice_analysis, filler_words } = sttData;
      
      if (!transcript?.trim()) {
        alert('Could not understand audio. Please try again.');
        setIsProcessing(false);
        return;
      }

      // Update voice feedback for display
      if (voice_analysis) {
        setVoiceFeedback({
          clarity: voice_analysis.clarity,
          confidence: voice_analysis.confidence,
          pacing: voice_analysis.pacing,
          tone: voice_analysis.tone,
          fillerCount: filler_words?.count || 0,
          suggestions: voice_analysis.suggestions || []
        });
      }

      // Add user message with unique ID
      const userMessageId = generateMessageId();
      setMessages(prev => [...prev, {
        id: userMessageId,
        role: 'user',
        content: transcript,
        timestamp: new Date()
      }]);

      await streamAIResponse(transcript, devInfo.currentQuestion);
    } catch (error) {
      console.error('Audio processing error:', error);
      setIsProcessing(false);
    }
  };

  // Complete interview and navigate to results
  const handleCompleteInterview = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // 1. Mark session as completed
        await fetch('/api/interview/complete-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            sessionId: sessionId,
            duration_seconds: elapsedTime,
            questions_answered: questionCounter.current
          })
        });

        // 2. Generate AI feedback immediately
        await fetch('/api/interview/generate-feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            session_id: sessionId
          })
        });
      }
    } catch {
      // Continue to results even if completion/feedback fails
    }
    
    // Navigate to interview page to see results under "Previous Interviews"
    router.push(`/interview/${slug}`);
  };

  // Loading states
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !meetsRequirement || !interview) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const colors = CATEGORY_COLORS[interview.category];

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Ambient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Main content - Full height split layout */}
      <div className="h-full flex">
        {/* LEFT SIDE - AI + Chat (40%) */}
        <div className="w-2/5 flex flex-col border-r border-white/10 relative z-10">
          
          {/* Compact Header with AI avatar, timer, controls */}
          <div className="flex items-center gap-3 p-3 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
            {/* Exit button */}
            <Link 
              href={`/interview/${slug}`} 
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>

            {/* Mini AI Avatar - Zoom style */}
            <div className={`relative w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border ${isAISpeaking ? 'border-blue-400' : 'border-white/20'} flex items-center justify-center overflow-hidden`}>
              {isAISpeaking ? (
                <div className="flex items-center justify-center gap-0.5 h-full">
                  {[0.3, 0.5, 0.7].map((delay, i) => (
                    <div 
                      key={i}
                      className="w-1 bg-blue-400 rounded-full"
                      style={{ 
                        animation: `soundWave 0.6s ease-in-out infinite`,
                        animationDelay: `${delay}s`,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <svg className={`w-6 h-6 ${isProcessing ? 'text-yellow-400 animate-pulse' : 'text-blue-400'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              )}
            </div>

            {/* Interview info */}
            <div className="flex-1 min-w-0">
              <h1 className="font-medium text-white text-sm truncate">{interview.title}</h1>
              <p className="text-xs text-slate-400">
                {isAISpeaking ? 'Speaking...' : isProcessing ? 'Thinking...' : isRecording ? 'Listening...' : interview.category}
              </p>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs text-slate-400">Progress</span>
                <p className="text-sm font-mono text-white">{devInfo.progress.current}/{devInfo.progress.total}</p>
              </div>
              <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${(devInfo.progress.current / devInfo.progress.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
              <div className={`w-1.5 h-1.5 rounded-full ${isInterviewComplete ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="font-mono text-xs text-slate-300">{formatTime(elapsedTime)}</span>
            </div>

            {/* Voice Toggle */}
            <button
              onClick={() => {
                const newState = !voiceEnabled;
                setVoiceEnabled(newState);
                if (!newState) stopSpeaking();
              }}
              className={`p-2 rounded-lg border transition-colors ${
                voiceEnabled 
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' 
                  : 'bg-white/5 border-white/10 text-slate-400'
              }`}
              title={voiceEnabled ? 'Voice ON' : 'Voice OFF'}
            >
              {voiceEnabled ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Voice Feedback Banner (when available) */}
          {voiceFeedback && (
            <div className="px-3 py-2 border-b border-white/10 bg-slate-800/50 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Confidence:</span>
                <span className={voiceFeedback.confidence >= 70 ? 'text-green-400' : 'text-yellow-400'}>{voiceFeedback.confidence}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Clarity:</span>
                <span className={voiceFeedback.clarity >= 70 ? 'text-green-400' : 'text-yellow-400'}>{voiceFeedback.clarity}%</span>
              </div>
              <span className="text-slate-500 capitalize">{voiceFeedback.pacing}</span>
              {voiceFeedback.fillerCount > 0 && (
                <span className="text-orange-400">Fillers: {voiceFeedback.fillerCount}</span>
              )}
              <button onClick={() => setVoiceFeedback(null)} className="ml-auto text-slate-500 hover:text-white">×</button>
            </div>
          )}

          {/* Chat Messages */}
          <div 
            ref={chatContainerRef}
            onScroll={checkScrollPosition}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-slate-100'
                  } ${message.isStreaming ? 'animate-pulse' : ''}`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content || '...'}</p>
                  <p className={`text-[10px] mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-3 border-t border-white/10 bg-slate-900/80 backdrop-blur-xl">
            {isInterviewComplete ? (
              <button
                onClick={handleCompleteInterview}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
              >
                View Results
              </button>
            ) : (
              <div className="flex gap-2">
                {/* Voice button */}
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-white/10 hover:bg-white/20 border border-white/20'
                  } disabled:opacity-50`}
                >
                  {isRecording && (
                    <div 
                      className="absolute inset-0 rounded-xl bg-red-500/50 animate-ping"
                      style={{ animationDuration: '1s' }}
                    />
                  )}
                  <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>

                {/* Text input */}
                <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type your response..."
                    disabled={isProcessing || isRecording}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 disabled:opacity-50 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!userInput.trim() || isProcessing || isRecording}
                    className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - Interactive Workspace (60%) */}
        <div className="w-3/5 flex flex-col relative z-10">
          <InterviewWorkspace
            activeTab={activeWorkspaceTab}
            onTabChange={setActiveWorkspaceTab}
            onSubmit={handleWorkspaceSubmit}
            currentQuestion={devInfo.currentQuestion}
            questionType={interview.taskType as 'coding' | 'math' | 'whiteboard' | 'writing' | 'design' | undefined}
            mediaContent={null}
          />
        </div>
      </div>
    </div>
  );
}

