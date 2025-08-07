'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface Intern {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
}

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnnouncementCreated: () => void;
}

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onAnnouncementCreated
}: CreateAnnouncementModalProps) {
  const [interns, setInterns] = useState<Intern[]>([]);
  const [selectedInterns, setSelectedInterns] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);

  

  useEffect(() => {
    if (isOpen) {
      fetchInterns();
    }
  }, [isOpen]);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const { data: interns } = await supabase
        .from('interns')
        .select('id, first_name, last_name, profile_photo_url')
        .order('first_name');
      
      if (interns) {
        setInterns(interns);
      }
    } catch (error) {
      console.error('Error fetching interns:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleInternSelection = (internId: string) => {
    setSelectedInterns(prev => 
      prev.includes(internId) 
        ? prev.filter(id => id !== internId)
        : [...prev, internId]
    );
  };

  const createAnnouncement = async () => {
    if (!title.trim() || !content.trim() || selectedInterns.length === 0) return;

    setCreating(true);
    try {
      const promises = selectedInterns.map(internId =>
        fetch('/api/announcements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title,
            content,
            recipient_id: internId,
            recipient_type: 'intern'
          }),
        })
      );

      await Promise.all(promises);
      onAnnouncementCreated();
      onClose();
      setTitle('');
      setContent('');
      setSelectedInterns([]);
    } catch (error) {
      console.error('Error creating announcements:', error);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Announcement
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Announcement content..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Recipients ({selectedInterns.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-2">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              ) : interns.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No interns found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {interns.map((intern) => (
                    <div
                      key={intern.id}
                      onClick={() => toggleInternSelection(intern.id)}
                      className={`p-2 rounded cursor-pointer border ${
                        selectedInterns.includes(intern.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {intern.profile_photo_url ? (
                            <img
                              src={intern.profile_photo_url}
                              alt="Avatar"
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-gray-600 text-xs font-medium">
                                {intern.first_name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {intern.first_name} {intern.last_name}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedInterns.includes(intern.id)}
                            onChange={() => toggleInternSelection(intern.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            onClick={createAnnouncement}
            disabled={!title.trim() || !content.trim() || selectedInterns.length === 0 || creating}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Announcement'}
          </button>
        </div>
      </div>
    </div>
  );
} 