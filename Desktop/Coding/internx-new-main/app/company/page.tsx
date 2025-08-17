'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
export default function CompanyHome() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative pt-32 pb-64 sm:pt-36 sm:pb-72 overflow-hidden">
        {/* Sky blue orbs background - company specific */}
        <div className="background-container">
          <div className="company-orb"></div>
          <div className="company-orb"></div>
          <div className="company-orb"></div>
          <div className="company-orb"></div>
          <div className="noise-overlay"></div>
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl animate-blob"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.7 }}
            transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
            className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"
          />
        </div>

        {/* Decorative grid pattern */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-grid-pattern"
        />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10"
        >
          <div className="text-center">
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-8">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                For Companies
              </span>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
            >
              <span className="block">Find Your Next</span>
              <span className="block gradient-text">Generation of Talent</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-3 max-w-md text-base text-black sm:text-lg md:mt-5 md:max-w-3xl md:text-xl"
            >
              Connect with motivated high school students and build your talent pipeline. Our AI-powered platform helps you find the perfect interns for your organization.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mx-auto mt-8 max-w-md sm:flex sm:justify-center md:mt-12"
            >
              <div className="rounded-md shadow">
                <Link
                  href="/company-get-started"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:px-10 md:py-4 md:text-lg transition-all duration-300 hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link
                  href="#features"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-100 px-8 py-3 text-base font-medium text-blue-700 hover:bg-blue-200 md:px-10 md:py-4 md:text-lg transition-all duration-300 hover:scale-105"
                >
                  Learn More
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Feature highlights */}
          <motion.div
            variants={containerVariants}
            className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3"
          >
            {[
              {
                name: "Smart Matching",
                description: "AI-powered matching to find the best candidates",
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                name: "Quality Candidates",
                description: "Access to motivated and talented students",
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )
              },
              {
                name: "Easy Management",
                description: "Streamlined intern management tools",
                icon: (
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                )
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.name}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{feature.name}</h3>
                    <p className="text-sm text-gray-500">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Company Benefits</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Why Choose Step Up?
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">2,500+</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">Active Students</div>
              <div className="mt-1 text-sm text-gray-500">Ready to intern</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">500+</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">Posted Internships</div>
              <div className="mt-1 text-sm text-gray-500">Available positions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">95%</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">Success Rate</div>
              <div className="mt-1 text-sm text-gray-500">Of successful placements</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">100+</div>
              <div className="mt-2 text-lg font-semibold text-gray-900">Partner Companies</div>
              <div className="mt-1 text-sm text-gray-500">Trust our platform</div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div id="features" className="py-12 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Revolutionizing Company Internship Programs
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our AI-powered platform helps companies find and manage talented high school interns while reducing the management burden.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <dt>
                  <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI-Powered Role Analysis</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Our AI analyzes your company roles and processes to identify hidden internship opportunities, expanding your talent pool.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI Intern Coach</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Reduce supervision time by up to 90% with our AI Intern Mentor Agents that provide continuous guidance and feedback.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Smart Skill Matching</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Connect with talented high school students based on their skills rather than prior experience, finding the perfect fit for your team.
                </dd>
              </div>

              <div className="relative">
                <dt>
                  <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Streamlined Management</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">
                  Easily manage your internship program with our comprehensive dashboard, from posting positions to tracking progress.
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to find top talent?</span>
            <span className="block text-blue-600">Start your journey with Step Up today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/company-get-started"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:px-10 md:py-4 md:text-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
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

        .gradient-text {
          background: linear-gradient(to right, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
} 