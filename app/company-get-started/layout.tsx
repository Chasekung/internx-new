import CompanyNavbar from '@/components/CompanyNavbar';

export default function CompanyGetStartedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CompanyNavbar />
      <main>{children}</main>
    </div>
  );
}

