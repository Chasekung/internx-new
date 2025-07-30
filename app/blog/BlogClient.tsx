"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function BlogClient() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Step Up <span className="text-blue-600">Blog</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tips, and stories from the world of high school opportunities and career development.
          </p>
        </motion.div>

        {/* Blog Posts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
        >
          {/* Placeholder blog post cards - these will be replaced with actual content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <div className="text-6xl opacity-30">📝</div>
            </div>
            <div className="p-6">
              <div className="text-sm text-blue-600 font-medium mb-2">Coming Soon</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">First Blog Post</h3>
              <p className="text-gray-600 mb-4">Our first blog post will be published here soon. Stay tuned for valuable insights and tips!</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Step Up Team</span>
                <span className="mx-2">•</span>
                <span>Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
              <div className="text-6xl opacity-30">💡</div>
            </div>
            <div className="p-6">
              <div className="text-sm text-green-600 font-medium mb-2">Coming Soon</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Tips</h3>
              <p className="text-gray-600 mb-4">Expert advice on building your career path and making the most of your opportunities.</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Step Up Team</span>
                <span className="mx-2">•</span>
                <span>Coming Soon</span>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
              <div className="text-6xl opacity-30">🚀</div>
            </div>
            <div className="p-6">
              <div className="text-sm text-purple-600 font-medium mb-2">Coming Soon</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Success Stories</h3>
              <p className="text-gray-600 mb-4">Inspiring stories from students who found amazing opportunities through Step Up.</p>
              <div className="flex items-center text-sm text-gray-500">
                <span>Step Up Team</span>
                <span className="mx-2">•</span>
                <span>Coming Soon</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* No Posts Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center py-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Blog Posts Yet</h2>
            <p className="text-gray-600 mb-6">
              We're working on creating valuable content for our community. Check back soon for insights, tips, and stories!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/opportunities"
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Browse Opportunities
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mt-12"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Want to be notified when we publish new blog posts? Get in touch with us!
            </p>
            <Link
              href="/about/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
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
          background-image: 
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
} 