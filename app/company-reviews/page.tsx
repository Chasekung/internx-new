'use client';

import { motion } from 'framer-motion';
import RatingChart from '@/components/RatingChart';

const COMPANY_FIELDS = [
  'All Fields',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Non-Profit',
  'Other'
];

export default function CompanyReviewsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">Company Reviews</h1>
          <p className="mt-4 text-xl text-gray-600">See what companies are saying about their experience with Step Up</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-12"
        >
          <RatingChart 
            fields={COMPANY_FIELDS}
            storageKey="companyRatings"
            reviewType="company"
          />
        </motion.div>
      </div>
    </div>
  );
} 