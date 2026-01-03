'use client';

import { useState, useEffect } from 'react';
import { ClipboardDocumentIcon, ShareIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface ReferralLinkProps {
  referralCode: string;
  className?: string;
  onGenerateNew?: () => void;
}

export default function ReferralLink({ referralCode, className = '', onGenerateNew }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    // Generate the full referral URL - now points to homepage
    const baseUrl = window.location.origin;
    setShareUrl(`${baseUrl}/referral/${referralCode}`);
  }, [referralCode]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
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

  return (
    <div className={className}>
      {/* Link input with copy button */}
      <div className="flex items-stretch gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 pr-20"
          />
          <button
            onClick={copyToClipboard}
            className={`absolute right-1 top-1 bottom-1 px-2.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              copied
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'
            }`}
          >
            {copied ? (
              <>
                <CheckIcon className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Share button */}
      <button
        onClick={shareLink}
        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
      >
        <ShareIcon className="w-4 h-4" />
        Share Link
      </button>

      {/* Info text */}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Earn rewards when friends sign up using your link
      </p>
    </div>
  );
}
