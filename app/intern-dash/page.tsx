'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ReferralLink from '@/components/ReferralLink';
import ReferralStats from '@/components/ReferralStats';
import AIInterviewGate from '@/components/AIInterviewGate';
import SimpleAIInterview from '@/components/SimpleAIInterview';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

interface InternData {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  location?: string;
  referral_code?: string;
  high_school?: string;
  grade_level?: string;
  age?: number;
  skills?: string[];
  experience?: string;
  extracurriculars?: string[];
  achievements?: string[];
  career_interests?: string[];
  resume_url?: string;
  profile_photo_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  bio?: string;
  interests?: string[];
  languages?: string[];
  certifications?: string[];
  created_at: string;
  updated_at: string;
  // Interview-related fields
  interview_completed?: boolean;
  interview_completed_at?: string;
  skill_score?: number;
  experience_score?: number;
  personality_score?: number;
  overall_match_score?: number;
  interview_summary?: string;
  interview_feedback?: string;
  interview_tags?: string[];
  // AI category scores
  business_finance_score?: number;
  technology_engineering_score?: number;
  education_nonprofit_score?: number;
  healthcare_sciences_score?: number;
  creative_media_score?: number;
  // Combined scores (30% AI + 70% Mathematical)
  business_finance_combined_score?: number;
  technology_engineering_combined_score?: number;
  education_nonprofit_combined_score?: number;
  healthcare_sciences_combined_score?: number;
  creative_media_combined_score?: number;
}

interface Application {
  id: string;
  applied_at: string;
  status: string;
  internships: {
    id: string;
    position: string;
    description?: string;
    duration?: string;
    start_date?: string;
    pay?: number;
    city?: string;
    state?: string;
    companies?: {
      company_name: string;
    };
  };
}

// Helper function to create Google Maps link
const createGoogleMapsLink = (address?: string, city?: string, state?: string) => {
  if (!city && !state && !address) return null;
  
  const fullAddress = [address, city, state].filter(Boolean).join(', ');
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
};

// Helper function to display location
const formatDisplayLocation = (city?: string, state?: string) => {
  if (!city && !state) return 'N/A';
  return [city, state].filter(Boolean).join(', ');
};

export default function InternDash() {
  const router = useRouter();
  const [internData, setInternData] = useState<InternData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isRegeneratingScores, setIsRegeneratingScores] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showInterviewInterface, setShowInterviewInterface] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [lastProfileUpdate, setLastProfileUpdate] = useState<Date | null>(null);
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
    if (!supabase) throw new Error('Supabase not initialized');
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

  const fetchInternData = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/interns/me');
      
      if (response.ok) {
        const responseData = await response.json();
        setInternData(responseData.data);
      } else {
        console.error('Failed to fetch intern data');
      }
    } catch (error) {
      console.error('Error fetching intern data:', error);
    }
  };
  
  const fetchApplications = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/interns/applications');
      
      if (response.ok) {
        const responseData = await response.json();
        setApplications(responseData.applications);
      } else {
        console.error('Failed to fetch applications');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchLatestSessionId = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/interview/get-latest-session');
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.session_id) {
          setCurrentSessionId(responseData.session_id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch session ID:', err);
    }
  };
  
  useEffect(() => {
    if (!supabase) return;
    
    const checkAuthAndFetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/intern-sign-in');
        return;
      }
      
      const fetchData = async () => {
        await Promise.all([
          fetchInternData(),
          fetchApplications(),
          fetchLatestSessionId()
        ]);
        setIsLoading(false);
      };

      fetchData();
    };

    checkAuthAndFetchData();
  }, [supabase]);

  // Check for profile updates
  useEffect(() => {
    if (internData) {
      checkProfileUpdates();
    }
  }, [internData]);

  const handleStartInterview = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/interview/start-session', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start interview session');
      }

      const responseData = await response.json();
      setCurrentSessionId(responseData.session_id);
      setShowInterviewInterface(true);
    } catch (error) {
      console.error('Error starting interview:', error);
      setError('Failed to start interview. Please try again.');
    }
  };

  const handleInterviewComplete = () => {
    setShowInterviewInterface(false);
    setCurrentSessionId(null);
    window.location.reload();
    window.dispatchEvent(new CustomEvent('authStateChange'));
  };

  const handleInterviewExit = () => {
    setShowInterviewInterface(false);
    setCurrentSessionId(null);
  };

  const handleSessionIdChange = (newSessionId: string) => {
    setCurrentSessionId(newSessionId);
  };

  // Calculate stats
  const totalApplications = Array.isArray(applications) ? applications.length : 0;
  const applicationsThisMonth = Array.isArray(applications) ? applications.filter(app => {
    const appliedDate = new Date(app.applied_at);
    const now = new Date();
    return appliedDate.getMonth() === now.getMonth() && 
           appliedDate.getFullYear() === now.getFullYear();
  }).length : 0;

  const generateReferralCode = async () => {
    setIsGeneratingCode(true);
    try {
      const response = await makeAuthenticatedRequest('/api/referrals/generate', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to generate referral code');
      }

      const responseData = await response.json();
      setInternData(prev => prev ? {
        ...prev,
        referral_code: responseData.referral_code
      } : null);
    } catch (error) {
      console.error('Error generating referral code:', error);
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const regenerateAIScores = async () => {
    try {
      setIsRegeneratingScores(true);
      console.log('🔄 Starting AI score regeneration...');
      const response = await makeAuthenticatedRequest('/api/interview/regenerate-ai-scores', {
        method: 'GET'
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        
        if (errorData.details && errorData.details.includes('Country, region, or territory not supported')) {
          throw new Error('OpenAI is not available in your region. The system will use existing scores and recommendations.');
        }
        
        throw new Error(`Failed to regenerate AI scores: ${errorData.error || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('✅ AI scores regenerated successfully:', responseData);
      alert('AI scores regenerated successfully! Your category scores have been updated with the new AI-based system.');
      
      window.location.reload();
    } catch (error) {
      console.error('💥 Error regenerating AI scores:', error);
      alert(`Failed to regenerate AI scores: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsRegeneratingScores(false);
    }
  };

  const checkProfileUpdates = () => {
    if (internData?.updated_at) {
      const lastUpdate = new Date(internData.updated_at);
      const now = new Date();
      const timeDiff = now.getTime() - lastUpdate.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        setProfileUpdated(true);
        setLastProfileUpdate(lastUpdate);
      } else {
        setProfileUpdated(false);
        setLastProfileUpdate(null);
      }
    }
  };

  const refreshPDFScores = async () => {
    try {
      const response = await makeAuthenticatedRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({
          name: internData?.full_name,
          email: internData?.email,
          username: internData?.username,
          skills: internData?.skills || '',
          experience: internData?.experience || '',
          bio: internData?.bio || '',
          extracurriculars: internData?.extracurriculars || '',
          achievements: internData?.achievements || '',
          careerInterests: internData?.career_interests || ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to refresh scores');
      }

      alert('Profile scores refreshed! Your PDF report will now show updated mathematical calculations.');
      setProfileUpdated(false);
      window.location.reload();
    } catch (error) {
      console.error('Error refreshing scores:', error);
      alert('Failed to refresh scores. Please try again.');
    }
  };

  // Show interview interface if currently in an interview
  if (showInterviewInterface && currentSessionId) {
    return (
      <SimpleAIInterview
        sessionId={currentSessionId}
        onComplete={handleInterviewComplete}
        onExit={handleInterviewExit}
        onSessionIdChange={handleSessionIdChange}
      />
    );
  }

  // The main dashboard content with beautiful bubbly design
  const dashboardContent = (
    <div className="min-h-screen relative overflow-hidden">
      {/* Beautiful Animated Gradient Blobs Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Animated gradient blobs */}
        <div className="gradient-blob gradient-blob-1"></div>
        <div className="gradient-blob gradient-blob-2"></div>
        <div className="gradient-blob gradient-blob-3"></div>
        <div className="gradient-blob gradient-blob-4"></div>
      </div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div>
            <h1 className="text-5xl font-bold text-slate-900">
              Welcome, {internData?.full_name?.split(' ')[0] || 'there'}!
            </h1>
            <p className="text-slate-600 mt-3 text-xl">
              This is your personal dashboard where you can manage your internship applications and profile.
            </p>
          </div>
        </motion.div>

        {/* Interview Completion Banner */}
        {internData?.interview_completed && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-lg border border-slate-200 rounded-3xl p-8 mb-12 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mr-6 shadow-lg">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-2">
                      Interview Complete
                    </h3>
                    <p className="text-slate-600 text-lg">
                      Your personalized match scores are now being calculated for all internships.
                    </p>
                  </div>
                </div>
                
                {internData?.overall_match_score && (
                  <div className="flex items-center space-x-8">
                    <div className="bg-blue-100 rounded-3xl p-6 shadow-lg border border-blue-200">
                      <div className="text-sm text-slate-500 mb-2">Overall Score</div>
                      <div className="text-4xl font-bold text-black">
                        {internData.overall_match_score}/100
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Rated out of 100</div>
                    </div>
                    
                    {internData.interview_tags && internData.interview_tags.length > 0 && (
                      <div className="flex flex-wrap gap-3">
                        {internData.interview_tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-blue-50 text-black text-sm rounded-2xl font-medium border border-blue-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex flex-col space-y-4 ml-8">
                <button
                  onClick={() => router.push('/opportunities')}
                  className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Browse Personalized Matches
                </button>
                
                <button
                  onClick={() => {
                    if (currentSessionId) {
                      window.open(`/api/interview/generate-pdf?session_id=${currentSessionId}`, '_blank');
                    } else {
                      makeAuthenticatedRequest('/api/interview/get-latest-session')
                        .then(response => response.json())
                        .then(responseData => {
                          if (responseData.session_id) {
                            window.open(`/api/interview/generate-pdf?session_id=${responseData.session_id}`, '_blank');
                          } else {
                            alert('Unable to generate report. Please try refreshing the page.');
                          }
                        })
                        .catch(() => {
                          alert('Unable to generate report. Please try refreshing the page.');
                        });
                    }
                  }}
                  className="bg-white text-slate-700 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition-all border border-blue-200 shadow-lg hover:shadow-xl"
                >
                  View Detailed Report
                </button>
                
                {profileUpdated && (
                  <button
                    onClick={refreshPDFScores}
                    className="bg-indigo-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-indigo-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Refresh Profile Scores
                    <div className="text-xs text-indigo-100 mt-1">
                      Profile updated {lastProfileUpdate ? 
                        `${Math.round((new Date().getTime() - lastProfileUpdate.getTime()) / (1000 * 60 * 60))} hours ago` 
                        : 'recently'}
                    </div>
                  </button>
                )}
                
                {internData?.interview_completed && (
                  <button
                    onClick={regenerateAIScores}
                    disabled={isRegeneratingScores}
                    className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegeneratingScores ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        <span>Regenerating AI Scores...</span>
                      </div>
                    ) : (
                      <span>Regenerate AI Scores</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Cards - Bubble Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Total Applications</h3>
                          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
              <img src="/penandpaperemoji.webp" alt="Pen and Paper" className="w-8 h-8" />
            </div>
            </div>
            <p className="text-5xl font-bold text-black mb-3">{totalApplications}</p>
            <p className="text-slate-500 text-lg">All time applications</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">This Month</h3>
                          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
              <img src="/calendaremoji.webp" alt="Calendar" className="w-8 h-8" />
            </div>
            </div>
            <p className="text-5xl font-bold text-black mb-3">{applicationsThisMonth}</p>
            <p className="text-slate-500 text-lg">Applications submitted</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Profile Score</h3>
                          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
              <img src="/targetemoji.webp" alt="Target" className="w-8 h-8" />
            </div>
            </div>
            <p className="text-5xl font-bold text-black mb-3">
              {internData?.overall_match_score || 'N/A'}
              {internData?.overall_match_score && '/100'}
            </p>
            <p className="text-slate-500 text-lg">
              {internData?.interview_completed ? 'Based on AI interview (0-100 scale)' : 'Complete interview to unlock'}
            </p>
          </motion.div>
        </div>

        {/* Recent Applications - Bubble Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300 mb-12"
        >
          <h3 className="text-3xl font-bold text-slate-900 mb-8">Recent Applications</h3>
          
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-6"></div>
              <p className="text-slate-600 text-xl">Loading applications...</p>
            </div>
          ) : !Array.isArray(applications) || applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-600 mb-8 text-xl">No applications yet</p>
              <button
                onClick={() => router.push('/opportunities')}
                className="bg-blue-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Browse Opportunities
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Array.isArray(applications) && applications.slice(0, 5).map((application) => (
                <div
                  key={application.id}
                  className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/80 transition-all cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => setExpanded(expanded === application.id ? null : application.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-xl">
                        {application.internships.companies?.company_name || 'Unknown Company'}
                      </h4>
                      <p className="text-blue-600 font-semibold text-lg">{application.internships.position}</p>
                      <p className="text-slate-500 text-base">
                        Applied: {new Date(application.applied_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-6 py-3 rounded-2xl text-sm font-semibold ${
                        application.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : application.status === 'accepted'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : application.status === 'rejected'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-slate-100 text-slate-800 border border-slate-200'
                      }`}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>

                  {expanded === application.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-slate-200"
                    >
                      <div className="grid md:grid-cols-2 gap-6 text-base">
                        <div>
                          <strong className="text-slate-900">Location:</strong>{' '}
                          <span className="text-slate-600">
                            {formatDisplayLocation(
                              application.internships.city,
                              application.internships.state
                            )}
                          </span>
                        </div>
                        <div>
                          <strong className="text-slate-900">Duration:</strong>{' '}
                          <span className="text-slate-600">
                            {application.internships.duration || 'Not specified'}
                          </span>
                        </div>
                        {application.internships.pay && (
                          <div>
                            <strong className="text-slate-900">Pay:</strong>{' '}
                            <span className="text-slate-600">${application.internships.pay}/hr</span>
                          </div>
                        )}
                        {application.internships.start_date && (
                          <div>
                            <strong className="text-slate-900">Start Date:</strong>{' '}
                            <span className="text-slate-600">
                              {new Date(application.internships.start_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                      {application.internships.description && (
                        <div className="mt-6">
                          <strong className="text-slate-900">Description:</strong>
                          <p className="text-slate-600 mt-2 leading-relaxed">
                            {application.internships.description}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              ))}
              
              {Array.isArray(applications) && applications.length > 5 && (
                <div className="text-center pt-8">
                  <button
                    onClick={() => router.push('/applications')}
                    className="text-blue-600 hover:text-blue-700 font-semibold text-xl hover:underline"
                  >
                    View all applications ({Array.isArray(applications) ? applications.length : 0})
                  </button>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Referral Section - Bubble Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300"
          >
            <h3 className="text-3xl font-bold text-slate-900 mb-8">Your Referral Link</h3>
            {internData?.referral_code ? (
              <div className="space-y-6">
                <ReferralLink referralCode={internData.referral_code} />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <p className="text-slate-600 mb-8 text-xl">
                  Generate your unique referral code to invite friends and earn rewards.
                </p>
                <button
                  onClick={generateReferralCode}
                  disabled={isGeneratingCode}
                  className="bg-purple-500 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-purple-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
                >
                  {isGeneratingCode ? 'Generating...' : 'Generate Referral Code'}
                </button>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-300"
          >
            <h3 className="text-3xl font-bold text-slate-900 mb-8">Referral Performance</h3>
            {internData?.referral_code ? (
              <ReferralStats userId={internData.id} />
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-slate-600 text-xl">
                  Generate your referral code to see your performance stats.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );

  // Wrap the dashboard content with the AI interview gate
  return (
    <AIInterviewGate onStartInterview={handleStartInterview}>
      {dashboardContent}
    </AIInterviewGate>
  );
} 