'use client';

import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';

interface AIFeedbackWidgetProps {
  feedbackType: 'score_accuracy' | 'interview_quality' | 'recommendation_helpfulness';
  category?: string;
  onFeedbackSubmitted?: () => void;
  className?: string;
}

export default function AIFeedbackWidget({ 
  feedbackType, 
  category, 
  onFeedbackSubmitted,
  className = '' 
}: AIFeedbackWidgetProps) {
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const feedbackTypeLabels = {
    score_accuracy: 'AI Score Accuracy',
    interview_quality: 'Interview Quality',
    recommendation_helpfulness: 'Recommendation Helpfulness'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/ai-accuracy/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback_type: feedbackType,
          rating,
          feedback_text: feedbackText,
          category
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        onFeedbackSubmitted?.();
        // Reset form after a delay
        setTimeout(() => {
          setIsSubmitted(false);
          setRating(0);
          setFeedbackText('');
        }, 3000);
      } else {
        console.error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <StarIcon className="h-5 w-5 text-green-600 mr-2" />
          <p className="text-green-800 font-medium">
            Thank you for your feedback! It helps us improve our AI system.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Rate your experience: {feedbackTypeLabels[feedbackType]}
      </h4>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Star Rating */}
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`p-1 rounded transition-colors ${
                rating >= star 
                  ? 'text-yellow-400 hover:text-yellow-500' 
                  : 'text-gray-300 hover:text-gray-400'
              }`}
            >
              <StarIcon className="h-6 w-6 fill-current" />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {rating > 0 && `${rating}/5`}
          </span>
        </div>

        {/* Feedback Text */}
        <div>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Optional: Tell us more about your experience..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none"
            rows={2}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={rating === 0 || isSubmitting}
          className={`w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            rating === 0 || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-2 text-center">
        Your feedback helps us improve our AI interview system
      </p>
    </div>
  );
} 