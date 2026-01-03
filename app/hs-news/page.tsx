'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useSupabase } from '@/hooks/useSupabase';
import { FiPlus } from 'react-icons/fi';

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

const NewsCard: React.FC<{ article: NewsArticle; onClick: () => void }> = ({ article, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg rounded-2xl overflow-hidden shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 border border-white/20 dark:border-slate-700/50"
      onClick={onClick}
    >
      {/* Image Container with Tags Overlay */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        {article.headline_image_url ? (
          <Image
            src={article.headline_image_url}
            alt={article.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={100}
            priority={false}
            unoptimized={true}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-4xl font-bold opacity-50">Step Up</span>
          </div>
        )}
        
        {/* Tags Overlay */}
        {article.tags && article.tags.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            {article.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-800 dark:text-slate-200 rounded-full text-xs font-semibold shadow-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {article.title}
        </h3>
        {article.subtitle && (
          <p className="text-gray-600 dark:text-slate-300 text-sm mb-4 line-clamp-2">
            {article.subtitle}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
          <span>{article.author}</span>
          <span>{formatDate(article.published_at)}</span>
        </div>
      </div>
    </motion.div>
  );
};

const NewsPage: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const { supabase } = useSupabase();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/hs-news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const data = await response.json();
        setArticles(data.articles || []);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news articles');
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

    fetchArticles();
    checkAdmin();
  }, [supabase]);

  const handleCardClick = (articleId: string) => {
    router.push(`/hs-news/${articleId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="mt-4 text-gray-600 dark:text-slate-400">Loading news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="flex-1 text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                News
              </h1>
              <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
                Stay updated with the latest news and updates from Step Up
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              {isAdmin && (
                <Link
                  href="/hs-news/admin"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  <FiPlus size={20} />
                  Create Article
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* News Grid */}
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-slate-400 text-lg">
              No news articles available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onClick={() => handleCardClick(article.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;

