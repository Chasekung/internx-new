'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/hooks/useSupabase';
import { 
  FiBold, 
  FiItalic, 
  FiUnderline, 
  FiList, 
  FiType,
  FiSave,
  FiX,
  FiUpload
} from 'react-icons/fi';

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  headline_image_url: string | null;
  body: string;
  author: string;
  tags: string[];
  published_at: string;
}

const RichTextEditor: React.FC<{ 
  value: string; 
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  return (
    <div className="border border-gray-300 dark:border-slate-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-800 border-b border-gray-300 dark:border-slate-600">
        <button
          type="button"
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
          title="Bold"
        >
          <FiBold size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
          title="Italic"
        >
          <FiItalic size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
          title="Underline"
        >
          <FiUnderline size={18} />
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-slate-600 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('formatBlock', '<h2>')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
          title="Heading"
        >
          <FiType size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
          title="Bullet List"
        >
          <FiList size={18} />
        </button>
        <button
          type="button"
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded"
          title="Numbered List"
        >
          <span className="text-sm font-bold">1.</span>
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-4 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none prose prose-lg dark:prose-invert max-w-none"
        style={{
          lineHeight: '1.8'
        }}
        suppressContentEditableWarning
      />
    </div>
  );
};

const AdminNewsEditor: React.FC = () => {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    headline_image_url: '',
    body: '',
    author: '',
    tags: ['', ''] // Max 2 tags
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    const checkAdmin = async () => {
      if (!supabase) {
        setLoading(false);
        setIsAdmin(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('interns')
          .select('username')
          .eq('id', session.user.id)
          .in('username', ['chasekung', 'Albert'])
          .single();

        if (error || !data) {
          setIsAdmin(false);
        } else {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Admin check error:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [supabase]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setError(null); // Clear any previous errors
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile || !supabase) {
      throw new Error('No image file selected');
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch('/api/hs-news/upload-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!supabase) {
      setError('Supabase not initialized');
      setSaving(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setSaving(false);
        return;
      }

      let imageUrl = formData.headline_image_url;
      
      // Upload new image if provided
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      // Filter out empty tags
      const tags = formData.tags.filter(tag => tag.trim() !== '');

      const response = await fetch('/api/hs-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          title: formData.title,
          subtitle: formData.subtitle || null,
          headline_image_url: imageUrl || null,
          body: formData.body,
          author: formData.author,
          tags: tags
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create article');
      }

      const data = await response.json();
      router.push(`/hs-news/${data.article.id}`);
    } catch (err: any) {
      console.error('Error creating article:', err);
      setError(err.message || 'Failed to create article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mb-4">
            You do not have permission to access this page.
          </p>
          <button
            onClick={() => router.push('/hs-news')}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create News Article
          </h1>
          <button
            onClick={() => router.push('/hs-news')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
          >
            <FiX size={20} />
            Cancel
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Headline Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Headline Image
            </label>
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
              Images will be displayed at their original high quality without compression.
            </p>
            <div className="space-y-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              />
              {(imagePreview || formData.headline_image_url) && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600">
                  <img
                    src={imagePreview || formData.headline_image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Author *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tags (Max 2) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Tags (Max 2)
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={formData.tags[0]}
                onChange={(e) => {
                  const newTags = [...formData.tags];
                  newTags[0] = e.target.value;
                  setFormData({ ...formData, tags: newTags });
                }}
                placeholder="Tag 1"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={formData.tags[1]}
                onChange={(e) => {
                  const newTags = [...formData.tags];
                  newTags[1] = e.target.value;
                  setFormData({ ...formData, tags: newTags });
                }}
                placeholder="Tag 2"
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Article Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Article Body *
            </label>
            <RichTextEditor
              value={formData.body}
              onChange={(value) => setFormData({ ...formData, body: value })}
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => router.push('/hs-news')}
              className="px-6 py-2 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSave size={18} />
              {saving ? 'Publishing...' : 'Publish Article'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminNewsEditor;

