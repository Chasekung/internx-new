'use client';

import Link from 'next/link';
import { Interview, CATEGORY_COLORS, DIFFICULTY_COLORS } from '@/lib/interviewData';

interface InterviewCardProps {
  interview: Interview;
}

export default function InterviewCard({ interview }: InterviewCardProps) {
  const colors = CATEGORY_COLORS[interview.category];
  const difficultyColor = DIFFICULTY_COLORS[interview.difficulty] || DIFFICULTY_COLORS['Medium'];

  return (
    <Link
      href={`/interview/${interview.slug}`}
      className={`group block rounded-xl border ${colors.border} ${colors.bg} p-5 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] hover:border-opacity-80`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
            {interview.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {interview.hasTask && interview.taskType && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" title="Includes interactive task">
              {interview.taskType}
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${difficultyColor}`}>
            {interview.difficulty}
          </span>
        </div>
      </div>

      {/* Subcategory */}
      {interview.subcategory && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {interview.subcategory}
        </p>
      )}

      <h3 className={`font-semibold text-lg mb-2 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
        {interview.title}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
        {interview.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{interview.duration}</span>
        </div>

        <div className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Start Interview
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
