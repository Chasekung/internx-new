'use client';

import { motion, VariantLabels } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MapPinIcon, GlobeAltIcon, PhoneIcon, BuildingOfficeIcon, BriefcaseIcon, EnvelopeIcon, ClockIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import supabase from '@/lib/supabaseClient';

interface CompanyLocation {
  address: string;
  city: string;
  state: string;
  is_headquarters: boolean;
}

interface Company {
  id: string;
  company_name: string;
  media_url?: string;
  company_logo?: string;
  phone?: string;
  website?: string;
  company_size?: string;
  industry?: string;
  description?: string;
  address_1?: string;
  city_1?: string;
  state_1?: string;
  is_headquarters_1?: boolean;
  address_2?: string;
  city_2?: string;
  state_2?: string;
  is_headquarters_2?: boolean;
  address_3?: string;
  city_3?: string;
  state_3?: string;
  is_headquarters_3?: boolean;
  address_4?: string;
  city_4?: string;
  state_4?: string;
  is_headquarters_4?: boolean;
  address_5?: string;
  city_5?: string;
  state_5?: string;
  is_headquarters_5?: boolean;
  address_6?: string;
  city_6?: string;
  state_6?: string;
  is_headquarters_6?: boolean;
  address_7?: string;
  city_7?: string;
  state_7?: string;
  is_headquarters_7?: boolean;
  address_8?: string;
  city_8?: string;
  state_8?: string;
  is_headquarters_8?: boolean;
  address_9?: string;
  city_9?: string;
  state_9?: string;
  is_headquarters_9?: boolean;
  address_10?: string;
  city_10?: string;
  state_10?: string;
  is_headquarters_10?: boolean;
}

interface Posting {
  id: string;
  position: string;
  category?: string;
  city?: string;
  state?: string;
  hours_per_week?: number;
  pay?: number;
  business_email?: string;
  for_profit?: string;
  description?: string;
  internship_picture_1?: string;
  internship_picture_2?: string;
  internship_picture_3?: string;
  internship_picture_4?: string;
  internship_picture_5?: string;
  companies: Company;
}

interface CompanyPostingContentProps {
  posting: Posting;
}

export default function CompanyPostingContent({ posting }: CompanyPostingContentProps) {
  const company = posting.companies;
  
  const locations: CompanyLocation[] = [];
  for (let i = 1; i <= 10; i++) {
    const address = company[`address_${i}` as keyof Company] as string | undefined;
    const city = company[`city_${i}` as keyof Company] as string | undefined;
    const state = company[`state_${i}` as keyof Company] as string | undefined;
    const isHq = company[`is_headquarters_${i}` as keyof Company] as boolean | undefined;
    
    if (address?.trim() || city?.trim() || state) {
      locations.push({
        address: address || '',
        city: city || '',
        state: state || '',
        is_headquarters: isHq || false
      });
    }
  }

  // Get all available images
  const images = [
    posting.internship_picture_1,
    posting.internship_picture_2,
    posting.internship_picture_3,
    posting.internship_picture_4,
    posting.internship_picture_5
  ].filter((img): img is string => Boolean(img));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl animate-blob"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.7 }}
          transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
          className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"
        />
      </div>

      {/* Decorative grid pattern */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 bg-grid-pattern"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 relative z-10">
        {/* Media Section Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Media</h1>

        {/* Images Section */}
        {images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((picture, index) => (
                  <div key={index} className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                    <Image
                      src={picture}
                      alt={`Workplace image ${index + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Company Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transform hover:scale-[1.02] transition-transform duration-300">
          <div className="flex items-center space-x-6">
            <div className="relative w-20 h-20">
              {company.company_logo ? (
                <Image
                  src={company.company_logo}
                  alt={`${company.company_name} logo`}
                  fill
                  className="rounded-2xl object-cover ring-2 ring-indigo-100"
                  sizes="(max-width: 640px) 80px, 80px"
                />
              ) : (
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {company.company_name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{company.company_name}</h1>
              <p className="text-lg text-indigo-600 font-medium">{posting.position}</p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <PhoneIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                <span className="text-gray-900">{company.phone || 'Not provided'}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <GlobeAltIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Website</p>
                {company.website ? (
                  <Link 
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    className="text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    {company.website.replace(/^https?:\/\//, '')}
                  </Link>
                ) : (
                  <span className="text-gray-900">Not provided</span>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Company Size</p>
                <span className="text-gray-900">{company.company_size ? `${company.company_size} employees` : 'Size not specified'}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Industry</p>
                <span className="text-gray-900">{company.industry || 'Industry not specified'}</span>
              </div>
            </div>
            
            <div className="col-span-full">
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2 mr-3">
                    <MapPinIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Company Locations</h3>
                </div>
                
                {locations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {locations.map((loc, index) => (
                      <div 
                        key={index}
                        className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <Link
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${loc.address}, ${loc.city}, ${loc.state}`
                              )}`}
                              target="_blank"
                              className="text-indigo-600 hover:text-indigo-700 transition-colors font-medium"
                            >
                              {loc.address}
                            </Link>
                            <p className="text-gray-600 mt-1">
                              {loc.city}, {loc.state}
                            </p>
                          </div>
                          {loc.is_headquarters && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              HQ
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No locations specified</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
            <p className="text-gray-600 whitespace-pre-wrap bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6">
              {company.description || 'No company description available.'}
            </p>
          </div>
        </div>

        {/* Internship Details */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8">Internship Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Category</p>
                <p className="text-gray-900">{posting.category || 'Not specified'}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <ClockIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Hours per Week</p>
                <p className="text-gray-900">{posting.hours_per_week ? `${posting.hours_per_week} hours` : 'Not specified'}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pay</p>
                <p className="text-gray-900">{posting.pay ? `$${posting.pay}/hr` : 'Not specified'}</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <EnvelopeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Contact Email</p>
                <p className="text-gray-900">{posting.business_email || 'Not provided'}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{posting.description || 'No position description available.'}</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, #a78bfa 1px, transparent 1px),
            linear-gradient(to bottom, #a78bfa 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
} 