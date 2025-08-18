import React from 'react';
import { motion } from 'framer-motion';

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

interface OpportunityCardViewProps {
  internships: Internship[];
  onInternshipClick: (id: string) => void;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

const OpportunityCard: React.FC<{ 
  internship: Internship; 
  onClick: () => void;
  onDelete?: () => void;
}> = ({ internship, onClick, onDelete }) => {
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

        {onDelete && (
          <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const OpportunityCardView: React.FC<OpportunityCardViewProps> = ({ 
  internships, 
  onInternshipClick, 
  showActions = false,
  onDelete 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {internships.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <p className="text-gray-500 text-lg">No opportunities available at the moment.</p>
        </div>
      ) : (
        internships.map((internship) => (
          <OpportunityCard
            key={internship.id}
            internship={internship}
            onClick={() => onInternshipClick(internship.id)}
            onDelete={showActions && onDelete ? () => onDelete(internship.id) : undefined}
          />
        ))
      )}
    </div>
  );
};

export default OpportunityCardView; 