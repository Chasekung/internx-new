'use client';

import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

interface Rating {
  stars: number;
  count: number;
}

interface Review {
  stars: number;
  text?: string;
  date: string;
  field: string;
}

const INTERNSHIP_FIELDS = [
  'All Fields',
  'Software Engineering',
  'Data Science',
  'Product Management',
  'UX/UI Design',
  'Marketing',
  'Finance',
  'Business Development',
  'Research',
  'Consulting',
  'Other'
];

const DATE_FILTERS = [
  'Recent Reviews',
  'All Dates',
  'Last Week',
  'Last Month',
  'Last 3 Months',
  'Last Year'
];

const RATING_FILTERS = [
  'All Ratings',
  '5 Stars',
  '4 Stars',
  '3 Stars',
  '2 Stars',
  '1 Star'
];

interface RatingChartProps {
  fields?: string[];
  storageKey?: string;
  reviewType?: 'user' | 'company';
}

export default function RatingChart({ 
  fields = INTERNSHIP_FIELDS,
  storageKey = 'studentRatings',
  reviewType = 'user'
}: RatingChartProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [dateFilter, setDateFilter] = useState('Recent Reviews');
  const [ratingFilter, setRatingFilter] = useState('All Ratings');
  const [fieldFilter, setFieldFilter] = useState('All Fields');
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 6;

  useEffect(() => {
    // Load ratings and reviews from localStorage on component mount
    const storedRatings = localStorage.getItem(storageKey);
    const storedHasRated = localStorage.getItem(`${storageKey}HasRated`);
    const storedReviews = localStorage.getItem(`${storageKey}Reviews`);
    const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (storedRatings) {
      const parsedRatings = JSON.parse(storedRatings);
      setRatings(parsedRatings);
      calculateStats(parsedRatings);
    }
    if (storedHasRated) {
      setHasRated(JSON.parse(storedHasRated));
    }
    if (storedReviews) {
      setReviews(JSON.parse(storedReviews));
    }
    if (storedIsLoggedIn) {
      setIsLoggedIn(JSON.parse(storedIsLoggedIn));
    }
  }, [storageKey]);

  const clearRatings = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}HasRated`);
    localStorage.removeItem(`${storageKey}Reviews`);
    setRatings([]);
    setReviews([]);
    setTotalReviews(0);
    setAverageRating(0);
    setSelectedRating(0);
    setHasRated(false);
    setReviewText('');
    setShowReviewForm(false);
    setSelectedField('');
  };

  const calculateStats = (ratings: Rating[]) => {
    let total = 0;
    let sum = 0;
    ratings.forEach(rating => {
      total += rating.count;
      sum += rating.stars * rating.count;
    });
    setTotalReviews(total);
    setAverageRating(total > 0 ? sum / total : 0);
  };

  const handleSubmit = () => {
    if (selectedRating === 0 || !selectedField) return;
    
    const newReview: Review = {
      stars: selectedRating,
      text: reviewText.trim() || undefined,
      date: new Date().toISOString(),
      field: selectedField
    };

    const newReviews = [...reviews, newReview];
    setReviews(newReviews);
    localStorage.setItem(`${storageKey}Reviews`, JSON.stringify(newReviews));

    const newRatings = [...ratings];
    const existingRating = newRatings.find(r => r.stars === selectedRating);
    
    if (existingRating) {
      existingRating.count += 1;
    } else {
      newRatings.push({ stars: selectedRating, count: 1 });
    }

    newRatings.sort((a, b) => b.stars - a.stars);
    
    setRatings(newRatings);
    calculateStats(newRatings);
    localStorage.setItem(storageKey, JSON.stringify(newRatings));
    localStorage.setItem(`${storageKey}HasRated`, JSON.stringify(true));
    
    setHasRated(true);
    setReviewText('');
    setShowReviewForm(false);
    setSelectedField('');
  };

  const maxCount = Math.max(...ratings.map(r => r.count), 0);

  const filteredReviews = reviews.filter(review => {
    // Filter by rating
    if (ratingFilter !== 'All Ratings') {
      const rating = parseInt(ratingFilter);
      if (review.stars !== rating) return false;
    }

    // Filter by field
    if (fieldFilter !== 'All Fields' && review.field !== fieldFilter) {
      return false;
    }

    // Filter by date
    const reviewDate = new Date(review.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - reviewDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    switch (dateFilter) {
      case 'Last Week':
        return diffDays <= 7;
      case 'Last Month':
        return diffDays <= 30;
      case 'Last 3 Months':
        return diffDays <= 90;
      case 'Last Year':
        return diffDays <= 365;
      case 'All Dates':
        return true;
      case 'Recent Reviews':
      default:
        return true;
    }
  });

  // Sort by date for Recent Reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (dateFilter === 'Recent Reviews') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const currentReviews = sortedReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', JSON.stringify(true));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('isLoggedIn', JSON.stringify(false));
  };

  return (
    <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {reviewType === 'company' ? 'Company Reviews' : 'Student Reviews'}
        </h2>
        {totalReviews > 0 ? (
          <div className="flex items-center">
            <span className="text-4xl font-bold text-gray-900 mr-2">{averageRating.toFixed(1)}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`w-6 h-6 ${i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">({totalReviews} reviews)</span>
            {isLoggedIn && (
              <button
                onClick={clearRatings}
                className="ml-4 text-sm text-red-600 hover:text-red-800"
              >
                Clear Ratings
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center text-gray-600">
            <StarIcon className="w-6 h-6 mr-2" />
            <span>Be the first to review!</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {[...Array(5)].map((_, i) => {
          const starRating = 5 - i;
          const rating = ratings.find(r => r.stars === starRating);
          const count = rating?.count || 0;
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <div key={starRating} className="flex items-center">
              <span className="w-12 text-sm text-gray-600">{starRating} stars</span>
              <div className="flex-1 h-4 mx-4 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-sm text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>

      {!hasRated && (
        <div className="mt-8">
          {isLoggedIn ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {reviewType === 'company' ? 'Rate your experience as a company' : 'Rate your experience as a student'}
                </h3>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Log Out
                </button>
              </div>
              <div 
                className="flex space-x-2"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  const isHovered = starValue <= hoverRating;
                  const isSelected = starValue <= selectedRating;
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedRating(starValue)}
                      onMouseEnter={() => setHoverRating(starValue)}
                      className="p-2 transition-colors"
                    >
                      <StarIcon 
                        className={`w-8 h-8 ${
                          isHovered || isSelected ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {selectedRating > 0 && (
                <div className="mt-6">
                  <div className="mb-4">
                    <label htmlFor="field" className="block text-sm font-medium text-gray-700 mb-1">
                      Internship Field *
                    </label>
                    <select
                      id="field"
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                      required
                    >
                      <option value="" className="text-gray-500">Select a field</option>
                      {fields.filter(field => field !== 'All Fields').map((field) => (
                        <option key={field} value={field} className="text-gray-900">
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="text-sm text-blue-600 hover:text-blue-800 mb-4"
                  >
                    {showReviewForm ? 'Hide review form' : 'Add a written review (optional)'}
                  </button>

                  {showReviewForm && (
                    <div className="space-y-4">
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your experience (optional)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                        rows={4}
                      />
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={!selectedField}
                    className={`mt-4 px-6 py-2 rounded-lg transition-colors ${
                      selectedField
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Submit Review
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {reviewType === 'company' ? 'Want to leave a company review?' : 'Want to leave a student review?'}
              </h3>
              <p className="text-gray-600 mb-4">
                You need to be a member to share your experience. Join our community to contribute your review!
              </p>
              <div className="space-x-4">
                <button
                  onClick={handleLogin}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Log In
                </button>
                <Link 
                  href="/signup"
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Reviews</h3>
            <div className="flex items-center space-x-4">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                {DATE_FILTERS.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>

              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                {RATING_FILTERS.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>

              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                {fields.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>

              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {currentReviews.map((review, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-5 h-5 ${i < review.stars ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="font-medium">Field:</span>
                  <span className="ml-2">{review.field}</span>
                </div>
                {review.text && (
                  <p className="text-gray-900 mt-2">{review.text}</p>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 mx-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 mx-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 