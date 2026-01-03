'use client';

import Link from 'next/link';
import { ProfileCompletenessResult } from '@/lib/profileCompleteness';
import { getMinimumProfilePercentage } from '@/hooks/useProfileGate';

interface ProfileCompletionBannerProps {
  completeness: ProfileCompletenessResult;
  variant?: 'warning' | 'info';
  showMissingFields?: boolean;
}

export default function ProfileCompletionBanner({ 
  completeness, 
  variant = 'warning',
  showMissingFields = true 
}: ProfileCompletionBannerProps) {
  const minimumRequired = getMinimumProfilePercentage();
  const { percentage, missingFields } = completeness;
  
  const isComplete = percentage >= minimumRequired;
  
  if (isComplete && variant === 'warning') {
    return null;
  }

  const topMissing = missingFields.slice(0, 4);

  const bgColor = variant === 'warning' 
    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700' 
    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
  
  const textColor = variant === 'warning'
    ? 'text-amber-800 dark:text-amber-200'
    : 'text-blue-800 dark:text-blue-200';

  const progressBg = variant === 'warning'
    ? 'bg-amber-200 dark:bg-amber-800'
    : 'bg-blue-200 dark:bg-blue-800';

  const progressFill = variant === 'warning'
    ? 'bg-amber-500 dark:bg-amber-400'
    : 'bg-blue-500 dark:bg-blue-400';

  return (
    <div className={`rounded-xl border ${bgColor} p-4 sm:p-5`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className={`w-5 h-5 ${textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className={`font-semibold ${textColor}`}>
              {isComplete ? 'Profile Complete!' : 'Complete Your Profile'}
            </h3>
          </div>
          
          <p className={`text-sm ${textColor} opacity-90 mb-3`}>
            {isComplete 
              ? `Your profile is ${percentage}% complete. You have full access to all features.`
              : `Your profile is ${percentage}% complete. Complete at least ${minimumRequired}% to access AI mock interviews.`
            }
          </p>

          {/* Progress bar */}
          <div className={`w-full h-2 rounded-full ${progressBg} overflow-hidden mb-3`}>
            <div 
              className={`h-full ${progressFill} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Missing fields */}
          {showMissingFields && topMissing.length > 0 && !isComplete && (
            <div className="flex flex-wrap gap-2">
              <span className={`text-xs ${textColor} opacity-70`}>Missing:</span>
              {topMissing.map((field) => (
                <span 
                  key={field} 
                  className={`text-xs px-2 py-0.5 rounded-full ${progressBg} ${textColor}`}
                >
                  {field}
                </span>
              ))}
              {missingFields.length > 4 && (
                <span className={`text-xs ${textColor} opacity-70`}>
                  +{missingFields.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {!isComplete && (
          <Link
            href="/edit-page"
            className={`shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-all
              ${variant === 'warning' 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
          >
            Complete Profile
            <svg className="w-4 h-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}

