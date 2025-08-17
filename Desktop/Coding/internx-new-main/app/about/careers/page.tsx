"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 relative overflow-hidden">
      {/* Bubbly Gradient Background - Updated to match home page style */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        <div className="absolute top-20 right-20 w-60 h-60 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-6000"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-8000"></div>
        
        {/* Additional bubbles to fill the page */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-1000"></div>
        <div className="absolute top-3/4 right-1/3 w-56 h-56 bg-green-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-3000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-48 h-48 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-5000"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-7000"></div>
        <div className="absolute top-1/6 right-1/6 w-52 h-52 bg-red-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-9000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-44 h-44 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-11000"></div>
        <div className="absolute top-2/3 left-1/6 w-36 h-36 bg-lime-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-13000"></div>
        <div className="absolute bottom-1/6 left-2/3 w-68 h-68 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-15000"></div>
      </div>

      {/* Header Section */}
      <div className="bg-white shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help us revolutionize the internship and volunteering experience for students and companies alike.
            </p>
          </div>
        </div>
      </div>

      {/* Currently Not Hiring Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center backdrop-blur-sm bg-white/90">
          <div className="mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
              <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Currently Not Hiring</h2>
            <p className="text-lg text-gray-600 mb-6">
              We're not actively hiring at the moment, but we're always looking for passionate individuals to join our mission.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-blue-900 mb-3">Stay Connected</h3>
            <p className="text-blue-700 mb-4">
              While we're not hiring right now, we encourage you to stay connected with us. 
              We'll post new opportunities here when they become available.
            </p>
            <p className="text-blue-600 text-sm">
              Follow us on social media or check back here periodically for updates.
            </p>
          </div>
        </div>
      </div>

      {/* Internship Opportunity Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center backdrop-blur-sm bg-white/90">
          <div className="mb-6">
            <div className="mx-auto mb-6">
              <Image
                src="/stepupflat.png"
                alt="Step Up"
                width={200}
                height={60}
                className="mx-auto"
              />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Interested in Interning with Step Up?</h2>
            <p className="text-xl text-gray-700 mb-6">
              We're always looking for passionate high school students who want to gain real-world experience 
              and make a difference in their community.
            </p>
            <p className="text-lg text-gray-600 mb-8">
              Join our team and help us build the future of student opportunities.
            </p>
          </div>
          <Link 
            href="/intern-sign-in"
            className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Apply to Intern with Us
            <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white border-t border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Work with Step Up?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Make an Impact</h4>
                <p className="text-gray-600">
                  Help connect students with meaningful opportunities that shape their future careers.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 mb-4">
                  <svg className="h-6 w-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Collaborative Culture</h4>
                <p className="text-gray-600">
                  Work with a team of passionate high school students and industry professionals.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Innovation</h4>
                <p className="text-gray-600">
                  Be part of building the next generation of student opportunity platforms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-5000 {
          animation-delay: 5s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
        .animation-delay-7000 {
          animation-delay: 7s;
        }
        .animation-delay-8000 {
          animation-delay: 8s;
        }
        .animation-delay-9000 {
          animation-delay: 9s;
        }
        .animation-delay-11000 {
          animation-delay: 11s;
        }
        .animation-delay-13000 {
          animation-delay: 13s;
        }
        .animation-delay-15000 {
          animation-delay: 15s;
        }
      `}</style>
    </div>
  );
} 