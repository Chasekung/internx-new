'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// Custom animations for feature icons
const iconAnimations = {
  pulse: {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  },
  bounce: {
    animate: {
      y: [0, -10, 0],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  },
  spin: {
    animate: {
      rotate: [0, 360],
    },
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear" as const
    }
  },
  ping: {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
    },
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  }
}

const features = [
  {
    name: '🎯 AI Career Pathfinder',
    description: 'Our advanced AI analyzes your interests, skills, and goals to discover hidden career opportunities you never knew existed. Get personalized recommendations that match your unique profile.',
    icon: (
      <motion.div 
        className="relative"
        {...iconAnimations.pulse}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg"></div>
        <svg className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </motion.div>
    ),
  },
  {
    name: '🚀 Skill-Based Matching',
    description: 'No experience required! Our platform matches you with opportunities based on your natural talents, creativity, and willingness to learn. Your potential is your passport to amazing experiences.',
    icon: (
      <motion.div 
        className="relative"
        {...iconAnimations.bounce}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-lg"></div>
        <svg className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
      </motion.div>
    ),
  },
  {
    name: '🤖 AI Mentor Companion',
    description: 'Get 24/7 guidance from your personal AI mentor! Learn new skills, get instant feedback, and grow your confidence with real-time coaching that adapts to your learning style.',
    icon: (
      <motion.div 
        className="relative"
        {...iconAnimations.spin}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg"></div>
        <svg className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </motion.div>
    ),
  },
  {
    name: '💫 Direct Company Access',
    description: 'Skip the traditional barriers! Connect directly with innovative companies that value fresh perspectives and creative thinking. Your youth is your superpower in the modern workplace.',
    icon: (
      <motion.div 
        className="relative"
        {...iconAnimations.ping}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg"></div>
        <svg className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </motion.div>
    ),
  },
]

const stats = [
  {
    name: 'Students Unable to Intern',
    value: '66%',
    description: 'Of high school students who want to intern are unable to do so',
  },
  {
    name: 'Lack of Experience Barrier',
    value: '2%',
    description: 'Only 2% of high school students successfully secure internships',
  },
  {
    name: 'Employer Openness',
    value: '50%',
    description: 'Of employers are open to high school interns, but lack proper channels',
  },
]

const testimonials = [
  {
    name: 'Person A',
    rating: 5,
    text: 'The AI-powered matching helped me find an Opportunity that perfectly aligned with my interests in computer science, even though I had no prior experience.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Person B',
    rating: 5,
    text: 'I was amazed by how the platform focused on my skills and potential rather than my lack of experience. It gave me the confidence to apply for Opportunities.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Person C',
    rating: 5,
    text: 'The AI Intern Coach was incredibly helpful in guiding me through my first Opportunity experience. It felt like having a mentor available 24/7.',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Person D',
    rating: 5,
    text: 'Thanks to Step Up, I landed an Opportunity at a tech company where I could apply my programming skills in a real-world setting.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Person E',
    rating: 5,
    text: 'The skill-based matching system helped me discover Opportunities I never knew existed in my field of interest.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Person F',
    rating: 5,
    text: 'I appreciated how the platform focused on my potential and willingness to learn rather than my lack of experience.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Person G',
    rating: 5,
    text: 'The AI Intern Coach provided valuable feedback and guidance throughout my Opportunity journey.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Person H',
    rating: 5,
    text: 'Step Up helped me break into the tech industry by focusing on my skills and potential rather than my age or experience.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

const volunteerTestimonials = [
  {
    name: 'Volunteer A',
    rating: 5,
    text: 'Volunteering through Step Up gave me a chance to make a real impact in my community.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Volunteer B',
    rating: 5,
    text: 'I met so many amazing people and learned valuable skills while volunteering.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Volunteer C',
    rating: 5,
    text: 'Step Up made it easy to find volunteer opportunities that matched my interests.',
    image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Volunteer D',
    rating: 5,
    text: 'Giving back has never been more rewarding. Thank you, Step Up!',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Volunteer E',
    rating: 5,
    text: 'I developed leadership skills and made lifelong friends through volunteering.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Volunteer F',
    rating: 5,
    text: 'Step Up connected me with organizations that truly needed my help.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Volunteer G',
    rating: 5,
    text: 'I learned so much about teamwork and responsibility.',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
  {
    name: 'Volunteer H',
    rating: 5,
    text: 'Volunteering gave me a sense of purpose and accomplishment.',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  },
];

export default function HomeClient() {
  const [currentIndex, setCurrentIndex] = useState(2);
  const animatedWords = ["Internship", "Volunteering", "Research", "Summer Camp"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 2000);
    return () => clearInterval(interval);
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

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < testimonials.length - 3) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY > 0 && currentIndex < testimonials.length - 3) {
      handleNext();
    } else if (e.deltaY < 0 && currentIndex > 0) {
      handlePrevious();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative pt-20 sm:pt-32 pb-32 sm:pb-64 overflow-hidden">
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
          className="mobile-container relative z-10"
        >
          <div className="text-center">
            <motion.div variants={itemVariants} className="inline-block">
              <span className="inline-flex items-center px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-blue-100 text-blue-800 mb-6 sm:mb-8">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Powered by AI
              </span>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight"
            >
              <span className="block">
                Find <span className="text-blue-600">Your Perfect</span>
              </span>
              <span className="block">
                <span style={{ display: 'inline-block', position: 'relative' }}>
                  <motion.span
                    key={animatedWords[wordIndex]}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="animated-purple-text"
                    style={{ display: 'inline-block' }}
                  >
                    {animatedWords[wordIndex]}
                    <motion.span
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      exit={{ scaleX: 0 }}
                      transition={{ duration: 0.5 }}
                      className="animated-purple-underline"
                      style={{
                        display: 'block',
                        height: '4px',
                        borderRadius: '2px',
                        background: 'linear-gradient(90deg, #a855f7, #6366f1, #c026d3)',
                        marginTop: '4px',
                        width: '100%',
                        transformOrigin: 'left',
                      }}
                    />
                  </motion.span>
                </span>
              </span>
              <span className="block gradient-text pb-2" style={{lineHeight: '1.2', paddingBottom: '0.5rem'}}>
                Opportunity
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-3 max-w-md mobile-text text-black md:mt-5 md:max-w-3xl"
            >
              Breaking down barriers for high school students to connect with meaningful opportunities. Powered by AI-driven matching and mentorship for internships, volunteering, and skill-building experiences.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mx-auto mt-6 sm:mt-8 max-w-md sm:flex sm:justify-center md:mt-12"
            >
              <div className="mobile-flex gap-3 sm:gap-4">
                <div className="rounded-md shadow">
                  <Link
                    href="/intern-get-started"
                    className="mobile-button bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 hover:scale-105"
                  >
                    Get Started
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0">
                  <Link
                    href="#features"
                    className="mobile-button bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all duration-300 hover:scale-105"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature highlights */}
          <motion.div
            variants={containerVariants}
            className="mt-12 sm:mt-16 mobile-grid sm:grid-cols-3"
          >
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="mobile-card"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">AI-Powered Matching</h3>
                  <p className="text-sm text-gray-500">Match with the perfect opportunity</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="mobile-card"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Smart Learning</h3>
                  <p className="text-sm text-gray-500">Continuous skill development</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="mobile-card"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Direct Connections</h3>
                  <p className="text-sm text-gray-500">Connect with top companies</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white py-12 sm:py-24">
        <div className="mobile-container">
          {/* Stats Section */}
          <div className="bg-white py-12 sm:py-16">
            <div className="mobile-container">
              <div className="text-center mb-8">
                <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Traditional Current Issues</h2>
                <h2 className="mt-2 mobile-heading font-extrabold tracking-tight text-gray-900">
                  The High School Opportunity Gap
                </h2>
              </div>
              <div className="mobile-grid sm:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.name} className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-blue-600">{stat.value}</div>
                    <div className="mt-2 text-base sm:text-lg font-semibold text-gray-900">{stat.name}</div>
                    <div className="mt-1 text-sm text-gray-500">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Section */}
          <div className="py-8 sm:py-12 bg-gray-50">
            <div className="mobile-container">
              <div className="lg:text-center">
                <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
                <p className="mt-2 mobile-heading font-extrabold tracking-tight text-gray-900">
                  Revolutionizing High School Opportunities
                </p>
                <p className="mt-4 max-w-2xl mobile-text text-gray-500 lg:mx-auto">
                  Our AI-powered platform connects high school students with meaningful Opportunity opportunities while reducing the management burden on companies.
                </p>
              </div>

              <div className="mt-8 sm:mt-10">
                <div className="mobile-responsive-spacing md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                  {features.map((feature, index) => (
                    <motion.div 
                      key={feature.name} 
                      className="relative group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <div className="p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                        <dt>
                          <div className="absolute flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {feature.icon}
                          </div>
                          <p className="ml-16 text-base sm:text-lg leading-6 font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                            {feature.name}
                          </p>
                        </dt>
                        <dd className="mt-2 ml-16 mobile-text text-gray-500 group-hover:text-gray-700 transition-colors duration-300">
                          {feature.description}
                        </dd>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="py-8 bg-white">
            <div className="mobile-container">
              <div className="text-center">
                <h2 className="mobile-heading font-extrabold tracking-tight text-gray-900">
                  Based on <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">skill and mindset</span>, not experience
                </h2>
                <p className="mt-2 mobile-text text-gray-500">
                  As revealed by past users
                </p>
              </div>

              <div className="mt-8 relative">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevious}
                    className="absolute left-0 top-1/2 -translate-y-1/2 transform bg-white w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full border-2 border-gray-300 shadow-lg z-10 disabled:opacity-50 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    aria-label="Previous reviews"
                    disabled={currentIndex === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 transform bg-white w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-full border-2 border-gray-300 shadow-lg z-10 disabled:opacity-50 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    aria-label="Next reviews"
                    disabled={currentIndex >= testimonials.length - 3}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>

                <div
                  className="flex overflow-hidden"
                  onWheel={handleWheel}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <div
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 400}px)` }}
                  >
                    {testimonials.map((testimonial, index) => (
                      <div key={index} className="w-[300px] sm:w-[400px] px-2">
                        <div className="mobile-card h-[280px] flex flex-col">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 sm:h-12 sm:w-12 rounded-full"
                              src={testimonial.image}
                              alt={testimonial.name}
                            />
                            <div className="ml-3 sm:ml-4">
                              <h3 className="text-base sm:text-lg font-medium text-gray-900">{testimonial.name}</h3>
                              <div className="flex items-center mt-1">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="mt-4 mobile-text text-gray-600 flex-grow">{testimonial.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section for SEO */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="mobile-container">
          <div className="text-center mb-12">
            <h2 className="mobile-heading font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="mobile-text text-gray-600 max-w-2xl mx-auto">
              Common questions about high school internships and opportunities
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How does AI-powered matching work?</h3>
              <p className="text-gray-600">
                Our AI analyzes your skills, interests, and goals to match you with the perfect internship or volunteering opportunity. We focus on your potential rather than just experience.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What types of opportunities are available?</h3>
              <p className="text-gray-600">
                We offer internships, volunteering positions, research opportunities, and skill-building programs across various industries including tech, healthcare, education, and more.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Do I need prior experience?</h3>
              <p className="text-gray-600">
                No prior experience required! Our platform is designed for high school students who are eager to learn and grow. We match you based on your skills and willingness to learn.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is Step Up free for students?</h3>
              <p className="text-gray-600">
                Yes, Step Up is completely free for high school students. We believe every student should have access to meaningful opportunities regardless of their background.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white">
        <div className="mobile-container py-8 sm:py-12 lg:py-16 lg:flex lg:items-center lg:justify-between">
          <h2 className="mobile-heading font-bold tracking-tight text-gray-900">
            <span className="block">Ready to find your next opportunity?</span>
            <span className="block text-blue-600">Join Step Up today.</span>
          </h2>
          <div className="mt-6 lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/intern-get-started"
                className="mobile-button bg-blue-600 text-white hover:bg-blue-700"
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

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }

        .animated-purple-text {
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-fill-color: transparent;
          font-weight: bold;
          display: inline-block;
          font-size: inherit;
        }
      `}</style>

      {/* Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Step Up",
            "url": "https://joinstepup.com",
            "description": "AI-powered platform connecting high school students with meaningful internships, volunteering, and skill-building opportunities.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://joinstepup.com/opportunities",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />
    </div>
  )
} 