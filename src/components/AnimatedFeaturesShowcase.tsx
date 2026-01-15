'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, ChevronRight, Search, MapPin, GraduationCap, Building2, FileText, Wand2 } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Student {
  id: string;
  name: string;
  school: string;
  grade: string;
  location: string;
  skills: string[];
  interests: string;
  matchReasons?: string[];
}

export default function AnimatedFeaturesShowcase() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    { id: 0, title: 'Post Opportunities with AI', subtitle: 'Create compelling job postings in seconds' },
    { id: 1, title: 'Scout Talent Smart', subtitle: 'AI-powered candidate discovery' },
    { id: 2, title: 'Smart Form Builder', subtitle: 'Custom application forms with AI' }
  ];

  return (
    <div className="relative py-32 bg-white overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 mb-4">
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            AI-Powered Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            See StepUp in Action
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover how our AI streamlines every step of your hiring process
          </p>
        </motion.div>

        {/* Feature Navigation Tabs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {features.map((feature, index) => (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(index)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeFeature === index
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="text-sm sm:text-base font-semibold">{feature.title}</div>
              <div className={`text-xs mt-0.5 ${activeFeature === index ? 'text-blue-100' : 'text-gray-500'}`}>
                {feature.subtitle}
              </div>
            </button>
          ))}
        </motion.div>

        {/* Animated Feature Demos */}
        <AnimatePresence mode="wait">
          {activeFeature === 0 && <PostOpportunityDemo key="post" />}
          {activeFeature === 1 && <ScoutTalentDemo key="scout" />}
          {activeFeature === 2 && <FormBuilderDemo key="form" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Feature 1: Post Opportunity with AI
function PostOpportunityDemo() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi! Tell me about your internship opportunity and I\'ll help you create a compelling job description.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const exampleQueries = [
    'Create a marketing intern position for our startup',
    'We need a software engineering intern',
    'Looking for a design intern for our agency'
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSend = (message?: string) => {
    const query = message || input;
    if (!query.trim() || isTyping) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    setChatMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: 'Perfect! I\'ve generated a professional job description for you. Check out the preview on the right →'
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Type out the generated description
      typeDescription();
    }, 1500);
  };

  const typeDescription = () => {
    const fullDescription = `About The Role

We're looking for a passionate and creative Marketing Intern to join our growing team. This is an excellent opportunity for high school students interested in marketing, content creation, and brand strategy.

In This Role You Will:
• Assist in creating engaging social media content
• Research market trends and competitor activities
• Help develop marketing campaigns and strategies
• Analyze campaign performance and metrics
• Collaborate with our marketing team on creative projects

You Might Thrive If You:
• Have strong written and verbal communication skills
• Are creative and enjoy brainstorming new ideas
• Have experience with social media platforms
• Are detail-oriented and organized
• Want to learn about digital marketing`;

    let currentText = '';
    const words = fullDescription.split(' ');
    let wordIndex = 0;

    const interval = setInterval(() => {
      if (wordIndex < words.length) {
        currentText += (wordIndex > 0 ? ' ' : '') + words[wordIndex];
        setGeneratedDescription(currentText);
        wordIndex++;
      } else {
        clearInterval(interval);
      }
    }, 30);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="grid lg:grid-cols-2 gap-8"
    >
      {/* AI Chatbot Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-lg">AI Job Description Assistant</h3>
              <p className="text-gray-600 text-sm">Powered by advanced AI</p>
            </div>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="h-80 overflow-y-auto p-6 space-y-4 bg-gray-50"
        >
          {chatMessages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-200">
          {/* Example queries */}
          <div className="mb-4 flex flex-wrap gap-2">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(query)}
                className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100"
              >
                {query}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Describe your internship role..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Generated Job Description Preview */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-lg">Generated Description</h3>
              <p className="text-gray-600 text-sm">AI-powered & optimized</p>
            </div>
          </div>
        </div>

        <div className="h-80 overflow-y-auto p-6 bg-gray-50">
          {generatedDescription ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="prose prose-sm max-w-none"
            >
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Marketing Intern</h4>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {generatedDescription}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Wand2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  AI-generated description will appear here
                </p>
              </div>
            </div>
          )}
        </div>

        {generatedDescription && (
          <div className="p-6 bg-white border-t border-gray-200">
            <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 shadow-sm">
              Insert into Posting
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Feature 2: Scout Talent Smart
function ScoutTalentDemo() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'I can help you find the perfect candidates! Tell me what you\'re looking for.' }
  ]);
  const [input, setInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const exampleQueries = [
    'Find students interested in marketing',
    'Show me candidates in California',
    'Looking for 11th or 12th graders with coding skills'
  ];

  const mockStudents: Student[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      school: 'Lincoln High School',
      grade: '11th Grade',
      location: 'San Francisco, CA',
      skills: ['Social Media', 'Content Writing', 'Canva', 'SEO'],
      interests: 'Passionate about digital marketing and brand storytelling',
      matchReasons: ['Strong social media portfolio', 'Marketing club president', 'Location match: Bay Area']
    },
    {
      id: '2',
      name: 'Marcus Johnson',
      school: 'Tech Valley High',
      grade: '12th Grade',
      location: 'Palo Alto, CA',
      skills: ['Marketing Analytics', 'Google Ads', 'Email Campaigns'],
      interests: 'Data-driven marketing enthusiast with startup experience',
      matchReasons: ['Relevant internship experience', 'High GPA (3.9)', 'Available immediately']
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      school: 'Westside Academy',
      grade: '11th Grade',
      location: 'San Jose, CA',
      skills: ['Graphic Design', 'Video Editing', 'Instagram Growth'],
      interests: 'Creative marketer interested in brand identity and visual storytelling',
      matchReasons: ['Portfolio with 50K+ reach', 'Leadership experience', 'Strong communication skills']
    }
  ];

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSearch = (query?: string) => {
    const searchQuery = query || input;
    if (!searchQuery.trim() || isSearching) return;

    const userMessage: ChatMessage = { role: 'user', content: searchQuery };
    setChatMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSearching(true);

    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `Found ${mockStudents.length} highly qualified candidates matching your criteria! Check them out →`
      };
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsSearching(false);
      
      // Animate students appearing
      mockStudents.forEach((student, idx) => {
        setTimeout(() => {
          setStudents(prev => [...prev, student]);
        }, idx * 300);
      });
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="grid lg:grid-cols-2 gap-8"
    >
      {/* AI Search Panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Search className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-gray-900 font-bold text-lg">AI Candidate Search</h3>
              <p className="text-gray-600 text-sm">Smart talent discovery</p>
            </div>
          </div>
        </div>

        <div 
          ref={chatContainerRef}
          className="h-80 overflow-y-auto p-6 space-y-4 bg-gray-50"
        >
          {chatMessages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              }`}>
                <p className="text-sm">{msg.content}</p>
              </div>
            </motion.div>
          ))}
          {isSearching && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-600 border-t-transparent" />
                  <p className="text-sm text-gray-700">Searching candidates...</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-200">
          <div className="mb-4 flex flex-wrap gap-2">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(query)}
                className="text-xs px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100"
              >
                {query}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe your ideal candidate..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <button
              onClick={() => handleSearch()}
              disabled={!input.trim() || isSearching}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Matched Students */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-lg">Top Matches</h3>
                <p className="text-gray-600 text-sm">{students.length} candidates found</p>
              </div>
            </div>
          </div>
        </div>

        <div className="h-80 overflow-y-auto p-6 bg-gray-50 space-y-4">
          {students.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  Matched candidates will appear here
                </p>
              </div>
            </div>
          ) : (
            students.map((student, idx) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl p-4 border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 border border-green-200 flex items-center justify-center text-green-700 font-bold text-lg flex-shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900">{student.name}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      <GraduationCap className="w-3 h-3" />
                      <span>{student.school} • {student.grade}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span>{student.location}</span>
                    </div>

                    <p className="text-xs text-gray-700 mt-2 line-clamp-2">{student.interests}</p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {student.skills.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {student.matchReasons && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs font-semibold text-gray-700 mb-1">Why they match:</p>
                        <ul className="space-y-1">
                          {student.matchReasons.slice(0, 2).map((reason, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-600">
                              <span className="text-green-600 mt-0.5">✓</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Feature 3: Smart Form Builder (Future Feature)
function FormBuilderDemo() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formFields, setFormFields] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const mockFormFields = [
    'Full Name',
    'Email Address',
    'Phone Number',
    'School Name',
    'Grade Level',
    'Why are you interested in this position?',
    'What relevant experience do you have?',
    'Tell us about a project you\'re proud of',
    'What are your career goals?',
    'Resume/Portfolio Upload'
  ];

  const handleGenerate = () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    setFormFields([]);
    setProgress(0);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    // Add form fields one by one
    mockFormFields.forEach((field, idx) => {
      setTimeout(() => {
        setFormFields(prev => [...prev, field]);
        if (idx === mockFormFields.length - 1) {
          setIsGenerating(false);
        }
      }, idx * 200);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="max-w-5xl mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-pink-600" />
              </div>
              <div>
                <h3 className="text-gray-900 font-bold text-2xl">AI Form Builder</h3>
                <p className="text-gray-600 text-sm">Create custom application forms instantly</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-gray-100 border border-gray-200 rounded-full text-gray-700 text-xs font-semibold">
              Coming Soon
            </span>
          </div>
        </div>

        <div className="p-8">
          {/* Control Panel */}
          <div className="mb-8 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h4 className="font-bold text-gray-900 mb-4">Generate Your Custom Application Form</h4>
            <p className="text-sm text-gray-600 mb-4">
              Our AI will create a tailored application form based on your internship requirements, including smart questions and validation.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <Wand2 className="w-5 h-5" />
              {isGenerating ? 'Generating Form...' : 'Generate Form with AI'}
            </button>

            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-pink-600"
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{progress}%</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Generated Form Preview */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 text-lg mb-4">Form Preview</h4>
            
            {formFields.length === 0 && !isGenerating ? (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Wand2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    Click the button above to generate your form
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {formFields.map((field, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-pink-300 hover:shadow-md transition-all"
                  >
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      {field}
                      {idx < 5 && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.includes('Upload') ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors cursor-pointer">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                      </div>
                    ) : field.includes('Why') || field.includes('Tell') || field.includes('What') ? (
                      <textarea
                        placeholder={`Enter your ${field.toLowerCase()}...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none h-24 text-sm"
                        disabled
                      />
                    ) : (
                      <input
                        type={field.includes('Email') ? 'email' : field.includes('Phone') ? 'tel' : 'text'}
                        placeholder={`Enter your ${field.toLowerCase()}...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                        disabled
                      />
                    )}
                  </motion.div>
                ))}

                {formFields.length === mockFormFields.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pt-4"
                  >
                    <button className="w-full px-6 py-4 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors font-semibold shadow-sm">
                      Publish Application Form
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

