'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

interface ReferralPageProps {
  params: { code: string };
}

export default function ReferralPage({ params }: ReferralPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasTracked = useRef(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!hasTracked.current) {
      trackReferralClick();
      hasTracked.current = true;
    }
  }, []);

  const trackReferralClick = async () => {
    try {
      // Get visitor information
      const visitorData = {
        referralCode: params.code,
        visitorIp: null, // Will be handled server-side
        visitorUserAgent: navigator.userAgent,
        visitorLocation: null // Could be enhanced with IP geolocation
      };

      // Track the click
      const response = await fetch('/api/referrals/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorData)
      });

      if (!response.ok) {
        console.error('Failed to track referral click');
      }

      // Store referral code in localStorage for signup
      localStorage.setItem('referralCode', params.code);
      
      setLoading(false);
    } catch (err) {
      console.error('Error tracking referral:', err);
      setError('Failed to process referral link');
      setLoading(false);
    }
  };

  const handleGetStarted = () => {
    // Redirect to signup page
    router.push('/intern-get-started');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(params.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopied(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Processing your referral link...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Referral Link</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 md:py-32">
        {/* Referral Code Display */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg font-semibold text-gray-900">Your referral code is:</span>
            <span className="text-lg font-mono bg-gray-100 px-3 py-1 rounded text-black border border-gray-300">{params.code}</span>
            <button onClick={handleCopy} className={`ml-2 p-1 rounded hover:bg-gray-200 transition-colors ${copied ? 'bg-green-100' : ''}`}
              title="Copy referral code">
              <ClipboardDocumentIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>
          <span className="text-sm text-gray-500">Copy this code and enter it during signup to be credited to your referrer.</span>
        </div>

        <div className="text-center mb-12 pt-8 md:pt-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to InternX! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            You've been invited by a friend to join the best internship platform
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Why InternX?
              </h2>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-black">Connect with top companies</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-black">AI-powered matching</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-black">Streamlined application process</span>
                </li>
                <li className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-black">Track your applications</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold mb-4">Ready to get started?</h3>
              <p className="mb-6 text-white">
                Join thousands of students finding their dream internships through InternX
              </p>
              <button
                onClick={handleGetStarted}
                className="w-full bg-white text-blue-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors text-lg shadow-md"
              >
                Create Your Account
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-500 mt-8">
          <p>Your referral code has been applied automatically</p>
          <p className="text-sm mt-2">
            By signing up, you'll be connected with your referrer
          </p>
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, #a78bfa 1px, transparent 1px),
            linear-gradient(to bottom, #a78bfa 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
} 