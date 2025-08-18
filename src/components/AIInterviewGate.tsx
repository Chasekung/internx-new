'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  PlayCircleIcon, 
  ClockIcon, 
  StarIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon 
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
      setInterviewStatus(data);
    } catch (error) {
      console.error('Error checking interview status:', error);
      setError('Failed to load interview status');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={checkInterviewStatus}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If interview is completed, show dashboard
  if (interviewStatus?.interview_completed) {
    return <>{children}</>;
  }

  // Show interview requirement screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex flex-col items-center mb-4">
            <img 
              src="/stepupflat.png" 
              alt="Step Up" 
              className="h-16 sm:h-20 mb-4"
            />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 sm:text-5xl">
              Welcome!
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Before you can access your dashboard and browse internships, please complete our 
            AI-powered interview to help us better match you with opportunities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-xl mb-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <PlayCircleIcon className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              AI Interview Assessment
            </h2>
            <p className="text-gray-600">
              A personalized 20-minute conversation to understand your skills, interests, and goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 rounded-2xl">
              <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">20 Minutes</h3>
              <p className="text-sm text-gray-600">
                A friendly conversation with our AI interviewer
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-2xl">
              <StarIcon className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Personalized</h3>
              <p className="text-sm text-gray-600">
                Questions tailored to your background and interests
              </p>
            </div>

            <div className="text-center p-6 bg-purple-50 rounded-2xl">
              <CheckCircleIcon className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-sm text-gray-600">
                Get personalized internship recommendations
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">What to expect:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Questions about your technical skills and project experience
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Discussion of your interests, hobbies, and career goals
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Behavioral questions about teamwork and problem-solving
              </li>
              <li className="flex items-start">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Optional video recording for better communication assessment
              </li>
            </ul>
          </div>

          <div className="text-center">
            {interviewStatus?.active_session ? (
              <div className="mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full mb-4">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Interview in progress
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  You have an active interview session. Click below to continue.
                </p>
              </div>
            ) : null}
            
            <button
              onClick={onStartInterview}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {interviewStatus?.active_session ? 'Continue Interview' : 'Start Interview'}
            </button>
            
            <p className="text-xs text-gray-500 mt-4">
              Don't worry - you can take your time and there are no wrong answers!
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-gray-500"
        >
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:stepuphs.67@gmail.com" className="text-blue-600 hover:underline">
              stepuphs.67@gmail.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
} 