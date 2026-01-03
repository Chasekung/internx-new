'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSupabase } from '@/hooks/useSupabase';
import { FiEdit2 } from 'react-icons/fi';

export const dynamic = 'force-dynamic';

interface NewsArticle {
  id: string;
  title: string;
  subtitle: string | null;
  headline_image_url: string | null;
  body: string;
  author: string;
  tags: string[];
  published_at: string;
  created_at: string;
  updated_at: string;
}

const ArticlePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { supabase } = useSupabase();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/hs-news/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Article not found');
          } else {
            throw new Error('Failed to fetch article');
          }
          return;
        }
        const data = await response.json();
        setArticle(data.article);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    const checkAdmin = async () => {
      if (!supabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
          .from('interns')
          .select('username')
          .eq('id', session.user.id)
          .eq('username', 'chasekung')
          .single();

        if (!error && data) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Admin check error:', err);
      }
    };

    if (params.id) {
      fetchArticle();
      checkAdmin();
    }
  }, [params.id, supabase]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Generate MLA citation
  const generateMLACitation = (article: NewsArticle) => {
    const siteName = 'Step Up';
    // Always use production URL, never localhost
    const url = typeof window !== 'undefined' 
      ? window.location.href.replace(/^https?:\/\/[^/]+/, 'https://joinstepup.com')
      : 'https://joinstepup.com/hs-news/' + params.id;
    const accessDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `${article.author}. "${article.title}." ${siteName}, ${formatDate(article.published_at)}, ${url}. Accessed ${accessDate}.`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {error || 'Article not found'}
          </h1>
          <Link
            href="/hs-news"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button and Edit Button */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/hs-news"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to News
          </Link>
          {isAdmin && (
            <Link
              href={`/hs-news/admin/${params.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <FiEdit2 size={18} />
              Edit Article
            </Link>
          )}
        </div>

        {/* Headline Image */}
        {article.headline_image_url && (
          <div className="relative w-full h-80 md:h-[500px] mb-8 rounded-2xl overflow-hidden">
            <Image
              src={article.headline_image_url}
              alt={article.title}
              fill
              className="object-cover"
              priority
              quality={100}
              unoptimized={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 896px"
            />
          </div>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {article.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-sm font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          {article.title}
        </h1>

        {/* Subtitle */}
        {article.subtitle && (
          <p className="text-xl text-gray-600 dark:text-slate-300 mb-6">
            {article.subtitle}
          </p>
        )}

        {/* Author and Date */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Author</p>
            <p className="text-gray-900 dark:text-white font-medium">{article.author}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400">Published</p>
            <p className="text-gray-900 dark:text-white font-medium">
              {formatDate(article.published_at)}
            </p>
          </div>
        </div>

        {/* Article Body */}
        <div 
          className="prose prose-lg dark:prose-invert max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: article.body }}
          style={{
            lineHeight: '1.8',
            fontSize: '1.125rem',
            color: 'inherit'
          }}
        />

        {/* MLA Citation Section */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            MLA Citation
          </h2>
          <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-700 dark:text-slate-300 font-mono leading-relaxed">
              {generateMLACitation(article)}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
            Use this citation when referencing this article in academic work.
          </p>
        </div>

        {/* Metadata for MLA (hidden but accessible) */}
        <div className="sr-only" aria-hidden="true">
          <span data-mla-author={article.author}></span>
          <span data-mla-title={article.title}></span>
          <span data-mla-site="Step Up"></span>
          <span data-mla-publisher="Step Up"></span>
          <span data-mla-date={formatDate(article.published_at)}></span>
          <span data-mla-url={typeof window !== 'undefined' 
            ? window.location.href.replace(/^https?:\/\/[^/]+/, 'https://joinstepup.com')
            : `https://joinstepup.com/hs-news/${params.id}`}></span>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;

