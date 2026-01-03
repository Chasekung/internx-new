'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayIcon, 
  ClockIcon, 
  SparklesIcon, 
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface InterviewStatus {
  interview_completed: boolean;
  interview_completed_at?: string;
  has_scores: boolean;
  scores?: {
    skill_score?: number;
    experience_score?: number;
    personality_score?: number;
    overall_match_score?: number;
  };
  active_session?: any;
}

interface AIInterviewGateProps {
  children: React.ReactNode;
  onStartInterview: () => void;
}

export default function AIInterviewGate({ children, onStartInterview }: AIInterviewGateProps) {
  const [interviewStatus, setInterviewStatus] = useState<InterviewStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkInterviewStatus();
  }, []);

  const checkInterviewStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/interview/check-status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to check interview status');
      }

      const data = await response.json();
      console.log('✅ Interview status loaded:', data);
      setInterviewStatus(data);
    } catch (error) {
      console.error('❌ Error checking interview status:', error);
      setError('Failed to load interview status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={checkInterviewStatus}
            className="px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If interview is completed, show dashboard
  if (interviewStatus?.interview_completed) {
    console.log('✅ Interview completed, showing dashboard');
    return <>{children}</>;
  }

  // Show interview requirement screen - minimalistic design
  console.log('⚠️ Interview not completed, showing gate. Status:', interviewStatus);
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-[0.015] dark:opacity-[0.03]" />
      
      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight mb-3">
            Complete Your Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            A quick AI interview helps us match you with the best opportunities
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
        >
          {/* Main content */}
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                  AI Interview
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  ~20 minutes • Conversational format
                </p>
              </div>
            </div>

            {/* Features grid */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <ClockIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">20 Minutes</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Friendly conversation</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <SparklesIcon className="w-5 h-5 text-slate-500 dark:text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">Personalized</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Tailored questions</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <svg className="w-5 h-5 text-slate-500 dark:text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-sm font-medium text-slate-900 dark:text-white">Smart Matching</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Better recommendations</p>
              </div>
            </div>

            {/* What to expect */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 mb-6">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">What to expect</p>
              <ul className="space-y-2">
                {[
                  'Questions about your skills and experience',
                  'Discussion of your interests and goals',
                  'Behavioral scenarios',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span className="w-1 h-1 bg-slate-400 rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Active session notice */}
            {interviewStatus?.active_session && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-6">
                <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  You have an interview in progress
                </p>
              </div>
            )}

            {/* CTA */}
            <button
              onClick={onStartInterview}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
            >
              {interviewStatus?.active_session ? (
                <>
                  Continue Interview
                  <ArrowRightIcon className="w-4 h-4" />
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  Start Interview
                </>
              )}
            </button>
          </div>

          {/* Footer note */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-750 border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400">
              Take your time — there are no wrong answers
            </p>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8"
        >
          Need help?{' '}
          <a href="mailto:stepuphs.67@gmail.com" className="text-slate-700 dark:text-slate-300 hover:underline">
            Contact support
          </a>
        </motion.p>
      </div>
    </div>
  );
}
