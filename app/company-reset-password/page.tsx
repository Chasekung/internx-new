"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function CompanyResetPassword() {
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");
    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/company-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reset failed");
      setMessage("Password reset successful! You can now sign in.");
      setTimeout(() => router.push("/company-sign-in"), 2000);
    } catch (err: any) {
      setError(err.message || "Reset failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <form onSubmit={handleSubmit} className="bg-white/80 p-8 rounded-2xl shadow-xl w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-4">Set New Password</h1>
        {message && <div className="bg-green-100 text-green-700 p-2 rounded">{message}</div>}
        {error && <div className="bg-red-100 text-red-700 p-2 rounded">{error}</div>}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            required
            value={form.newPassword}
            onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={form.confirmPassword}
            onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold disabled:opacity-60">
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
} 