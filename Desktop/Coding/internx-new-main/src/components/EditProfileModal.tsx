import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileData {
  name: string;
  email: string;
  username: string;
  linkedinUrl: string;
  phoneNumber: string;
  location: string;
  bio: string;
  graduationYear: string;
  highSchool: string;
  interests: string[];
  otherInterests: string;
  skills: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileData) => void;
  initialData: ProfileData;
}

export default function EditProfileModal({ isOpen, onClose, onSave, initialData }: EditProfileModalProps) {
  const [activeSection, setActiveSection] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(initialData);

  const interestOptions = [
    'Computer Science',
    'Engineering',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Business',
    'Marketing',
    'Finance',
    'Design',
    'Art',
    'Music',
    'Writing',
    'Journalism',
    'Medicine',
    'Law',
    'Psychology',
    'Education',
    'Environmental Science',
    'Other'
  ];

  useEffect(() => {
    setProfileData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestChange = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
      otherInterests: interest === 'Other' && !prev.interests.includes(interest) ? prev.otherInterests : ''
    }));
  };

  const handleOtherInterestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData(prev => ({
      ...prev,
      otherInterests: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(profileData);
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex">
                {/* Navigation */}
                <div className="w-64 border-r border-gray-200">
                  <nav className="flex flex-col">
                    {['basic', 'contact', 'education', 'professional'].map((section) => (
                      <button
                        key={section}
                        onClick={() => setActiveSection(section)}
                        className={`py-4 px-6 text-sm font-medium text-left transition-all duration-200 ${
                          activeSection === section
                            ? 'bg-blue-50 border-l-4 border-blue-500 text-blue-600 font-semibold shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {section.charAt(0).toUpperCase() + section.slice(1)} Info
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Form */}
                <div className="flex-1">
                  <form onSubmit={handleSubmit} className="p-6">
                    {/* Basic Info Section */}
                    {activeSection === 'basic' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                              Full Name
                            </label>
                            <input
                              type="text"
                              name="name"
                              id="name"
                              value={profileData.name}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-900">
                              Username
                            </label>
                            <input
                              type="text"
                              name="username"
                              id="username"
                              value={profileData.username}
                              readOnly
                              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-blue-500 focus:ring-blue-500 cursor-not-allowed text-gray-900"
                            />
                            <p className="mt-1 text-sm text-gray-600">Username cannot be changed after registration</p>
                          </div>
                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                              Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={profileData.email}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-900">
                              Bio
                            </label>
                            <textarea
                              name="bio"
                              id="bio"
                              rows={3}
                              value={profileData.bio}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Info Section */}
                    {activeSection === 'contact' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-900">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              name="phoneNumber"
                              id="phoneNumber"
                              value={profileData.phoneNumber}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-900">
                              Location
                            </label>
                            <input
                              type="text"
                              name="location"
                              id="location"
                              value={profileData.location}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-900">
                              LinkedIn Profile
                            </label>
                            <input
                              type="url"
                              name="linkedinUrl"
                              id="linkedinUrl"
                              value={profileData.linkedinUrl}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Education Section */}
                    {activeSection === 'education' && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <div>
                            <label htmlFor="highSchool" className="block text-sm font-medium text-gray-900">
                              High School
                            </label>
                            <input
                              type="text"
                              name="highSchool"
                              id="highSchool"
                              value={profileData.highSchool}
                              onChange={handleChange}
                              placeholder="e.g., Bellarmine College Preparatory"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                          <div>
                            <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-900">
                              Expected Graduation Year
                            </label>
                            <input
                              type="text"
                              name="graduationYear"
                              id="graduationYear"
                              value={profileData.graduationYear}
                              onChange={handleChange}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-900 mb-2">
                              Interests
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {interestOptions.map((interest) => (
                                <label key={interest} className="inline-flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={profileData.interests.includes(interest)}
                                    onChange={() => handleInterestChange(interest)}
                                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                  />
                                  <span className="ml-2 text-sm text-gray-900">{interest}</span>
                                </label>
                              ))}
                            </div>
                            {profileData.interests.includes('Other') && (
                              <div className="mt-4">
                                <label htmlFor="otherInterests" className="block text-sm font-medium text-gray-900">
                                  Please specify your other interests
                                </label>
                                <input
                                  type="text"
                                  id="otherInterests"
                                  value={profileData.otherInterests}
                                  onChange={handleOtherInterestsChange}
                                  placeholder="Enter your other interests (comma-separated)"
                                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Professional Section */}
                    {activeSection === 'professional' && (
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="skills" className="block text-sm font-medium text-gray-900">
                            Skills (comma-separated)
                          </label>
                          <input
                            type="text"
                            name="skills"
                            id="skills"
                            value={profileData.skills}
                            onChange={handleChange}
                            placeholder="e.g., JavaScript, React, Node.js"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={saving}
                        className={`inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          saving ? 'opacity-75 cursor-not-allowed' : ''
                        }`}
                      >
                        {saving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 