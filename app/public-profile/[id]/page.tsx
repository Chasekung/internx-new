'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaLinkedin } from 'react-icons/fa';
import { FileText } from 'lucide-react';

interface ProfileData {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  location: string;
  state: string;
  highSchool: string;
  gradeLevel: string;
  age: string;
  skills: string;
  experience: string;
  extracurriculars: string;
  achievements: string;
  careerInterests: string;
  resumeUrl: string;
  profilePhotoUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  bio: string;
  headline?: string;
  interests: string;
  languages: string;
  certifications: string[];
  created_at: string;
  updated_at: string;
}

export default function PublicProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  // Mock: isPremium should be replaced with real check
  const [isPremium, setIsPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Color palette for interest tags
  const interestColors = [
    'bg-blue-100 text-blue-800',
    'bg-purple-100 text-purple-800',
    'bg-teal-100 text-teal-800',
    'bg-pink-100 text-pink-800',
    'bg-indigo-100 text-indigo-800',
    'bg-fuchsia-100 text-fuchsia-800',
    'bg-cyan-100 text-cyan-800',
    'bg-rose-100 text-rose-800',
    'bg-sky-100 text-sky-800',
    'bg-violet-100 text-violet-800',
  ];

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Public Profile Debug - Starting fetch for ID/username:', params.id);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ No token found, redirecting to intern-get-started');
        router.push('/intern-get-started');
        return;
      }

      if (!params.id) {
        console.log('❌ No ID provided');
        setError('Profile not found');
        setIsLoading(false);
        return;
      }

      try {
        console.log('📡 Making API request to:', `/api/interns/${params.id}`);
        const response = await fetch(`/api/interns/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('📊 API Response status:', response.status);
        console.log('📊 API Response ok:', response.ok);

        if (!response.ok) {
          if (response.status === 404) {
            console.log('❌ Profile not found (404)');
            setError('Profile not found');
            setIsLoading(false);
            return;
          }
          console.log('❌ API error:', response.status, response.statusText);
          setError('Failed to load profile');
          setIsLoading(false);
          return;
        }

        const responseData = await response.json();
        console.log('📊 API Response data:', responseData);

        if (!responseData || !responseData.data) {
          console.log('❌ No profile data found');
          setError('Profile not found');
          setIsLoading(false);
          return;
        }

        setProfileData(responseData.data);
        console.log('🔍 Frontend Debug - Profile data received:', responseData.data);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setError('Failed to load profile');
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Not Found</h1>
          <p className="text-gray-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/search')}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Search for Users
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return null;
  }

  // Helper function to split string fields into arrays for display
  const splitField = (field: string | null | undefined): string[] => {
    if (!field || typeof field !== 'string') return [];
    return field.split(',').map(item => item.trim()).filter(Boolean);
  };

  // Debug logging
  console.log('🔍 JSX Debug - Headline value:', profileData?.headline);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-900 pt-24 overflow-hidden">
      {/* Full-screen blue-violet gradient background - hidden in dark mode */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-400 to-violet-400 dark:from-slate-900 dark:to-slate-900"></div>
      {/* Animated background elements - hidden in dark mode */}
      <div className="absolute inset-0 overflow-hidden z-0 dark:hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full filter blur-xl animate-blob"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full filter blur-xl animate-blob animation-delay-2000"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 1.5, delay: 0.4, ease: 'easeOut' }}
          className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full filter blur-xl animate-blob animation-delay-4000"
        />
      </div>
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-[0.02] z-0"></div>
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rest of the profile content */}
        <div className="bg-white/70 dark:bg-slate-800/80 rounded-lg shadow-sm backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/60 dark:bg-slate-800/60 rounded-2xl shadow-xl p-8 backdrop-blur"
          >
            {/* Header Section with Profile Photo */}
            <div className="border-b border-gray-200 dark:border-slate-700 pb-6 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                {profileData.profilePhotoUrl && (
                  <img
                    src={profileData.profilePhotoUrl}
                    alt="Profile Photo"
                    className="w-24 h-24 rounded-full object-cover border border-gray-300 dark:border-slate-600 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-shadow duration-300"
                  />
                )}
                <div>
                  <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{profileData.fullName}</h1>
                    {profileData.linkedinUrl && (
                      <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <FaLinkedin className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 h-6 w-6" />
                      </a>
                    )}
                    {profileData.resumeUrl && (
                      <a href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 h-6 w-6" />
                      </a>
                    )}
                  </div>
                  {profileData.headline && (
                    <p className="text-lg text-gray-600 dark:text-slate-300 mt-1">{profileData.headline}</p>
                  )}
                  <p className="text-md text-gray-500 dark:text-slate-400 mb-1">@{profileData.username}</p>
                  <div className="flex items-center gap-4 mt-2 text-gray-500 dark:text-slate-400">
                    <p>{profileData.highSchool}</p>
                    <span>&bull;</span>
                    <p>{profileData.gradeLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-8 rounded-lg p-6 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-700 dark:via-slate-700 dark:to-slate-700 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">About</h2>
              <div>
                <p className="text-gray-700 dark:text-slate-300 whitespace-pre-line">
                  {profileData.bio ? profileData.bio : <span className='italic text-gray-500 dark:text-slate-400'>No information provided.</span>}
                </p>
              </div>
            </div>

            {/* Interests Section */}
            {profileData.interests && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {splitField(profileData.interests).map((interest, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${interestColors[index % interestColors.length]} dark:bg-opacity-20 dark:text-slate-200`}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extracurriculars Section */}
            {profileData.extracurriculars && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Extracurriculars</h2>
                <p className="text-gray-700 dark:text-slate-300">{profileData.extracurriculars}</p>
              </div>
            )}

            {/* Skills Section */}
            {profileData.skills && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Skills</h2>
                <p className="text-gray-700 dark:text-slate-300">{profileData.skills}</p>
              </div>
            )}

            {/* Experience Section */}
            {profileData.experience && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Experience</h2>
                <p className="text-gray-700 dark:text-slate-300 whitespace-pre-line">{profileData.experience}</p>
              </div>
            )}

            {/* Achievements Section */}
            {profileData.achievements && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Achievements</h2>
                <p className="text-gray-700 dark:text-slate-300">{profileData.achievements}</p>
              </div>
            )}

            {/* Career Interests Section */}
            {profileData.careerInterests && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Career Interests</h2>
                <p className="text-gray-700 dark:text-slate-300">{profileData.careerInterests}</p>
              </div>
            )}

            {/* Languages Section */}
            {profileData.languages && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Languages</h2>
                <p className="text-gray-700 dark:text-slate-300">{profileData.languages}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* Location */}
                  {profileData.location && (
                    <div className="flex items-center text-gray-700 dark:text-slate-300 relative">
                      <span className="font-medium w-24">Location:</span>
                      {isPremium ? (
                        <span>{profileData.location}, {profileData.state}</span>
                      ) : (
                        <span className="relative flex items-center">
                          <span className="select-none pointer-events-none blur-sm bg-gray-200 dark:bg-slate-600 rounded px-2 py-1 text-gray-400 dark:text-slate-500" style={{ userSelect: 'none' }}>
                            {profileData.location}, {profileData.state}
                          </span>
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer z-10" style={{ userSelect: 'none' }} onClick={() => setShowPremiumModal(true)}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.01z" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5"/><circle cx="12" cy="12" r="11" stroke="#a78bfa" strokeWidth="1.5" fill="none"/></svg>
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                  {/* Phone */}
                  {profileData.phoneNumber && (
                    <div className="flex items-center text-gray-700 dark:text-slate-300 relative">
                      <span className="font-medium w-24">Phone:</span>
                      {isPremium ? (
                        <span>{profileData.phoneNumber}</span>
                      ) : (
                        <span className="relative flex items-center">
                          <span className="select-none pointer-events-none blur-sm bg-gray-200 dark:bg-slate-600 rounded px-2 py-1 text-gray-400 dark:text-slate-500" style={{ userSelect: 'none' }}>
                            {profileData.phoneNumber}
                          </span>
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer z-10" style={{ userSelect: 'none' }} onClick={() => setShowPremiumModal(true)}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.01z" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5"/><circle cx="12" cy="12" r="11" stroke="#a78bfa" strokeWidth="1.5" fill="none"/></svg>
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                  {/* Email */}
                  {profileData.email && (
                    <div className="flex items-center text-gray-700 dark:text-slate-300 relative">
                      <span className="font-medium w-24">Email:</span>
                      {isPremium ? (
                        <span>
                          <a href={`mailto:${profileData.email}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline">{profileData.email}</a>
                        </span>
                      ) : (
                        <span className="relative flex items-center">
                          <span className="select-none pointer-events-none blur-sm bg-gray-200 dark:bg-slate-600 rounded px-2 py-1 text-gray-400 dark:text-slate-500" style={{ userSelect: 'none' }}>
                            {profileData.email}
                          </span>
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 cursor-pointer z-10" style={{ userSelect: 'none' }} onClick={() => setShowPremiumModal(true)}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.01z" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5"/><circle cx="12" cy="12" r="11" stroke="#a78bfa" strokeWidth="1.5" fill="none"/></svg>
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                  {/* If all are missing */}
                  {!profileData.location && !profileData.phoneNumber && !profileData.email && (
                    <p className="text-gray-500 dark:text-slate-400 italic">No contact information available</p>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 dark:text-slate-400 mb-4">Sign in to view contact information</p>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity duration-200 shadow-md"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Premium Modal */}
            {showPremiumModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-sm w-full relative flex flex-col items-center">
                  <button
                    className="absolute top-2 right-2 text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 text-2xl font-bold focus:outline-none"
                    onClick={() => setShowPremiumModal(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <span className="mb-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none"><path d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.01z" fill="#a78bfa" stroke="#a78bfa" strokeWidth="1.5"/><circle cx="12" cy="12" r="11" stroke="#a78bfa" strokeWidth="1.5" fill="none"/></svg>
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Unlock Contact Info</h3>
                  <p className="text-gray-500 dark:text-slate-400 mb-6 text-center">Make smarter decisions and increase your chances of success by unlocking direct contact details.</p>
                  <button
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-400 to-blue-400 text-white font-semibold text-lg shadow-md hover:opacity-90 transition-opacity duration-200"
                    onClick={e => e.preventDefault()}
                  >
                    Try Premium for $0
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      {/* Add custom styles for blob animation and grid pattern */}
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