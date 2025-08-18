'use client';

import { motion } from 'framer-motion';
import RatingChart from '@/components/RatingChart';

const INTERNSHIP_FIELDS = [
  'All Fields',
  'Software Engineering',
  'Data Science',
  'Product Management',
  'UX/UI Design',
  'Marketing',
  'Finance',
  'Business Development',
  'Research',
  'Consulting',
  'Other'
];

export default function UserReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative grid pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundSize: '25px 25px',
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `
        }}
      ></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Student Reviews</h1>
          <p className="mt-4 text-xl text-gray-600">See what students are saying about their internship experiences</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <RatingChart 
            fields={INTERNSHIP_FIELDS}
            storageKey="studentRatings"
            reviewType="user"
          />
        </motion.div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Review Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200/50"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xl font-semibold text-purple-600">JD</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">John Doe</h3>
                <p className="text-sm text-gray-500">Software Engineering Intern</p>
              </div>
            </div>
            <p className="text-gray-600">
              "Step Up helped me land my dream internship at a top tech company. The platform made it easy to showcase my skills and connect with potential employers."
            </p>
            <div className="mt-4 flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </motion.div>

          {/* Review Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200/50"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xl font-semibold text-purple-600">AS</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Alice Smith</h3>
                <p className="text-sm text-gray-500">Data Science Intern</p>
              </div>
            </div>
            <p className="text-gray-600">
              "The internship matching process was seamless. I found a position that perfectly matched my skills and interests. The support from Step Up was exceptional throughout the process."
            </p>
            <div className="mt-4 flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </motion.div>

          {/* Review Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-200/50"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xl font-semibold text-purple-600">MJ</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Michael Johnson</h3>
                <p className="text-sm text-gray-500">Product Design Intern</p>
              </div>
            </div>
            <p className="text-gray-600">
              "Step Up's platform is incredibly user-friendly. I was able to create a professional profile and start applying to internships within minutes. Highly recommend!"
            </p>
            <div className="mt-4 flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
} 