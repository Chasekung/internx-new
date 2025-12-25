'use client';

import { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  CursorArrowRaysIcon, 
  CheckCircleIcon,
  ChartBarIcon 
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

export default function ReferralStats({ userId, className = '' }: ReferralStatsProps) {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ${className}`}>
        <div className="text-center text-red-600 dark:text-red-400">
          <p>Error loading referral stats: {error}</p>
          <button 
            onClick={fetchReferralStats}
            className="mt-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Retry
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
    <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ${className}`}>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Referral Performance</h3>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center">
            <CursorArrowRaysIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Clicks</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalClicks}</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Referrals</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalReferrals}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedReferrals}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-100 dark:border-slate-600">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            <div className="ml-3">
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Conversion</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.conversionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      {referrals.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Referrals</h4>
          <div className="space-y-3">
            {referrals.slice(0, 5).map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {referral.full_name || 'Anonymous'}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {referral.email}
                  </p>
                  {referral.location && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      📍 {referral.location}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                    Completed
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(referral.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Location Analytics */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Location Analytics</h4>
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Click Referral Locations */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Top Click Referral Locations</h5>
              {(() => {
                const locationCounts = clicks.reduce((acc, click) => {
                  const location = click.visitor_location || 'Unknown';
                  acc[location] = (acc[location] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                const topLocations = Object.entries(locationCounts)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5);
                
                return (
                  <div className="space-y-2">
                    {topLocations.map(([location, count]) => (
                      <div key={location} className="flex justify-between text-sm">
                        <span className="text-gray-600">{location}</span>
                        <span className="font-medium text-black">{count} users</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            {/* Top Referral Locations */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Top Referral Locations</h5>
              {(() => {
                const referralLocations = referrals
                  .filter(r => r.location)
                  .map(r => r.location);
                
                const locationCounts = referralLocations.reduce((acc, location) => {
                  acc[location] = (acc[location] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>);
                
                const topReferralLocations = Object.entries(locationCounts)
                  .sort(([,a], [,b]) => (b as number) - (a as number))
                  .slice(0, 5);
                
                return (
                  <div className="space-y-2">
                    {topReferralLocations.length > 0 ? (
                      topReferralLocations.map(([location, count]) => (
                        <div key={location} className="flex justify-between text-sm">
                          <span className="text-gray-600">{location}</span>
                          <span className="font-medium text-black">{count} users</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">No location data yet</p>
                    )}
                  </div>
                );
              })()}
            </div>
            {/* Top Premium Referral Locations */}
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Top Premium Referral Locations</h5>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">(Coming soon)</span>
                  <span className="font-medium text-black">0 users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referred Users List */}
      <div className="mt-8">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Users You Referred</h4>
        {referrals.length > 0 ? (
          <div className="space-y-2">
            {referrals.map((user) => (
              <div key={user.id} className="flex justify-between items-center bg-gray-100 rounded px-4 py-2">
                <div>
                  <span className="font-medium text-gray-900">{user.username || 'Unknown'}</span>
                  <span className="ml-2 text-gray-600">{user.full_name || ''}</span>
                </div>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No users referred yet.</p>
        )}
      </div>

      {referrals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No referrals yet. Share your link to get started!</p>
        </div>
      )}
    </div>
  );
} 