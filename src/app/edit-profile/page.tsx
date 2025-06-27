'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface ProfileData {
  fullName: string;
  email: string;
  username: string;
  phoneNumber: string;
  address: string;
  state: string;
  highSchool: string;
  gradeLevel: string;
  age: string;
  skills: string[];
  experience: string;
  extracurriculars: string[];
  achievements: string[];
  careerInterests: string[];
  resumeUrl: string;
  profilePhotoUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  bio: string;
  headline?: string;
  interests: string[];
  languages: string[];
  certifications: string[];
}

export default function EditProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileData>({
    fullName: '',
    email: '',
    username: '',
    phoneNumber: '',
    address: '',
    state: '',
    highSchool: '',
    gradeLevel: '',
    age: '',
    skills: [],
    experience: '',
    extracurriculars: [],
    achievements: [],
    careerInterests: [],
    resumeUrl: '',
    bio: '',
    headline: '',
    interests: [],
    languages: [],
    certifications: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/intern-sign-in');
      return;
    }
    fetchProfileData();
  }, [router]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/intern-sign-in');
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const data = await response.json();
      console.log('Fetched profile data:', data);

      setFormData({
        fullName: data.fullName || data.name || '',
        email: data.email || '',
        username: data.username || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || data.location || '',
        state: data.state || '',
        highSchool: data.highSchool || '',
        gradeLevel: data.gradeLevel || '',
        age: data.age || '',
        skills: data.skills || [],
        experience: data.experience || '',
        extracurriculars: data.extracurriculars || [],
        achievements: data.achievements || [],
        careerInterests: data.careerInterests || [],
        resumeUrl: data.resumeUrl || '',
        bio: data.bio || '',
        headline: data.headline || '',
        interests: data.interests || [],
        languages: data.languages || [],
        certifications: data.certifications || [],
        profilePhotoUrl: data.profilePhotoUrl || '',
        linkedinUrl: data.linkedinUrl || '',
        githubUrl: data.githubUrl || '',
        portfolioUrl: data.portfolioUrl || '',
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to load profile data'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/intern-sign-in');
        return;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          location: formData.address,
          state: formData.state,
          highSchool: formData.highSchool,
          gradeLevel: formData.gradeLevel,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
          skills: formData.skills,
          experience: formData.experience,
          extracurriculars: formData.extracurriculars,
          achievements: formData.achievements,
          careerInterests: formData.careerInterests,
          resumeUrl: formData.resumeUrl,
          bio: formData.bio,
          headline: formData.headline,
          interests: formData.interests,
          languages: formData.languages,
          certifications: formData.certifications,
          linkedinUrl: formData.linkedinUrl,
          githubUrl: formData.githubUrl,
          portfolioUrl: formData.portfolioUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const arrayValue = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      [name]: arrayValue
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
          {message && (
            <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">Full Name</label>
                  <input type="text" id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                  <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email</label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-300">Phone Number</label>
                  <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-300">Address</label>
                  <input type="text" id="address" name="address" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-300">State</label>
                  <input type="text" id="state" name="state" value={formData.state} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
            </div>
            
            <div className="space-y-6 bg-gray-800 p-6 rounded-lg">
                <div>
                    <label htmlFor="headline" className="block text-sm font-medium text-gray-300">Headline</label>
                    <input id="headline" name="headline" type="text" value={formData.headline} onChange={handleInputChange} maxLength={100} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="A short, catchy phrase..." />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-300">About</label>
                    <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Tell us about yourself..."></textarea>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-4">Education</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="highSchool" className="block text-sm font-medium text-gray-300">High School</label>
                    <input type="text" id="highSchool" name="highSchool" value={formData.highSchool} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-300">Grade Level</label>
                    <input type="text" id="gradeLevel" name="gradeLevel" value={formData.gradeLevel} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="age" className="block text-sm font-medium text-gray-300">Age</label>
                    <input type="number" id="age" name="age" value={formData.age} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Professional Info</h3>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="skills" className="block text-sm font-medium text-gray-300">Skills</label>
                        <textarea id="skills" name="skills" value={Array.isArray(formData.skills) ? formData.skills.join(', ') : ''} onChange={handleArrayInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., Python, JavaScript, Public Speaking"></textarea>
                    </div>
                    <div>
                        <label htmlFor="experience" className="block text-sm font-medium text-gray-300">Experience</label>
                        <textarea id="experience" name="experience" value={formData.experience} onChange={handleInputChange} rows={3} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <label htmlFor="extracurriculars" className="block text-sm font-medium text-gray-300">Extracurriculars</label>
                        <textarea id="extracurriculars" name="extracurriculars" value={Array.isArray(formData.extracurriculars) ? formData.extracurriculars.join(', ') : ''} onChange={handleArrayInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <label htmlFor="achievements" className="block text-sm font-medium text-gray-300">Achievements</label>
                        <textarea id="achievements" name="achievements" value={Array.isArray(formData.achievements) ? formData.achievements.join(', ') : ''} onChange={handleArrayInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                    <div>
                        <label htmlFor="careerInterests" className="block text-sm font-medium text-gray-300">Career Interests</label>
                        <textarea id="careerInterests" name="careerInterests" value={Array.isArray(formData.careerInterests) ? formData.careerInterests.join(', ') : ''} onChange={handleArrayInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"></textarea>
                    </div>
                </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4">Social & Portfolio Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-300">LinkedIn URL</label>
                        <input type="url" id="linkedinUrl" name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-300">GitHub URL</label>
                        <input type="url" id="githubUrl" name="githubUrl" value={formData.githubUrl} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="portfolioUrl" className="block text-sm font-medium text-gray-300">Portfolio URL</label>
                        <input type="url" id="portfolioUrl" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleInputChange} className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
} 