"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Cog6ToothIcon, ChevronDownIcon, ChevronUpIcon, CodeBracketIcon, PresentationChartBarIcon, MegaphoneIcon, PaintBrushIcon, BriefcaseIcon, BuildingOfficeIcon, AcademicCapIcon, BeakerIcon, HeartIcon, SparklesIcon, DocumentPlusIcon, UserGroupIcon, UserCircleIcon, EnvelopeIcon, CalendarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ApplicationResponseView from '@/components/ApplicationResponseView';
import { checkCompanyAuth, CompanyUser } from '../../src/lib/companyAuth';

export default function CompanyDash() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [companyName, setCompanyName] = useState("");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [activeTab, setActiveTab] = useState('applications');
  const [isPostingsOpen, setIsPostingsOpen] = useState(true);
  const [postings, setPostings] = useState<any[]>([]);
  const [expandedPostings, setExpandedPostings] = useState<string[]>([]);
  const [expandedManagePostings, setExpandedManagePostings] = useState<string[]>([]);
  const [expandedApplications, setExpandedApplications] = useState<string[]>([]);
  const [applicationCounts, setApplicationCounts] = useState<Record<string, number>>({});
  const [existingApplicationForms, setExistingApplicationForms] = useState<Record<string, boolean>>({});
  const [applications, setApplications] = useState<any[]>([]);
  const [expandedApplicationResponses, setExpandedApplicationResponses] = useState<string[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [companyUser, setCompanyUser] = useState<CompanyUser | null>(null);

  const handleApplicationFormClick = async (postingId: string) => {
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // In our system, the user.id is the company ID for company users
      const companyId = user.id;

      // Check if a form already exists for this internship
      const { data: existingForm, error: formError } = await supabase
        .from('forms')
        .select('id')
        .eq('internship_id', postingId)
        .eq('company_id', companyId)
        .single();

      if (formError && formError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw formError;
      }

      if (existingForm) {
        // Update existingApplicationForms state to show "Edit Application"
        setExistingApplicationForms(prev => ({
          ...prev,
          [postingId]: true
        }));
        // Navigate to edit page
        router.push(`/company/form-builder/${companyId}/${existingForm.id}`);
      } else {
        // Generate a random UUID for the form
        const formId = crypto.randomUUID();

        // Get internship details for form title
        const { data: internship, error: internshipError } = await supabase
          .from('internships')
          .select('title, description')
          .eq('id', postingId)
          .single();

        if (internshipError) throw internshipError;

        // Create a new form with the generated ID
        const { data: newForm, error: createError } = await supabase
          .from('forms')
          .insert({
            id: formId,
            internship_id: postingId,
            company_id: companyId,
            title: `${internship.title} Application Form`,
            description: internship.description || 'Please fill out all required fields.',
            status: 'draft',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;

        // Update existingApplicationForms state to show "Edit Application"
        setExistingApplicationForms(prev => ({
          ...prev,
          [postingId]: true
        }));

        // Navigate to the new form
        router.push(`/company/form-builder/${companyId}/${formId}`);
      }
    } catch (error) {
      console.error('Error handling form navigation:', error);
      // Show error to user (you can add a toast notification here)
    }
  };

  const loadApplications = async (companyId: string, internshipId?: string) => {
    try {
      setIsLoadingApplications(true);
      const params = new URLSearchParams({ companyId });
      if (internshipId) {
        params.append('internshipId', internshipId);
      }
      
      const response = await fetch(`/api/companies/applications?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setApplications(data.applications || []);
      } else {
        console.error('Error loading applications:', data.error);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const loadTeamMembers = async (companyId: string) => {
    try {
      setIsLoadingTeam(true);
      
      // Find interns who have applied to this company's internships AND have been assigned to a team
      const { data, error } = await supabase
        .from('interns')
        .select(`
          id, 
          full_name, 
          email, 
          high_school, 
          graduation_year, 
          profile_photo_url, 
          team,
          applications!inner(
            internship_id,
            internships!inner(
              company_id
            )
          )
        `)
        .eq('applications.internships.company_id', companyId)
        .not('team', 'is', null)
        .order('team', { ascending: true })
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error loading team members:', error);
        setTeamMembers([]);
      } else {
        // Remove duplicates (same intern might have multiple applications)
        const uniqueInterns = data?.filter((intern, index, array) => 
          array.findIndex(i => i.id === intern.id) === index
        ) || [];
        
        setTeamMembers(uniqueInterns);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const loadPostings = async (companyId: string) => {
    try {
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading postings:', error);
      } else {
        setPostings(data || []);
        
        // Load application counts for each posting
        if (data && data.length > 0) {
          const counts: Record<string, number> = {};
          const existingForms: Record<string, boolean> = {};
          
          for (const posting of data) {
            // Get application count from the applications table
            const { data: appData, error: appError } = await supabase
              .from('applications')
              .select('id')
              .eq('internship_id', posting.id);
            
            if (!appError) {
              counts[posting.id] = appData?.length || 0;
            }
            
            // Check if form exists
            const { data: formData, error: formError } = await supabase
              .from('forms')
              .select('id')
              .eq('internship_id', posting.id)
              .eq('company_id', companyId)
              .single();
            
            if (!formError && formData) {
              existingForms[posting.id] = true;
            }
          }
          
          setApplicationCounts(counts);
          setExistingApplicationForms(existingForms);
        }
      }
    } catch (error) {
      console.error('Error loading postings:', error);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Use the new company authentication check
        const { isCompany, user, error } = await checkCompanyAuth();
        
        if (!isCompany || !user) {
          console.log('Company auth failed:', error);
          router.replace('/company-sign-in');
          return;
        }

        // User is properly authenticated as a company
        setCompanyUser(user);
        setCompanyName(user.companyName);
        setContactName(user.contactName);
        setCompanyId(user.id);
        
        // Update localStorage with proper company data
        localStorage.setItem('user', JSON.stringify({
          id: user.id,
          email: user.email,
          role: 'COMPANY',
          companyName: user.companyName,
          contactName: user.contactName
        }));
        
        // Load all data after successful authentication
        await Promise.all([
          loadPostings(user.id),
          loadApplications(user.id),
          loadTeamMembers(user.id)
        ]);
        
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/company-sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      router.replace('/company-sign-in');
    }
  };

  // Helper function to get category-specific styles
  const getCategoryStyles = (category: string) => {
    const styles = {
      'Software Engineering': {
        icon: CodeBracketIcon,
        color: 'text-blue-600',
        bgLight: 'bg-gradient-to-br from-blue-50 to-purple-50',
        border: 'border-blue-200'
      },
      'Data Science': {
        icon: PresentationChartBarIcon,
        color: 'text-purple-600',
        bgLight: 'bg-gradient-to-br from-purple-50 to-fuchsia-50',
        border: 'border-purple-200'
      },
      'Marketing': {
        icon: MegaphoneIcon,
        color: 'text-pink-600',
        bgLight: 'bg-gradient-to-br from-pink-50 to-purple-50',
        border: 'border-pink-200'
      },
      'Design': {
        icon: PaintBrushIcon,
        color: 'text-indigo-600',
        bgLight: 'bg-gradient-to-br from-indigo-50 to-purple-50',
        border: 'border-indigo-200'
      },
      'Business': {
        icon: BriefcaseIcon,
        color: 'text-amber-600',
        bgLight: 'bg-gradient-to-br from-amber-50 to-purple-50',
        border: 'border-amber-200'
      },
      'Operations': {
        icon: BuildingOfficeIcon,
        color: 'text-emerald-600',
        bgLight: 'bg-gradient-to-br from-emerald-50 to-purple-50',
        border: 'border-emerald-200'
      },
      'Education': {
        icon: AcademicCapIcon,
        color: 'text-cyan-600',
        bgLight: 'bg-gradient-to-br from-cyan-50 to-purple-50',
        border: 'border-cyan-200'
      },
      'Research': {
        icon: BeakerIcon,
        color: 'text-teal-600',
        bgLight: 'bg-gradient-to-br from-teal-50 to-purple-50',
        border: 'border-teal-200'
      },
      'Healthcare': {
        icon: HeartIcon,
        color: 'text-rose-600',
        bgLight: 'bg-gradient-to-br from-rose-50 to-purple-50',
        border: 'border-rose-200'
      }
    };
    return styles[category as keyof typeof styles] || {
      icon: SparklesIcon,
      color: 'text-gray-600',
      bgLight: 'bg-gradient-to-br from-gray-50 to-purple-50',
      border: 'border-gray-200'
    };
  };

  // Helper function to generate the URL-safe company name
  const getUrlSafeString = (str: string) => {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full border-b-2 border-blue-600 w-8 h-8 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Settings Icon */}
      <div className="absolute top-4 right-4">
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200"
          >
            <Cog6ToothIcon className="h-6 w-6 text-gray-600" />
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical">
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome{contactName ? `, ${contactName}` : companyName ? `, ${companyName}` : ", Employer"}!
          </h1>
          <p className="text-gray-600 mb-8">
            This is your company dashboard. Manage your postings, find top interns, and grow your team.
          </p>
          {/* Tabs */}
          <div className="flex space-x-4 border-b border-gray-200 mb-6">
            <button
              className={`px-4 py-2 font-medium text-base focus:outline-none border-b-2 transition-colors duration-200 ${activeTab === 'applications' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700'}`}
              onClick={() => setActiveTab('applications')}
            >
              Applications
            </button>
            <button
              className={`px-4 py-2 font-medium text-base focus:outline-none border-b-2 transition-colors duration-200 ${activeTab === 'manage' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700'}`}
              onClick={() => setActiveTab('manage')}
            >
              Manage Postings
            </button>
            <button
              className={`px-4 py-2 font-medium text-base focus:outline-none border-b-2 transition-colors duration-200 ${activeTab === 'team' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-blue-700'}`}
              onClick={() => setActiveTab('team')}
            >
              {companyName ? `${companyName} Team` : 'Team'}
            </button>
          </div>
          {/* Tab Content */}
          <div>
            {activeTab === 'applications' && (
              <div>
                {/* Expandable Postings Section */}
                <div className="bg-white rounded-lg shadow border border-gray-200 mb-6">
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer select-none border-b border-gray-100"
                    onClick={() => setIsPostingsOpen((open) => !open)}
                  >
                    <h3 className="text-lg font-medium text-gray-900">Postings</h3>
                    {isPostingsOpen ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  {isPostingsOpen && (
                    <div className="px-6 py-4">
                      {postings.length === 0 ? (
                        <div className="py-8 text-gray-600 text-lg text-center">No postings found.</div>
                      ) : (
                        <div className="space-y-4">
                          {postings.map((posting) => {
                            const categoryStyle = getCategoryStyles(posting.category);
                            const IconComponent = categoryStyle.icon;
                            
                            return (
                              <motion.div
                                key={posting.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`rounded-lg border ${categoryStyle.border} overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-purple-100`}
                              >
                                <div
                                  className={`flex items-center justify-between px-6 py-4 cursor-pointer select-none ${categoryStyle.bgLight}`}
                                  onClick={() => setExpandedPostings((prev) => 
                                    prev.includes(posting.id) 
                                      ? prev.filter(id => id !== posting.id) 
                                      : [...prev, posting.id]
                                  )}
                                >
                                  <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-lg bg-white bg-opacity-60 backdrop-blur-sm`}>
                                      <IconComponent className={`h-6 w-6 ${categoryStyle.color}`} />
                                    </div>
                                    <div>
                                      <h4 className={`font-semibold ${categoryStyle.color}`}>
                                        {posting.category}
                                      </h4>
                                      <p className="text-gray-600 text-sm mt-1">
                                        {posting.position}
                                      </p>
                                    </div>
                                  </div>
                                  <motion.div
                                    initial={false}
                                    animate={{ rotate: expandedPostings.includes(posting.id) ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white bg-opacity-60 rounded-full p-1"
                                  >
                                    <ChevronDownIcon className={`h-5 w-5 ${categoryStyle.color}`} />
                                  </motion.div>
                                </div>
                                <AnimatePresence>
                                  {expandedPostings.includes(posting.id) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-6 py-4 bg-white bg-opacity-90">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div className={`p-4 rounded-lg ${categoryStyle.bgLight} backdrop-blur-sm`}>
                                            <h5 className="text-sm font-medium text-gray-500">Category</h5>
                                            <p className={`text-lg font-medium ${categoryStyle.color}`}>
                                              {posting.category}
                                            </p>
                                          </div>
                                          <div className={`p-4 rounded-lg ${categoryStyle.bgLight} backdrop-blur-sm`}>
                                            <h5 className="text-sm font-medium text-gray-500">Position</h5>
                                            <p className={`text-lg font-medium ${categoryStyle.color}`}>
                                              {posting.position}
                                            </p>
                                          </div>
                                        </div>

                                        {/* Create/Edit Application Button */}
                                        <div className="mt-4 mb-4">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApplicationFormClick(posting.id);
                                            }}
                                            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg ${categoryStyle.bgLight} border ${categoryStyle.border} hover:shadow-md transition-all duration-200`}
                                          >
                                            <div className={`p-1.5 rounded-lg bg-white bg-opacity-60 backdrop-blur-sm mr-2`}>
                                              <DocumentPlusIcon className={`h-4 w-4 ${categoryStyle.color}`} />
                                            </div>
                                            <span className={`text-sm font-medium ${categoryStyle.color}`}>
                                              {existingApplicationForms[posting.id] ? 'Edit Application' : 'Create Application'}
                                            </span>
                                          </button>
                                        </div>

                                        {/* Applications Section */}
                                        <div className="mt-4">
                                          <div
                                            className={`rounded-lg border ${categoryStyle.border} overflow-hidden transition-all duration-200`}
                                          >
                                            <div
                                              className={`flex items-center justify-between px-6 py-3 cursor-pointer select-none ${categoryStyle.bgLight}`}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedApplications(prev =>
                                                  prev.includes(posting.id)
                                                    ? prev.filter(id => id !== posting.id)
                                                    : [...prev, posting.id]
                                                );
                                              }}
                                            >
                                              <div className="flex items-center space-x-2">
                                                <div className={`p-1.5 rounded-lg bg-white bg-opacity-60 backdrop-blur-sm`}>
                                                  <BriefcaseIcon className={`h-4 w-4 ${categoryStyle.color}`} />
                                                </div>
                                                <h4 className={`font-medium ${categoryStyle.color}`}>
                                                  Applications
                                                  <span className="ml-2 px-2 py-0.5 text-sm bg-white bg-opacity-60 rounded-full">
                                                    {applicationCounts[posting.id] || 0}
                                                  </span>
                                                </h4>
                                              </div>
                                              <motion.div
                                                initial={false}
                                                animate={{ rotate: expandedApplications.includes(posting.id) ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="bg-white bg-opacity-60 rounded-full p-1"
                                              >
                                                <ChevronDownIcon className={`h-4 w-4 ${categoryStyle.color}`} />
                                              </motion.div>
                                            </div>
                                            <AnimatePresence>
                                              {expandedApplications.includes(posting.id) && (
                                                <motion.div
                                                  initial={{ height: 0, opacity: 0 }}
                                                  animate={{ height: "auto", opacity: 1 }}
                                                  exit={{ height: 0, opacity: 0 }}
                                                  transition={{ duration: 0.2 }}
                                                  className="overflow-hidden"
                                                >
                                                  <div className="px-6 py-4 bg-white bg-opacity-90">
                                                    {applicationCounts[posting.id] > 0 ? (
                                                      <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                          <p className="text-gray-600">
                                                            {applicationCounts[posting.id]} application{applicationCounts[posting.id] === 1 ? '' : 's'} for this position
                                                          </p>
                                                          <Link
                                                            href={`/company/view-responses?internshipId=${posting.id}`}
                                                            className={`px-4 py-2 rounded-lg ${categoryStyle.bgLight} border ${categoryStyle.border} hover:shadow-md transition-all duration-200 flex items-center space-x-2`}
                                                          >
                                                            <UserGroupIcon className={`h-4 w-4 ${categoryStyle.color}`} />
                                                            <span className={`text-sm font-medium ${categoryStyle.color}`}>
                                                              View Individual Responses
                                                            </span>
                                                          </Link>
                                                        </div>
                                                        
                                                        {applications.length > 0 && (
                                                          <div className="space-y-3">
                                                            {applications
                                                              .filter(app => app.internship.id === posting.id)
                                                              .map((application) => (
                                                                <ApplicationResponseView
                                                                  key={application.id}
                                                                  application={application}
                                                                  isExpanded={expandedApplicationResponses.includes(application.id)}
                                                                  onToggle={() => {
                                                                    setExpandedApplicationResponses(prev =>
                                                                      prev.includes(application.id)
                                                                        ? prev.filter(id => id !== application.id)
                                                                        : [...prev, application.id]
                                                                    );
                                                                  }}
                                                                />
                                                              ))}
                                                          </div>
                                                        )}
                                                      </div>
                                                    ) : (
                                                      <p className="text-gray-600">
                                                        No applications yet for this position.
                                                      </p>
                                                    )}
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'manage' && (
              <div>
                <div className="px-6 py-4">
                  {postings.length === 0 ? (
                    <div className="py-8 text-gray-600 text-lg text-center">No postings found.</div>
                  ) : (
                    <div className="space-y-4">
                      {postings.map((posting) => {
                        const categoryStyle = getCategoryStyles(posting.category);
                        const IconComponent = categoryStyle.icon;
                        
                        return (
                          <motion.div
                            key={posting.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`rounded-lg border ${categoryStyle.border} overflow-hidden transition-all duration-200 hover:shadow-md hover:shadow-purple-100`}
                          >
                            <div
                              className={`flex items-center justify-between px-6 py-4 cursor-pointer select-none ${categoryStyle.bgLight}`}
                              onClick={() => setExpandedManagePostings((prev) => 
                                prev.includes(posting.id) 
                                  ? prev.filter(id => id !== posting.id) 
                                  : [...prev, posting.id]
                              )}
                            >
                              <div className="flex items-center space-x-4">
                                <div className={`p-2 rounded-lg bg-white bg-opacity-60 backdrop-blur-sm`}>
                                  <IconComponent className={`h-6 w-6 ${categoryStyle.color}`} />
                                </div>
                                <div>
                                  <h4 className={`font-semibold ${categoryStyle.color}`}>
                                    {posting.category}
                                  </h4>
                                  <p className="text-gray-600 text-sm mt-1">
                                    {posting.position}
                                  </p>
                                </div>
                              </div>
                              <motion.div
                                initial={false}
                                animate={{ rotate: expandedManagePostings.includes(posting.id) ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="bg-white bg-opacity-60 rounded-full p-1"
                              >
                                <ChevronDownIcon className={`h-5 w-5 ${categoryStyle.color}`} />
                              </motion.div>
                            </div>
                            <AnimatePresence>
                              {expandedManagePostings.includes(posting.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 py-4 bg-white bg-opacity-90">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className={`p-4 rounded-lg ${categoryStyle.bgLight} backdrop-blur-sm`}>
                                        <h5 className="text-sm font-medium text-gray-500">Category</h5>
                                        <p className={`text-lg font-medium ${categoryStyle.color}`}>
                                          {posting.category}
                                        </p>
                                      </div>
                                      <div className={`p-4 rounded-lg ${categoryStyle.bgLight} backdrop-blur-sm`}>
                                        <h5 className="text-sm font-medium text-gray-500">Position</h5>
                                        <p className={`text-lg font-medium ${categoryStyle.color}`}>
                                          {posting.position}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="mt-6">
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                          <h5 className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Posting URL
                                          </h5>
                                          <div className="h-4 w-[1px] bg-gradient-to-b from-blue-200 to-purple-200"></div>
                                          <span className="text-xs text-gray-400">Click to view or copy</span>
                                        </div>
                                      </div>
                                      <div className={`p-3 rounded-lg bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors duration-200`}>
                                        <Link
                                          href={`/company/postings/${posting.id}`}
                                          target="_blank"
                                          onClick={(e) => e.stopPropagation()}
                                          className="block text-sm text-gray-600 hover:text-blue-600 font-medium break-all transition-colors duration-200"
                                        >
                                          {`/company/postings/${posting.id}`}
                                        </Link>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'team' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Team</h3>
                  <p className="text-gray-600">Manage interns who have been added to your team</p>
                </div>
                
                {isLoadingTeam ? (
                  <div className="py-8 text-gray-600 text-lg text-center">Loading team members...</div>
                ) : teamMembers.length === 0 ? (
                  <div className="py-8 text-gray-600 text-lg text-center">
                    <div className="mb-4">
                      <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    </div>
                    <p>No team members yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Use the "Connect to your team" button on applications to add interns to your team
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Group by team */}
                    {Object.entries(
                      teamMembers.reduce((acc: Record<string, any[]>, member: any) => {
                        const team = member.team || 'Unassigned';
                        if (!acc[team]) acc[team] = [];
                        acc[team].push(member);
                        return acc;
                      }, {})
                    ).map(([teamName, members]) => (
                      <div key={teamName} className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                          <h4 className="text-lg font-semibold text-gray-900">{teamName}</h4>
                          <p className="text-sm text-gray-600">{members.length} member{members.length === 1 ? '' : 's'}</p>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {members.map((member) => (
                            <div key={member.id} className="px-6 py-4 flex items-center space-x-4">
                              <div className="flex-shrink-0">
                                {member.profile_photo_url ? (
                                  <img
                                    src={member.profile_photo_url}
                                    alt={member.full_name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <UserCircleIcon className="h-10 w-10 text-gray-400" />
                                )}
                              </div>
                                                              <div className="flex-1">
                                  <h5 className="text-sm font-medium text-gray-900">{member.full_name}</h5>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <EnvelopeIcon className="h-4 w-4 mr-1" />
                                      {member.email}
                                    </div>
                                    <div className="flex items-center">
                                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                                      {member.high_school}
                                    </div>
                                    <div className="flex items-center">
                                      <CalendarIcon className="h-4 w-4 mr-1" />
                                      Class of {member.graduation_year}
                                    </div>
                                  </div>
                                </div>
                              <div className="flex-shrink-0">
                                <Link
                                  href={`/company/public-profile/${member.id}`}
                                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-1"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span>View Profile</span>
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
        {/* Placeholder for future analytics or widgets */}
        {/* <CompanyAnalytics /> */}
      </div>
      {/* Add custom styles for animations */}
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