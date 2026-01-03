'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useProfileGate } from '@/hooks/useProfileGate';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';
import { getInterviewBySlug, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/interviewData';

interface PastSession {
  id: string;
  session_status: string;
  started_at: string;
  completed_at: string | null;
  overall_score: number | null;
  feedback_summary: string | null;
  detailed_feedback: string | null;
  skill_scores: Record<string, number> | null;
  strengths: string[] | null;
  improvements: string[] | null;
  duration_seconds: number | null;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  
  const { isLoading: profileLoading, isAuthenticated, meetsRequirement, completeness } = useProfileGate(true);
  
  const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [generatingFeedbackFor, setGeneratingFeedbackFor] = useState<string | null>(null);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  // Get interview data
  const interview = getInterviewBySlug(slug);

  // Fetch past sessions
  const fetchPastSessions = useCallback(async () => {
    if (!interview) return;
    
    try {
      setIsLoadingSessions(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/interview/sessions-by-type?interview_type=${interview.slug}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPastSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching past sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [interview]);

  useEffect(() => {
    if (isAuthenticated && meetsRequirement && interview) {
      fetchPastSessions();
    }
  }, [isAuthenticated, meetsRequirement, interview, fetchPastSessions]);

  // Generate/regenerate feedback for a session
  const handleGenerateFeedback = async (sessionId: string) => {
    try {
      setGeneratingFeedbackFor(sessionId);
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/interview/generate-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (response.ok) {
        const data = await response.json();
        // Update the session in state with new feedback
        setPastSessions(prev => prev.map(s => 
          s.id === sessionId 
            ? {
                ...s,
                overall_score: data.feedback.overall_score,
                feedback_summary: data.feedback.feedback_summary,
                detailed_feedback: data.feedback.detailed_feedback,
                skill_scores: data.feedback.skill_scores,
                strengths: data.feedback.strengths,
                improvements: data.feedback.improvements
              }
            : s
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to generate feedback');
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      alert('Failed to generate feedback. Please try again.');
    } finally {
      setGeneratingFeedbackFor(null);
    }
  };

  // Generate feedback for all completed sessions
  const handleGenerateAllFeedback = async () => {
    const sessionsNeedingFeedback = completedSessions.filter(s => !s.overall_score || !s.skill_scores || Object.keys(s.skill_scores).length === 0);
    
    if (sessionsNeedingFeedback.length === 0) {
      alert('All sessions already have feedback. You can click on individual sessions to regenerate.');
      return;
    }

    setIsGeneratingAll(true);
    
    for (const session of sessionsNeedingFeedback) {
      await handleGenerateFeedback(session.id);
    }
    
    setIsGeneratingAll(false);
  };

  // Start new interview session
  const handleStartInterview = async () => {
    if (!interview) return;
    
    try {
      setIsStartingInterview(true);
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/intern-sign-in');
        return;
      }

      const response = await fetch('/api/interview/start-mock-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interview_type: interview.slug,
          interview_title: interview.title,
          interview_category: interview.category,
          interview_subcategory: interview.subcategory,
          difficulty_level: interview.difficulty.toLowerCase()
        })
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to the interview session page
        router.push(`/interview/${interview.slug}/session/${data.session_id}`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to start interview session');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      alert('Failed to start interview. Please try again.');
    } finally {
      setIsStartingInterview(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get score color
  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-slate-400';
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-500 dark:text-red-400';
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Loading interview...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated or doesn't meet requirement, the hook will redirect
  if (!isAuthenticated || !meetsRequirement) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Checking access...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Interview not found
  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-28 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Interview Not Found
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The interview you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/practice-interviews"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Interviews
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const colors = CATEGORY_COLORS[interview.category];
  const icon = CATEGORY_ICONS[interview.category];

  const difficultyColors = {
    'Beginner': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    'Intermediate': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    'Advanced': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  };

  const completedSessions = pastSessions.filter(s => s.session_status === 'completed');
  const inProgressSession = pastSessions.find(s => s.session_status === 'in_progress');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-28 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/practice-interviews"
          className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to All Interviews
        </Link>

        {/* Profile Completion Banner */}
        {completeness && (
          <div className="mb-6">
            <ProfileCompletionBanner completeness={completeness} variant="info" showMissingFields={false} />
          </div>
        )}

        {/* ============================================ */}
        {/* HEADER SECTION */}
        {/* ============================================ */}
        <div className={`rounded-2xl border ${colors.border} ${colors.bg} p-8 mb-8`}>
          {/* Category & Difficulty Badges */}
          <div className="flex flex-wrap items-start gap-3 mb-4">
            <span className="text-3xl">{icon}</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
              {interview.category}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyColors[interview.difficulty]}`}>
              {interview.difficulty}
            </span>
            {completedSessions.length > 0 && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                {completedSessions.length} attempt{completedSessions.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {interview.title}
          </h1>

          {/* Description - What this interview evaluates */}
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            {interview.description}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>~{interview.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>AI-Powered Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Unlimited Retakes</span>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* ACTION SECTION - CTA */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="text-center">
            {inProgressSession ? (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium mb-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Interview in progress
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  You have an unfinished interview
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Continue where you left off or start fresh.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button
                    onClick={() => router.push(`/interview/${interview.slug}/session/${inProgressSession.id}`)}
                    className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Continue Interview
                  </button>
                  <button
                    onClick={handleStartInterview}
                    disabled={isStartingInterview}
                    className="inline-flex items-center px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                  >
                    Start New Interview
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Ready to practice?
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Take this AI-powered mock interview to improve your skills and receive personalized feedback.
                </p>
                <button
                  onClick={handleStartInterview}
                  disabled={isStartingInterview}
                  className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStartingInterview ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Take Mock Interview
                    </>
                  )}
                </button>
              </>
            )}
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              🎤 Make sure your microphone is ready for voice-based responses
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* PREVIOUS INTERVIEWS SECTION */}
        {/* ============================================ */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Previous Attempts
            </h2>
            <div className="flex items-center gap-3">
              {completedSessions.length > 0 && (
                <button
                  onClick={handleGenerateAllFeedback}
                  disabled={isGeneratingAll || generatingFeedbackFor !== null}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAll ? (
                    <>
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-1.5" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Generate All Feedback
                    </>
                  )}
                </button>
              )}
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {completedSessions.length} completed
              </span>
            </div>
          </div>

          {isLoadingSessions ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400">Loading past attempts...</p>
            </div>
          ) : completedSessions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-1">No previous attempts yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">Take the interview to see your results here</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {completedSessions.map((session) => (
                <div key={session.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-750">
                  {/* Session Header - Always Visible */}
                  <button
                    onClick={() => setExpandedSession(expandedSession === session.id ? null : session.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-4">
                      {/* Score Circle */}
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${
                        session.overall_score 
                          ? session.overall_score >= 80 
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : session.overall_score >= 60 
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                      }`}>
                        {session.overall_score ? `${Math.round(session.overall_score)}` : '—'}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {formatDate(session.started_at)}
                          </span>
                          {session.duration_seconds && (
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              • {formatDuration(session.duration_seconds)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {session.feedback_summary || 'Interview completed successfully'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getScoreColor(session.overall_score)}`}>
                        {session.overall_score 
                          ? session.overall_score >= 80 ? 'Excellent' 
                            : session.overall_score >= 60 ? 'Good' 
                            : 'Needs Work'
                          : 'Completed'
                        }
                      </span>
                      <svg 
                        className={`w-5 h-5 text-slate-400 transition-transform ${expandedSession === session.id ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedSession === session.id && (
                    <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50">
                      {/* Generate Feedback Button - always show for regenerating */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => handleGenerateFeedback(session.id)}
                          disabled={generatingFeedbackFor === session.id}
                          className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {generatingFeedbackFor === session.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              {session.overall_score ? 'Regenerate Feedback' : 'Generate AI Feedback'}
                            </>
                          )}
                        </button>
                        {session.overall_score && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            Last updated: {session.completed_at ? new Date(session.completed_at).toLocaleDateString() : 'N/A'}
                          </span>
                        )}
                      </div>

                      {/* Detailed Feedback Section */}
                      {session.detailed_feedback && (
                        <div className="mb-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detailed Feedback</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {session.detailed_feedback}
                          </p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Skill Scores */}
                        {session.skill_scores && Object.keys(session.skill_scores).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Performance Metrics</h4>
                            <div className="space-y-2">
                              {Object.entries(session.skill_scores)
                                .filter(([skill]) => !['completion', 'engagement'].includes(skill.toLowerCase()))
                                .map(([skill, score]) => (
                                <div key={skill} className="flex items-center gap-3">
                                  <span className="text-sm text-slate-600 dark:text-slate-400 w-32 capitalize">
                                    {skill.replace(/_/g, ' ')}
                                  </span>
                                  <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${
                                        (score as number) >= 80 ? 'bg-emerald-500' : (score as number) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                      }`}
                                      style={{ width: `${score}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-medium w-10 text-right ${getScoreColor(score as number)}`}>
                                    {score}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Strengths & Improvements */}
                        <div className="space-y-4">
                          {session.strengths && session.strengths.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <span className="text-emerald-500">✓</span> Strengths
                              </h4>
                              <ul className="space-y-1">
                                {session.strengths.map((s, i) => (
                                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                    <span className="text-emerald-500 mt-0.5">•</span>
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {session.improvements && session.improvements.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                                <span className="text-amber-500">↗</span> Areas to Improve
                              </h4>
                              <ul className="space-y-1">
                                {session.improvements.map((s, i) => (
                                  <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                                    <span className="text-amber-500 mt-0.5">•</span>
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Detailed Feedback */}
                      {session.detailed_feedback && (
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detailed Feedback</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                            {session.detailed_feedback}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Related Topics */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Related Topics
          </h2>
          <div className="flex flex-wrap gap-2">
            {interview.keywords.map((keyword) => (
              <span
                key={keyword}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
