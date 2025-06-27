"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchPage from '../../search/page';

export default function CompanySearchWrapper() {
  const router = useRouter();
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
  }, [router]);
  return <SearchPage />;
} 