'use client';

import { usePathname } from 'next/navigation';

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const isFormBuilder = pathname?.includes('/form-builder/');

  return (
    <div className="relative">
      {/* Main content */}
      <main>
        {children}
      </main>
    </div>
  );
} 