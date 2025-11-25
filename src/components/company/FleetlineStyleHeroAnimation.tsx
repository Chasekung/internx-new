'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export default function FleetlineStyleHeroAnimation() {
  const [currentScene, setCurrentScene] = useState(0);
  const [cursorPos, setCursorPos] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [formsPublished, setFormsPublished] = useState<number[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [sortedForms, setSortedForms] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [showTyping, setShowTyping] = useState(false);
  const [onboardingTools, setOnboardingTools] = useState<string[]>([]);
  const [completedTools, setCompletedTools] = useState<string[]>([]);
  const [clickedButton, setClickedButton] = useState<string | null>(null);

  // Mock data
  const mockApplicants = [
    { id: 1, name: 'Sarah Chen', highlights: ['Marketing exp', 'Social media'], matchScore: 'High Match', formId: 2 },
    { id: 2, name: 'Marcus Johnson', highlights: ['Coding skills', 'Math olympiad'], matchScore: 'High Match', formId: 1 },
    { id: 3, name: 'Emily Rodriguez', highlights: ['Design portfolio', 'Art club'], matchScore: 'Good Match', formId: 3 },
    { id: 4, name: 'David Kim', highlights: ['Debate team', 'Writing skills'], matchScore: 'Good Match', formId: 2 }
  ];

  const mockMessages = [
    { id: 1, sender: 'company', text: 'Hi Sarah! We loved your application!' },
    { id: 2, sender: 'intern', text: 'Thank you! I would love to interview.' },
    { id: 3, sender: 'company', text: 'Great! Tuesday at 2pm works?' },
    { id: 4, sender: 'intern', text: 'Perfect! See you then.' }
  ];

  // Animation loop timing (snappier)
  useEffect(() => {
    const sceneTimings = [3800, 3800, 4200]; // Scene durations in ms
    const transitionTime = 400; // Faster transitions

    const timer = setTimeout(() => {
      setCurrentScene((prev) => (prev + 1) % 3);
    }, sceneTimings[currentScene] + transitionTime);

    return () => clearTimeout(timer);
  }, [currentScene]);

  // Scene-specific animations
  useEffect(() => {
    // Reset states when scene changes
    setFormsPublished([]);
    setApplicants([]);
    setSortedForms([]);
    setMessages([]);
    setShowTyping(false);
    setOnboardingTools([]);
    setCompletedTools([]);
    setClickedButton(null);

    if (currentScene === 0) {
      // Scene 1: Multiple forms - cursor clicks each button (adjusted positions)
      setTimeout(() => {
        setCursorPos({ x: 16.5, y: 50 });
        setTimeout(() => {
          setClickedButton('form-1');
          setIsClicking(true);
          setTimeout(() => {
            setIsClicking(false);
            setFormsPublished([1]);
            setTimeout(() => setClickedButton(null), 100);
          }, 200);
        }, 500);
      }, 200);

      setTimeout(() => {
        setCursorPos({ x: 50, y: 50 });
        setTimeout(() => {
          setClickedButton('form-2');
          setIsClicking(true);
          setTimeout(() => {
            setIsClicking(false);
            setFormsPublished([1, 2]);
            setTimeout(() => setClickedButton(null), 100);
          }, 200);
        }, 500);
      }, 1200);

      setTimeout(() => {
        setCursorPos({ x: 83.5, y: 50 });
        setTimeout(() => {
          setClickedButton('form-3');
          setIsClicking(true);
          setTimeout(() => {
            setIsClicking(false);
            setFormsPublished([1, 2, 3]);
            setTimeout(() => setClickedButton(null), 100);
          }, 200);
        }, 500);
      }, 2200);
    }

    if (currentScene === 1) {
      // Scene 2: Load applicants, cursor clicks sort button (adjusted y position)
      setTimeout(() => setApplicants(mockApplicants), 300);
      setTimeout(() => setCursorPos({ x: 78, y: 10 }), 500);
      setTimeout(() => {
        setClickedButton('sort');
        setIsClicking(true);
        setTimeout(() => {
          setIsClicking(false);
          // Trigger sorting animation immediately
          setSortedForms([
            { formId: 1, applicant: mockApplicants[1] },
            { formId: 2, applicant: mockApplicants[0] },
            { formId: 3, applicant: mockApplicants[2] }
          ]);
          setTimeout(() => setClickedButton(null), 100);
        }, 200);
      }, 1800);
    }

    if (currentScene === 2) {
      // Scene 3: Messaging + Onboarding with cursor clicks
      setTimeout(() => setMessages([mockMessages[0]]), 300);
      setTimeout(() => setMessages([mockMessages[0], mockMessages[1]]), 750);
      setTimeout(() => {
        setShowTyping(true);
        setCursorPos({ x: 75, y: 52 });
      }, 1200);
      setTimeout(() => {
        setShowTyping(false);
        setMessages([mockMessages[0], mockMessages[1], mockMessages[2]]);
      }, 1650);
      
      // Cursor clicks Send
      setTimeout(() => {
        setClickedButton('send');
        setIsClicking(true);
        setTimeout(() => {
          setIsClicking(false);
          setMessages(mockMessages);
          setTimeout(() => setClickedButton(null), 100);
        }, 200);
      }, 1800);

      // Show onboarding tools
      setTimeout(() => {
        setOnboardingTools(['Slack', 'Notion', 'GitHub']);
      }, 2300);

      // Cursor clicks Connect All button (adjusted y position to match button center)
      setTimeout(() => {
        setCursorPos({ x: 50, y: 92 });
        setTimeout(() => {
          setClickedButton('connect');
          setIsClicking(true);
          setTimeout(() => {
            setIsClicking(false);
            setTimeout(() => setClickedButton(null), 100);
          }, 200);
        }, 300);
      }, 2700);

      // Tools connect in sequence
      setTimeout(() => setCompletedTools(['Slack']), 3100);
      setTimeout(() => setCompletedTools(['Slack', 'Notion']), 3400);
      setTimeout(() => setCompletedTools(['Slack', 'Notion', 'GitHub']), 3700);
    }
  }, [currentScene]);

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      {/* Mac Window Frame - Reduced Size */}
      <div className="relative bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Mac Title Bar */}
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs font-medium text-gray-600">
              {currentScene === 0 && 'AI Forms Creation'}
              {currentScene === 1 && 'Smart Applicant Sorting'}
              {currentScene === 2 && 'Messaging & Onboarding'}
            </span>
          </div>
        </div>

        {/* Window Content - Reduced Height and Padding */}
        <div className="relative bg-white min-h-[380px] p-5 overflow-hidden">
          <AnimatePresence mode="wait">
            {currentScene === 0 && <Scene1MultipleForms key="scene1" formsPublished={formsPublished} clickedButton={clickedButton} />}
            {currentScene === 1 && <Scene2SmartSorting key="scene2" applicants={applicants} sortedForms={sortedForms} clickedButton={clickedButton} />}
            {currentScene === 2 && <Scene3MessagingOnboarding key="scene3" messages={messages} showTyping={showTyping} onboardingTools={onboardingTools} completedTools={completedTools} clickedButton={clickedButton} />}
          </AnimatePresence>

          {/* Animated Cursor - positioned above everything */}
          <motion.div
            className="absolute pointer-events-none z-50"
            animate={{
              left: `${cursorPos.x}%`,
              top: `${cursorPos.y}%`,
              scale: isClicking ? 0.85 : 1,
              rotate: isClicking ? -5 : 0
            }}
            transition={{
              left: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
              top: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
              scale: { duration: 0.12, ease: 'easeOut' },
              rotate: { duration: 0.12, ease: 'easeOut' }
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 3L19 12L12 13L9 21L5 3Z"
                fill="#1F2937"
                stroke="#111827"
                strokeWidth="1.5"
              />
            </svg>
          </motion.div>
        </div>
      </div>

      {/* Scene Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentScene === index ? 'w-8 bg-blue-600' : 'w-1.5 bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Scene 1: AI Creates Multiple Forms
function Scene1MultipleForms({ formsPublished, clickedButton }: { formsPublished: number[]; clickedButton: string | null }) {
  const [showAI, setShowAI] = useState(false);
  
  const forms = [
    { id: 1, title: 'Marketing Intern', fields: 4 },
    { id: 2, title: 'Developer Intern', fields: 5 },
    { id: 3, title: 'Design Intern', fields: 4 }
  ];

  useEffect(() => {
    setTimeout(() => setShowAI(true), 100);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">AI Creates Multiple Forms</h3>
          <p className="text-xs text-gray-600">Building application forms simultaneously</p>
        </div>
        {showAI && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2 py-1 bg-purple-50 border border-purple-200 rounded-full"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full"
            />
            <span className="text-xs font-semibold text-purple-700">AI Processing</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {forms.map((form, index) => (
          <motion.div
            key={form.id}
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: index * 0.15, duration: 0.3, ease: 'easeOut' }}
            className="bg-gray-50 border border-gray-200 rounded-lg p-3"
          >
            <h4 className="font-semibold text-gray-900 text-xs mb-2">{form.title}</h4>
            
            {/* Form fields animation - snappier */}
            <div className="space-y-1.5 mb-3">
              {[...Array(form.fields)].map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: '100%' }}
                  transition={{ 
                    delay: index * 0.15 + idx * 0.1, 
                    duration: 0.25,
                    ease: 'easeOut'
                  }}
                  className="h-1.5 bg-blue-200 rounded"
                />
              ))}
            </div>

            {/* Create & Publish Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1,
                y: 0,
                scale: clickedButton === `form-${form.id}` ? 0.92 : 1,
                backgroundColor: formsPublished.includes(form.id) ? '#10b981' : '#2563eb'
              }}
              transition={{ 
                scale: { duration: 0.15 },
                backgroundColor: { duration: 0.2 }
              }}
              className="w-full px-2 py-1.5 text-white text-xs rounded font-semibold shadow-sm"
            >
              {formsPublished.includes(form.id) ? '✓ Published' : 'Create & Publish'}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Scene 2: Smart Sorting Across Forms
function Scene2SmartSorting({ applicants, sortedForms, clickedButton }: { applicants: any[]; sortedForms: any[]; clickedButton: string | null }) {
  const [showAI, setShowAI] = useState(false);
  
  const forms = [
    { id: 1, title: 'Marketing', color: 'bg-purple-50 border-purple-200' },
    { id: 2, title: 'Developer', color: 'bg-blue-50 border-blue-200' },
    { id: 3, title: 'Design', color: 'bg-pink-50 border-pink-200' }
  ];

  useEffect(() => {
    if (sortedForms.length > 0) {
      setShowAI(true);
      setTimeout(() => setShowAI(false), 1000);
    }
  }, [sortedForms]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">AI Sorts Applicants</h3>
            <p className="text-xs text-gray-600">Matching candidates to optimal roles</p>
          </div>
          {showAI && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 rounded-full"
            >
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="text-xs"
              >
                ✨
              </motion.span>
              <span className="text-xs font-semibold text-green-700">AI Matching</span>
            </motion.div>
          )}
        </div>
        <motion.button
          animate={{
            scale: clickedButton === 'sort' ? 0.92 : 1
          }}
          transition={{ duration: 0.15 }}
          className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg font-semibold shadow-sm"
        >
          Make Optimal Assignments
        </motion.button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {forms.map((form, formIndex) => {
          const matchedApplicants = sortedForms.length > 0 
            ? applicants.filter(a => a.formId === form.id)
            : applicants.filter(a => a.formId === form.id).slice(0, 1);

          return (
            <motion.div 
              key={form.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: formIndex * 0.1, duration: 0.25 }}
              className={`${form.color} border rounded-lg p-2.5 min-h-[220px]`}
            >
              <h4 className="font-semibold text-gray-900 text-xs mb-2">{form.title}</h4>
              
              <div className="space-y-1.5">
                <AnimatePresence mode="popLayout">
                  {matchedApplicants.map((applicant, index) => (
                    <motion.div
                      key={applicant.id}
                      layout
                      initial={{ opacity: 0, x: -15, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 15, scale: 0.9 }}
                      transition={{
                        layout: { duration: 0.4, ease: 'easeInOut' },
                        opacity: { duration: 0.25 },
                        scale: { duration: 0.25 },
                        delay: sortedForms.length > 0 ? index * 0.15 : 0
                      }}
                      className="bg-white border border-gray-200 rounded p-2"
                    >
                      <h5 className="font-semibold text-gray-900 text-xs mb-0.5">{applicant.name}</h5>
                      <div className="space-y-0.5">
                        {applicant.highlights.map((highlight: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-1 text-xs text-gray-600">
                            <span className="text-blue-600 mt-0.5 text-xs">•</span>
                            <span className="text-xs">{highlight}</span>
                          </div>
                        ))}
                      </div>
                      <span className="inline-block mt-1.5 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {applicant.matchScore}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Scene 3: Messaging & Onboarding
function Scene3MessagingOnboarding({ messages, showTyping, onboardingTools, completedTools, clickedButton }: { messages: any[]; showTyping: boolean; onboardingTools: string[]; completedTools: string[]; clickedButton: string | null }) {
  const [showAISuggestion, setShowAISuggestion] = useState(false);

  useEffect(() => {
    if (messages.length === 1) {
      setTimeout(() => setShowAISuggestion(true), 200);
      setTimeout(() => setShowAISuggestion(false), 1200);
    }
  }, [messages]);

  // Tool logos styled to look like actual logos
  const toolLogos: Record<string, { bg: string; text: string; icon: string }> = {
    'Slack': { bg: 'bg-purple-600', text: 'text-white', icon: '#' },
    'Notion': { bg: 'bg-white border-2 border-gray-800', text: 'text-gray-900', icon: 'N' },
    'GitHub': { bg: 'bg-gray-900', text: 'text-white', icon: '</>' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="h-full flex flex-col"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Message & Onboard</h3>
          <p className="text-xs text-gray-600">Interview and connect to tools</p>
        </div>
        {showAISuggestion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 rounded-full"
          >
            <span className="text-xs font-semibold text-blue-700">AI Generated</span>
          </motion.div>
        )}
      </div>

      {/* Messaging Section */}
      <div className="flex-1 bg-gray-50 rounded-lg p-3 mb-3 min-h-[160px]">
        <div className="space-y-1.5">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: message.sender === 'company' ? 20 : -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className={`flex ${message.sender === 'company' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-2.5 py-1.5 rounded-lg text-xs ${
                    message.sender === 'company'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {showTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div className="bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                <div className="flex gap-0.5">
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="w-1 h-1 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="w-1 h-1 bg-gray-400 rounded-full"
                  />
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="w-1 h-1 bg-gray-400 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex gap-2 mt-2">
          <input
            type="text"
            placeholder="Type message..."
            className="flex-1 px-2.5 py-1 border border-gray-300 rounded-lg text-xs"
            readOnly
          />
          <motion.button
            animate={{
              scale: clickedButton === 'send' ? 0.92 : 1
            }}
            transition={{ duration: 0.15 }}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg font-semibold"
          >
            Send
          </motion.button>
        </div>
      </div>

      {/* Onboarding Tools Section */}
      {onboardingTools.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="border-t border-gray-200 pt-3"
        >
          <h4 className="text-xs font-semibold text-gray-900 mb-2">Connect to Tools</h4>
          <div className="flex gap-2">
            {onboardingTools.map((tool, index) => {
              const logo = toolLogos[tool];
              return (
                <motion.div
                  key={tool}
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ 
                    opacity: completedTools.includes(tool) ? 0.5 : 1,
                    y: 0,
                    scale: completedTools.includes(tool) ? 0.88 : 1
                  }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index * 0.1,
                    ease: 'easeOut'
                  }}
                  className="flex-1"
                >
                  <div className={`p-2 rounded-lg border-2 text-center ${
                    completedTools.includes(tool)
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-200 bg-white shadow-sm'
                  }`}>
                    <div className={`w-8 h-8 mx-auto mb-1.5 rounded-lg ${logo.bg} ${logo.text} flex items-center justify-center font-bold text-xs`}>
                      {logo.icon}
                    </div>
                    <div className="text-xs font-medium text-gray-700">{tool}</div>
                    {completedTools.includes(tool) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-xs text-green-600 mt-1 font-semibold"
                      >
                        ✓ Connected
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {!completedTools.includes(onboardingTools[onboardingTools.length - 1]) && (
            <motion.button
              animate={{
                scale: clickedButton === 'connect' ? 0.92 : 1
              }}
              transition={{ duration: 0.15 }}
              className="w-full mt-2 px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg font-semibold shadow-sm"
            >
              Connect All Tools
            </motion.button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}