'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, Fragment } from "react";
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

const CATEGORIES = [
  "Software Engineering",
  "Marketing",
  "Finance",
  "Design",
  "Operations",
  "Sales",
  "Product Management",
  "Research",
  "Education",
  "Healthcare",
  "Other"
];

const POSITIONS = [
  "Volunteer",
  "Assistant",
  "Analyst",
  "Coordinator",
  "Associate",
  "Fellow",
  "Researcher",
  "Developer",
  "Designer",
  "Other"
];

const PAY_PERIODS = ["hr", "week", "month", "year"];

const STATE_ABBREVIATIONS: { [key: string]: string } = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR", "California": "CA",
  "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN", "Iowa": "IA",
  "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO",
  "Montana": "MT", "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH",
  "Oklahoma": "OK", "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT", "Vermont": "VT",
  "Virginia": "VA", "Washington": "WA", "West Virginia": "WV", "Wisconsin": "WI", "Wyoming": "WY"
};

const COUNTRY_ABBREVIATIONS: { [key: string]: string } = {
  "United States of America": "USA",
  "Canada": "CAN",
  "United Kingdom": "UK",
  "Australia": "AUS",
  "India": "IND",
  "Germany": "DEU",
  "France": "FRA",
  "China": "CHN",
  "Japan": "JPN",
  "Other": "N/A"
};

const COUNTRIES = [
  "United States of America",
  "Canada",
  "United Kingdom",
  "Australia",
  "India",
  "Germany",
  "France",
  "China",
  "Japan",
  "Other"
];

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Wyoming"
];

const POSITIONS_BY_CATEGORY: { [key: string]: string[] } = {
  "Software Engineering": ["Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Developer", "QA Engineer", "Other"],
  "Marketing": ["Marketing Intern", "Content Creator", "Social Media Manager", "SEO Specialist", "Other"],
  "Finance": ["Finance Intern", "Analyst", "Accounting Assistant", "Bookkeeper", "Other"],
  "Design": ["Graphic Designer", "UI/UX Designer", "Product Designer", "Other"],
  "Operations": ["Operations Assistant", "Logistics Coordinator", "Project Coordinator", "Other"],
  "Sales": ["Sales Associate", "Sales Intern", "Account Manager", "Other"],
  "Product Management": ["Product Manager", "Product Analyst", "Product Owner", "Other"],
  "Research": ["Research Assistant", "Lab Assistant", "Research Fellow", "Other"],
  "Education": ["Teacher's Assistant", "Tutor", "Camp Counselor", "Other"],
  "Healthcare": ["Medical Assistant", "Healthcare Intern", "Nursing Assistant", "Other"],
  "Other": ["Volunteer", "Assistant", "Coordinator", "Other"]
};

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

export default function CompanyOpportunitiesPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const { supabase, error: supabaseError } = useSupabase();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);
  const router = useRouter();

  // Fetch internships for this company (optional, for initial load)
  useEffect(() => {
    // TODO: Replace with actual company filter if needed
    const fetchInternships = async () => {
      
      const { data, error } = await supabase.from('internships').select('*');
      if (!error && data) setInternships(data);
    };
    fetchInternships();
  }, []);

  const handleInternshipClick = (internshipId: string) => {
    // Check if user is signed in as company
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
    // Default to intern view if not signed in as company
    router.push(`/postings/${internshipId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Opportunities Available</h1>
            <p className="text-lg text-gray-500">Find your next opportunity</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">COMPANY NAME</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">FOR-PROFIT/NON-PROFIT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">CATEGORY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">POSITION</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">LOCATION</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">HRS/WEEK</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">PAY</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">BUSINESS EMAIL</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-black">
              {internships.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-400 text-lg font-medium">
                    No opportunities available at the moment.
                  </td>
                </tr>
              ) : (
                internships.map((internship, idx) => (
                  <tr 
                    key={idx}
                    onClick={() => handleInternshipClick(internship.id)}
                    className="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.company_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.for_profit === 'for-profit' ? 'For-Profit' : 'Non-Profit'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.position}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {internship.address ? (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${internship.address}, ${internship.city}, ${internship.state}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {internship.city}, {internship.state}
                        </a>
                      ) : (
                        `${internship.city}, ${internship.state}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.hours_per_week}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {internship.pay ? `$${internship.pay}/hr` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-black">{internship.business_email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}