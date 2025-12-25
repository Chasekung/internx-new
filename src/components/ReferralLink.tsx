'use client';

import { useState, useEffect } from 'react';
import { ClipboardDocumentIcon, ShareIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ReferralLinkProps {
  referralCode: string;
  className?: string;
  onGenerateNew?: () => void;
}

export default function ReferralLink({ referralCode, className = '', onGenerateNew }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Generate the full referral URL - now points to homepage
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/referral/${referralCode}`);
  }, [referralCode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join me on InternX!',
          text: 'I found this great platform for internships. Check it out!',
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled sharing
        console.log('Share cancelled');
      }
    } else {
      // Fallback to copy
      copyToClipboard();
    }
  };

  const handleGenerateNew = async () => {
    if (!onGenerateNew) return;
    
    setIsGenerating(true);
    try {
      await onGenerateNew();
      toast.success('New referral code generated!');
    } catch (error) {
      toast.error('Failed to generate new code');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm ${className}`}>
      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Your Referral Link</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Share this link with friends:
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                copied
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700 shadow-sm'
                  : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg hover:shadow-xl'
              }`}
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={shareLink}
            className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </button>
          
          {onGenerateNew && (
            <button
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 bg-slate-50 rounded-xl p-3">
          <p className="mb-1">• When someone signs up using your link, you'll be credited as their referrer</p>
          <p>• Track your referral performance in your dashboard</p>
        </div>
      </div>
    </div>
  );
} 