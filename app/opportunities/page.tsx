'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BsGrid, BsList } from 'react-icons/bs';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import OpportunityCardView from '@/components/OpportunityCardView';
import OpportunityListView from '@/components/OpportunityListView';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

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

const OpportunityCard: React.FC<{ internship: Internship; onClick: () => void }> = ({ internship, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={onClick}
    >
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
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
            <p className="text-sm text-gray-500">Category</p>
            <p className="text-gray-900">{internship.category}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            {internship.address ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${internship.address}, ${internship.city}, ${internship.state}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
                onClick={(e) => e.stopPropagation()}
              >
                {internship.city}, {internship.state}
              </a>
            ) : (
              <p className="text-gray-900">{internship.city}, {internship.state}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Hours/Week</p>
            <p className="text-gray-900">{internship.hours_per_week || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pay</p>
            <p className="text-gray-900">{internship.pay ? `$${internship.pay}/hr` : 'N/A'}</p>
          </div>
        </div>
        
        <div className="mt-2">
          <p className="text-sm text-gray-500">Contact</p>
          <p className="text-gray-900">{internship.business_email}</p>
        </div>
      </div>
    </motion.div>
  );
};

const OpportunitiesPage: React.FC = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [supabase, setSupabase] = useState<any>(null);
  const router = useRouter();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);
  

  useEffect(() => {
    if (!supabase) return;
    
    const load = async () => {
      const { data, error } = await supabase.from('internships').select('*');
      if (!error && data) setInternships(data);
      else setInternships([]);
    };
    load();
    window.addEventListener('opportunitiesUpdated', load);
    return () => window.removeEventListener('opportunitiesUpdated', load);
  }, [supabase]);

  const handleInternshipClick = (internshipId: string) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role === 'COMPANY') {
          router.push(`/company/postings/${internshipId}`);
          return;
        }
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    router.push(`/postings/${internshipId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 sm:text-5xl"
          >
            Opportunities Available
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-xl text-gray-600"
          >
            Find your next opportunity
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex justify-end mb-6"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode('card')}
              className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                viewMode === 'card' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <BsGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md transition-colors duration-200 ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <BsList size={20} />
            </button>
          </div>
        </motion.div>

        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {viewMode === 'card' ? (
            <OpportunityCardView
              internships={internships}
              onInternshipClick={handleInternshipClick}
            />
          ) : (
            <OpportunityListView
              internships={internships}
              onInternshipClick={handleInternshipClick}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
