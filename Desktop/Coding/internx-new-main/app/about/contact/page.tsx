"use client";

import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

export default function ContactPage() {
  const [state, handleSubmit] = useForm('mzzvbrzj');
  if (state.succeeded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative pt-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 max-w-xl w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold text-blue-700 mb-2">Thank you!</h2>
          <p className="text-lg text-gray-700">Your message has been sent. We'll get back to you soon.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 relative pt-20">
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
  );
} 