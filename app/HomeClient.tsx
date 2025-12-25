'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

const stats = [
  {
    value: '67%',
    label: 'Want to Intern',
    description: 'Of high school students who want internships are unable to find one',
  },
  {
    value: '98%',
    label: 'Failure Rate',
    description: 'Only 2% of high school students successfully secure internships',
  },
  {
    value: '50%',
    label: 'Employers Open',
    description: 'Half of employers are open to high school interns but lack channels',
  },
]

const features = [
  {
    title: 'Smart Matching',
    description: 'Connect with opportunities that align with your skills and interests.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Skill Development',
    description: 'Build real-world experience through meaningful work opportunities.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Direct Connections',
    description: 'Message companies directly and build lasting professional relationships.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

const faqs = [
  {
    question: 'How does matching work?',
    answer: 'Our platform analyzes your skills, interests, and goals to connect you with opportunities that fit. We focus on potential, not just experience.',
  },
  {
    question: 'What types of opportunities are available?',
    answer: 'Internships, volunteering positions, research opportunities, and skill-building programs across tech, healthcare, education, and more.',
  },
  {
    question: 'Do I need prior experience?',
    answer: 'No. Step Up is designed for students eager to learn. We match based on your skills and willingness to grow.',
  },
  {
    question: 'Is Step Up free for students?',
    answer: 'Yes, completely free. Every student deserves access to meaningful opportunities regardless of background.',
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function HomeClient() {
  const animatedWords = ["Internship", "Non-Profit", "Research Experience", "Summer Program"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % animatedWords.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Stars data for reuse throughout the page
  const starsData = [
    { left: 5, top: 3, dur: 2.5, delay: 0.1 }, { left: 12, top: 5, dur: 3.2, delay: 0.5 },
    { left: 22, top: 2, dur: 2.8, delay: 1.2 }, { left: 35, top: 4, dur: 3.5, delay: 0.3 },
    { left: 45, top: 3, dur: 2.2, delay: 0.8 }, { left: 55, top: 6, dur: 3.8, delay: 1.5 },
    { left: 68, top: 2, dur: 2.6, delay: 0.2 }, { left: 78, top: 5, dur: 3.1, delay: 1.0 },
    { left: 88, top: 4, dur: 2.9, delay: 0.6 }, { left: 95, top: 7, dur: 3.4, delay: 1.3 },
    { left: 8, top: 12, dur: 2.4, delay: 0.4 }, { left: 18, top: 15, dur: 3.0, delay: 0.9 },
    { left: 28, top: 10, dur: 2.7, delay: 1.4 }, { left: 42, top: 14, dur: 3.3, delay: 0.7 },
    { left: 52, top: 18, dur: 2.3, delay: 1.1 }, { left: 65, top: 11, dur: 3.6, delay: 0.0 },
    { left: 75, top: 16, dur: 2.1, delay: 1.6 }, { left: 85, top: 13, dur: 3.2, delay: 0.5 },
    { left: 92, top: 19, dur: 2.8, delay: 1.2 }, { left: 3, top: 22, dur: 3.5, delay: 0.3 },
    { left: 15, top: 25, dur: 2.6, delay: 0.8 }, { left: 25, top: 21, dur: 3.8, delay: 1.5 },
    { left: 38, top: 27, dur: 2.2, delay: 0.2 }, { left: 48, top: 30, dur: 3.1, delay: 1.0 },
    { left: 58, top: 24, dur: 2.9, delay: 0.6 }, { left: 72, top: 28, dur: 3.4, delay: 1.3 },
    { left: 82, top: 23, dur: 2.4, delay: 0.4 }, { left: 90, top: 31, dur: 3.0, delay: 0.9 },
    { left: 6, top: 35, dur: 2.7, delay: 1.4 }, { left: 20, top: 38, dur: 3.3, delay: 0.7 },
    { left: 32, top: 33, dur: 2.3, delay: 1.1 }, { left: 45, top: 40, dur: 3.6, delay: 0.0 },
    { left: 55, top: 36, dur: 2.1, delay: 1.6 }, { left: 68, top: 42, dur: 3.2, delay: 0.5 },
    { left: 80, top: 37, dur: 2.8, delay: 1.2 }, { left: 88, top: 44, dur: 3.5, delay: 0.3 },
    { left: 4, top: 48, dur: 2.5, delay: 0.1 }, { left: 16, top: 52, dur: 3.2, delay: 0.5 },
    { left: 26, top: 46, dur: 2.8, delay: 1.2 }, { left: 40, top: 55, dur: 3.5, delay: 0.3 },
    { left: 50, top: 50, dur: 2.2, delay: 0.8 }, { left: 62, top: 57, dur: 3.8, delay: 1.5 },
    { left: 74, top: 48, dur: 2.6, delay: 0.2 }, { left: 84, top: 54, dur: 3.1, delay: 1.0 },
    { left: 94, top: 51, dur: 2.9, delay: 0.6 }, { left: 7, top: 62, dur: 3.4, delay: 1.3 },
    { left: 19, top: 66, dur: 2.4, delay: 0.4 }, { left: 31, top: 60, dur: 3.0, delay: 0.9 },
    { left: 43, top: 68, dur: 2.7, delay: 1.4 }, { left: 57, top: 64, dur: 3.3, delay: 0.7 },
    { left: 67, top: 70, dur: 2.3, delay: 1.1 }, { left: 79, top: 63, dur: 3.6, delay: 0.0 },
    { left: 89, top: 72, dur: 2.1, delay: 1.6 }, { left: 2, top: 76, dur: 3.2, delay: 0.5 },
    { left: 14, top: 80, dur: 2.8, delay: 1.2 }, { left: 28, top: 74, dur: 3.5, delay: 0.3 },
    { left: 38, top: 82, dur: 2.6, delay: 0.8 }, { left: 52, top: 78, dur: 3.8, delay: 1.5 },
    { left: 64, top: 85, dur: 2.2, delay: 0.2 }, { left: 76, top: 79, dur: 3.1, delay: 1.0 },
    { left: 86, top: 88, dur: 2.9, delay: 0.6 }, { left: 96, top: 83, dur: 3.4, delay: 1.3 },
    { left: 10, top: 92, dur: 2.4, delay: 0.4 }, { left: 24, top: 95, dur: 3.0, delay: 0.9 },
    { left: 36, top: 90, dur: 2.7, delay: 1.4 }, { left: 48, top: 97, dur: 3.3, delay: 0.7 },
    { left: 60, top: 93, dur: 2.3, delay: 1.1 }, { left: 72, top: 98, dur: 3.6, delay: 0.0 },
    { left: 82, top: 94, dur: 2.1, delay: 1.6 }, { left: 92, top: 96, dur: 3.2, delay: 0.5 },
  ];

  // Planets data for dark mode
  const planetsData = [
    { left: 8, top: 18, size: 6, color: 'bg-purple-400', glow: 'bg-purple-400/30' },
    { left: 85, top: 35, size: 8, color: 'bg-blue-400', glow: 'bg-blue-400/30' },
    { left: 15, top: 55, size: 5, color: 'bg-pink-400', glow: 'bg-pink-400/30' },
    { left: 72, top: 65, size: 7, color: 'bg-cyan-400', glow: 'bg-cyan-400/30' },
    { left: 40, top: 78, size: 4, color: 'bg-orange-400', glow: 'bg-orange-400/30' },
    { left: 92, top: 85, size: 6, color: 'bg-green-400', glow: 'bg-green-400/30' },
    { left: 25, top: 92, size: 5, color: 'bg-rose-400', glow: 'bg-rose-400/30' },
    { left: 58, top: 42, size: 4, color: 'bg-violet-400', glow: 'bg-violet-400/30' },
  ];

  return (
    <div className="relative">
      {/* ═══════════════════════════════════════════════════════════════════
          GLOBAL BACKGROUNDS - Cover entire page
      ═══════════════════════════════════════════════════════════════════ */}
      
      {/* LIGHT MODE: Animated bubble gradient background - FULL PAGE */}
      {/* Using opacity only (no mix-blend-multiply) to prevent text color bleeding */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none dark:hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.35 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-200 rounded-full filter blur-3xl animate-blob"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.35 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute top-[30%] -left-40 w-[500px] h-[500px] bg-indigo-200 rounded-full filter blur-3xl animate-blob animation-delay-2000"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.25 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-100 rounded-full filter blur-3xl animate-blob animation-delay-4000"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.3 }}
          transition={{ duration: 1.5, delay: 0.6, ease: "easeOut" }}
          className="absolute top-[60%] right-[10%] w-[400px] h-[400px] bg-violet-200 rounded-full filter blur-3xl animate-blob animation-delay-2000"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
          className="absolute top-[85%] left-[20%] w-[450px] h-[450px] bg-indigo-100 rounded-full filter blur-3xl animate-blob animation-delay-4000"
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
      </div>

      {/* DARK MODE: Full page starfield, planets, comets, and moons */}
      <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none hidden dark:block">
        {/* Starfield background - spread throughout entire page */}
        <div className="absolute inset-0">
          {starsData.map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${star.left}%`,
                top: `${star.top}%`,
                animation: `twinkle ${star.dur}s infinite ${star.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Small Planets scattered throughout */}
        {planetsData.map((planet, i) => (
          <motion.div
            key={`planet-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: 0.8, 
              scale: 1,
              y: [0, -5, 0],
            }}
            transition={{ 
              opacity: { duration: 1, delay: i * 0.1 },
              scale: { duration: 0.5, delay: i * 0.1 },
              y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute"
            style={{
              left: `${planet.left}%`,
              top: `${planet.top}%`,
              width: `${planet.size * 4}px`,
              height: `${planet.size * 4}px`,
            }}
          >
            {/* Planet glow */}
            <div className={`absolute inset-0 ${planet.glow} rounded-full blur-sm`} />
            {/* Planet body */}
            <div className={`absolute inset-1 ${planet.color} rounded-full opacity-80`} />
          </motion.div>
        ))}

        {/* Crescent Moon with Astronaut in hero area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ 
            opacity: 0.85, 
            scale: 1,
            y: [0, -8, 0],
          }}
          transition={{ 
            opacity: { duration: 1 },
            scale: { duration: 1 },
            y: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute top-16 right-[8%] w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"
        >
          <div className="relative w-full h-full">
            {/* Moon glow */}
            <div className="absolute inset-0 bg-amber-100 rounded-full blur-xl opacity-20" />
            
            {/* Crescent Moon SVG */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
              {/* Moon crescent - created by overlapping circles */}
              <defs>
                <mask id="crescentMask">
                  <circle cx="50" cy="50" r="45" fill="white" />
                  <circle cx="70" cy="45" r="38" fill="black" />
                </mask>
                <linearGradient id="moonGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef3c7" />
                  <stop offset="50%" stopColor="#fde68a" />
                  <stop offset="100%" stopColor="#fcd34d" />
                </linearGradient>
              </defs>
              
              {/* Moon body */}
              <circle cx="50" cy="50" r="45" fill="url(#moonGradient)" mask="url(#crescentMask)" opacity="0.9" />
              
              {/* Moon craters on visible part */}
              <circle cx="25" cy="40" r="3" fill="#fbbf24" opacity="0.4" mask="url(#crescentMask)" />
              <circle cx="30" cy="60" r="2" fill="#fbbf24" opacity="0.3" mask="url(#crescentMask)" />
              <circle cx="20" cy="55" r="1.5" fill="#fbbf24" opacity="0.35" mask="url(#crescentMask)" />
              
              {/* Astronaut silhouette on the moon surface */}
              <g transform="translate(18, 68) scale(0.35)" opacity="0.85">
                {/* Astronaut body */}
                <ellipse cx="12" cy="22" rx="8" ry="10" fill="#1e293b" />
                {/* Astronaut helmet */}
                <circle cx="12" cy="8" r="7" fill="#1e293b" />
                {/* Helmet visor reflection */}
                <circle cx="12" cy="8" r="5" fill="#334155" />
                <circle cx="10" cy="6" r="1.5" fill="#64748b" opacity="0.6" />
                {/* Astronaut arm reaching to flag */}
                <path d="M 18 18 Q 28 12 32 8" stroke="#1e293b" strokeWidth="3" fill="none" strokeLinecap="round" />
                {/* Astronaut legs */}
                <path d="M 8 30 L 4 42" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                <path d="M 16 30 L 20 42" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" />
                {/* Astronaut backpack */}
                <rect x="16" y="16" width="6" height="10" rx="1" fill="#1e293b" />
              </g>
              
              {/* Flag on the moon */}
              <g transform="translate(28, 52)">
                {/* Flag pole */}
                <line x1="0" y1="0" x2="0" y2="22" stroke="#94a3b8" strokeWidth="1" />
                {/* Flag - waving effect */}
                <path d="M 0 0 Q 6 2 12 0 Q 6 4 12 6 L 0 6 Z" fill="#8b5cf6" opacity="0.9">
                  <animate attributeName="d" 
                    values="M 0 0 Q 6 2 12 0 Q 6 4 12 6 L 0 6 Z;
                            M 0 0 Q 6 -1 12 1 Q 6 5 12 5 L 0 6 Z;
                            M 0 0 Q 6 2 12 0 Q 6 4 12 6 L 0 6 Z" 
                    dur="3s" repeatCount="indefinite" />
                </path>
                {/* Star on flag */}
                <polygon points="6,3 6.5,4 7.5,4 6.7,4.6 7,5.5 6,5 5,5.5 5.3,4.6 4.5,4 5.5,4" fill="white" opacity="0.9">
                  <animate attributeName="opacity" values="0.9;0.6;0.9" dur="2s" repeatCount="indefinite" />
                </polygon>
              </g>
            </svg>
          </div>
        </motion.div>

        {/* Animated Comets - spread across the page */}
        <div className="absolute inset-0">
          <div className="comet comet-1" />
          <div className="comet comet-2" />
          <div className="comet comet-3" />
          <div className="comet comet-4" />
          <div className="comet comet-5" />
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION - Clean, Confident, Minimal
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="mobile-container max-w-4xl mx-auto text-center relative z-10"
        >
{/* Headline */}
          <motion.h1 
            variants={fadeUp}
            className="heading-1 text-slate-900 dark:text-white"
          >
            Find Your Perfect
            <br />
            <span className="relative inline-block">
              <motion.span
                key={animatedWords[wordIndex]}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="text-purple-600 dark:text-purple-400"
              >
                {animatedWords[wordIndex]}
              </motion.span>
            </span>
            <br />
            {/* <span className="text-slate-900 dark:text-white">Experience</span> */}
          </motion.h1>

          {/* Subheadline */}
            <motion.p
            variants={fadeUp}
            className="mt-6 sm:mt-8 body-large max-w-2xl mx-auto text-slate-600 dark:text-slate-300"
            >
            A platform connecting high school students with internships, volunteering, and skill-building opportunities.
            </motion.p>

          {/* CTA Buttons */}
            <motion.div
            variants={fadeUp}
            className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4 justify-center"
            >
                  <Link
                    href="/intern-get-started"
              className="btn-base btn-primary text-base"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="#features"
              className="btn-base btn-glass text-base"
                  >
                    Learn More
                  </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURE HIGHLIGHTS - Compact, Clean
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="mobile-container">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={fadeUp}
                className="glass-card p-6 sm:p-8 group hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="heading-3 text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="body-base">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          STATS SECTION - The Opportunity Gap
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative z-10">
        <div className="mobile-container max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="label text-indigo-600 dark:text-indigo-400 mb-3">
              The Problem
            </motion.p>
            <motion.h2 variants={fadeUp} className="heading-2 text-slate-900 dark:text-white">
              The High School Opportunity Gap
            </motion.h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeUp}
                className="text-center glass-card p-6 sm:p-8"
              >
                <div className="text-5xl sm:text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-3">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {stat.label}
                </div>
                <p className="body-small max-w-xs mx-auto">
                  {stat.description}
                </p>
              </motion.div>
            ))}
            </motion.div>
          </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FEATURES SECTION - Detailed
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-20 sm:py-28">
        <div className="mobile-container max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="label text-indigo-600 dark:text-indigo-400 mb-3">
              How It Works
            </motion.p>
            <motion.h2 variants={fadeUp} className="heading-2 text-slate-900 dark:text-white mb-4">
              Built for High School Students
            </motion.h2>
            <motion.p variants={fadeUp} className="body-large max-w-2xl mx-auto">
              Our platform connects students with meaningful opportunities while 
              reducing the management burden on companies.
            </motion.p>
          </motion.div>

          {/* Feature Grid with Video Placeholders */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Interview Practice */}
            <motion.div variants={fadeUp} className="glass-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Interview Practice</h3>
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">Coming Soon</span>
              </div>
              {/* Video Placeholder */}
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3 border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                  <span className="text-xs">Video coming soon</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Practice with an adaptive system that provides real-time feedback.
              </p>
            </motion.div>

            {/* Progress Tracking */}
            <motion.div variants={fadeUp} className="glass-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Progress Tracking</h3>
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">Coming Soon</span>
              </div>
              {/* Video Placeholder */}
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3 border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                  <span className="text-xs">Video coming soon</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Get comprehensive analytics about your performance and skills.
              </p>
            </motion.div>

            {/* Easy Applications */}
            <motion.div variants={fadeUp} className="glass-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Easy Applications</h3>
                <span className="text-xs font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded">Available</span>
              </div>
              {/* Video Placeholder */}
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3 border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                  <span className="text-xs">Video coming soon</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Browse and apply to opportunities designed for high school students.
              </p>
            </motion.div>

            {/* Direct Messaging */}
            <motion.div variants={fadeUp} className="glass-card p-4 sm:p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">Direct Messaging</h3>
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">Available</span>
              </div>
              {/* Video Placeholder */}
              <div className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-3 border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <svg className="w-8 h-8 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                  </svg>
                  <span className="text-xs">Video coming soon</span>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Seamless communication with companies and mentors.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          REVIEWS SECTION - Blurred Coming Soon
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mobile-container max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="heading-2 text-slate-900 dark:text-white mb-4">
              Based on <span className="text-indigo-600 dark:text-indigo-400">skill and mindset</span>,
              <br />not experience
            </motion.h2>
            <motion.p variants={fadeUp} className="body-base">
              What students are saying about Step Up
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            {/* Blurred placeholder */}
            <div className="glass-card p-8 sm:p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
              </div>
              <h3 className="heading-3 text-slate-900 dark:text-white mb-2">Reviews Coming Soon</h3>
              <p className="body-base max-w-md mx-auto">
                We&apos;re gathering feedback from students to share comprehensive 
                and insightful reviews. Check back soon!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQ SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28">
        <div className="mobile-container max-w-3xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeUp} className="heading-2 text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </motion.h2>
            <motion.p variants={fadeUp} className="body-base">
              Common questions about high school internships and opportunities
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-4"
          >
            {faqs.map((faq) => (
              <motion.div
                key={faq.question}
                variants={fadeUp}
                className="glass-card p-6"
              >
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                  {faq.question}
                </h3>
                <p className="body-base">
                  {faq.answer}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          CTA SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 relative">
        <div className="mobile-container max-w-4xl mx-auto relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="glass-card p-8 sm:p-12 text-center"
          >
            <motion.h2 variants={fadeUp} className="heading-2 text-slate-900 dark:text-white mb-4">
              Ready to find your next opportunity?
            </motion.h2>
            <motion.p variants={fadeUp} className="body-large mb-8 max-w-xl mx-auto">
              Join thousands of high school students already building their futures with Step Up.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/intern-get-started"
                className="btn-base btn-primary text-base"
              >
                Get Started — It&apos;s Free
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Structured Data for Homepage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Step Up",
            "url": "https://joinstepup.com",
            "description": "Platform connecting high school students with meaningful internships, volunteering, and skill-building opportunities.",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://joinstepup.com/opportunities",
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* Custom Animations CSS */}
      <style jsx global>{`
        /* Blob animation for light mode */
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 8s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        /* Grid pattern for light mode */
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #a78bfa 1px, transparent 1px),
            linear-gradient(to bottom, #a78bfa 1px, transparent 1px);
          background-size: 32px 32px;
        }
        
        /* Star twinkle animation for dark mode */
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        
        /* Comet animation for dark mode */
        @keyframes comet {
          0% {
            transform: translate(0, 0) rotate(-45deg);
            opacity: 1;
          }
          70% {
            opacity: 1;
          }
          100% {
            transform: translate(-500px, 500px) rotate(-45deg);
            opacity: 0;
          }
        }
        
        .comet {
          position: absolute;
          width: 4px;
          height: 4px;
          background: linear-gradient(90deg, #ffffff, transparent);
          border-radius: 50%;
          opacity: 0;
        }
        
        .comet::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
          width: 80px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0.6), transparent);
        }
        
        .comet-1 {
          top: 8%;
          right: -10%;
          animation: comet 4s ease-in-out infinite;
          animation-delay: 0s;
        }
        
        .comet-2 {
          top: 22%;
          right: -5%;
          animation: comet 5s ease-in-out infinite;
          animation-delay: 2.5s;
        }
        
        .comet-3 {
          top: 45%;
          right: -15%;
          animation: comet 6s ease-in-out infinite;
          animation-delay: 5s;
        }
        
        .comet-4 {
          top: 65%;
          right: -8%;
          animation: comet 4.5s ease-in-out infinite;
          animation-delay: 7.5s;
        }
        
        .comet-5 {
          top: 85%;
          right: -12%;
          animation: comet 5.5s ease-in-out infinite;
          animation-delay: 10s;
        }
      `}</style>
    </div>
  )
} 
