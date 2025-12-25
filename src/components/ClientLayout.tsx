'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
      {/* Refined Background - Fewer elements, larger, more subtle */}
      <div className="background-container">
        {/* Only 2 large ambient orbs instead of 4 */}
        <div className="gradient-orb"></div>
        <div className="gradient-orb"></div>
        {/* Subtle noise texture */}
        <div className="noise-overlay"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10">
        {isCompanyPage ? <CompanyNavbar /> : <UserNavbar />}
        
        {/* Adjusted padding for floating navbar */}
        <main className="mobile-safe-area pt-24">
          {children}
        </main>
        
        {/* Refined Footer */}
        <footer className="mt-auto border-t border-slate-200/50 dark:border-slate-700/30 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
          <div className="mobile-container py-12 sm:py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {/* About Column */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-4">About</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/about/step-up" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/about/contact" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Students Column */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-4">For Students</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/intern-get-started" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Create Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/opportunities" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Browse Opportunities
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Resources
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Companies Column */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-4">For Companies</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/company" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Register
                    </Link>
                  </li>
                  <li>
                    <Link href="/company/b2b-pricing" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/company" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Post Opportunity
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal Column */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-4">Legal</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/privacy" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/cookies" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="mt-12 pt-8 border-t border-slate-200/50 dark:border-slate-700/30 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} Step Up. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a 
                  href="https://www.instagram.com/stepuphs.67/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.linkedin.com/company/join-step-up" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export default ClientLayout;
