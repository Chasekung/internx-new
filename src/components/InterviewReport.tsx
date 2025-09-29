'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface InterviewReportProps {
  sessionId: string;
  onClose: () => void;
}

interface Recommendation {
  category: string;
  role_title: string;
  reasoning: string;
  match_percentage: number;
  skills_needed: string[];
  growth_potential: string;
}

interface ReportData {
  html_content: string;
  student_info: {
    name: string;
    school: string;
    scores: {
      skill: number;
      experience: number;
      personality: number;
    };
    summary: string;
    completed_at: string;
  };
  recommendations: {
    top_opportunities: Recommendation[];
    skill_gaps: string[];
    development_areas: string[];
    overall_assessment: string;
  };
}

export default function InterviewReport({ sessionId, onClose }: InterviewReportProps) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateReport();
  }, [sessionId]);

  const generateReport = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/interview/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const data = await response.json();
      setReportData(data.report_data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;
    
    // Create a new window with the HTML content
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(reportData.html_content);
      newWindow.document.close();
      newWindow.print();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Generating Interview Report</h3>
            <p className="text-gray-600">Creating detailed analysis and recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Interview Report</h2>
            <div className="flex space-x-2">
              <button
                onClick={downloadPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Student Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="font-medium">Name:</span> {reportData.student_info.name}
              </div>
              <div>
                <span className="font-medium">School:</span> {reportData.student_info.school}
              </div>
              <div>
                <span className="font-medium">Interview Date:</span> {new Date(reportData.student_info.completed_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Scores */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Interview Scores</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{reportData.student_info.scores.skill}/100</div>
                <div className="text-sm text-gray-600">Skill Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{reportData.student_info.scores.experience}/100</div>
                <div className="text-sm text-gray-600">Experience Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{reportData.student_info.scores.personality}/100</div>
                <div className="text-sm text-gray-600">Personality Score</div>
              </div>
            </div>
          </div>

          {/* Interview Summary */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Interview Summary</h3>
            <p className="text-gray-700 leading-relaxed">{reportData.student_info.summary}</p>
          </div>

          {/* Recommendations */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Opportunity Recommendations</h3>
            <div className="space-y-4">
              {reportData.recommendations.top_opportunities?.map((opp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50 rounded-r-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg">{opp.role_title}</h4>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                      {opp.match_percentage}% Match
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{opp.reasoning}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Category: {opp.category}</span>
                    <span className="text-gray-600">Growth: {opp.growth_potential}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Development Areas */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Development Areas</h3>
            <ul className="list-disc list-inside space-y-1">
              {reportData.recommendations.development_areas?.map((area, index) => (
                <li key={index} className="text-gray-700">{area}</li>
              ))}
            </ul>
          </div>

          {/* Overall Assessment */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Overall Assessment</h3>
            <p className="text-gray-700 leading-relaxed">{reportData.recommendations.overall_assessment}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 