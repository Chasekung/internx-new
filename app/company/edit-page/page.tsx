'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic';

const STATE_ABBREVIATIONS = {
  'Alabama': 'AL',
  'Alaska': 'AK',
  'Arizona': 'AZ',
  'Arkansas': 'AR',
  'California': 'CA',
  'Colorado': 'CO',
  'Connecticut': 'CT',
  'Delaware': 'DE',
  'Florida': 'FL',
  'Georgia': 'GA',
  'Hawaii': 'HI',
  'Idaho': 'ID',
  'Illinois': 'IL',
  'Indiana': 'IN',
  'Iowa': 'IA',
  'Kansas': 'KS',
  'Kentucky': 'KY',
  'Louisiana': 'LA',
  'Maine': 'ME',
  'Maryland': 'MD',
  'Massachusetts': 'MA',
  'Michigan': 'MI',
  'Minnesota': 'MN',
  'Mississippi': 'MS',
  'Missouri': 'MO',
  'Montana': 'MT',
  'Nebraska': 'NE',
  'Nevada': 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  'Ohio': 'OH',
  'Oklahoma': 'OK',
  'Oregon': 'OR',
  'Pennsylvania': 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  'Tennessee': 'TN',
  'Texas': 'TX',
  'Utah': 'UT',
  'Vermont': 'VT',
  'Virginia': 'VA',
  'Washington': 'WA',
  'West Virginia': 'WV',
  'Wisconsin': 'WI',
  'Wyoming': 'WY'
} as const;

interface CompanyData {
  companyName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  description: string;
  companyLogo?: string;
  companySize: string;
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

interface Location {
  address: string;
  city: string;
  state: string;
  is_headquarters: boolean;
}

const EditCompanyPage = () => {
  const router = useRouter();
  const [supabase, setSupabase] = useState<any>(null);

  // Initialize Supabase client when component mounts
  useEffect(() => {
    const client = createClientComponentClient();
    setSupabase(client);
  }, []);
  const [activeSection, setActiveSection] = useState('basic');
  const [companyData, setCompanyData] = useState<CompanyData>({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    industry: '',
    description: '',
    companyLogo: '',
    companySize: '',
  });
  const [locations, setLocations] = useState<Location[]>([
    { address: '', city: '', state: '', is_headquarters: false }
  ]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [companyLogo, setCompanyLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    checkSession();
  }, [router]);

  const checkSession = async () => {
    try {
      console.log('Checking session...');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Session error:', error);
        router.push('/company-sign-in');
        return;
      }

      if (!user) {
        console.log('No session found');
        router.push('/company-sign-in');
        return;
      }

      console.log('Session found, user:', user.id);
      
      fetchCompanyData();
    } catch (error) {
      console.error('Error checking session:', error);
      router.push('/company-sign-in');
    }
  };

  useEffect(() => {
    if (!companyLogo) {
      if (companyData.companyLogo) {
        setLogoPreview(companyData.companyLogo);
      } else {
        setLogoPreview(null);
      }
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(companyLogo);
  }, [companyLogo, companyData.companyLogo]);

  const fetchCompanyData = async () => {
    try {
      console.log('Fetching company data...');
      
      // Fetch company profile
      const response = await fetch('/api/companies/profile', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }

      const data = await response.json();
      console.log('Company data fetched:', data);

      if (data.company) {
        setCompanyData({
          companyName: data.company.company_name || '',
          email: data.company.email || '',
          phone: data.company.phone || '',
          website: data.company.website || '',
          industry: data.company.industry || '',
          description: data.company.description || '',
          companyLogo: data.company.logo_url || '',
          companySize: data.company.company_size || '',
        });

        // Convert database location fields to locations array
        const locationsArray: Location[] = [];
        for (let i = 1; i <= 10; i++) {
          const address = data.company[`address_${i}`];
          const city = data.company[`city_${i}`];
          const state = data.company[`state_${i}`];
          const isHeadquarters = data.company[`is_headquarters_${i}`];
          
          if (address && city && state) {
            locationsArray.push({
              address,
              city,
              state,
              is_headquarters: isHeadquarters || false
            });
          }
        }
        
        if (locationsArray.length > 0) {
          setLocations(locationsArray);
        } else {
          // Set at least one empty location if none exist
          setLocations([{ address: '', city: '', state: '', is_headquarters: false }]);
        }
      }
    } catch (error) {
      console.error('Error fetching company data:', error);
      setMessage({ type: 'error', text: 'Failed to load company data' });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Logo file size must be under 10MB' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please upload an image file' });
      return;
    }

    setCompanyLogo(file);
  };

  const uploadLogo = async (): Promise<string | undefined> => {
    if (!companyLogo) return undefined;

    try {
      const fileExt = companyLogo.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `company-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-logos')
        .upload(filePath, companyLogo);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('company-logos')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  };

  const handleLocationChange = (index: number, field: keyof Location, value: string | boolean) => {
    setLocations(prevLocations => {
      const newLocations = [...prevLocations];
      newLocations[index] = {
        ...newLocations[index],
        [field]: value
      };
      // If this location is being set as headquarters, unset others
      if (field === 'is_headquarters' && value === true) {
        newLocations.forEach((loc, i) => {
          if (i !== index) {
            loc.is_headquarters = false;
          }
        });
      }
      return newLocations;
    });
  };

  const addLocation = () => {
    if (locations.length < 10) {
      setLocations(prev => [...prev, { address: '', city: '', state: '', is_headquarters: false }]);
    } else {
      setMessage({ type: 'error', text: 'Maximum of 10 locations allowed' });
    }
  };

  const removeLocation = (index: number) => {
    setLocations(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setMessage(null);
      
      // Upload logo if changed
      let logoUrl = companyData.companyLogo;
      if (companyLogo) {
        logoUrl = await uploadLogo();
      }

      // Convert locations array to database fields
      const locationFields: any = {};
      locations.forEach((location, index) => {
        const i = index + 1;
        if (location.address && location.city && location.state) {
          locationFields[`address_${i}`] = location.address;
          locationFields[`city_${i}`] = location.city;
          locationFields[`state_${i}`] = location.state;
          locationFields[`is_headquarters_${i}`] = location.is_headquarters;
        }
      });

      // Prepare company data
      const companyUpdateData = {
        company_name: companyData.companyName,
        email: companyData.email,
        phone: companyData.phone,
        website: companyData.website,
        industry: companyData.industry,
        description: companyData.description,
        logo_url: logoUrl,
        company_size: companyData.companySize,
        ...locationFields
      };

      // Save company data
      const response = await fetch('/api/companies/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyUpdateData)
      });

      if (!response.ok) {
        throw new Error('Failed to save company data');
      }

      setMessage({ type: 'success', text: 'Company profile updated successfully!' });
      
      // Update local state
      setCompanyData(prev => ({
        ...prev,
        companyLogo: logoUrl || prev.companyLogo
      }));
      
      setCompanyLogo(null);
    } catch (error) {
      console.error('Error saving company data:', error);
      setMessage({ type: 'error', text: 'Failed to save company data' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
          <div className="p-6 bg-white border-b border-gray-200">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Edit Company Profile</h1>
            
            {message && (
              <div className={`mb-4 p-4 rounded-md ${
                message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message.text}
              </div>
            )}

            {/* Company Logo Section */}
            <div className="mb-8">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Company Logo</h2>
              <div className="flex items-start space-x-6">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-gray-100">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Company logo preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 128px, 128px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">No logo</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Logo
                    <span className="text-xs text-gray-500 ml-2">(Max 10MB)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="mt-1 block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-medium
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Upload a high-quality image of your company logo. Square images work best.
                  </p>
                </div>
              </div>
            </div>

            {/* Rest of the form */}
            <div className="space-y-6">
              {/* Basic Information Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={companyData.companyName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Business Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={companyData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={companyData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={companyData.website}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                      Industry
                    </label>
                    <input
                      type="text"
                      id="industry"
                      name="industry"
                      value={companyData.industry}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label htmlFor="companySize" className="block text-sm font-medium text-gray-700">
                      Company Size
                    </label>
                    <select
                      id="companySize"
                      name="companySize"
                      value={companyData.companySize}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                    >
                      <option value="">Select company size</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1001-5000">1001-5000 employees</option>
                      <option value="5001+">5001+ employees</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Company Description Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Description</h2>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={companyData.description}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              {/* Locations Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Locations</h2>
                  {locations.length < 10 && (
                    <button
                      type="button"
                      onClick={addLocation}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Location
                    </button>
                  )}
                </div>
                
                {locations.map((location, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Location {index + 1}</h3>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeLocation(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <input
                          type="text"
                          value={location.address}
                          onChange={(e) => handleLocationChange(index, 'address', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          City
                        </label>
                        <input
                          type="text"
                          value={location.city}
                          onChange={(e) => handleLocationChange(index, 'city', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          State
                        </label>
                        <select
                          value={location.state}
                          onChange={(e) => handleLocationChange(index, 'state', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        >
                          <option value="">Select state</option>
                          {Object.entries(STATE_ABBREVIATIONS).map(([name, abbr]) => (
                            <option key={abbr} value={abbr}>
                              {name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={location.is_headquarters}
                          onChange={(e) => handleLocationChange(index, 'is_headquarters', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">This is our headquarters</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Save Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save Company Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

export default EditCompanyPage; 