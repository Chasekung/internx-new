import CompanyNavbar from '@/components/CompanyNavbar';

export default function CompanyForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      <CompanyNavbar />
      <main>{children}</main>
    </div>
  );
}

