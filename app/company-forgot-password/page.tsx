"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyForgotPassword() {
  const [form, setForm] = useState({ identifier: "", email: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/company-forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessage("If an account exists, a reset link has been sent to the email.");
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <form onSubmit={handleSubmit} className="bg-white/80 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">Reset Company Password</h1>
        {message && <div className="bg-green-100 text-green-700 p-2 rounded">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
        <div>
          <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            required
            value={form.identifier}
            onChange={e => setForm(f => ({ ...f, identifier: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-black"
          />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 font-semibold disabled:opacity-60">
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
} 