'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Application {
  id: string;
  status: string;
  applied_at: string;
  internship_id: string;
  internships: {
    title: string;
    position: string;
    companies: {
      company_name: string;
      company_logo?: string;
    };
  };
}

export default function InternDashboard() {
  const router = useRouter();
  const [internData, setInternData] = useState<any>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is signed in
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/intern-sign-in');
      return;
    }
    // Fetch intern data
    const fetchInternData = async () => {
      try {
        const response = await fetch('/api/interns/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch intern data');
        const data = await response.json();
        setInternData(data);
      } catch (error) {
        setError('Failed to load dashboard data');
      }
    };
    // Fetch applications
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/interns/applications', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch applications');
        const data = await response.json();
        setApplications(data.applications || []);
      } catch (error) {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchInternData();
    fetchApplications();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
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
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome, {internData?.name || internData?.full_name || 'Intern'}
          </h1>
          <p className="text-gray-600">
            This is your personal dashboard where you can manage your internship applications and profile.
          </p>
        </motion.div>
        {/* Applications List */}
        <div className="space-y-6">
          {applications.length === 0 ? (
            <div className="text-center text-gray-500">No submitted applications yet.</div>
          ) : (
            applications.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setExpanded(expanded === app.id ? null : app.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {app.internships?.companies?.company_logo && (
                      <img
                        src={app.internships.companies.company_logo}
                        alt={app.internships.companies.company_name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <div className="font-semibold text-lg text-gray-900">{app.internships?.title || 'Internship'}</div>
                      <div className="text-sm text-gray-600">{app.internships?.companies?.company_name}</div>
                      <div className="text-xs text-gray-400">Applied: {new Date(app.applied_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                  </div>
                </div>
                {/* Expandable details */}
                {expanded === app.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 border-t pt-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Position</div>
                        <div className="font-medium text-gray-800">{app.internships?.position}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Company</div>
                        <div className="font-medium text-gray-800">{app.internships?.companies?.company_name}</div>
                      </div>
                      {/* Add more details as needed */}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>
      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .bg-grid-pattern {
          background-image: linear-gradient(to right, #a78bfa 1px, transparent 1px),
            linear-gradient(to bottom, #a78bfa 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
} 