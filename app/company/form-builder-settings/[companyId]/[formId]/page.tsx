'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Cog6ToothIcon, 
  DocumentTextIcon, 
  EyeIcon, 
  XMarkIcon,
  BellIcon,
  LockClosedIcon,
  UserGroupIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast, { Toaster } from 'react-hot-toast';

interface FormSettings {
  accepting_responses: boolean;
  max_responses: number | null;
  submission_deadline: string | null;
  notify_on_submission: boolean;
  notification_email: string;
  allow_editing: boolean;
  auto_save: boolean;
  form_privacy: 'public' | 'private' | 'organization';
  primary_color: number | null;
  background_color: number | null;
  font_family: string;
  border_radius: number | null;
  spacing: number | null;
}

export default function FormBuilderSettings({ params: { companyId, formId } }: { params: { companyId: string, formId: string } }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [activeTab, setActiveTab] = useState<'build' | 'settings' | 'publish'>('settings');
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<FormSettings>({
    accepting_responses: true,
    max_responses: null,
    submission_deadline: null,
    notify_on_submission: true,
    notification_email: '',
    allow_editing: false,
    auto_save: true,
    form_privacy: 'private',
    primary_color: null,
    background_color: null,
    font_family: '',
    border_radius: null,
    spacing: null,
  });
  const [localSettings, setLocalSettings] = useState<FormSettings>({
    ...settings
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const { data: formData, error } = await supabase
        .from('forms')
        .select(`
          accepting_responses,
          max_responses,
          submission_deadline,
          notify_on_submission,
          notification_email,
          allow_editing,
          auto_save,
          form_privacy,
          primary_color,
          background_color,
          font_family,
          border_radius,
          spacing
        `)
        .eq('id', formId)
        .single();

      if (error) throw error;
      if (formData) {
        const deadline = formData.submission_deadline 
          ? new Date(formData.submission_deadline).toISOString().slice(0, 16) 
          : null;
        const settingsData = {
          accepting_responses: formData.accepting_responses,
          max_responses: formData.max_responses,
          submission_deadline: deadline,
          notify_on_submission: formData.notify_on_submission,
          notification_email: formData.notification_email || '',
          allow_editing: formData.allow_editing,
          auto_save: formData.auto_save,
          form_privacy: formData.form_privacy,
          primary_color: formData.primary_color,
          background_color: formData.background_color,
          font_family: formData.font_family || '',
          border_radius: formData.border_radius,
          spacing: formData.spacing,
        };
        setSettings(settingsData);
        setLocalSettings(settingsData);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: keyof FormSettings, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = async () => {
    const saveToast = toast.loading('Saving changes...');
    try {
      const submission_deadline = localSettings.submission_deadline 
        ? new Date(localSettings.submission_deadline).toISOString()
        : null;
      const updateData = {
        accepting_responses: localSettings.accepting_responses,
        max_responses: localSettings.max_responses,
        submission_deadline,
        notify_on_submission: localSettings.notify_on_submission,
        notification_email: localSettings.notification_email,
        allow_editing: localSettings.allow_editing,
        auto_save: localSettings.auto_save,
        form_privacy: localSettings.form_privacy,
        primary_color: localSettings.primary_color,
        background_color: localSettings.background_color,
        font_family: localSettings.font_family,
        border_radius: localSettings.border_radius,
        spacing: localSettings.spacing,
      };
      const { data, error } = await supabase
        .from('forms')
        .update(updateData)
        .eq('id', formId)
        .select();
      if (error) throw error;
      setSettings(localSettings);
      setHasUnsavedChanges(false);
      toast.success('Settings saved successfully', { id: saveToast });
      await loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.', { id: saveToast });
    }
  };

  // Navigation functions
  const navigateToBuild = () => {
    router.push(`/company/form-builder/${companyId}/${formId}`);
  };

  const navigateToPreview = () => {
    router.push(`/company/form-builder-pnp/${companyId}/${formId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="bottom-right" />
      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm" style={{ zIndex: 50 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-10">
              <button
                onClick={() => router.push('/company-dash')}
                className="text-gray-600 hover:text-gray-900"
              >
                <XMarkIcon className="h-8 w-8" />
              </button>
              <div className="flex space-x-6">
                <button
                  onClick={navigateToBuild}
                  className={`px-6 py-3 rounded-md text-lg font-medium ${
                    activeTab === 'build'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <DocumentTextIcon className="h-6 w-6 inline-block mr-3" />
                  Build
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-6 py-3 rounded-md text-lg font-medium ${
                    activeTab === 'settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Cog6ToothIcon className="h-6 w-6 inline-block mr-3" />
                  Settings
                </button>
                <button
                  onClick={navigateToPreview}
                  className={`px-6 py-3 rounded-md text-lg font-medium ${
                    activeTab === 'publish'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <EyeIcon className="h-6 w-6 inline-block mr-3" />
                  Preview & Publish
                </button>
              </div>
            </div>
            <button
              onClick={saveSettings}
              disabled={!hasUnsavedChanges}
              className={`px-6 py-3 text-white rounded-md transition-colors duration-200 text-lg font-medium ${
                hasUnsavedChanges 
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="pt-48 pb-16 relative" style={{ zIndex: 30 }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Form Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <DocumentDuplicateIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-black">Form Status</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <span className="text-black">Accepting Responses</span>
                  </label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localSettings.accepting_responses}
                      onChange={(e) => handleSettingChange('accepting_responses', e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>

            {/* Access Control */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <LockClosedIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-black">Access Control</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">Form Privacy</label>
                <select
                  value={localSettings.form_privacy}
                  onChange={(e) => handleSettingChange('form_privacy', e.target.value as 'public' | 'private' | 'organization')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-black"
                >
                  <option value="public">Public - Anyone can view and submit</option>
                  <option value="private">Private - Only invited users can access</option>
                  <option value="organization">Organization - Only company members can access</option>
                </select>
              </div>
            </div>

            {/* Response Limits */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <UserGroupIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-black">Response Limits</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Maximum Responses</label>
                  <input
                    type="number"
                    value={localSettings.max_responses || ''}
                    onChange={(e) => handleSettingChange('max_responses', e.target.value ? parseInt(e.target.value) : null)}
                    placeholder="No limit"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Submission Deadline</label>
                  <input
                    type="datetime-local"
                    value={localSettings.submission_deadline || ''}
                    onChange={(e) => handleSettingChange('submission_deadline', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <BellIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-black">Notifications</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <span className="text-black">Email Notifications on Submission</span>
                  </label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localSettings.notify_on_submission}
                      onChange={(e) => handleSettingChange('notify_on_submission', e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                {localSettings.notify_on_submission && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Notification Email</label>
                    <input
                      type="email"
                      value={localSettings.notification_email}
                      onChange={(e) => handleSettingChange('notification_email', e.target.value)}
                      placeholder="email@company.com"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Response Handling */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <ClockIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-black">Response Handling</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <span className="text-black">Allow Editing After Submission</span>
                  </label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localSettings.allow_editing}
                      onChange={(e) => handleSettingChange('allow_editing', e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <span className="text-black">Auto-save Responses</span>
                  </label>
                  <div className="relative inline-block w-12 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      checked={localSettings.auto_save}
                      onChange={(e) => handleSettingChange('auto_save', e.target.checked)}
                      className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                  </div>
                </div>
              </div>
            </div>

            {/* Theme Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Cog6ToothIcon className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-black">Theme Settings</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Primary Color</label>
                  <input
                    type="color"
                    value={localSettings.primary_color !== null ? `#${localSettings.primary_color.toString(16).padStart(6, '0')}` : '#000000'}
                    onChange={e => {
                      const hex = e.target.value.replace('#', '');
                      handleSettingChange('primary_color', parseInt(hex, 16));
                    }}
                    className="w-16 h-10 p-0 border-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Background Color</label>
                  <input
                    type="color"
                    value={localSettings.background_color !== null ? `#${localSettings.background_color.toString(16).padStart(6, '0')}` : '#ffffff'}
                    onChange={e => {
                      const hex = e.target.value.replace('#', '');
                      handleSettingChange('background_color', parseInt(hex, 16));
                    }}
                    className="w-16 h-10 p-0 border-none bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Font Family</label>
                  <select
                    value={localSettings.font_family}
                    onChange={e => handleSettingChange('font_family', e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md text-black"
                  >
                    <option value="">Default</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Border Radius (px)</label>
                  <input
                    type="number"
                    value={localSettings.border_radius ?? ''}
                    onChange={e => handleSettingChange('border_radius', e.target.value ? parseInt(e.target.value) : null)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    min={0}
                    max={100}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Spacing (px)</label>
                  <input
                    type="number"
                    value={localSettings.spacing ?? ''}
                    onChange={e => handleSettingChange('spacing', e.target.value ? parseInt(e.target.value) : null)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                    min={0}
                    max={100}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add styles for toggle switches */}
      <style jsx>{`
        .toggle-checkbox:checked {
          right: 0;
          border-color: #3b82f6;
        }
        .toggle-checkbox:checked + .toggle-label {
          background-color: #3b82f6;
        }
        .toggle-checkbox {
          right: 0;
          transition: all 0.3s;
        }
        .toggle-label {
          transition: background-color 0.3s;
        }
      `}</style>
    </div>
  );