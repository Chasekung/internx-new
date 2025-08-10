'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { MapPinIcon, GlobeAltIcon, PhoneIcon, BuildingOfficeIcon, BriefcaseIcon, EnvelopeIcon, ClockIcon, CurrencyDollarIcon, BuildingOffice2Icon, StarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { type Posting, type CompanyLocation, getCompanyLocations } from '@/lib/postingUtils';
import AnimatedBackground from './AnimatedBackground';
import { useSupabase } from '@/hooks/useSupabase';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

interface PostingContentProps {
  posting: Posting;
}

export default function PublicPostingContent({ posting }: PostingContentProps) {
  const company = posting.companies!;
  const locations = getCompanyLocations(company);
  const [hasApplicationForm, setHasApplicationForm] = useState<boolean | null>(null);
  const [isCheckingForm, setIsCheckingForm] = useState(true);
  const { supabase, error: supabaseError } = useSupabase();

  // Initialize Supabase client when component mounts
  useEffect(() => {
    
    
  }, []);
  

  // Group locations by state
  const locationsByState = locations.reduce((acc, location) => {
    const state = location.state;
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(location);
    return acc;
  }, {} as Record<string, CompanyLocation[]>);

  // Get all available images
  const images = [
    posting.internship_picture_1,
    posting.internship_picture_2,
    posting.internship_picture_3,
    posting.internship_picture_4,
    posting.internship_picture_5
  ].filter((img): img is string => Boolean(img));

  // Check if application form exists for this internship
  useEffect(() => {
    const checkApplicationForm = async () => {
      try {
        setIsCheckingForm(true);
        
        // Check if a form exists for this internship
        const { data: form, error } = await supabase
          .from('forms')
          .select('id')
          .eq('internship_id', posting.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking for application form:', error);
          setHasApplicationForm(false);
        } else {
          setHasApplicationForm(!!form);
        }
      } catch (error) {
        console.error('Error checking for application form:', error);
        setHasApplicationForm(false);
      } finally {
        setIsCheckingForm(false);
      }
    };

    checkApplicationForm();
  }, [posting.id, supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <AnimatedBackground />

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
            <div className="lg:col-span-3 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 transform hover:scale-[1.01] transition-transform duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2 mr-3">
                  <BuildingOffice2Icon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Office Locations</h3>
              </div>
              
              {locations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(locationsByState).map(([state, stateLocations]) => (
                    <div key={state} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center mb-3">
                        <MapPinIcon className="h-5 w-5 text-indigo-500 mr-2" />
                        <span className="font-medium text-gray-800">{state}</span>
                      </div>
                      <div className="space-y-3">
                        {stateLocations.map((location, idx) => (
                          <Link
                            key={`${location.address}-${idx}`}
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${location.address}, ${location.city}, ${location.state}`
                            )}`}
                            target="_blank"
                            className="block hover:bg-indigo-50 rounded-md p-2 transition-colors"
                          >
                            <div className="flex items-start">
                              {location.is_headquarters && (
                                <div className="shrink-0 mr-2">
                                  <StarIcon className="h-5 w-5 text-indigo-500" />
                                </div>
                              )}
                              <div>
                                <div className="text-indigo-600 font-medium">
                                  {location.is_headquarters && 'Headquarters'}
                                </div>
                                <div className="text-gray-600">
                                  {location.address}
                                </div>
                                <div className="text-gray-500 text-sm">
                                  {location.city}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No office locations specified
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">About {company.company_name}</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{company.description || 'No company description available.'}</p>
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
                <span className="text-gray-900">{posting.category || 'Category not specified'}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <MapPinIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                <span className="text-gray-900">
                  {posting.city && posting.state ? `${posting.city}, ${posting.state}` : 'Location not specified'}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <ClockIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Hours per Week</p>
                <span className="text-gray-900">
                  {posting.hours_per_week ? `${posting.hours_per_week} hours` : 'Hours not specified'}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pay</p>
                <span className="text-gray-900">
                  {posting.pay ? `$${posting.pay}/hr` : 'Pay not specified'}
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 flex items-center space-x-4 transform hover:scale-[1.02] transition-transform duration-300">
              <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-lg p-2">
                <EnvelopeIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Contact Email</p>
                <span className="text-gray-900">{posting.business_email || 'Email not provided'}</span>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Position Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap mb-8">{posting.description || 'No position description available.'}</p>
            
            <div className="flex justify-center">
              {isCheckingForm ? (
                <div className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-lg bg-gray-400 text-white">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Checking Application Status...
                </div>
              ) : hasApplicationForm ? (
                <Link
                  href={`/apply?internshipId=${posting.id}`}
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
                >
                  <EnvelopeIcon className="mr-2 h-6 w-6" />
                  Apply Now
                </Link>
              ) : (
                <div className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl shadow-lg bg-yellow-500 text-white">
                  <ExclamationTriangleIcon className="mr-2 h-6 w-6" />
                  Application has not been created for this listing
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 