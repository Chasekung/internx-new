"use client";
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import supabase from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { BsGrid, BsList } from 'react-icons/bs';
import OpportunityCardView from '@/components/OpportunityCardView';
import OpportunityListView from '@/components/OpportunityListView';

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

const POSITIONS_BY_CATEGORY: Record<string, string[]> = {
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

const STATE_ABBREVIATIONS = {
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
  internship_picture_1: string | null;
  internship_picture_2: string | null;
  internship_picture_3: string | null;
  internship_picture_4: string | null;
  internship_picture_5: string | null;
}

type InternshipPictureKeys = 'internship_picture_1' | 'internship_picture_2' | 'internship_picture_3' | 'internship_picture_4' | 'internship_picture_5';

type InternshipPictureUrls = {
  internship_picture_1?: string;
  internship_picture_2?: string;
  internship_picture_3?: string;
  internship_picture_4?: string;
  internship_picture_5?: string;
};

type FormStateKey = keyof FormState;

interface FormState {
  company_name: string;
  for_profit: string;
  category: string;
  position: string;
  address: string;
  city: string;
  state: string;
  hours_per_week: string;
  pay: string;
  business_email: string;
  description: string;
  internship_picture_1: string | null;
  internship_picture_2: string | null;
  internship_picture_3: string | null;
  internship_picture_4: string | null;
  internship_picture_5: string | null;
}

interface ImageFields {
  internship_picture_1: string | null;
  internship_picture_2: string | null;
  internship_picture_3: string | null;
  internship_picture_4: string | null;
  internship_picture_5: string | null;
}

export default function CompanyOpportunitiesPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params?.companyId as string;
  const [userId, setUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [form, setForm] = useState<FormState>({
    company_name: '',
    for_profit: '',
    category: '',
    position: '',
    address: '',
    city: '',
    state: '',
    hours_per_week: '',
    pay: '',
    business_email: '',
    description: '',
    internship_picture_1: null,
    internship_picture_2: null,
    internship_picture_3: null,
    internship_picture_4: null,
    internship_picture_5: null,
  });
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (!userStr) {
      router.replace('/company-sign-in');
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== 'COMPANY') {
        router.replace('/company-sign-in');
        return;
      }
    } catch {
      router.replace('/company-sign-in');
      return;
    }
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, [router, companyId]);

  useEffect(() => {
    const fetchInternships = async () => {
      const { data, error } = await supabase.from('internships').select('*').eq('company_id', companyId);
      if (!error && data) setInternships(data);
      setLoading(false);
    };
    if (companyId) fetchInternships();
  }, [companyId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle file uploads
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const file = e.target.files?.[0];
      const key = name as FormStateKey;
      
      if (!file) {
        // File was removed
        setForm((prev) => ({
          ...prev,
          [key]: null
        }));
        return;
      }

      // File was selected
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setForm((prev) => ({
          ...prev,
          [key]: result
        }));
      };
      reader.readAsDataURL(file);
      return;
    }

    // Handle other form fields
    const key = name as FormStateKey;
    setForm((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Generate title from position and category
      const title = form.category 
        ? `${form.position} - ${form.category}`
        : form.position;

      // First create the internship posting without images
      const { data: internship, error: postingError } = await supabase
        .from('internships')
        .insert([{
          company_id: params.companyId,
          company_name: form.company_name,
          title: title,
          for_profit: form.for_profit === 'true' ? 'for-profit' : 'non-profit',
          category: form.category,
          position: form.position,
          address: form.address,
          city: form.city,
          state: form.state,
          hours_per_week: parseInt(form.hours_per_week),
          pay: form.pay,
          business_email: form.business_email,
          description: form.description,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (postingError) throw postingError;

      // Upload images to storage and update the posting with image URLs
      const imageUrls: InternshipPictureUrls = {};

      // Handle each image field separately
      const uploadImage = async (fieldName: InternshipPictureKeys) => {
        const imageData = form[fieldName];
        if (imageData && imageData.startsWith('data:image')) {
          try {
            // Convert base64 to blob
            const blob = await fetch(imageData).then(r => r.blob());
            const fileExt = blob.type.split('/')[1];
            const fileName = `${internship.id}_${fieldName}_${Date.now()}.${fileExt}`;
            
            // Upload the file
            const { error: uploadError } = await supabase.storage
              .from('internship-pictures')
              .upload(fileName, blob);
              
            if (uploadError) {
              console.error(`Error uploading ${fieldName}:`, uploadError);
              return;
            }
            
            // Get the full public URL
            const { data: urlData } = await supabase.storage
              .from('internship-pictures')
              .getPublicUrl(fileName);
            
            if (!urlData?.publicUrl) {
              console.error(`Failed to get public URL for ${fieldName}`);
              return;
            }

            return urlData.publicUrl;
          } catch (uploadError) {
            console.error(`Error processing ${fieldName}:`, uploadError);
            return;
          }
        }
        return undefined;
      };

      // Upload each image
      const [url1, url2, url3, url4, url5] = await Promise.all([
        uploadImage('internship_picture_1'),
        uploadImage('internship_picture_2'),
        uploadImage('internship_picture_3'),
        uploadImage('internship_picture_4'),
        uploadImage('internship_picture_5')
      ]);

      // Add successful uploads to imageUrls
      if (url1) imageUrls.internship_picture_1 = url1;
      if (url2) imageUrls.internship_picture_2 = url2;
      if (url3) imageUrls.internship_picture_3 = url3;
      if (url4) imageUrls.internship_picture_4 = url4;
      if (url5) imageUrls.internship_picture_5 = url5;
      
      // Update internship with image URLs if any were uploaded
      if (Object.keys(imageUrls).length > 0) {
        const { error: updateError } = await supabase
          .from('internships')
          .update(imageUrls)
          .eq('id', internship.id);
          
        if (updateError) {
          console.error('Error updating internship with images:', updateError);
          // Don't throw here, as the internship was created successfully
        }
      }

      router.push(`/company/postings/${internship.id}`);
    } catch (error: any) {
      console.error('Error creating internship:', error);
      setError(error.message || 'Failed to create internship posting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const positionsForCategory = form.category ? POSITIONS_BY_CATEGORY[form.category as keyof typeof POSITIONS_BY_CATEGORY] || POSITIONS_BY_CATEGORY["Other"] : [];

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    const { error } = await supabase.from('internships').delete().eq('id', id);
    if (!error) {
      setInternships((prev) => prev.filter((item) => item.id !== id));
    } else {
      alert('Failed to delete. Please try again.');
    }
  };

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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!userId || userId !== companyId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-20 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Company Opportunities</h1>
        <p className="text-lg text-gray-500 mb-8">You must be signed in as this company to post or manage internships.</p>
        <div className="bg-white rounded-lg shadow-sm overflow-x-auto w-full max-w-4xl">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">ACTIONS</th>
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
                internships.map((internship: Internship, idx: number) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(internship.id);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="flex justify-between items-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            Your Opportunity Postings
          </motion.h1>
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-lg p-1 shadow-sm"
            >
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
            </motion.div>
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Post an Internship
            </motion.button>
          </div>
        </div>

        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : internships.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-8 text-center">
              <p className="text-gray-600 text-lg mb-4">No opportunities posted yet.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-blue-600 font-medium hover:text-blue-800"
              >
                Post your first internship opportunity
              </button>
            </div>
          ) : viewMode === 'card' ? (
            <OpportunityCardView
              internships={internships}
              onInternshipClick={handleInternshipClick}
              showActions
              onDelete={handleDelete}
            />
          ) : (
            <OpportunityListView
              internships={internships}
              onInternshipClick={handleInternshipClick}
              showActions
              onDelete={handleDelete}
            />
          )}
        </motion.div>

        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title
                      as="h3"
                      className="text-2xl font-bold leading-6 text-gray-900 mb-8"
                    >
                      Post a New Internship
                    </Dialog.Title>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-black">Company Name</label>
                        <input name="company_name" value={form.company_name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">For-profit/Non-profit</label>
                        <select name="for_profit" value={form.for_profit} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                          <option value="">Select</option>
                          <option value="for-profit">For-Profit</option>
                          <option value="non-profit">Non-Profit</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Category</label>
                        <select name="category" value={form.category} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                          <option value="">Select</option>
                          {CATEGORIES.map((cat) => <option key={cat} value={cat} className="text-black">{cat}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Position</label>
                        <select name="position" value={form.position} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                          <option value="">Select</option>
                          {positionsForCategory.map((pos: string) => <option key={pos} value={pos} className="text-black">{pos}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Address</label>
                        <input name="address" value={form.address} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">City</label>
                        <input name="city" value={form.city} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">State</label>
                        <select name="state" value={form.state} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black">
                          <option value="">Select</option>
                          {Object.values(STATE_ABBREVIATIONS).map((abbr) => <option key={abbr} value={abbr} className="text-black">{abbr}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Hours per Week</label>
                        <input type="number" name="hours_per_week" value={form.hours_per_week} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Pay ($/hr)</label>
                        <input type="number" name="pay" value={form.pay} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Business Email</label>
                        <input type="email" name="business_email" value={form.business_email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black">Position Description</label>
                        <textarea 
                          name="description" 
                          value={form.description} 
                          onChange={handleChange} 
                          required 
                          maxLength={150}
                          placeholder="Here's a suggested format: 'About The Team', 'About The Role', 'Team Focus Areas', 'In this role you will:', 'You might thrive in this role if you:'"
                          className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-black h-32 resize-none" 
                        />
                        <p className="mt-1 text-sm text-gray-500">{form.description.length}/150 words</p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-lg font-medium text-black mb-2">Add Images</label>
                          <p className="text-sm text-gray-500 mb-4">
                            Upload photos that showcase your workplace environment and company culture. This helps high school students visualize what working at your organization looks like.
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <div key={num} className="relative">
                              <label className="block text-sm font-medium text-black mb-1">Image {num}</label>
                              <div className="relative">
                                <input
                                  type="file"
                                  name={`internship_picture_${num}`}
                                  accept="image/*"
                                  onChange={handleChange}
                                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                                />
                                <div className={`
                                  w-full aspect-[4/3] rounded-lg border-2 border-dashed
                                  ${form[`internship_picture_${num}` as keyof FormState] ? 'border-blue-500' : 'border-gray-300'}
                                  flex items-center justify-center overflow-hidden
                                `}>
                                  {form[`internship_picture_${num}` as keyof FormState] ? (
                                    <img
                                      src={form[`internship_picture_${num}` as keyof FormState] || ''}
                                      alt={`Preview ${num}`}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-center p-4">
                                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                      </svg>
                                      <p className="mt-1 text-sm text-gray-500">Click to upload</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      )}

                      <div className="mt-5 sm:mt-6">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`
                            inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2
                            text-base font-medium text-white sm:text-sm
                            ${isSubmitting 
                              ? 'bg-blue-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }
                          `}
                        >
                          {isSubmitting ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Posting...
                            </>
                          ) : (
                            'Post Internship'
                          )}
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </div>
    </div>
  );
} 