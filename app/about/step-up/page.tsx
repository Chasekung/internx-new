'use client';

import { motion } from 'framer-motion';
import ValuesAccordion from './ValuesAccordion';

export default function AboutStepUpPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
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

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-64">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-lg font-semibold text-blue-600 uppercase tracking-wide"
          >
            ABOUT STEP UP
          </motion.p>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
          >
            <span className="block">Connecting <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">motivated students</span></span>
            <span className="block">with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">mission-driven organizations</span></span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed"
          >
            The traditional opportunity landscape has overlooked high school talent for too long. At Step Up, we're changing that with an AI-powered platform that connects ambitious high school students to meaningful opportunities — internships, volunteering, and more — making the process seamless for both students and organizations.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed"
          >
            No more barriers. No more missed connections. Just direct pathways to skills, experience, and growth for students — and a simple way for organizations to reach motivated, diverse, and skilled youth talent.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-6 max-w-3xl mx-auto text-xl text-gray-600 leading-relaxed"
          >
            Step Up empowers every high school student to take their first step into the real world with confidence, while enabling organizations to build their future talent pipelines and make a positive impact.
          </motion.p>
        </div>
      </div>

      {/* Our Values Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-48 pb-32">
        <div className="flex flex-col md:flex-row md:space-x-16 items-start">
          {/* Left Side */}
          <div className="md:w-1/2 mb-12 md:mb-0">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-lg font-semibold text-blue-600 uppercase tracking-wide mb-4"
            >
              Our Values
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6"
            >
              Empathy and Excellence in Action
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-gray-600 leading-relaxed"
            >
              At Step Up, we believe that true impact comes from a blend of empathy and a drive for excellence. We listen deeply, support each other, and always aim higher—whether we're serving students, partners, or our own team. Our values guide every connection, every opportunity, and every step forward.
            </motion.p>
          </div>

          {/* Right Side: Accordion */}
          <div className="md:w-1/2 w-full">
            <ValuesAccordion />
          </div>
        </div>
      </section>

      {/* About the team Section */}
      <section className="relative z-20 w-full pb-32">
        {/* Full-width turquoise gradient background, from transparent to turquoise, starting higher */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-transparent via-cyan-100 via-40% via-teal-200 to-teal-300 to-80% opacity-95 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">About the team</h2>
            <p className="text-lg text-gray-600">Founded by passionate high schoolers, starting from LaunchX</p>
          </div>
          
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">The Co-founders</h3>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Meet the five passionate high school students who came together to revolutionize the internship and volunteering experience for students and companies alike.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 justify-items-center">
            {/* Chase Kung */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center w-full max-w-xs">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-blue-200 to-purple-200 mb-6 flex items-center justify-center overflow-hidden border-4 border-blue-500">
                <img
                  src="/Chase_LaunchX.jpg"
                  alt="Chase Kung"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 mb-2">Chase Kung</div>
                <div className="text-sm text-gray-600">Chief Executive Officer</div>
              </div>
            </div>

            {/* Kyungjin Oh */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center w-full max-w-xs">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-blue-200 to-purple-200 mb-6 flex items-center justify-center overflow-hidden border-4 border-blue-500">
                <img
                  src="/KJ_LaunchX.jpg"
                  alt="Kyungjin Oh"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 mb-2">Kyungjin Oh</div>
                <div className="text-sm text-gray-600">Chief Operating Officer</div>
              </div>
            </div>

            {/* Albert Zhang */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center w-full max-w-xs">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-blue-200 to-purple-200 mb-6 flex items-center justify-center overflow-hidden border-4 border-blue-500">
                <img
                  src="/Albert_LaunchX.jpg"
                  alt="Albert Zhang"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 mb-2">Albert Zhang</div>
                <div className="text-sm text-gray-600">Chief Marketing Officer</div>
              </div>
            </div>

            {/* Kymi Taniwan */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center w-full max-w-xs">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-blue-200 to-purple-200 mb-6 flex items-center justify-center overflow-hidden border-4 border-blue-500">
                <img
                  src="/Kymi_LaunchX.jpg"
                  alt="Kymi Taniwan"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 mb-2">Kymi Taniwan</div>
                <div className="text-sm text-gray-600">Chief Financial Officer</div>
              </div>
            </div>

            {/* Siddh Rajrishi */}
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 flex flex-col items-center w-full max-w-xs">
              <div className="w-40 h-40 rounded-xl bg-gradient-to-br from-blue-200 to-purple-200 mb-6 flex items-center justify-center overflow-hidden border-4 border-blue-500">
                <img
                  src="/Siddh_LaunchX.jpg"
                  alt="Siddh Rajrishi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900 mb-2">Siddh Rajrishi</div>
                <div className="text-sm text-gray-600">Chief Communications Officer</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 