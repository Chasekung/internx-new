import React from 'react';

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

interface OpportunityListViewProps {
  internships: Internship[];
  onInternshipClick: (id: string) => void;
  showActions?: boolean;
  onDelete?: (id: string) => void;
}

const OpportunityListView: React.FC<OpportunityListViewProps> = ({ 
  internships, 
  onInternshipClick, 
  showActions = false,
  onDelete 
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50/50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              For-Profit/Non-Profit
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hrs/Week
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pay
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Business Email
            </th>
            {showActions && (
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white/50 divide-y divide-gray-200">
          {internships.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 9 : 8} className="px-6 py-4 text-center text-sm text-gray-500">
                No opportunities available at the moment.
              </td>
            </tr>
          ) : (
            internships.map((internship) => (
              <tr 
                key={internship.id}
                onClick={() => onInternshipClick(internship.id)}
                className="cursor-pointer hover:bg-blue-50/50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{internship.company_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {internship.for_profit === 'for-profit' ? 'For-Profit' : 'Non-Profit'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{internship.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{internship.position}</td>
                <td className="px-6 py-4 whitespace-nowrap">
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
                    <span className="text-gray-900">{internship.city}, {internship.state}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{internship.hours_per_week}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {internship.pay ? `$${internship.pay}/hr` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">{internship.business_email}</td>
                {showActions && onDelete && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(internship.id);
                      }}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OpportunityListView; 