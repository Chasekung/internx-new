import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon, 
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface Application {
  id: string;
  company: string;
  position: string;
  status: 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Rejected';
  date: string;
  notes: string;
  totalApplicants?: number;
  acceptedApplicants?: number;
  responseTime?: number;
  location?: string;
  salary?: string;
  rating?: number;
  applicationDeadline?: string;
  interviewDate?: string;
}

interface Analytics {
  totalApplications: number;
  statusDistribution: {
    Applied: number;
    'Under Review': number;
    Interview: number;
    Offer: number;
    Rejected: number;
  };
}

export default function ApplicationTracker() {
  const [applications] = useState<Application[]>([
    {
      id: '1',
      company: 'Tech Corp',
      position: 'Software Engineering Intern (Example)',
      status: 'Interview',
      date: '2024-03-15',
      notes: 'Technical interview scheduled for next week',
      totalApplicants: 150,
      acceptedApplicants: 5,
      responseTime: 3,
      location: 'San Francisco, CA',
      salary: '$45/hr',
      rating: 4.5,
      applicationDeadline: '2024-04-01',
      interviewDate: '2024-03-22'
    }
  ]);
  const [expandedApplication, setExpandedApplication] = useState<string | null>(null);
  const [analytics] = useState<Analytics>({
    totalApplications: 0,
    statusDistribution: {
      Applied: 0,
      'Under Review': 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0
    }
  });

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-100 text-blue-800';
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Interview':
        return 'bg-purple-100 text-purple-800';
      case 'Offer':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBgColor = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500';
      case 'Under Review':
        return 'bg-yellow-500';
      case 'Interview':
        return 'bg-purple-500';
      case 'Offer':
        return 'bg-green-500';
      case 'Rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'Under Review':
        return <ClockIcon className="h-5 w-5" />;
      case 'Interview':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'Offer':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'Rejected':
        return <XCircleIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const toggleApplication = (id: string) => {
    setExpandedApplication(expandedApplication === id ? null : id);
  };

  return (
    <div className="space-y-8">
      {/* Primary Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Applications This Month</p>
              <p className="text-2xl font-semibold text-gray-900">
                {applications.filter(app => {
                  const appDate = new Date(app.date);
                  const now = new Date();
                  return appDate.getMonth() === now.getMonth() && 
                         appDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Interviews Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">
                {applications.filter(app => app.status === 'Interview').length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Under Review</p>
              <p className="text-2xl font-semibold text-gray-900">
                {applications.filter(app => app.status === 'Under Review').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Application Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Application Timeline</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {applications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No applications yet. Start applying to track your progress!</p>
            </div>
          ) : (
            applications.map((application, index) => (
              <div key={application.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleApplication(application.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{application.position}</h4>
                        <p className="text-sm text-gray-500">{application.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500">{application.date}</span>
                      {expandedApplication === application.id ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </motion.div>

                <AnimatePresence>
                  {expandedApplication === application.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6">
                        <div className="border-t border-gray-200 pt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Application Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-600">Location</p>
                              </div>
                              <p className="text-xl font-semibold text-gray-900 mt-1">{application.location || '--'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-600">Salary</p>
                              </div>
                              <p className="text-xl font-semibold text-gray-900 mt-1">{application.salary || '--'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <StarIcon className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-600">Company Rating</p>
                              </div>
                              <p className="text-xl font-semibold text-gray-900 mt-1">{application.rating || '--'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Basic Application Analytics</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <UserGroupIcon className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-600">Total Applicants</p>
                              </div>
                              <p className="text-xl font-semibold text-gray-900 mt-1">{application.totalApplicants || '--'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-600">Accepted Applicants</p>
                              </div>
                              <p className="text-xl font-semibold text-gray-900 mt-1">{application.acceptedApplicants || '--'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center space-x-2">
                                <ClockIcon className="h-5 w-5 text-gray-400" />
                                <p className="text-sm font-medium text-gray-600">Response Time</p>
                              </div>
                              <p className="text-xl font-semibold text-gray-900 mt-1">
                                {application.responseTime ? `${application.responseTime} days` : '--'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Premium Analytics Section */}
                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Advanced Analytics</h4>
                          <div className="relative">
                            {/* Preview of one clear metric */}
                            <div className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 select-none">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <ChartBarIcon className="h-5 w-5 text-purple-500" />
                                  <p className="text-sm font-medium text-gray-600">Success Probability</p>
                                </div>
                                <span className="text-sm text-purple-600 font-medium">Premium</span>
                              </div>
                              <p className="text-2xl font-bold text-gray-900 mt-2">85%</p>
                              <p className="text-xs text-gray-500 mt-1">Based on your profile match and company hiring patterns</p>
                            </div>

                            {/* Blurred advanced analytics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 filter blur-sm">
                              <div className="bg-gray-50 rounded-lg p-4 select-none">
                                <div className="flex items-center space-x-2">
                                  <ArrowTrendingUpIcon className="h-5 w-5 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-600">Market Demand</p>
                                </div>
                                <p className="text-xl font-semibold text-gray-900 mt-1">High</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 select-none">
                                <div className="flex items-center space-x-2">
                                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-600">Similar Roles</p>
                                </div>
                                <p className="text-xl font-semibold text-gray-900 mt-1">12</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 select-none">
                                <div className="flex items-center space-x-2">
                                  <UserGroupIcon className="h-5 w-5 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-600">Competitor Analysis</p>
                                </div>
                                <p className="text-xl font-semibold text-gray-900 mt-1">Top 20%</p>
                              </div>
                            </div>

                            {/* Additional blurred analytics */}
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 filter blur-sm">
                              <div className="bg-gray-50 rounded-lg p-4 select-none">
                                <div className="flex items-center space-x-2">
                                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-600">Salary Range</p>
                                </div>
                                <p className="text-xl font-semibold text-gray-900 mt-1">$45-55/hr</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 select-none">
                                <div className="flex items-center space-x-2">
                                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-600">Company Growth</p>
                                </div>
                                <p className="text-xl font-semibold text-gray-900 mt-1">+25% YoY</p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4 select-none">
                                <div className="flex items-center space-x-2">
                                  <EyeIcon className="h-5 w-5 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-600">Application Views</p>
                                </div>
                                <p className="text-xl font-semibold text-gray-900 mt-1">3 views</p>
                                <div className="mt-2 space-y-2">
                                  <div className="text-sm">
                                    <p className="text-gray-900 font-medium">John Doe</p>
                                    <p className="text-gray-500">JohnDoe@mockcompany.com</p>
                                    <p className="text-gray-500">linkedin.com/in/John-Doe1234</p>
                                    <p className="text-xs text-gray-400 mt-1">Viewed 4.5 min ago</p>
                                  </div>
                                  <div className="text-sm">
                                    <p className="text-gray-900 font-medium">Sarah Smith</p>
                                    <p className="text-gray-500">Sarah.Smith@mockcompany.com</p>
                                    <p className="text-gray-500">linkedin.com/in/Sarah-Smith-5678</p>
                                    <p className="text-xs text-gray-400 mt-1">Viewed 2 days ago</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                                <StarIcon className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">Unlock All Analytics</h3>
                                <p className="text-sm text-gray-600 mb-3">Make smarter decisions and increase your chances of success</p>
                                <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors">
                                  Try Premium for $0
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Timeline</h4>
                          <div className="relative py-16 flex justify-center items-center">
                            {/* Background blobs for depth */}
                            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob"></div>
                            <div className="absolute top-1/2 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-2000"></div>
                            <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-40 animate-blob animation-delay-4000"></div>

                            {/* Vertical glowing timeline */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-2 bg-gradient-to-b from-blue-400 via-purple-400 to-green-400 shadow-2xl rounded-full z-0"></div>

                            {/* Timeline events */}
                            <div className="relative z-10 flex flex-col gap-16 w-full max-w-2xl mx-auto">
                              {[
                                { type: 'Applied', date: application.date, color: 'blue', icon: DocumentTextIcon },
                                { type: 'Deadline', date: application.applicationDeadline, color: 'yellow', icon: CalendarIcon },
                                { type: 'Interview', date: application.interviewDate, color: 'purple', icon: UserGroupIcon },
                                { type: 'Current', date: new Date().toISOString().split('T')[0], color: getStatusBgColor(application.status).replace('bg-', ''), icon: CheckCircleIcon }
                              ]
                                .filter(event => event.date)
                                .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())
                                .map((event, idx, arr) => {
                                  const isLeft = idx % 2 === 0;
                                  return (
                                    <div key={event.type} className="relative flex items-center group min-h-[120px]">
                                      {/* Connector line with animated progress */}
                                      {idx < arr.length - 1 && (
                                        <motion.div
                                          initial={{ scaleY: 0 }}
                                          animate={{ scaleY: 1 }}
                                          transition={{ duration: 0.7, delay: 0.2 * idx }}
                                          className="absolute left-1/2 -translate-x-1/2 top-10 w-1 h-[80px] bg-gradient-to-b from-blue-400 via-purple-400 to-green-400 rounded-full z-0 origin-top"
                                        />
                                      )}
                                      {/* Event icon with animated pulse */}
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 * idx }}
                                        className={`absolute left-1/2 -translate-x-1/2 z-10 w-12 h-12 rounded-full bg-${event.color}-500 shadow-xl flex items-center justify-center border-4 border-white`}
                                      >
                                        <event.icon className="w-6 h-6 text-white animate-bounce" />
                                        <span className={`absolute inset-0 rounded-full bg-${event.color}-400 opacity-30 animate-ping`}></span>
                                      </motion.div>
                                      {/* Floating event card */}
                                      <motion.div
                                        initial={{ x: isLeft ? -60 : 60, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.6, delay: 0.15 * idx }}
                                        className={`relative w-full max-w-xs ${isLeft ? 'ml-20 text-left' : 'mr-20 text-right'} group-hover:scale-105 transition-transform`}
                                      >
                                        <div className={`bg-white/80 backdrop-blur-lg border-l-4 ${isLeft ? `border-${event.color}-500` : `border-${event.color}-400`} rounded-xl shadow-lg px-6 py-4`}> 
                                          <p className="text-base font-bold text-gray-900 mb-1">{event.type}</p>
                                          <p className="text-xs text-gray-600">{event.date}</p>
                                        </div>
                                      </motion.div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Notes & Reminders</h4>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">{application.notes}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
} 