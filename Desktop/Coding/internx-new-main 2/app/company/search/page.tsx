"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkCompanyAuth } from '@/lib/companyAuth';
import SearchPage from '../../search/page';

export default function CompanySearchWrapper() {
  const router = useRouter();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { isCompany, error } = await checkCompanyAuth();
      
      if (!isCompany) {
        console.log('Company auth failed:', error);
        router.replace('/company-sign-in');
        return;
      }
    };

    checkAuth();
  }, [router]);
  
  return <SearchPage />;
} 