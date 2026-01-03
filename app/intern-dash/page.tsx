'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  DocumentTextIcon,
  CalendarIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SparklesIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  LinkIcon,
  ChartBarIcon,
  BriefcaseIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import ReferralLink from '@/components/ReferralLink';
import ReferralStats from '@/components/ReferralStats';
import AIInterviewGate from '@/components/AIInterviewGate';
import SimpleAIInterview from '@/components/SimpleAIInterview';
import { useSupabase } from '@/hooks/useSupabase';

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
  if (!city && !state) return 'Not specified';
  return [city, state].filter(Boolean).join(', ');
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    accepted: { 
      bg: 'bg-emerald-50 dark:bg-emerald-900/20', 
      text: 'text-emerald-700 dark:text-emerald-400',
      icon: <CheckCircleIcon className="w-3.5 h-3.5" />
    },
    rejected: { 
      bg: 'bg-red-50 dark:bg-red-900/20', 
      text: 'text-red-700 dark:text-red-400',
      icon: <XCircleIcon className="w-3.5 h-3.5" />
    },
    in_progress: { 
      bg: 'bg-amber-50 dark:bg-amber-900/20', 
      text: 'text-amber-700 dark:text-amber-400',
      icon: <ClockIcon className="w-3.5 h-3.5" />
    },
    pending: { 
      bg: 'bg-slate-100 dark:bg-slate-700/50', 
      text: 'text-slate-600 dark:text-slate-400',
      icon: <ClockIcon className="w-3.5 h-3.5" />
    },
    submitted: { 
      bg: 'bg-blue-50 dark:bg-blue-900/20', 
      text: 'text-blue-700 dark:text-blue-400',
      icon: <DocumentTextIcon className="w-3.5 h-3.5" />
    },
  };

  const { bg, text, icon } = config[status] || config.pending;
  const label = status === 'in_progress' ? 'In Progress' 
    : status === 'submitted' || status === 'pending' ? 'Submitted'
    : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${bg} ${text}`}>
      {icon}
      {label}
    </span>
  );
};

// Metric card component
const MetricCard = ({ 
  label, 
  value, 
  subtext,
  icon: Icon 
}: { 
  label: string; 
  value: string | number; 
  subtext?: string;
  icon: React.ElementType;
}) => (
  <div className="flex items-start gap-3 p-4 bg-white/60 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-lg">
    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
      <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-xl font-semibold text-slate-900 dark:text-white mt-0.5">{value}</p>
      {subtext && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtext}</p>}
    </div>
  </div>
);

// Tab navigation component
type TabId = 'applications' | 'referrals';

const TabNav = ({ 
  activeTab, 
  setActiveTab,
  applicationCount,
}: { 
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  applicationCount: number;
}) => (
  <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
    <button
      onClick={() => setActiveTab('applications')}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === 'applications' 
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      Applications
      {applicationCount > 0 && (
        <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-slate-200 dark:bg-slate-600 rounded">
          {applicationCount}
        </span>
      )}
    </button>
    <button
      onClick={() => setActiveTab('referrals')}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === 'referrals' 
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      Referrals
    </button>
  </div>
);

export default function InternDash() {
  const router = useRouter();
  const [internData, setInternData] = useState<InternData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isRegeneratingScores, setIsRegeneratingScores] = useState(false);
  const [showInterviewInterface, setShowInterviewInterface] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [profileUpdated, setProfileUpdated] = useState(false);
  const [lastProfileUpdate, setLastProfileUpdate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('applications');
  const { supabase, error: supabaseError } = useSupabase();

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
    if (supabaseError) {
      console.error('Supabase error:', supabaseError);
      return;
    }
    
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
  }, [supabase, supabaseError]);

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

  const handleViewReport = () => {
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

  // The main dashboard content with minimalistic design
  const dashboardContent = (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none opacity-[0.015] dark:opacity-[0.03]" />
      
      {/* Main content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header - Compact */}
        <motion.header 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">
                Welcome back, {internData?.full_name?.split(' ')[0] || 'there'}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Manage your applications and track your progress
              </p>
            </div>
            <button
              onClick={() => router.push('/opportunities')}
              className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
            >
              Browse opportunities
              <ArrowTopRightOnSquareIcon className="w-4 h-4" />
            </button>
          </div>
        </motion.header>

        {/* Interview Completion Banner - Compact */}
        {internData?.interview_completed && (
          <motion.section
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-slate-900 dark:text-white">Interview Complete</h3>
                      {internData?.overall_match_score && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded">
                          Score: {internData.overall_match_score}/100
                        </span>
                      )}
                    </div>
                    {internData.interview_tags && internData.interview_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {internData.interview_tags.slice(0, 4).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-0.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleViewReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    Report
                  </button>
                  
                  <button
                    onClick={regenerateAIScores}
                    disabled={isRegeneratingScores}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${isRegeneratingScores ? 'animate-spin' : ''}`} />
                    {isRegeneratingScores ? 'Updating...' : 'Refresh Scores'}
                  </button>
                  
                  {profileUpdated && (
                    <button
                      onClick={refreshPDFScores}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <SparklesIcon className="w-4 h-4" />
                      Sync Profile
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* Stats Grid - Compact */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
        >
          <MetricCard
            label="Total"
            value={totalApplications}
            subtext="All applications"
            icon={BriefcaseIcon}
          />
          <MetricCard
            label="This Month"
            value={applicationsThisMonth}
            subtext="Recent activity"
            icon={CalendarIcon}
          />
          <MetricCard
            label="Match Score"
            value={internData?.overall_match_score ? `${internData.overall_match_score}` : '—'}
            subtext={internData?.interview_completed ? 'AI assessment' : 'Complete interview'}
            icon={AcademicCapIcon}
          />
        </motion.section>

        {/* Tab Navigation */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <TabNav 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
            applicationCount={totalApplications}
          />
        </motion.section>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'applications' ? (
            <motion.section
              key="applications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300" />
                </div>
              ) : !Array.isArray(applications) || applications.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <DocumentTextIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-900 dark:text-white mb-1">No applications yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Start exploring opportunities to find your perfect internship
                  </p>
                  <button
                    onClick={() => router.push('/opportunities')}
                    className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Browse opportunities →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {applications.slice(0, 10).map((application) => (
                    <div key={application.id}>
                      <button
                        onClick={() => setExpanded(expanded === application.id ? null : application.id)}
                        className="w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-slate-900 dark:text-white truncate">
                                {application.internships.position}
                              </h4>
                              <StatusBadge status={application.status} />
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {application.internships.companies?.company_name || 'Company'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                              Applied {new Date(application.applied_at).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <ChevronDownIcon 
                            className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                              expanded === application.id ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </button>

                      <AnimatePresence>
                        {expanded === application.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-0">
                              <div className="bg-slate-50 dark:bg-slate-750 rounded-lg p-4">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                                      <MapPinIcon className="w-3.5 h-3.5" />
                                      <span className="text-xs font-medium">Location</span>
                                    </div>
                                    <p className="text-slate-900 dark:text-white">
                                      {formatDisplayLocation(application.internships.city, application.internships.state)}
                                    </p>
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                                      <ClockIcon className="w-3.5 h-3.5" />
                                      <span className="text-xs font-medium">Duration</span>
                                    </div>
                                    <p className="text-slate-900 dark:text-white">
                                      {application.internships.duration || 'Not specified'}
                                    </p>
                                  </div>
                                  {application.internships.pay && (
                                    <div>
                                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                                        <CurrencyDollarIcon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">Pay</span>
                                      </div>
                                      <p className="text-slate-900 dark:text-white">
                                        ${application.internships.pay}/hr
                                      </p>
                                    </div>
                                  )}
                                  {application.internships.start_date && (
                                    <div>
                                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
                                        <CalendarIcon className="w-3.5 h-3.5" />
                                        <span className="text-xs font-medium">Starts</span>
                                      </div>
                                      <p className="text-slate-900 dark:text-white">
                                        {new Date(application.internships.start_date).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric'
                                        })}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                {application.internships.description && (
                                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                                      {application.internships.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              )}
              
              {Array.isArray(applications) && applications.length > 10 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center">
                  <button
                    onClick={() => router.push('/applications')}
                    className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    View all {applications.length} applications →
                  </button>
                </div>
              )}
            </motion.section>
          ) : (
            <motion.section
              key="referrals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid lg:grid-cols-2 gap-4">
                {/* Referral Link */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <LinkIcon className="w-4 h-4 text-slate-500" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Your Referral Link</h3>
                  </div>
                  
                  {internData?.referral_code ? (
                    <ReferralLink referralCode={internData.referral_code} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <LinkIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Generate your unique referral code to invite friends
                      </p>
                      <button
                        onClick={generateReferralCode}
                        disabled={isGeneratingCode}
                        className="px-4 py-2 text-sm font-medium bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isGeneratingCode ? 'Generating...' : 'Generate Code'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Referral Stats */}
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <ChartBarIcon className="w-4 h-4 text-slate-500" />
                    <h3 className="font-medium text-slate-900 dark:text-white">Performance</h3>
                  </div>
                  
                  {internData?.referral_code ? (
                    <ReferralStats userId={internData.id} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <ChartBarIcon className="w-5 h-5 text-slate-400" />
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Generate your referral code to see stats
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg shadow-lg text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
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
