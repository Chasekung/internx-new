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
  const companyPages = ['/company', '/company-get-started', '/company-sign-in', '/company-forgot-password', '/company-reset-password', '/company-dash', '/company/opportunities', '/company/search', '/company/messaging', '/company/postings', '/company/view-responses', '/company/form-builder', '/company/public-profile', '/company/edit-page'];
  
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
        
        <main className="mobile-safe-area pt-20">
          {children}
        </main>
        
        <footer className="glass-effect mt-auto border-t border-gray-200">
          <div className="mobile-container py-8 sm:py-12">
            <div className="mobile-grid md:grid-cols-4">
              <div className="mobile-responsive-spacing">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">About</h3>
                <ul className="mobile-responsive-spacing space-y-2">
                  <li>
                    <Link href="/about/step-up" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/about/contact" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mobile-responsive-spacing">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">For Students</h3>
                <ul className="mobile-responsive-spacing space-y-2">
                  <li>
                    <Link href="/intern-get-started" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Create Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/opportunities" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Browse Opportunities
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Social Media
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mobile-responsive-spacing">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">For Companies</h3>
                <ul className="mobile-responsive-spacing space-y-2">
                  <li>
                    <Link href="/company" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Register Company
                    </Link>
                  </li>
                  <li>
                    <Link href="/company/b2b-pricing" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/company" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Post an Internship
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="mobile-responsive-spacing">
                <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                <ul className="mobile-responsive-spacing space-y-2">
                  <li>
                    <Link href="/privacy" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="mobile-text text-gray-500 hover:text-gray-900 transition-colors">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-6 sm:mt-8 border-t border-gray-200 pt-6 sm:pt-8">
              <p className="mobile-text text-gray-400 text-center">
                © {new Date().getFullYear()} Step Up. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default ClientLayout;// Updated: Mon Aug 18 19:23:30 KST 2025
