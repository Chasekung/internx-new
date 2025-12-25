'use client';

import { motion } from 'framer-motion';

export default function UserReviewsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
      {/* Blurred Background Content */}
      <div className="absolute inset-0 filter blur-sm opacity-40 pointer-events-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white sm:text-5xl">Student Reviews</h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">See what students are saying about their internship experiences</p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Placeholder Review Cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-slate-700"></div>
                  <div className="ml-4">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-3 w-32 bg-gray-100 dark:bg-slate-600 rounded mt-2"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-gray-100 dark:bg-slate-600 rounded"></div>
                  <div className="h-3 w-full bg-gray-100 dark:bg-slate-600 rounded"></div>
                  <div className="h-3 w-3/4 bg-gray-100 dark:bg-slate-600 rounded"></div>
                </div>
                <div className="mt-4 flex items-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="w-4 h-4 rounded-full bg-gray-200 dark:bg-slate-700"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glass Overlay with Coming Soon Message */}
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative"
        >
          {/* Glass Card */}
          <div 
            className="backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl px-12 py-16 text-center max-w-lg mx-auto"
            style={{
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.1) inset'
            }}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
            >
              <svg 
                className="w-10 h-10 text-slate-500 dark:text-slate-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                />
              </svg>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-semibold text-slate-800 dark:text-white mb-3"
            >
              Reviews Coming Soon
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed"
            >
              We're working on collecting authentic student experiences. Check back soon to see what others are saying.
            </motion.p>

            {/* Decorative line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="w-16 h-0.5 bg-slate-200 mx-auto mt-8"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
