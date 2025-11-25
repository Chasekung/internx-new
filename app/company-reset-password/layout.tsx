import CompanyNavbar from '@/components/CompanyNavbar';

export default function CompanyResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CompanyNavbar />
      <main>{children}</main>
    </div>
  );
}

