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

export default function CompanyPublicProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchProfile = async () => {
      if (!params.id) {
        setError('Profile not found');
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/company-sign-in');
          return;
        }

        const response = await fetch(`/api/interns/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/company-sign-in');
            return;
          }
          if (response.status === 404) {
            setError('Profile not found');
            setIsLoading(false);
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        if (responseData.data) {
          setProfileData(responseData.data);
        } else {
          setError('Profile not found');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/company/search')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        {/* Rest of the profile content */}
        <div className="bg-white/70 rounded-lg shadow-sm backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/60 rounded-2xl shadow-xl p-8 backdrop-blur"
          >
            {/* Header Section with Profile Photo */}
            <div className="border-b border-gray-200 pb-6 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6">
                {profileData.profilePhotoUrl && (
                  <img
                    src={profileData.profilePhotoUrl}
                    alt="Profile Photo"
                    className="w-24 h-24 rounded-full object-cover border border-gray-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] transition-shadow duration-300"
                  />
                )}
                <div>
                  <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{profileData.fullName}</h1>
                    {profileData.linkedinUrl && (
                      <a href={profileData.linkedinUrl} target="_blank" rel="noopener noreferrer">
                        <FaLinkedin className="text-blue-600 hover:text-blue-800 h-6 w-6" />
                      </a>
                    )}
                    {profileData.resumeUrl && (
                      <a href={profileData.resumeUrl} target="_blank" rel="noopener noreferrer">
                        <FileText className="text-red-600 hover:text-red-800 h-6 w-6" />
                      </a>
                    )}
                  </div>
                  {profileData.headline && (
                    <p className="text-lg text-gray-600 mt-1">{profileData.headline}</p>
                  )}
                  <p className="text-md text-gray-500 mb-1">@{profileData.username}</p>
                  <div className="flex items-center gap-4 mt-2 text-gray-500">
                    <p>{profileData.highSchool}</p>
                    <span>&bull;</span>
                    <p>{profileData.gradeLevel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="mb-8 rounded-lg p-6 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">About</h2>
              <div>
                <p className="text-gray-700 whitespace-pre-line">
                  {profileData.bio ? profileData.bio : <span className='italic text-gray-500'>No information provided.</span>}
                </p>
              </div>
            </div>

            {/* Interests Section */}
            {profileData.interests && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Interests</h2>
                <div className="flex flex-wrap gap-2">
                  {splitField(profileData.interests).map((interest, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        interestColors[index % interestColors.length]
                      }`}
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills Section */}
            {profileData.skills && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {splitField(profileData.skills).map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience Section */}
            {profileData.experience && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Experience</h2>
                <p className="text-gray-700 whitespace-pre-line">{profileData.experience}</p>
              </div>
            )}

            {/* Extracurriculars Section */}
            {profileData.extracurriculars && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Extracurriculars</h2>
                <p className="text-gray-700 whitespace-pre-line">{profileData.extracurriculars}</p>
              </div>
            )}

            {/* Achievements Section */}
            {profileData.achievements && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Achievements</h2>
                <p className="text-gray-700 whitespace-pre-line">{profileData.achievements}</p>
              </div>
            )}

            {/* Career Interests Section */}
            {profileData.careerInterests && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Career Interests</h2>
                <p className="text-gray-700 whitespace-pre-line">{profileData.careerInterests}</p>
              </div>
            )}

            {/* Languages Section */}
            {profileData.languages && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Languages</h2>
                <div className="flex flex-wrap gap-2">
                  {splitField(profileData.languages).map((language, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{profileData.email}</p>
                </div>
                {profileData.phoneNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="text-gray-900">{profileData.phoneNumber}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Location</p>
                  <p className="text-gray-900">{profileData.location}, {profileData.state}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">School</p>
                  <p className="text-gray-900">{profileData.highSchool}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
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