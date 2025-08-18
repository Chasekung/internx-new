"use client";

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

export default function ContactPage() {
  const [state, handleSubmit] = useForm('mzzvbrzj');
  if (state.succeeded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-40 w-80 h-80 bg-violet-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Decorative grid pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundSize: '25px 25px',
            backgroundImage: `
              linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
            `
          }}
        ></div>

        <div className="relative min-h-screen flex flex-col items-center justify-center pt-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center">
            <h2 className="text-3xl font-bold text-blue-700 mb-2">Thank you!</h2>
            <p className="text-lg text-gray-700">Your message has been sent. We'll get back to you soon.</p>
          </div>
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
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundSize: '25px 25px',
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `
        }}
      ></div>

      <div className="relative min-h-screen flex flex-col items-center justify-center pt-20">
        <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-xl w-full flex flex-col gap-4">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">Contact Us</h2>
          <label htmlFor="email" className="font-semibold text-gray-700">Email Address</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
          <label htmlFor="message" className="font-semibold text-gray-700">Message</label>
          <textarea
            id="message"
            name="message"
            required
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-black"
            rows={5}
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
          <button
            type="submit"
            disabled={state.submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md transition disabled:opacity-50"
          >
            {state.submitting ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
} 