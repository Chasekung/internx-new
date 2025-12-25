"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
}

const states = [
  'AL', 'AK', 'AZ', 'AR', 'AS', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'MP', 'OH', 'OK', 'OR', 'PA', 'PR', 'RI', 'SC', 'SD', 'TN', 'TX', 'TT', 'UT', 'VT', 'VA', 'VI', 'WA', 'WV', 'WI', 'WY'
];

const EditPage = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('contact');
  const [profileData, setProfileData] = useState<ProfileData>({
    email: '',
    username: '',
    fullName: '',
    phoneNumber: '',
    address: '',
    state: '',
    highSchool: '',
    gradeLevel: '',
    age: '',
    skills: '',
    experience: '',
    extracurriculars: '',
    achievements: '',
    careerInterests: '',
    resumeUrl: '',
    bio: '',
    headline: '',
    interests: '',
    languages: '',
    certifications: [],
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [editInterests, setEditInterests] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [showReminder, setShowReminder] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/intern-sign-in');
      return;
    }
    fetchProfileData();
  }, [router]);

  useEffect(() => {
    if (!profilePhoto) {
      if (profileData.profilePhotoUrl) {
        setProfilePhotoPreview(profileData.profilePhotoUrl);
      } else {
        setProfilePhotoPreview(null);
      }
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(profilePhoto);
  }, [profilePhoto, profileData.profilePhotoUrl]);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/sign-in');
        return;
      }

      const response = await fetch('/api/interns/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile data');
      }

      const { data: profileData } = await response.json();
      console.log('Fetched profile data:', profileData);

      setProfileData({
        fullName: profileData.full_name || '',
        email: profileData.email || '',
        username: profileData.username || '',
        phoneNumber: profileData.phone || '',
        address: profileData.location || '',
        state: profileData.state || '',
        highSchool: profileData.high_school || '',
        gradeLevel: profileData.grade_level || '',
        age: profileData.age ? profileData.age.toString() : '',
        skills: profileData.skills || '',
        experience: profileData.experience || '',
        extracurriculars: profileData.extracurriculars || '',
        achievements: profileData.achievements || '',
        careerInterests: profileData.career_interests || '',
        resumeUrl: profileData.resume_url || '',
        bio: profileData.bio || '',
        headline: profileData.headline || '',
        interests: profileData.interests || '',
        languages: profileData.languages || '',
        certifications: Array.isArray(profileData.certifications) ? profileData.certifications : [],
        profilePhotoUrl: profileData.profile_photo_url || '',
        linkedinUrl: profileData.linkedin_url || '',
        githubUrl: profileData.github_url || '',
        portfolioUrl: profileData.portfolio_url || '',
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to load profile data'
      });
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/sign-in');
        return;
      }

      let profilePhotoUrl = undefined;
      if (profilePhoto) {
        const formData = new FormData();
        formData.append('file', profilePhoto);
        const uploadRes = await fetch('/api/user/profile-photo', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload profile photo');
        }
        profilePhotoUrl = uploadData.url;
      }

      console.log('Saving profile with data:', profileData);

      const response = await fetch('/api/interns/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: profileData.fullName,
          email: profileData.email,
          username: profileData.username,
          phone: profileData.phoneNumber,
          location: profileData.address,
          state: profileData.state,
          high_school: profileData.highSchool,
          grade_level: profileData.gradeLevel,
          age: profileData.age ? parseInt(profileData.age, 10) : undefined,
          skills: profileData.skills,
          experience: profileData.experience,
          extracurriculars: profileData.extracurriculars,
          achievements: profileData.achievements,
          career_interests: profileData.careerInterests,
          resume_url: profileData.resumeUrl,
          bio: profileData.bio,
          headline: profileData.headline,
          interests: profileData.interests,
          languages: profileData.languages,
          certifications: profileData.certifications,
          linkedin_url: profileData.linkedinUrl,
          github_url: profileData.githubUrl,
          portfolio_url: profileData.portfolioUrl,
          profile_photo_url: profilePhotoUrl || profileData.profilePhotoUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const { data: updatedProfile } = await response.json();
      console.log('Profile updated successfully:', updatedProfile);

      setProfileData({
        ...profileData,
        fullName: updatedProfile.full_name || profileData.fullName,
        address: updatedProfile.location || profileData.address,
        state: updatedProfile.state || profileData.state,
        highSchool: updatedProfile.high_school || profileData.highSchool,
        gradeLevel: updatedProfile.grade_level || profileData.gradeLevel,
        age: updatedProfile.age ? updatedProfile.age.toString() : profileData.age,
        skills: updatedProfile.skills || profileData.skills,
        experience: updatedProfile.experience || profileData.experience,
        extracurriculars: updatedProfile.extracurriculars || profileData.extracurriculars,
        achievements: updatedProfile.achievements || profileData.achievements,
        careerInterests: updatedProfile.career_interests || profileData.careerInterests,
        bio: updatedProfile.bio || profileData.bio,
        headline: updatedProfile.headline || profileData.headline,
        interests: updatedProfile.interests || profileData.interests,
        languages: updatedProfile.languages || profileData.languages,
        certifications: Array.isArray(updatedProfile.certifications) ? updatedProfile.certifications : [],
        linkedinUrl: updatedProfile.linkedin_url || profileData.linkedinUrl,
        githubUrl: updatedProfile.github_url || profileData.githubUrl,
        portfolioUrl: updatedProfile.portfolio_url || profileData.portfolioUrl,
        resumeUrl: updatedProfile.resume_url || profileData.resumeUrl,
        profilePhotoUrl: updatedProfile.profile_photo_url || profileData.profilePhotoUrl,
      });

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile'
      });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Only image files are allowed.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Image must be less than 2MB.' });
      return;
    }
    setProfilePhoto(file);
    setMessage(null);
  };

  // Update handleDeleteAccount to show modal
  const handleDeleteAccount = () => {
    setDeleteInput('');
    setDeleteError('');
    setShowDeleteModal(true);
  };

  // Confirm delete handler
  const confirmDeleteAccount = async () => {
    if (deleteInput.trim() !== 'DELETE') {
      setDeleteError('Please type "DELETE" exactly to confirm account deletion.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/intern-sign-in');
        return;
      }
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ confirmation: deleteInput.trim() })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }
      // Remove token and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setShowDeleteModal(false);
      setMessage({ type: 'success', text: 'Account deleted. Redirecting...' });
      setTimeout(() => {
        setMessage(null);
        router.push('/');
      }, 2000);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Reminder Message */}
        {showReminder && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300 rounded flex items-center justify-between">
            <span><span className="font-semibold">Reminder:</span> If you don't want certain information to be visible on your public profile, simply leave those fields blank.</span>
            <button
              onClick={() => setShowReminder(false)}
              className="ml-4 text-yellow-700 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-200 text-lg font-bold focus:outline-none"
              aria-label="Dismiss reminder"
            >
              ×
            </button>
          </div>
        )}
        {/* Message Display */}
        {message && (
          <div className={`fixed bottom-20 left-4 p-4 rounded-md shadow-lg ${
            message.type === 'success' 
              ? 'bg-green-500 bg-opacity-90' 
              : 'bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-white/20 dark:border-slate-700/50">
          {/* Navigation */}
          <div className="border-b border-gray-200 dark:border-slate-700">
            <nav className="flex -mb-px">
              {['contact', 'education', 'bio', 'skills', 'links'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`py-4 px-6 text-sm font-medium transition-colors duration-200
                    ${activeSection === section
                      ? 'border-b-2 border-blue-500 text-blue-700 dark:text-blue-400 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100 dark:from-slate-700 dark:via-slate-700 dark:to-slate-700'
                      : 'text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 bg-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 dark:hover:from-slate-700 dark:hover:via-slate-700 dark:hover:to-slate-700 hover:shadow-md hover:brightness-110'}
                  `}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* ... (rest of the tabbed UI code remains unchanged) ... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPage; 