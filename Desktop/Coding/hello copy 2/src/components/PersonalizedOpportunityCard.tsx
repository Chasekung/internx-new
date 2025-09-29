'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  StarIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface Internship {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  requirements: string[] | null;
  duration: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  company_name: string;
  for_profit: 'for-profit' | 'non-profit';
  category: string;
  position: string;
  address: string;
  city: string;
  state: string;
  hours_per_week: number | null;
  pay: number | null;
  business_email: string;
}

interface PersonalizedScore {
  match_score: number;
  match_level: 'high' | 'moderate' | 'low';
  factors_analysis: {
    base_interview_score: number;
    category_alignment: number;
    skill_match: number;
    experience_relevance: number;
    personality_fit: number;
    career_interest_match: number;
  };
}

interface PersonalizedOpportunityCardProps {
  internship: Internship;
  onClick: () => void;
  showPersonalization: boolean;
}

export default function PersonalizedOpportunityCard({ 
  internship, 
  onClick, 
  showPersonalization 
}: PersonalizedOpportunityCardProps) {
  const [personalizedScore, setPersonalizedScore] = useState<PersonalizedScore | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showPersonalization) {
      fetchPersonalizedScore();
    }
  }, [showPersonalization, internship.id]);

  const fetchPersonalizedScore = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/interview/personalized-scores`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // For now, we'll simulate the score since we need to implement the endpoint that returns specific scores
        // In a real implementation, you'd have an endpoint that returns the score for a specific internship
        const mockScore: PersonalizedScore = {
          match_score: Math.floor(Math.random() * 40) + 60, // 60-100
          match_level: Math.random() > 0.5 ? 'high' : 'moderate',
          factors_analysis: {
            base_interview_score: 75,
            category_alignment: 10,
            skill_match: 80,
            experience_relevance: 70,
            personality_fit: 85,
            career_interest_match: 15
          }
        };
        setPersonalizedScore(mockScore);
      }
    } catch (error) {
      console.error('Error fetching personalized score:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMatchLevelColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getMatchIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <ArrowTrendingUpIcon className="h-4 w-4" />;
      case 'moderate':
        return <StarIcon className="h-4 w-4" />;
      case 'low':
        return <ArrowTrendingDownIcon className="h-4 w-4" />;
      default:
        return <StarIcon className="h-4 w-4" />;
    }
  };

  const renderMatchScore = () => {
    if (!showPersonalization || !personalizedScore) return null;

    return (
      <div className="absolute top-4 right-4">
        <div className={`flex items-center px-3 py-2 rounded-full text-sm font-medium ${getMatchLevelColor(personalizedScore.match_level)}`}>
          {getMatchIcon(personalizedScore.match_level)}
          <span className="ml-1 capitalize">{personalizedScore.match_level} Match</span>
        </div>
        
        <div className="mt-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-sm">
          <div className="flex items-center justify-center space-x-1">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIconSolid
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.ceil(personalizedScore.match_score / 20)
                      ? 'text-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium text-gray-700">
              {personalizedScore.match_score}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 border border-gray-100"
      onClick={onClick}
    >
      {renderMatchScore()}
      
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start pr-16">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{internship.company_name}</h3>
            <p className="text-blue-600 font-medium">{internship.position}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {internship.for_profit === 'for-profit' ? 'For-Profit' : 'Non-Profit'}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              Category
            </div>
            <p className="text-gray-900 font-medium">{internship.category}</p>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <MapPinIcon className="h-4 w-4 mr-1" />
              Location
            </div>
            {internship.address ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${internship.address}, ${internship.city}, ${internship.state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {internship.city}, {internship.state}
              </a>
            ) : (
              <p className="text-gray-900 font-medium">{internship.city}, {internship.state}</p>
            )}
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <ClockIcon className="h-4 w-4 mr-1" />
              Hours/Week
            </div>
            <p className="text-gray-900 font-medium">{internship.hours_per_week || 'N/A'}</p>
          </div>
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              Pay
            </div>
            <p className="text-gray-900 font-medium">{internship.pay ? `$${internship.pay}/hr` : 'N/A'}</p>
          </div>
        </div>
        
        {showPersonalization && personalizedScore && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Match Factors:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">Skills:</span>
                <span className="font-medium">{personalizedScore.factors_analysis.skill_match}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="font-medium">{personalizedScore.factors_analysis.experience_relevance}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Personality:</span>
                <span className="font-medium">{personalizedScore.factors_analysis.personality_fit}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest:</span>
                <span className="font-medium">
                  {personalizedScore.factors_analysis.career_interest_match > 0 ? 'High' : 'Medium'}
                </span>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-2">
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>Contact</span>
          </div>
          <p className="text-gray-900 text-sm">{internship.business_email}</p>
        </div>
      </div>
    </motion.div>
  );
} 