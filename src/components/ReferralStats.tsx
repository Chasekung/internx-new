'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  CursorArrowRaysIcon, 
  CheckCircleIcon,
  ChartBarIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

interface ReferralStatsProps {
  userId: string;
  className?: string;
}

interface ReferralData {
  referralCode: string;
  stats: {
    totalClicks: number;
    totalReferrals: number;
    completedReferrals: number;
    conversionRate: number;
    recentReferrals: number;
  };
  referrals: Array<{
    id: string;
    username: string;
    full_name: string;
    email: string;
    location: string;
    created_at: string;
  }>;
  clicks: Array<{
    id: string;
    visitor_location: string;
    clicked_at: string;
  }>;
}

// Compact stat item
const StatItem = ({ 
  icon: Icon, 
  label, 
  value 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
}) => (
  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
    <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
    <div className="min-w-0 flex-1">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  </div>
);

export default function ReferralStats({ userId, className = '' }: ReferralStatsProps) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchReferralStats();
  }, [userId]);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/referrals/stats?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch referral stats');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <div className="text-center py-6">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">Failed to load stats</p>
          <button 
            onClick={fetchReferralStats}
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            Try again →
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { stats, referrals, clicks } = data;

  return (
    <div className={className}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <StatItem icon={CursorArrowRaysIcon} label="Clicks" value={stats.totalClicks} />
        <StatItem icon={UserGroupIcon} label="Referrals" value={stats.totalReferrals} />
        <StatItem icon={CheckCircleIcon} label="Completed" value={stats.completedReferrals} />
        <StatItem icon={ChartBarIcon} label="Rate" value={`${stats.conversionRate}%`} />
      </div>

      {/* Expandable Details */}
      {(referrals.length > 0 || clicks.length > 0) && (
        <div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>View Details</span>
            <ChevronDownIcon className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
          </button>
          
          {showDetails && (
            <div className="mt-2 space-y-4">
              {/* Recent Referrals */}
              {referrals.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Recent Referrals
                  </h4>
                  <div className="space-y-2">
                    {referrals.slice(0, 5).map((referral) => (
                      <div 
                        key={referral.id} 
                        className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {referral.full_name || referral.username || 'Anonymous'}
                          </p>
                          {referral.location && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {referral.location}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            Active
                          </span>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {new Date(referral.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location Analytics - Compact */}
              {clicks.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Top Locations
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
                    {(() => {
                      const locationCounts = clicks.reduce((acc, click) => {
                        const location = click.visitor_location || 'Unknown';
                        acc[location] = (acc[location] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      const topLocations = Object.entries(locationCounts)
                        .sort(([,a], [,b]) => (b as number) - (a as number))
                        .slice(0, 4);
                      
                      const maxCount = Math.max(...topLocations.map(([, count]) => count as number));
                      
                      return (
                        <div className="space-y-2">
                          {topLocations.map(([location, count]) => (
                            <div key={location} className="flex items-center gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                    {location}
                                  </span>
                                  <span className="text-xs font-medium text-slate-900 dark:text-white ml-2 flex-shrink-0">
                                    {count}
                                  </span>
                                </div>
                                <div className="h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-slate-400 dark:bg-slate-400 rounded-full"
                                    style={{ width: `${((count as number) / maxCount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {referrals.length === 0 && stats.totalClicks === 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Share your link to start tracking
          </p>
        </div>
      )}
    </div>
  );
}
