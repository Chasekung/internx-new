"use client";
import React from "react";

export default function B2BPricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="relative z-10 max-w-3xl mx-auto py-28 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-12 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">For Businesses</h1>
        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Monthly Plan */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Monthly Plan</h2>
            <button className="mb-4 px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all duration-200">Start Monthly Plan</button>
            <span className="text-base font-normal text-gray-500 mb-4">$39/month</span>
            <ul className="list-disc ml-4 text-gray-700 space-y-1 text-left">
              <li>3–5 active listings</li>
              <li>Basic AI matching</li>
              <li>Email support</li>
              <li>Branded company profile page</li>
              <li>Save intern profiles to "talent pool"</li>
            </ul>
          </section>
          {/* Yearly Plan */}
          <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">Yearly Plan</h2>
            <button className="mb-4 px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all duration-200">Start Yearly Plan</button>
            <span className="text-base font-normal text-gray-500 mb-4">$399/year</span>
            <ul className="list-disc ml-4 text-gray-700 space-y-1 text-left">
              <li>5–9 active internship listings</li>
              <li>Advanced AI matching & filters</li>
              <li>Branded company profile page</li>
              <li>Internship analytics dashboard</li>
              <li>Save intern profiles to "talent pool"</li>
              <li>Add up to 5 team members</li>
              <li>Built-in onboarding/legal docs (work permits, parental consent)</li>
              <li>Priority email support</li>
            </ul>
          </section>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Discounts available for nonprofits and schools. Post-trial upgrades include a 10–15% first-year discount.</p>
        </div>
        {/* Custom Pricing Section for Businesses */}
        <div className="mt-12 flex flex-col items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center">
            <h3 className="text-2xl font-bold text-blue-700 mb-2">Need Something Different?</h3>
            <p className="text-gray-700 mb-4 text-center">None of the options fit your needs? Contact us for custom pricing and solutions tailored to your organization.</p>
            <a href="/about/contact" className="inline-block px-6 py-3 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all duration-200">Contact Us</a>
          </div>
        </div>
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">For Non-Profits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Non-Profit Monthly Plan */}
            <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">Monthly Plan</h3>
              <button className="mb-4 px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all duration-200">Start Monthly Plan</button>
              <span className="text-base font-normal text-gray-500 mb-4">$14.99/month</span>
              <ul className="list-disc ml-4 text-gray-700 space-y-1 text-left">
                <li>Up to 3 active volunteer listings</li>
                <li>Basic AI matching</li>
                <li>Email support</li>
                <li>Branded organization profile page</li>
              </ul>
            </section>
            {/* Non-Profit Yearly Plan */}
            <section className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 flex flex-col items-center">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">Yearly Plan</h3>
              <button className="mb-4 px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all duration-200">Start Yearly Plan</button>
              <span className="text-base font-normal text-gray-500 mb-4">$99/year</span>
              <ul className="list-disc ml-4 text-gray-700 space-y-1 text-left">
                <li>Up to 5 active volunteer listings</li>
                <li>Basic AI matching</li>
                <li>Email support</li>
                <li>Branded organization profile page</li>
                <li>Save volunteer profiles to "talent pool"</li>
              </ul>
            </section>
          </div>
          {/* Custom Pricing Section for Nonprofits */}
          <div className="mt-12 flex flex-col items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center">
              <h3 className="text-2xl font-bold text-blue-700 mb-2">Need Something Different?</h3>
              <p className="text-gray-700 mb-4 text-center">None of the options fit your needs? Contact us for custom nonprofit pricing and solutions.</p>
              <a href="/about/contact" className="inline-block px-6 py-3 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-all duration-200">Contact Us</a>
            </div>
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