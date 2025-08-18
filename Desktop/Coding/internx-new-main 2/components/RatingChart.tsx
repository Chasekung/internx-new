'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RatingChartProps {
  fields: string[];
  storageKey: string;
  reviewType: 'user' | 'company';
}

export default function RatingChart({ fields, storageKey, reviewType }: RatingChartProps) {
  const [selectedField, setSelectedField] = useState('All Fields');
  const [ratings, setRatings] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    // Load ratings from localStorage
    const savedRatings = localStorage.getItem(storageKey);
    if (savedRatings) {
      setRatings(JSON.parse(savedRatings));
    }
  }, [storageKey]);

  const handleFieldChange = (field: string) => {
    setSelectedField(field);
  };

  const getAverageRating = () => {
    if (selectedField === 'All Fields') {
      const allRatings = Object.values(ratings);
      return allRatings.length > 0 ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length : 0;
    }
    return ratings[selectedField] || 0;
  };

  const averageRating = getAverageRating();

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200/50">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">
          {reviewType === 'user' ? 'Student' : 'Company'} Ratings
        </h3>
        <div className="flex flex-wrap gap-2">
          {fields.map((field) => (
            <button
              key={field}
              onClick={() => handleFieldChange(field)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedField === field
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {field}
            </button>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="text-4xl font-bold text-blue-600 mb-2">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-4">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-6 h-6 ${
                i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-gray-600">
          {selectedField === 'All Fields' ? 'Overall' : selectedField} Rating
        </p>
      </div>
    </div>
  );
} 