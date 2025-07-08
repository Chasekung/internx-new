'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import ApplicationTracker from '@/components/ApplicationTracker';
import ReferralLink from '@/components/ReferralLink';
import ReferralStats from '@/components/ReferralStats';

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
}

export default function InternDash() {
  const router = useRouter();
  const [internData, setInternData] = useState<InternData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  useEffect(() => {
    // Check if user is signed in
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to sign in');
      router.replace('/intern-sign-in');
      return;
    }

    const fetchInternData = async () => {
      try {
        console.log('Fetching intern data...');
        const response = await fetch('/api/interns/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error('Failed to fetch intern data');
        }

        const data = await response.json();
        console.log('Intern data received:', data);
        setInternData(data.data); // Note: the API returns { success: true, data: {...} }
      } catch (err) {
        console.error('Error fetching intern data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInternData();
  }, [router]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      router.replace('/intern-sign-in');
    }
  };

  const handleGenerateNewReferralCode = async () => {
    if (!internData) return;
    
    setIsGeneratingCode(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/referrals/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: internData.id })
      });

      if (!response.ok) {
        throw new Error('Failed to generate new code');
      }

      const result = await response.json();
      
      // Update the local state with the new referral code
      setInternData(prev => prev ? {
        ...prev,
        referral_code: result.referralCode
      } : null);
      
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    } finally {
      setIsGeneratingCode(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Settings Icon */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
          >
            <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
          </button>
          
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {internData?.full_name || 'Intern'}
          </h1>
          <p className="text-gray-600">
            This is your personal dashboard where you can manage your internship applications and profile.
          </p>
        </motion.div>

        {/* Application Tracker */}
        <ApplicationTracker />

        {/* Referral System */}
        {internData && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <ReferralLink 
              referralCode={internData.referral_code || 'GENERATING'} 
              onGenerateNew={handleGenerateNewReferralCode}
            />
            <ReferralStats userId={internData.id} />
          </div>
        )}
      </div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, #a78bfa 1px, transparent 1px),
            linear-gradient(to bottom, #a78bfa 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
} 