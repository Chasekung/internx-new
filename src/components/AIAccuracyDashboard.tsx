'use client';

import React, { useState, useEffect } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  StarIcon,
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface AccuracyMetrics {
  period: string;
  overall: {
    totalValidations: number;
    accuratePredictions: number;
    accuracy: number;
    averageDifference: number;
  };
  categoryAccuracy: Record<string, {
    total: number;
    accurate: number;
    accuracy: number;
    averageDifference: number;
  }>;
  scoreTypeAccuracy: Record<string, {
    total: number;
    accurate: number;
    accuracy: number;
  }>;
  trendData: Array<{
    date: string;
    accuracy: number;
    totalValidations: number;
    averageDifference: number;
  }>;
  feedbackStats: {
    total: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
  } | null;
}

interface ValidationRecord {
  id: string;
  intern_id: string;
  ai_score: number;
  human_score: number | null;
  category: string;
  score_type: string;
  confidence_difference: number | null;
  accuracy_rating: number | null;
  feedback_notes: string | null;
  created_at: string;
  intern: { full_name: string; email: string };
  validator: { email: string } | null;
}

export default function AIAccuracyDashboard() {
  const { supabase } = useSupabase();
  const [metrics, setMetrics] = useState<AccuracyMetrics | null>(null);
  const [validations, setValidations] = useState<ValidationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showValidationForm, setShowValidationForm] = useState(false);
  const [selectedValidation, setSelectedValidation] = useState<ValidationRecord | null>(null);

  useEffect(() => {
    fetchMetrics();
    fetchValidations();
  }, [period, selectedCategory]);

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_accuracy_metrics')
        .select('*')
        .gte('metric_date', new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('metric_date', { ascending: true });

      if (error) throw error;

      // For now, we'll use the API endpoint when it's ready
      // This is a placeholder for the metrics calculation
      const response = await fetch(`/api/ai-accuracy/metrics?period=${period}`);
      if (response.ok) {
        const result = await response.json();
        setMetrics(result.metrics);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  const fetchValidations = async () => {
    try {
      let query = supabase
        .from('ai_accuracy_validation')
        .select(`
          *,
          intern:interns(full_name, email),
          validator:auth.users(email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;

      setValidations(data || []);
    } catch (error) {
      console.error('Error fetching validations:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitValidation = async (validationData: any) => {
    try {
      const { error } = await supabase
        .from('ai_accuracy_validation')
        .insert(validationData);

      if (error) throw error;

      setShowValidationForm(false);
      setSelectedValidation(null);
      fetchValidations();
      fetchMetrics();
    } catch (error) {
      console.error('Error submitting validation:', error);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 80) return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    if (accuracy >= 60) return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    return <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Accuracy Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Monitor and improve the accuracy of our AI interview scoring system
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5 text-gray-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-5 w-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Categories</option>
            <option value="business_finance">Business & Finance</option>
            <option value="technology_engineering">Technology & Engineering</option>
            <option value="education_nonprofit">Education & Non-Profit</option>
            <option value="healthcare_sciences">Healthcare & Sciences</option>
            <option value="creative_media">Creative & Media</option>
          </select>
        </div>

        <button
          onClick={() => setShowValidationForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Validation
        </button>
      </div>

      {/* Overall Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overall Accuracy</p>
                <p className={`text-2xl font-bold ${getAccuracyColor(metrics.overall.accuracy)}`}>
                  {metrics.overall.accuracy}%
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                {metrics.overall.accuratePredictions} of {metrics.overall.totalValidations} predictions accurate
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Difference</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.overall.averageDifference}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Points difference between AI and human scores
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <StarIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">User Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.feedbackStats?.averageRating || 0}/5
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Average feedback rating from users
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Validations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {metrics.overall.totalValidations}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Human-validated AI predictions
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Category Accuracy */}
      {metrics && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Category Performance</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(metrics.categoryAccuracy).map(([category, stats]) => (
                <div key={category} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    {getAccuracyIcon(stats.accuracy)}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {stats.accuracy}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {stats.accurate} of {stats.total} accurate
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Avg diff: {stats.averageDifference} points
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Validations */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Validations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Intern
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Human Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Difference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Accuracy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {validations.map((validation) => (
                <tr key={validation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {validation.intern?.full_name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {validation.intern?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {validation.category?.replace('_', ' ') || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {validation.ai_score}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {validation.human_score || 'Not rated'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {validation.confidence_difference ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        validation.confidence_difference <= 10 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {validation.confidence_difference}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {validation.accuracy_rating ? (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`h-4 w-4 ${
                              i < validation.accuracy_rating! 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Not rated</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(validation.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Validation Form Modal */}
      {showValidationForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add AI Validation</h3>
              <ValidationForm
                onSubmit={submitValidation}
                onCancel={() => setShowValidationForm(false)}
                validation={selectedValidation}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Validation Form Component
function ValidationForm({ 
  onSubmit, 
  onCancel, 
  validation 
}: { 
  onSubmit: (data: any) => void; 
  onCancel: () => void; 
  validation: ValidationRecord | null; 
}) {
  const [formData, setFormData] = useState({
    intern_id: validation?.intern_id || '',
    ai_score: validation?.ai_score || 0,
    human_score: validation?.human_score || '',
    category: validation?.category || '',
    score_type: validation?.score_type || '',
    accuracy_rating: validation?.accuracy_rating || 5,
    feedback_notes: validation?.feedback_notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Intern ID</label>
        <input
          type="text"
          value={formData.intern_id}
          onChange={(e) => setFormData({ ...formData, intern_id: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">AI Score</label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.ai_score}
          onChange={(e) => setFormData({ ...formData, ai_score: parseInt(e.target.value) })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Human Score (Optional)</label>
        <input
          type="number"
          min="0"
          max="100"
          value={formData.human_score}
          onChange={(e) => setFormData({ ...formData, human_score: e.target.value ? parseInt(e.target.value) : null })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Select Category</option>
          <option value="business_finance">Business & Finance</option>
          <option value="technology_engineering">Technology & Engineering</option>
          <option value="education_nonprofit">Education & Non-Profit</option>
          <option value="healthcare_sciences">Healthcare & Sciences</option>
          <option value="creative_media">Creative & Media</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Score Type</label>
        <select
          value={formData.score_type}
          onChange={(e) => setFormData({ ...formData, score_type: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="">Select Score Type</option>
          <option value="skill">Skill</option>
          <option value="experience">Experience</option>
          <option value="personality">Personality</option>
          <option value="overall">Overall</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Accuracy Rating</label>
        <div className="flex items-center space-x-2 mt-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setFormData({ ...formData, accuracy_rating: rating })}
              className={`p-1 rounded ${
                formData.accuracy_rating >= rating 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            >
              <StarIcon className="h-6 w-6 fill-current" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Feedback Notes</label>
        <textarea
          value={formData.feedback_notes}
          onChange={(e) => setFormData({ ...formData, feedback_notes: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Submit
        </button>
      </div>
    </form>
  );
} 