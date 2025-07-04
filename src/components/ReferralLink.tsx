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
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share this link with friends:
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono text-black"
            />
            <button
              onClick={copyToClipboard}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700 border border-green-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ClipboardDocumentIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={shareLink}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </button>
          
          {onGenerateNew && (
            <button
              onClick={handleGenerateNew}
              disabled={isGenerating}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            </button>
          )}
        </div>

        <div className="text-xs text-gray-500">
          <p>• When someone signs up using your link, you'll be credited as their referrer</p>
          <p>• Track your referral performance in your dashboard</p>
        </div>
      </div>
    </div>
  );
} 