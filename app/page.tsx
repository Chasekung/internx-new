'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const features = [
  {
    name: 'AI-Powered Role Analysis',
    description: 'Our AI analyzes company roles and processes to identify hidden Opportunity opportunities, expanding the supply of available positions.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    name: 'Smart Skill Matching',
    description: 'Connect with opportunities based on your skills rather than prior experience, making it easier for high school students to find relevant positions.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
  },
  {
    name: 'AI Intern Coach',
    description: 'Get continuous guidance and feedback through our AI Intern Mentor Agents, reducing supervision time by up to 90% for companies.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    name: 'Direct Company Connections',
    description: 'Bypass traditional barriers and connect directly with companies that are open to high school interns.',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
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

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [activeTab, setActiveTab] = useState('internships');

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
      <div className="relative pt-32 pb-64 sm:pt-36 sm:pb-72 overflow-hidden">
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
                Powered by AI
              </span>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
            >
              <span className="block">Find</span>
              <span className="block gradient-text">Your Perfect Opportunity</span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mx-auto mt-3 max-w-md text-base text-black sm:text-lg md:mt-5 md:max-w-3xl md:text-xl"
            >
              Breaking down barriers for high school students to connect with meaningful opportunities. Powered by AI-driven matching and mentorship.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="mx-auto mt-8 max-w-md sm:flex sm:justify-center md:mt-12"
            >
              <div className="rounded-md shadow">
                <Link
                  href="/intern-get-started"
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
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
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
              className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
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
              className="relative p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
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
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="sm:flex sm:justify-center mb-12">
            <div className="relative flex rounded-full p-1 bg-gray-200 text-gray-500">
              <button
                onClick={() => setActiveTab('internships')}
                className={`relative rounded-full py-2 px-6 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'internships' ? 'text-white' : 'hover:text-gray-700'}`}
              >
                {activeTab === 'internships' && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-blue-600 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20">Internships</span>
              </button>
              <button
                onClick={() => setActiveTab('volunteering')}
                className={`relative rounded-full py-2 px-6 text-sm font-medium transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${activeTab === 'volunteering' ? 'text-white' : 'hover:text-gray-700'}`}
              >
                {activeTab === 'volunteering' && (
                  <motion.span
                    layoutId="bubble"
                    className="absolute inset-0 z-10 bg-blue-600 rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-20">Volunteering</span>
              </button>
            </div>
          </div>

          {activeTab === 'internships' && (
            <div>
              {/* Existing internships content goes here (from Traditional Current Issues to reviews) */}
              {/* Stats Section */}
              <div className="bg-white py-16">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-8">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Traditional Current Issues</h2>
                    <h2 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                      The High School Opportunity Gap
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat) => (
                      <div key={stat.name} className="text-center">
                        <div className="text-4xl font-bold text-blue-600">{stat.value}</div>
                        <div className="mt-2 text-lg font-semibold text-gray-900">{stat.name}</div>
                        <div className="mt-1 text-sm text-gray-500">{stat.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feature Section */}
              <div className="py-12 bg-gray-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  <div className="lg:text-center">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
                    <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                      Revolutionizing High School Opportunities
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                      Our AI-powered platform connects high school students with meaningful Opportunity opportunities while reducing the management burden on companies.
                    </p>
                  </div>

                  <div className="mt-10">
                    <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                      {features.map((feature) => (
                        <div key={feature.name} className="relative">
                          <dt>
                            <div className="absolute flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                              {feature.icon}
                            </div>
                            <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                          </dt>
                          <dd className="mt-2 ml-16 text-base text-gray-500">
                            {feature.description}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="py-8 bg-white">
                <div className="mx-auto max-w-[1275px] px-4 sm:px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                      Based on <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">skill and mindset</span>, not experience
                    </h2>
                    <p className="mt-2 text-xl text-gray-500">
                      As revealed by past users
                    </p>
                  </div>

                  <div className="mt-8 relative">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={handlePrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 transform bg-white w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-300 shadow-lg z-10 disabled:opacity-50 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        aria-label="Previous reviews"
                        disabled={currentIndex === 0}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 transform bg-white w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-300 shadow-lg z-10 disabled:opacity-50 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        aria-label="Next reviews"
                        disabled={currentIndex >= testimonials.length - 3}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
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
                          <div key={index} className="w-[400px] px-2">
                            <div className="bg-white rounded-lg shadow-lg p-6 h-[280px] flex flex-col">
                              <div className="flex items-center">
                                <img
                                  className="h-12 w-12 rounded-full"
                                  src={testimonial.image}
                                  alt={testimonial.name}
                                />
                                <div className="ml-4">
                                  <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                                  <div className="flex items-center mt-1">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className="h-5 w-5 text-yellow-400"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="mt-4 text-base text-gray-600 flex-grow">{testimonial.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'volunteering' && (
            <div>
              {/* Placeholder for Volunteering Content */}
              <div className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">TRADITIONAL CURRENT ISSUES</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">The High School Volunteering Gap</p>
                  </div>
                  <dl className="mt-20 grid grid-cols-1 gap-y-16 text-center lg:grid-cols-3">
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                      <dt className="text-base leading-7 text-gray-600">Placeholder Stat 1</dt>
                      <dd className="order-first text-5xl font-semibold tracking-tight text-blue-600">0%</dd>
                      <p className="text-sm text-gray-500">Description for placeholder stat 1.</p>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                      <dt className="text-base leading-7 text-gray-600">Placeholder Stat 2</dt>
                      <dd className="order-first text-5xl font-semibold tracking-tight text-blue-600">0%</dd>
                      <p className="text-sm text-gray-500">Description for placeholder stat 2.</p>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                      <dt className="text-base leading-7 text-gray-600">Placeholder Stat 3</dt>
                      <dd className="order-first text-5xl font-semibold tracking-tight text-blue-600">0%</dd>
                      <p className="text-sm text-gray-500">Description for placeholder stat 3.</p>
                    </div>
                  </dl>
                </div>
              </div>

              <div id="features-volunteering" className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-base font-semibold leading-7 text-blue-600">FEATURES</h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Revolutionizing High School Volunteering</p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                      Placeholder text for volunteering features.
                    </p>
                  </div>
                  <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
                    <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                      {/* Placeholder features */}
                    </dl>
                  </div>
                </div>
              </div>

              <section className="bg-white py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Based on <span className="text-blue-600">passion and commitment,</span> not connections</h2>
                    <p className="mt-4 text-lg leading-8 text-gray-600">As revealed by past volunteers</p>
                  </div>
                  <div className="relative mt-16 flex justify-center">
                    <button
                      onClick={handlePrevious}
                      className="absolute left-0 top-1/2 -translate-y-1/2 transform bg-white w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-300 shadow-lg z-10 disabled:opacity-50 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      aria-label="Previous reviews"
                      disabled={currentIndex === 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    <div
                      className="overflow-hidden mx-auto"
                      style={{ width: '1320px', maxWidth: '100%' }} // 3 * 400px + 2 * 40px gap
                    >
                      <div
                        className="flex transition-transform duration-300 ease-in-out gap-[40px]"
                        style={{ transform: `translateX(-${currentIndex * 440}px)` }}
                      >
                        {volunteerTestimonials.map((testimonial, index) => {
                          const isCenter = index === currentIndex + 1;
                          return (
                            <div
                              key={index}
                              className={`w-[400px] ${isCenter ? 'scale-105 shadow-2xl border-2 border-blue-500 z-10' : 'scale-100 opacity-80'} transition-all duration-300 bg-white rounded-lg`}
                              style={{ flexShrink: 0 }}
                            >
                              <div className="rounded-2xl bg-gray-50 p-10 text-base leading-6 shadow ring-1 ring-gray-900/5 h-[320px] flex flex-col">
                                <div className="flex items-center">
                                  <img
                                    className="h-14 w-14 rounded-full"
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                  />
                                  <div className="ml-4">
                                    <h3 className="text-xl font-medium text-gray-900">{testimonial.name}</h3>
                                    <div className="flex items-center mt-1">
                                      {[...Array(testimonial.rating)].map((_, i) => (
                                        <svg
                                          key={i}
                                          className="h-5 w-5 text-yellow-400"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <p className="mt-6 text-lg text-gray-600 flex-grow">{testimonial.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <button
                      onClick={handleNext}
                      className="absolute right-0 top-1/2 -translate-y-1/2 transform bg-white w-14 h-14 flex items-center justify-center rounded-full border-2 border-gray-300 shadow-lg z-10 disabled:opacity-50 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                      aria-label="Next reviews"
                      disabled={currentIndex >= volunteerTestimonials.length - 3}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {/* CTA Section (Ready to find your next opportunity) remains outside the tabs */}
      <div className="bg-white">
        <div className="mx-auto max-w-7xl py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to find your next opportunity?</span>
            <span className="block text-blue-600">Join Step Up today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/intern-get-started"
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
      `}</style>
    </div>
  )
}
