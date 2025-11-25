'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import AnimatedFeaturesShowcase from '@/components/AnimatedFeaturesShowcase';
import FleetlineStyleHeroAnimation from '@/components/company/FleetlineStyleHeroAnimation';

export default function CompanyHome() {
  // Load Calendly widget script and styles
  useEffect(() => {
    // Add Calendly CSS
    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Add Calendly JS
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup on unmount
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

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
      {/* YC-STYLE HERO SECTION - With Original Step Up Gradient Background */}
      <div className="relative pt-24 pb-24 sm:pt-32 sm:pb-32 overflow-hidden">
        {/* RESTORED: Original animated blob background elements */}
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

        {/* RESTORED: Original decorative grid pattern */}
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
          {/* Vertically Stacked Layout */}
          <div className="flex flex-col items-center">
            {/* Top - Hero Text Content */}
            <div className="text-center max-w-4xl mb-16">
              {/* Badge */}
              <motion.div variants={itemVariants} className="inline-block mb-6">
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  For Companies
                </span>
              </motion.div>

              {/* Main Headline - Invest Early Focus */}
              <motion.h1
                variants={itemVariants}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
              >
                <span className="block text-gray-900">Invest Early in</span>
                <span className="block text-blue-600">High-Potential Talent</span>
              </motion.h1>

              {/* Subheadline - Concise and Punchy */}
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed"
              >
                Pre-vetted high school talent. AI-powered matching. 90% less supervision.
              </motion.p>

              {/* Primary CTAs - Clear Action */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/company-get-started"
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Start Now
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <button
                  onClick={() => {
                    const demoSection = document.getElementById('book-demo');
                    demoSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                >
                  Book a Demo
                </button>
              </motion.div>

              {/* Social Proof / Stats */}
              <motion.div 
                variants={itemVariants}
                className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-500"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-gray-700">AI-Powered Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-gray-700">Pre-Vetted Candidates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-gray-700">90% Less Supervision</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom - Demo Animation */}
            <motion.div
              variants={itemVariants}
              className="w-full flex justify-center"
            >
              <FleetlineStyleHeroAnimation />
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* PARTNER LOGOS CAROUSEL - Blurred with Coming Soon */}
      <div className="bg-white py-12 border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 mb-8 uppercase tracking-wide">
            Trusted by innovative companies
          </p>
          
          {/* Blurred carousel container with Coming Soon overlay */}
          <div className="relative overflow-hidden min-h-[160px]">
            {/* Blurred logos in background */}
            <div className="blur-md opacity-40 pointer-events-none">
              <div className="flex animate-scroll-left">
                {/* First set of placeholder company logos */}
                {[...Array(2)].map((_, setIndex) => (
                  <div key={setIndex} className="flex items-center space-x-12 px-6 whitespace-nowrap">
                    {[
                      'TechCorp', 'InnovateLabs', 'DataStream', 'CloudWave', 
                      'NextGen', 'FutureWorks', 'SmartSystems', 'DigiHub'
                    ].map((company, index) => (
                      <div 
                        key={`${setIndex}-${index}`}
                        className="flex items-center justify-center min-w-[140px] h-20 px-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-sm"
                      >
                        <span className="text-base font-bold text-gray-400 tracking-tight">
                          {company}
                        </span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6 py-4 bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-blue-100 shadow-lg">
                <div className="inline-flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-lg font-bold text-blue-600">Coming Soon</span>
                </div>
                <p className="text-sm text-gray-600">
                  Company partnerships will be announced
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOUR WAYS SECTION - Glassy Panels */}
      <div className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-4">
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Four Ways We Make High-Potential
              <span className="block text-blue-600">Talent Accessible</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamline your hiring process with AI-powered tools designed for modern companies
            </p>
          </motion.div>

          {/* Four Glassy Panels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {[
              {
                title: "AI-Powered Form Creation",
                description: "Build custom application forms in minutes with intelligent question suggestions",
                mockupType: "form",
                delay: 0
              },
              {
                title: "Intelligent Applicant Sorting",
                description: "AI automatically ranks candidates by skill match and potential",
                mockupType: "sorting",
                delay: 0.1
              },
              {
                title: "Smart Assignment Optimization",
                description: "Match the right talent to the right tasks for maximum productivity",
                mockupType: "assignment",
                delay: 0.2
              },
              {
                title: "Integrated Messaging System",
                description: "Communicate seamlessly with candidates all in one place",
                mockupType: "messaging",
                delay: 0.3
              }
            ].map((panel, index) => (
              <motion.div
                key={panel.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: panel.delay }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="group relative overflow-hidden rounded-3xl"
              >
                {/* Glassy Panel Container */}
                <div className="relative h-[400px] bg-gray-50/80 backdrop-blur-xl border border-gray-200/50 shadow-xl overflow-hidden">
                  {/* Mockup/Screenshot Area */}
                  <div className="absolute inset-0 p-8">
                    {panel.mockupType === 'form' && <FormMockup />}
                    {panel.mockupType === 'sorting' && <SortingMockup />}
                    {panel.mockupType === 'assignment' && <AssignmentMockup />}
                    {panel.mockupType === 'messaging' && <MessagingMockup />}
                  </div>

                  {/* Text Overlay with Glass Effect */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/70 backdrop-blur-md border-t border-white/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {panel.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {panel.description}
                    </p>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-4 right-4 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="absolute bottom-4 left-4 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                  
                  {/* Hover Border Effect */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-blue-500/0 group-hover:border-blue-500/50 transition-all duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* PRODUCT DEMO ANIMATION SECTION - YC Style Interactive Preview */}
      <div id="demo" className="relative py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 mb-4">
                See It In Action
              </span>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                Hire in <span className="text-blue-600">Three Simple Steps</span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                From posting to hiring, Step Up streamlines your entire internship process
              </p>
            </motion.div>
          </div>

          {/* Animated Demo Container */}
          <ProductDemoAnimation />

          {/* Integrated Value Propositions */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Build Your Future Talent Pipeline
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Connect with motivated high school students and transform your internship program
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  title: "Access to Untapped Talent",
                  description: "Discover motivated high school students eager to learn and contribute. Build relationships early with future industry leaders.",
                  delay: 0
                },
                {
                  title: "90% Less Management Time",
                  description: "Our AI-powered coaching system guides interns through tasks, reducing your team's supervision burden dramatically.",
                  delay: 0.2
                },
                {
                  title: "Cost-Effective Growth",
                  description: "Fill knowledge gaps and support ongoing projects without the overhead of traditional hiring processes.",
                  delay: 0.4
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: benefit.delay }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="relative group"
                >
                  <div className="h-full p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-600 text-white mb-6 shadow-lg">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ANIMATED FEATURES SHOWCASE - YC-Style Interactive Demos */}
      <AnimatedFeaturesShowcase />

      {/* FEATURES SECTION - Horizontal Carousel with Mouse Wheel Scroll */}
      <div id="features" className="py-24 bg-white overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100 mb-4">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to
              <span className="block text-blue-600">scale your internship program</span>
            </h2>
            <p className="mt-4 max-w-2xl text-lg text-gray-600 mx-auto">
              AI-powered platform that reduces management burden while connecting you with top talent
            </p>
          </motion.div>

          {/* Horizontal Scrolling Carousel */}
          <FeaturesCarousel />
        </div>
      </div>

      {/* BOOK A DEMO SECTION - Embedded Calendly */}
      <div id="book-demo" className="relative py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 mb-4">
              Let's Talk
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Book a Demo
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              See how Step Up can transform your internship program. Schedule a personalized demo with our team.
            </p>
          </motion.div>

          {/* Calendly Embed Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 p-4 sm:p-8"
          >
            <div 
              className="calendly-inline-widget" 
              data-url="https://calendly.com/stepuphs-67/30min"
              style={{ minWidth: '320px', height: '700px' }}
            />
          </motion.div>

          <p className="text-center text-sm text-gray-500 mt-8">
            Can't find a time that works? Email us at{' '}
            <a href="mailto:stepuphs.67@gmail.com" className="text-blue-600 hover:text-blue-700 font-medium">
              stepuphs.67@gmail.com
            </a>
          </p>
        </div>
      </div>

      {/* FINAL CTA SECTION - Enhanced YC Style */}
      <div className="relative py-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"
        />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to transform your
              <span className="block mt-2">internship program?</span>
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join innovative companies using Step Up to hire top talent with zero overhead
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/company-get-started"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Get Started Now
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-xl hover:bg-white/10 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>

            <p className="mt-8 text-sm text-blue-200">
              No credit card required • Free trial available • Setup in 5 minutes
            </p>
          </motion.div>
        </div>
      </div>

      {/* Enhanced custom styles for YC-quality animations */}
      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes slide-up {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
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

        /* Hide scrollbar for feature carousel */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}

// FEATURES CAROUSEL COMPONENT
// Horizontal scrolling carousel with mouse wheel support
function FeaturesCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      title: "AI-Powered Role Analysis",
      description: "Our AI analyzes your company roles and processes to identify hidden internship opportunities, expanding your talent pool.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "AI Intern Coach",
      description: "Reduce supervision time by up to 90% with our AI Intern Mentor Agents that provide continuous guidance and feedback.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Smart Skill Matching",
      description: "Connect with talented high school students based on their skills rather than prior experience, finding the perfect fit for your team.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      ),
      color: "from-indigo-500 to-indigo-600"
    },
    {
      title: "Streamlined Management",
      description: "Easily manage your internship program with our comprehensive dashboard, from posting positions to tracking progress.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-blue-500 to-cyan-600"
    },
    {
      title: "Video Interviews",
      description: "Built-in video interview functionality allows candidates to record responses, saving you time on initial screenings.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-pink-500 to-rose-600"
    },
    {
      title: "Analytics Dashboard",
      description: "Track application metrics, candidate quality, and program success with comprehensive analytics and insights.",
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: "from-emerald-500 to-teal-600"
    }
  ];

  // Handle mouse wheel to scroll horizontally
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Only intercept horizontal scroll when not at edges
      const atStart = container.scrollLeft === 0;
      const atEnd = container.scrollLeft >= container.scrollWidth - container.clientWidth - 1;
      
      if ((e.deltaY > 0 && !atEnd) || (e.deltaY < 0 && !atStart)) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div className="relative">
      {/* Scroll hint */}
      <div className="text-center mb-8">
        <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Scroll or swipe to explore features
        </p>
      </div>

      {/* Horizontal scrolling container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar scroll-smooth snap-x snap-mandatory"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-[380px] snap-center"
          >
            <div className="h-full p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg`}>
                {feature.icon}
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gradient fade edges for visual polish */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent pointer-events-none" />
    </div>
  );
}

// PRODUCT DEMO ANIMATION COMPONENT
// This component shows an interactive walkthrough of the Step Up platform
function ProductDemoAnimation() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      number: "01",
      title: "Post Your Internship in Minutes",
      description: "Create custom application forms with our AI-powered form builder. Smart drag-and-drop interface with AI-suggested questions tailored to your role. Add video questions, skill assessments, and portfolio requirements. Go live in minutes and start receiving qualified applications immediately.",
      features: [
        "Smart Form Builder with AI-suggested questions",
        "Custom screening with video and assessments",
        "Instant publishing to thousands of candidates"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600"
    },
    {
      number: "02",
      title: "AI Matches Top Talent",
      description: "Our algorithm finds the best candidates based on skills, not just experience. Get AI-powered rankings and insights on every applicant.",
      features: [
        "Skills-based matching algorithm",
        "Automated candidate ranking",
        "AI-generated candidate insights"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-purple-500 to-purple-600"
    },
    {
      number: "03",
      title: "Review & Hire",
      description: "Browse AI-vetted candidates with video interviews and skill assessments. Make confident hiring decisions with comprehensive candidate profiles.",
      features: [
        "Pre-recorded video responses",
        "Skill assessment results",
        "One-click communication"
      ],
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      {/* Left side - Step descriptions */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2 }}
            onClick={() => setActiveStep(index)}
            className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
              activeStep === index
                ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Step number and icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                {step.icon}
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-gray-400">{step.number}</span>
                  <h3 className={`text-xl font-bold transition-colors ${
                    activeStep === index ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-3">
                  {step.description}
                </p>
                {step.features && activeStep === index && (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2 mt-3"
                  >
                    {step.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </div>

              {/* Active indicator */}
              {activeStep === index && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-blue-600 rounded-r-full"
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Right side - Animated visual representation */}
      <div className="relative">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-50 rounded-3xl shadow-2xl overflow-hidden border border-gray-200"
        >
          {/* Placeholder animated mockup */}
          <div className="absolute inset-0 p-8 flex flex-col items-center justify-center">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-48 h-48 rounded-3xl bg-blue-600 shadow-2xl flex items-center justify-center text-white"
            >
              {steps[activeStep].icon}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-center"
            >
              <h4 className="text-2xl font-bold text-gray-900 mb-2">
                {steps[activeStep].title}
              </h4>
              <p className="text-gray-600">
                Step {activeStep + 1} of {steps.length}
              </p>
            </motion.div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-blue-200 rounded-full filter blur-2xl opacity-60" />
          <div className="absolute bottom-4 left-4 w-20 h-20 bg-purple-200 rounded-full filter blur-2xl opacity-60" />
        </motion.div>

        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveStep(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                activeStep === index
                  ? 'w-8 bg-blue-600'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// MOCKUP COMPONENTS FOR FOUR WAYS SECTION

// Form Builder Mockup
function FormMockup() {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <div className="h-3 bg-gray-300 rounded w-32" />
        </div>
        <div className="h-8 bg-gray-100 rounded-lg" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <div className="h-3 bg-gray-300 rounded w-40" />
        </div>
        <div className="h-8 bg-gray-100 rounded-lg" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="bg-blue-600 text-white rounded-xl p-3 text-center font-semibold shadow-lg"
      >
        Publish Form
      </motion.div>
    </div>
  );
}

// Sorting Mockup
function SortingMockup() {
  const candidates = [
    { score: 95, color: 'bg-green-600' },
    { score: 88, color: 'bg-blue-600' },
    { score: 82, color: 'bg-purple-600' }
  ];

  return (
    <div className="space-y-3">
      {candidates.map((candidate, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400" />
          <div className="flex-1">
            <div className="h-3 bg-gray-300 rounded w-24 mb-2" />
            <div className="h-2 bg-gray-200 rounded w-32" />
          </div>
          <div className={`px-3 py-1 rounded-full ${candidate.color} text-white text-sm font-bold`}>
            {candidate.score}%
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Assignment Mockup
function AssignmentMockup() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { title: 'Task A', color: 'bg-blue-600' },
        { title: 'Task B', color: 'bg-purple-600' },
        { title: 'Task C', color: 'bg-pink-600' },
        { title: 'Task D', color: 'bg-indigo-600' }
      ].map((task, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          className={`${task.color} rounded-xl p-4 shadow-lg cursor-pointer`}
        >
          <div className="text-white font-semibold mb-2">{task.title}</div>
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-white/30" />
            <div className="w-6 h-6 rounded-full bg-white/30" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Messaging Mockup
function MessagingMockup() {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg max-w-[80%]"
      >
        <div className="text-xs text-gray-600 mb-1">Candidate</div>
        <div className="h-2 bg-gray-300 rounded w-full mb-1" />
        <div className="h-2 bg-gray-300 rounded w-3/4" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="bg-blue-600 rounded-2xl p-3 shadow-lg max-w-[80%] ml-auto"
      >
        <div className="text-xs text-white/70 mb-1">You</div>
        <div className="h-2 bg-white/70 rounded w-full mb-1" />
        <div className="h-2 bg-white/70 rounded w-2/3" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg max-w-[80%]"
      >
        <div className="text-xs text-gray-600 mb-1">Candidate</div>
        <div className="h-2 bg-gray-300 rounded w-full" />
      </motion.div>
    </div>
  );
}