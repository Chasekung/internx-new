'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AgoraRTC, { IAgoraRTCClient, IAgoraRTCRemoteUser, ICameraVideoTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';

// Agora is the most popular choice for AI interviews because:
// - Professional video quality (HD streaming)
// - Global performance (200+ data centers)
// - Built-in audio processing for AI integration
// - Used by Zoom, Discord, Microsoft Teams
// - Industry standard for video applications
// - Perfect for interview scenarios with low latency

interface TranscriptEntry {
  timestamp: string;
  speaker: 'AI' | 'STUDENT';
  content: string;
  isTyping?: boolean;
}

interface AIInterviewInterfaceProps {
  sessionId: string;
  onComplete: (scores: any) => void;
  onExit: () => void;
}

export default function AIInterviewInterface({ sessionId, onComplete, onExit }: AIInterviewInterfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [interviewStep, setInterviewStep] = useState<'welcome' | 'interviewing' | 'complete'>('welcome');
  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null);
  const [localTracks, setLocalTracks] = useState<{ videoTrack?: ICameraVideoTrack; audioTrack?: IMicrophoneAudioTrack }>({});

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Initialize Agora client
  useEffect(() => {
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setAgoraClient(client);
  }, []);

  // Start interview
  const startInterview = async () => {
    setIsLoading(true);
    try {
      // Get Agora credentials (you'll need to set these in your API)
      const agoraResponse = await fetch('/api/interview/video/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!agoraResponse.ok) {
        throw new Error('Failed to get video credentials');
      }

      const { appId, channel, token } = await agoraResponse.json();

      // Join Agora channel
      if (agoraClient) {
        await agoraClient.join(appId, channel, token, null);

        // Create and publish local tracks
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        
        await agoraClient.publish([audioTrack, videoTrack]);
        
        setLocalTracks({ audioTrack, videoTrack });

        // Display local video
        if (videoContainerRef.current) {
          videoTrack.play(videoContainerRef.current);
        }

        // Handle remote user events (for AI interviewer)
        agoraClient.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
          await agoraClient.subscribe(user, mediaType);
          
          if (mediaType === 'video' && videoContainerRef.current) {
            user.videoTrack?.play(videoContainerRef.current);
          }
        });
      }

      // Get first question
      const questionResponse = await fetch('/api/interview/ai-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          action: 'get_next_question'
        })
      });

      if (!questionResponse.ok) {
        throw new Error('Failed to get question');
      }

      const questionData = await questionResponse.json();
      setCurrentQuestion(questionData.question);

      // Add AI question to transcript
      setTranscript(prev => [...prev, {
        timestamp: new Date().toISOString(),
        speaker: 'AI',
        content: questionData.question
      }]);

      // Play AI question as speech
      await playAISpeech(questionData.question);

      setInterviewStep('interviewing');
    } catch (error) {
      console.error('Error starting interview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Play AI speech
  const playAISpeech = async (text: string) => {
    if (!audioContextRef.current) return;

    setIsPlaying(true);
    try {
      const response = await fetch('/api/interview/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: 'alloy' })
      });

      if (!response.ok) {
        throw new Error('TTS failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing AI speech:', error);
      setIsPlaying(false);
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

  // Process user response
  const processUserResponse = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      // Transcribe speech
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const transcriptResponse = await fetch('/api/interview/voice/stt', {
        method: 'POST',
        body: formData
      });

      if (!transcriptResponse.ok) {
        throw new Error('Transcription failed');
      }

      const { transcript: userTranscript } = await transcriptResponse.json();

      // Add user response to transcript
      setTranscript(prev => [...prev, {
        timestamp: new Date().toISOString(),
        speaker: 'STUDENT',
        content: userTranscript
      }]);

      // Analyze response
      const analysisResponse = await fetch('/api/interview/ai-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          action: 'analyze_response',
          response_text: userTranscript
        })
      });

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await analysisResponse.json();

      // Get next question
      const nextQuestionResponse = await fetch('/api/interview/ai-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          action: 'get_next_question'
        })
      });

      if (!nextQuestionResponse.ok) {
        // Interview complete
        await completeInterview();
        return;
      }

      const nextQuestionData = await nextQuestionResponse.json();
      setCurrentQuestion(nextQuestionData.question);

      // Add AI response to transcript
      setTranscript(prev => [...prev, {
        timestamp: new Date().toISOString(),
        speaker: 'AI',
        content: nextQuestionData.question
      }]);

      // Play AI response
      await playAISpeech(nextQuestionData.question);

    } catch (error) {
      console.error('Error processing user response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Complete interview
  const completeInterview = async () => {
    try {
      // Leave Agora channel
      if (agoraClient) {
        await agoraClient.leave();
      }

      // Stop local tracks
      localTracks.audioTrack?.close();
      localTracks.videoTrack?.close();

      const completeResponse = await fetch('/api/interview/complete-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!completeResponse.ok) {
        throw new Error('Failed to complete interview');
      }

      const completeData = await completeResponse.json();
      setInterviewStep('complete');
      onComplete(completeData.scores);
    } catch (error) {
      console.error('Error completing interview:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 text-white z-50">
      <div className="flex h-full">
        {/* Video Call Section */}
        <div className="flex-1 flex flex-col">
          {/* Video Container */}
          <div className="flex-1 bg-gray-800 rounded-lg m-4 relative">
            {interviewStep === 'welcome' ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold mb-2">AI Interviewer</h2>
                  <p className="text-gray-400">Ready to begin your interview</p>
                </div>
              </div>
            ) : (
              <div ref={videoContainerRef} className="w-full h-full" />
            )}
          </div>

          {/* Controls */}
          <div className="p-4 flex justify-center space-x-4">
            {interviewStep === 'welcome' && (
              <button
                onClick={startInterview}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold disabled:opacity-50"
              >
                {isLoading ? 'Starting...' : 'Start Interview'}
              </button>
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
                  {isRecording ? 'Stop Recording' : 'Start Recording'}
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
                className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
              >
                View Results
              </button>
            )}
          </div>
        </div>

        {/* Live Transcript Section */}
        <div className="w-96 bg-gray-800 border-l border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold">Live Transcript</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {transcript.map((entry, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg ${
                  entry.speaker === 'AI'
                    ? 'bg-blue-600 ml-8'
                    : 'bg-gray-700 mr-8'
                }`}
              >
                <div className="flex items-center mb-1">
                  <span className="font-semibold text-sm">
                    {entry.speaker === 'AI' ? 'Alex' : 'You'}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{entry.content}</p>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded-lg bg-blue-600 ml-8"
              >
                <div className="flex items-center">
                  <div className="animate-pulse text-sm">AI is thinking...</div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 