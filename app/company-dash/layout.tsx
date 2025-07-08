import CompanyNavbar from '@/components/CompanyNavbar';

export default function CompanyDashLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CompanyNavbar />
      <main>{children}</main>
    </div>
  );
} 