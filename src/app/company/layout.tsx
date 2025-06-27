'use client';

import CompanyNavbar from '@/components/CompanyNavbar';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <CompanyNavbar />
      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  );
} 