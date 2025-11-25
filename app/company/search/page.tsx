"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, GraduationCap, User, Building, ChevronLeft, ChevronRight, Sparkles, Send, RotateCcw, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
import { checkCompanyAuth } from '@/lib/companyAuth';
import { getProfileLink } from '@/lib/linkUtils';

interface SearchResult {
  id: string;
  fullName: string;
  username: string;
  highSchool: string;
  gradeLevel: string;
  profilePhotoUrl?: string;
  bio?: string;
  location?: string;
  state?: string;
  skills?: string;
  careerInterests?: string;
  headline?: string;
}

interface MatchReason {
  reason: string;
  icon: string;
}

interface CandidateMatch extends SearchResult {
  matchReasons?: MatchReason[];
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  candidates?: CandidateMatch[];
  timestamp: number;
}

export default function CompanySearchPage() {
  const router = useRouter();
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Search state
  const [query, setQuery] = useState('');
  const [allStudents, setAllStudents] = useState<SearchResult[]>([]); // Store all students
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // AI Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelWidth, setPanelWidth] = useState(320); // Increased default width
  const [isWidthLocked, setIsWidthLocked] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [aiQuery, setAiQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAllCandidates, setShowAllCandidates] = useState<{[key: number]: boolean}>({});
  const [hasActiveAiFilter, setHasActiveAiFilter] = useState(false);
  
  const panelRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { isCompany, error } = await checkCompanyAuth();
      
      if (!isCompany) {
        console.log('Company auth failed:', error);
        router.replace('/company-sign-in');
        return;
      }
      
      setIsAuthenticated(true);
      loadAllUsers();
      loadChatHistory();
      loadPanelPreferences();
    };

    checkAuth();
  }, [router]);
  
  // Panel resize functionality
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || isWidthLocked) return;
      
      e.preventDefault(); // Prevent text selection during drag
      
      const newWidth = e.clientX;
      if (newWidth >= 280 && newWidth <= 600) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        savePanelPreferences();
        // Re-enable text selection
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };

    if (isResizing) {
      // Disable text selection during resize
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      // Ensure selection is re-enabled
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing, isWidthLocked]);

  // Load/save panel preferences
  const loadPanelPreferences = () => {
    try {
      const savedWidth = localStorage.getItem('ai_panel_width');
      const savedLock = localStorage.getItem('ai_panel_locked');
      if (savedWidth) setPanelWidth(parseInt(savedWidth));
      if (savedLock) setIsWidthLocked(savedLock === 'true');
    } catch (error) {
      console.error('Error loading panel preferences:', error);
    }
  };

  const savePanelPreferences = () => {
    try {
      localStorage.setItem('ai_panel_width', panelWidth.toString());
      localStorage.setItem('ai_panel_locked', isWidthLocked.toString());
    } catch (error) {
      console.error('Error saving panel preferences:', error);
    }
  };

  useEffect(() => {
    savePanelPreferences();
  }, [isWidthLocked]);

  // Load chat history from localStorage
  const loadChatHistory = () => {
    try {
      const saved = localStorage.getItem('ai_chat_history');
      if (saved) {
        const messages = JSON.parse(saved);
        setChatMessages(messages);
        
        // Restore last AI filter if exists
        const lastAiMessage = messages.filter((m: ChatMessage) => m.role === 'assistant').pop();
        if (lastAiMessage?.candidates && lastAiMessage.candidates.length > 0) {
          setHasActiveAiFilter(true);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  // Save chat history to localStorage
  const saveChatHistory = (messages: ChatMessage[]) => {
    try {
      localStorage.setItem('ai_chat_history', JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  // Clear chat history and reset filters
  const handleNewChat = () => {
    setChatMessages([]);
    localStorage.removeItem('ai_chat_history');
    setHasActiveAiFilter(false);
    setResults(allStudents);
    setShowAllCandidates({});
  };

  // Load all users and reset AI filter
  const loadAllUsers = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/interns/search?all=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      const students = data.results || [];
      setAllStudents(students);
      setResults(students);
      setHasActiveAiFilter(false);
    } catch (error) {
      console.error('Error loading users:', error);
      setAllStudents([]);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      loadAllUsers();
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/interns/search?q=${encodeURIComponent(query.trim())}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setHasActiveAiFilter(false);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // AI Chat Handler with cumulative filtering
  const handleAiQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || isAiLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: aiQuery.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setAiQuery('');
    setIsAiLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Get current filtered set or all students
      const currentCandidates = hasActiveAiFilter && results.length > 0 
        ? results 
        : allStudents;

      const response = await fetch('/api/companies/ai-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: userMessage.content,
          conversationHistory: chatMessages,
          currentCandidates: currentCandidates, // Send current filtered set
          isFollowUp: hasActiveAiFilter
        })
      });

      if (!response.ok) {
        throw new Error('AI search failed');
      }

      const data = await response.json();
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        candidates: data.candidates || [],
        timestamp: Date.now()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);

      // Update main results with AI-filtered candidates
      if (data.candidates && data.candidates.length > 0) {
        setResults(data.candidates);
        setHasActiveAiFilter(true);
      } else if (data.resetFilter) {
        // AI detected a "show all" request
        setResults(allStudents);
        setHasActiveAiFilter(false);
      }
    } catch (error) {
      console.error('AI query error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: Date.now()
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setChatMessages(finalMessages);
      saveChatHistory(finalMessages);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    router.push(getProfileLink(userId));
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const toggleShowMore = (index: number) => {
    setShowAllCandidates(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="relative flex">
        {/* AI ASSISTANT PANEL */}
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div
              ref={panelRef}
              initial={{ x: -panelWidth, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -panelWidth, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed left-0 top-0 h-screen bg-white border-r border-gray-200 shadow-xl z-40 flex flex-col"
              style={{ 
                paddingTop: '64px',
                width: `${panelWidth}px`
              }}
            >
              {/* Resize Handle */}
              {!isWidthLocked && (
                <div
                  ref={resizeHandleRef}
                  className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 hover:w-1.5 transition-all z-50 select-none"
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent text selection
                    setIsResizing(true);
                  }}
                  style={{ touchAction: 'none', userSelect: 'none' }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-16 bg-gray-300 rounded-l hover:bg-blue-500 transition-colors select-none"></div>
                </div>
              )}

              {/* Panel Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-black">AI Assistant</h2>
                    <p className="text-xs text-gray-600">Smart candidate search</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsWidthLocked(!isWidthLocked);
                    savePanelPreferences();
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                  title={isWidthLocked ? "Unlock width" : "Lock width"}
                >
                  {isWidthLocked ? (
                    <Lock className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Active Filter Indicator */}
              {hasActiveAiFilter && (
                <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                  <Search className="w-3 h-3 text-blue-600" />
                  <p className="text-xs text-blue-700 font-medium">
                    AI Filter Active ({results.length} candidates)
                  </p>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-2 font-medium">Ask me to find candidates!</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Try:</p>
                      <p className="italic">"Find students interested in marketing"</p>
                      <p className="italic">"Show me candidates in Bay Area"</p>
                      <p className="italic">"Filter for 11th grade or higher"</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((message, index) => (
                    <div key={index} className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`inline-block max-w-[85%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-black'
                      }`}>
                        <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      {/* Enhanced Candidate Cards with Match Reasons */}
                      {message.candidates && message.candidates.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.candidates.slice(0, showAllCandidates[index] ? undefined : 3).map((candidate) => (
                            <div
                              key={candidate.id}
                              onClick={() => handleProfileClick(candidate.id)}
                              className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                {candidate.profilePhotoUrl ? (
                                  <img
                                    src={candidate.profilePhotoUrl}
                                    alt={candidate.fullName}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                    {candidate.fullName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-black truncate">{candidate.fullName}</p>
                                  {candidate.headline && (
                                    <p className="text-xs text-gray-600 truncate">{candidate.headline}</p>
                                  )}
                                  
                                  {/* Match Reasons - Bullet Points */}
                                  {candidate.matchReasons && candidate.matchReasons.length > 0 && (
                                    <ul className="mt-2 space-y-1">
                                      {candidate.matchReasons.map((reason, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-xs text-gray-700">
                                          <span className="text-blue-600 mt-0.5">{reason.icon}</span>
                                          <span>{reason.reason}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* See More / See Less Button */}
                          {message.candidates.length > 3 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleShowMore(index);
                              }}
                              className="w-full py-2 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded transition-colors flex items-center justify-center gap-1"
                            >
                              {showAllCandidates[index] ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  See Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  See {message.candidates.length - 3} More
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isAiLoading && (
                  <div className="text-left">
                    <div className="inline-block bg-gray-100 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-xs text-gray-700">Analyzing candidates...</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <button
                  onClick={handleNewChat}
                  className="w-full mb-3 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 hover:bg-blue-50 py-2 rounded transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Start New Chat (Reset Filter)
                </button>
                <form onSubmit={handleAiQuery} className="flex gap-2">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="Ask AI to filter candidates..."
                    disabled={isAiLoading}
                    className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-black placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={isAiLoading || !aiQuery.trim()}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle Button */}
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="fixed left-0 top-20 z-50 bg-white border border-gray-200 rounded-r-lg shadow-lg p-2 hover:bg-gray-50 transition-colors"
          style={{ marginLeft: isPanelOpen ? `${panelWidth}px` : '0' }}
        >
          {isPanelOpen ? <ChevronLeft className="w-5 h-5 text-gray-600" /> : <ChevronRight className="w-5 h-5 text-gray-600" />}
        </button>

        {/* MAIN CONTENT */}
        <div 
          className="flex-1 transition-all duration-300"
          style={{ marginLeft: isPanelOpen ? `${panelWidth}px` : '0' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Find Your Next Intern</h1>
              <p className="text-xl text-gray-600">Use AI to find the perfect candidates or search manually</p>
              {hasActiveAiFilter && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    AI Filter Active • Showing {results.length} of {allStudents.length} candidates
                  </span>
                </div>
              )}
            </motion.div>

            {/* Search Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              onSubmit={handleSearch}
              className="mb-12"
            >
              <div className="relative max-w-3xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, school, skills... (or use AI assistant)"
                    className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder-gray-500 shadow-sm"
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        {query.trim() ? 'Searching...' : 'Loading...'}
                      </>
                    ) : (
                      query.trim() ? 'Search Interns' : 'Show All Interns'
                    )}
                  </button>
                  
                  {/* Show All Button - Resets AI Filter */}
                  {hasActiveAiFilter && (
                    <button
                      type="button"
                      onClick={loadAllUsers}
                      className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-2"
                    >
                      <RotateCcw className="w-5 h-5" />
                      Reset Filter
                    </button>
                  )}
                </div>
              </div>
            </motion.form>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {isLoading ? (
                <div className="text-center py-16">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-6 text-lg text-gray-600">
                    {query.trim() ? 'Searching for interns...' : 'Loading all interns...'}
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                    {hasActiveAiFilter && (
                      <span className="text-blue-600">AI Filtered: </span>
                    )}
                    {results.length} intern{results.length !== 1 ? 's' : ''}
                    {hasActiveAiFilter && allStudents.length > 0 && (
                      <span className="text-gray-500 text-lg ml-2">
                        (from {allStudents.length} total)
                      </span>
                    )}
                  </h2>
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * Math.min(index, 6) }}
                        onClick={() => handleProfileClick(result.id)}
                        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 overflow-hidden transform hover:-translate-y-1"
                      >
                        {/* Header with photo and name */}
                        <div className="p-6 border-b border-gray-100">
                          <div className="flex items-center space-x-4">
                            {result.profilePhotoUrl ? (
                              <img
                                src={result.profilePhotoUrl}
                                alt={result.fullName}
                                className="w-20 h-20 rounded-full object-cover border-4 border-gray-100"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-100">
                                {result.fullName.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-xl font-bold text-gray-900 truncate">
                                {result.fullName}
                              </h3>
                              {result.username && (
                                <p className="text-sm text-blue-600 font-medium">@{result.username}</p>
                              )}
                              {result.headline && (
                                <p className="text-sm text-gray-700 font-medium mt-1">
                                  {result.headline}
                                </p>
                              )}
                              {result.state && (
                                <div className="flex items-center mt-1 text-sm text-gray-500">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {result.state}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4">
                          {/* Education */}
                          {(result.highSchool || result.gradeLevel) && (
                            <div className="flex items-start space-x-3">
                              <GraduationCap className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {result.highSchool || 'High School Student'}
                                </p>
                                {result.gradeLevel && (
                                  <p className="text-sm text-gray-600">{result.gradeLevel}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Bio */}
                          {result.bio && (
                            <div className="flex items-start space-x-3">
                              <User className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {truncateText(result.bio, 120)}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Skills */}
                          {result.skills && (
                            <div className="flex items-start space-x-3">
                              <Building className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">Skills</p>
                                <p className="text-sm text-gray-700">
                                  {truncateText(result.skills, 100)}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Career Interests */}
                          {result.careerInterests && (
                            <div className="flex items-start space-x-3">
                              <Building className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900 mb-1">Career Interests</p>
                                <p className="text-sm text-gray-700">
                                  {truncateText(result.careerInterests, 100)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No interns found</h3>
                  <p className="text-gray-600 mb-4">
                    {query.trim() 
                      ? `No interns match your search for "${query}". Try the AI assistant or different keywords.`
                      : hasActiveAiFilter
                      ? 'No candidates match your AI filter criteria. Try adjusting your query.'
                      : 'No interns are currently available. Check back later!'
                    }
                  </p>
                  {(query.trim() || hasActiveAiFilter) && (
                    <button
                      onClick={loadAllUsers}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Show All Interns
                    </button>
                  )}
                </div>
              )}
            </motion.div>
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

        /* Ensure resize handle is always accessible */
        .cursor-col-resize {
          z-index: 100;
        }
      `}</style>
    </div>
  );
}
