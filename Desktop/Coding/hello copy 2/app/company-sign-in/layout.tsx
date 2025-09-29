import CompanyNavbar from '@/components/CompanyNavbar';

export default function CompanySignInLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CompanyNavbar />
      <main>{children}</main>
    </div>
  );
} 