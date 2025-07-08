'use client';

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100 pt-32 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Reminder Message */}
        {showReminder && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded flex items-center justify-between">
            <span><span className="font-semibold">Reminder:</span> If you don't want certain information to be visible on your public profile, simply leave those fields blank.</span>
            <button
              onClick={() => setShowReminder(false)}
              className="ml-4 text-yellow-700 hover:text-yellow-900 text-lg font-bold focus:outline-none"
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
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          {/* Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['contact', 'education', 'bio', 'skills', 'links'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`py-4 px-6 text-sm font-medium transition-colors duration-200
                    ${activeSection === section
                      ? 'border-b-2 border-blue-500 text-blue-700 bg-gradient-to-r from-blue-100 via-indigo-50 to-purple-100'
                      : 'text-gray-700 hover:text-gray-900 hover:border-gray-300 bg-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 hover:shadow-md hover:brightness-110'}
                  `}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <span className="inline-block h-24 w-24 rounded-full overflow-hidden bg-gray-100 mr-6">
                      {profilePhotoPreview ? (
                        <img src={profilePhotoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.997A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">{profileData.fullName}</h1>
                      <p className="text-sm text-gray-500">@{profileData.username}</p>
                    </div>
                  </div>
                </div>
                {activeSection === 'contact' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={profileData.email}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Username</label>
                        <input
                          type="text"
                          name="username"
                          value={profileData.username}
                          readOnly
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 text-gray-900 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Phone Number</label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Address</label>
                        <input
                          type="text"
                          name="address"
                          value={profileData.address}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">State</label>
                        <select
                          name="state"
                          value={profileData.state}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="">Select State</option>
                          {states.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">High School</label>
                        <input
                          type="text"
                          name="highSchool"
                          value={profileData.highSchool}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Grade Level</label>
                        <input
                          type="text"
                          name="gradeLevel"
                          value={profileData.gradeLevel}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Age</label>
                        <input
                          type="text"
                          name="age"
                          value={profileData.age}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'education' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Education Information</h2>
                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">High School</label>
                        <input
                          type="text"
                          name="highSchool"
                          value={profileData.highSchool}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Grade Level</label>
                        <select
                          name="gradeLevel"
                          value={profileData.gradeLevel}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="">Select Grade</option>
                          <option value="9th Grade">9th Grade</option>
                          <option value="10th Grade">10th Grade</option>
                          <option value="11th Grade">11th Grade</option>
                          <option value="12th Grade">12th Grade</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Age</label>
                        <input
                          type="number"
                          name="age"
                          value={profileData.age}
                          onChange={handleInputChange}
                          min="13"
                          max="19"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., 16"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Extracurricular Activities</label>
                        <textarea
                          name="extracurriculars"
                          value={profileData.extracurriculars}
                          onChange={handleInputChange}
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="List your clubs, sports, volunteer work, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Achievements & Awards</label>
                        <textarea
                          name="achievements"
                          value={profileData.achievements}
                          onChange={handleInputChange}
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="List any awards, honors, competitions won, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Experience</label>
                        <textarea
                          name="experience"
                          value={profileData.experience}
                          onChange={handleInputChange}
                          rows={4}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="Describe any relevant experience, projects, part-time jobs, etc."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'bio' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Bio</h2>
                    <div className="mb-6">
                      <label htmlFor="headline" className="block text-sm font-medium text-gray-700">Headline</label>
                      <input type="text" name="headline" id="headline" value={profileData.headline || ''} onChange={handleInputChange} maxLength={100} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900" />
                      <p className="mt-2 text-xs text-gray-500">A short, catchy phrase to appear under your name. (max 100 characters)</p>
                    </div>
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio Information</label>
                      <textarea name="bio" id="bio" value={profileData.bio || ''} onChange={handleInputChange} rows={5} maxLength={2000} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"></textarea>
                      <p className="mt-2 text-xs text-gray-500">About (max 2000 characters)</p>
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700">Change Profile Photo</label>
                      <div className="mt-2 flex items-center">
                        <input id="profile-photo-upload" name="profile-photo-upload" type="file" className="sr-only" onChange={handleProfilePhotoChange} accept="image/*" />
                        <label htmlFor="profile-photo-upload" className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
                          Upload a file
                        </label>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Max size: 2MB. Any image type allowed.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'skills' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Skills & Interests</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Skills</label>
                        {editInterests ? (
                          <div className="space-y-2">
                            <textarea
                              value={profileData.skills}
                              onChange={(e) => {
                                setProfileData(prev => ({ ...prev, skills: e.target.value }));
                              }}
                              rows={3}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                              placeholder="e.g., JavaScript, Python, Design, Leadership, Communication"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                onClick={() => setEditInterests(false)}
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                onClick={() => setEditInterests(false)}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <div className="flex flex-wrap gap-2">
                              {profileData.skills && typeof profileData.skills === 'string' && profileData.skills.trim() ? (
                                profileData.skills.split(',').map((skill, index) => (
                                  <span
                                    key={index}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                  >
                                    {skill.trim()}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-500 text-sm">No skills selected</span>
                              )}
                            </div>
                            <button
                              type="button"
                              className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                              onClick={() => setEditInterests(true)}
                            >
                              Edit
                            </button>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Career Interests</label>
                        <textarea
                          name="careerInterests"
                          value={profileData.careerInterests}
                          onChange={(e) => {
                            setProfileData(prev => ({ ...prev, careerInterests: e.target.value }));
                          }}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., Software Engineering, Marketing, Design, Medicine, Business"
                        />
                        <p className="mt-1 text-sm text-gray-500">Separate career interests with commas</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">General Interests</label>
                        <textarea
                          name="interests"
                          value={profileData.interests}
                          onChange={(e) => {
                            setProfileData(prev => ({ ...prev, interests: e.target.value }));
                          }}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., Reading, Gaming, Sports, Music, Art"
                        />
                        <p className="mt-1 text-sm text-gray-500">Separate interests with commas</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Languages</label>
                        <textarea
                          name="languages"
                          value={profileData.languages}
                          onChange={(e) => {
                            setProfileData(prev => ({ ...prev, languages: e.target.value }));
                          }}
                          rows={2}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="e.g., English, Spanish, French"
                        />
                        <p className="mt-1 text-sm text-gray-500">Separate languages with commas</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'certificates' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Certificates</h2>
                    <p className="text-gray-700">Coming soon...</p>
                  </div>
                )}

                {activeSection === 'links' && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-gray-900">Professional Links</h2>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-900">LinkedIn Profile URL</label>
                        <input
                          type="url"
                          name="linkedinUrl"
                          value={profileData.linkedinUrl || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="https://www.linkedin.com/in/your-profile"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Paste your LinkedIn profile URL here
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">GitHub Profile URL</label>
                        <input
                          type="url"
                          name="githubUrl"
                          value={profileData.githubUrl || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="https://github.com/your-username"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Paste your GitHub profile URL here
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Portfolio URL</label>
                        <input
                          type="url"
                          name="portfolioUrl"
                          value={profileData.portfolioUrl || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="https://your-portfolio.com"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Paste your portfolio website URL here
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900">Resume URL</label>
                        <input
                          type="url"
                          name="resumeUrl"
                          value={profileData.resumeUrl || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          placeholder="https://drive.google.com/your-resume"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Paste your resume URL here (Google Drive, Dropbox, etc.)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete Account
                </button>
              </div>
            </form>

            {/* Delete Account Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                  <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                    onClick={() => setShowDeleteModal(false)}
                    aria-label="Close"
                  >
                    ×
                  </button>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm Account Deletion</h2>
                  <p className="mb-4 text-gray-700">This action cannot be undone. To confirm, please type "DELETE" exactly below:</p>
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={e => { setDeleteInput(e.target.value); setDeleteError(''); }}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                    placeholder="Type 'DELETE' to confirm"
                  />
                  {deleteError && <div className="text-red-600 text-sm mb-2">{deleteError}</div>}
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteAccount}
                      className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPage; 