'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserNav from './UserNav';
import CompanyNav from './CompanyNav';
import CompanyNavbar from './CompanyNavbar';
import UserNavbar from './UserNavbar';

function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname();
  
  // Define company pages
  const companyPages = ['/company', '/company-get-started', '/company-sign-in', '/company-forgot-password', '/company-reset-password', '/company-dash', '/company/opportunities', '/company/search', '/company/messaging', '/company/postings', '/company/view-responses', '/company/form-builder', '/company/public-profile'];
  
  const isCompanyPage = companyPages.some(page => pathname?.startsWith(page));

  return (
    <>
      {/* Background gradients */}
      <div className="background-container">
        <div className="gradient-orb"></div>
        <div className="gradient-orb"></div>
        <div className="gradient-orb"></div>
        <div className="gradient-orb"></div>
        <div className="noise-overlay"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {isCompanyPage ? <CompanyNavbar /> : <UserNavbar />}
        
        <main>
          {children}
        </main>
        
        <footer className="glass-effect mt-auto">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/about/step-up" className="text-base text-gray-500 hover:text-gray-900">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/about/contact" className="text-base text-gray-500 hover:text-gray-900">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-base text-gray-500 hover:text-gray-900">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">For Students</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/intern-get-started" className="text-base text-gray-500 hover:text-gray-900">
                      Create Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/opportunities" className="text-base text-gray-500 hover:text-gray-900">
                      Browse Opportunities
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources" className="text-base text-gray-500 hover:text-gray-900">
                      Resources
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">For Companies</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/company" className="text-base text-gray-500 hover:text-gray-900">
                      Register Company
                    </Link>
                  </li>
                  <li>
                    <Link href="/company/b2b-pricing" className="text-base text-gray-500 hover:text-gray-900">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/company" className="text-base text-gray-500 hover:text-gray-900">
                      Post an Internship
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                <ul className="mt-4 space-y-4">
                  <li>
                    <Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-base text-gray-500 hover:text-gray-900">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-8 border-t border-gray-200 pt-8">
              <p className="text-base text-gray-400 text-center">
                © {new Date().getFullYear()} Step Up. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default ClientLayout;