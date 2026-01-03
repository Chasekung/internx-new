'use client';

import { useState, useMemo } from 'react';
import { useProfileGate } from '@/hooks/useProfileGate';
import InterviewCard from '@/components/InterviewCard';
import ProfileCompletionBanner from '@/components/ProfileCompletionBanner';
import { 
  INTERVIEW_CATEGORIES, 
  CATEGORY_COLORS,
  getInterviewsByCategory, 
  searchInterviews,
  type InterviewCategory 
} from '@/lib/interviewData';

export default function PracticeInterviewsPage() {
  const { isLoading, isAuthenticated, meetsRequirement, completeness } = useProfileGate(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<InterviewCategory | 'all'>('all');

  // Get interviews grouped by category
  const interviewsByCategory = useMemo(() => getInterviewsByCategory(), []);

  // Filter interviews based on search
  const filteredInterviews = useMemo(() => {
    if (!searchQuery.trim()) return null; // null means show categories
    return searchInterviews(searchQuery);
  }, [searchQuery]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Loading interviews...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated or doesn't meet requirement, the hook will redirect
  // But we can show a brief loading state
  if (!isAuthenticated || !meetsRequirement) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Checking access...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 pt-28 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            AI Mock Interviews
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Practice with AI-powered interviews tailored to your career goals. 
            Get real-time feedback and improve your interview skills.
          </p>
        </div>

        {/* Profile Completion Status (info variant, always visible) */}
        {completeness && (
          <div className="mb-8">
            <ProfileCompletionBanner completeness={completeness} variant="info" showMissingFields={false} />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search interviews by title, category, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-shadow hover:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {filteredInterviews !== null ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                Search Results
              </h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {filteredInterviews.length} interview{filteredInterviews.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {filteredInterviews.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <svg className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-slate-500 dark:text-slate-400">No interviews found matching "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredInterviews.map((interview) => (
                  <InterviewCard key={interview.id} interview={interview} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                All Categories
              </button>
              {INTERVIEW_CATEGORIES.map((category) => {
                const colors = CATEGORY_COLORS[category];
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? `${colors.bg} ${colors.text} border ${colors.border} shadow-md`
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            {/* Interview Sections by Category */}
            <div className="space-y-12">
              {INTERVIEW_CATEGORIES.filter(category => 
                activeCategory === 'all' || activeCategory === category
              ).map((category) => {
                const interviews = interviewsByCategory[category];
                if (interviews.length === 0) return null;

                const colors = CATEGORY_COLORS[category];

                return (
                  <section key={category}>
                    <div className="flex items-center gap-3 mb-6">
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {category}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                        {interviews.length} interview{interviews.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {interviews.slice(0, 20).map((interview) => (
                        <InterviewCard key={interview.id} interview={interview} />
                      ))}
                    </div>

                    {interviews.length > 20 && (
                      <div className="mt-4 text-center">
                        <button className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                          View all {interviews.length} {category} interviews →
                        </button>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">50+</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Interview Types</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">10</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Categories</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">3</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Difficulty Levels</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">AI</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">Powered Feedback</div>
          </div>
        </div>
      </div>
    </div>
  );
}

