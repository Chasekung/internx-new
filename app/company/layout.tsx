'use client';

import { usePathname } from 'next/navigation';
import CompanyNavbar from '@/components/CompanyNavbar';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isFormBuilder = pathname?.includes('/form-builder');

  return (
    <div className="relative">
      {/* Hide CompanyNavbar on form-builder pages as they have their own navigation */}
      {!isFormBuilder && <CompanyNavbar />}
      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  );
} 