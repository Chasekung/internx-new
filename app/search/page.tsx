'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, GraduationCap, User, Building } from 'lucide-react';
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

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/intern-get-started');
      return;
    }
    
    // Load all users by default
    loadAllUsers();
  }, [router]);

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
      setResults(data.results || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      // If search is empty, load all users
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
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = (userId: string) => {
    router.push(getProfileLink(userId));
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Expand Your Network</h1>
          <p className="text-xl text-gray-600">Connect with talented students across the country</p>
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
                placeholder="Search by name, username, school, or skills... (or leave empty to see all)"
                className="w-full pl-14 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg text-gray-900 placeholder-gray-500 shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-blue-600 text-white font-semibold py-4 px-8 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
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
                {query.trim() ? `Found ${results.length} intern${results.length !== 1 ? 's' : ''}` : `Showing ${results.length} intern${results.length !== 1 ? 's' : ''}`}
              </h2>
              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {results.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
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
                          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-100">
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
              <p className="text-gray-600">
                {query.trim() 
                  ? `No interns match your search for "${query}". Try different keywords or browse all interns.`
                  : 'No interns are currently available. Check back later!'
                }
              </p>
              {query.trim() && (
                <button
                  onClick={loadAllUsers}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Show All Interns
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );