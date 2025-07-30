import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ClientLayout from '@/components/ClientLayout'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: {
    default: 'Step Up - AI-Powered High School Internship & Opportunity Platform',
    template: '%s | Step Up'
  },
  description: 'Connect high school students with meaningful internships, volunteering, and skill-building opportunities. AI-powered matching platform for career development.',
  keywords: ['high school internships', 'student opportunities', 'teen internships', 'career development', 'AI matching', 'volunteering opportunities', 'skill building'],
  authors: [{ name: 'Step Up Team' }],
  creator: 'Step Up',
  publisher: 'Step Up',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://joinstepup.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://joinstepup.com',
    title: 'Step Up - AI-Powered High School Internship & Opportunity Platform',
    description: 'Connect high school students with meaningful internships, volunteering, and skill-building opportunities. AI-powered matching platform for career development.',
    siteName: 'Step Up',
    images: [
      {
        url: '/stepup-logo.png',
        width: 1200,
        height: 630,
        alt: 'Step Up - AI-Powered High School Internship Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Step Up - AI-Powered High School Internship & Opportunity Platform',
    description: 'Connect high school students with meaningful internships, volunteering, and skill-building opportunities.',
    images: ['/stepup-logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Add your Google verification code
  },
  icons: {
    icon: [
      {
        url: '/android-chrome-192x192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        url: '/android-chrome-512x512.png',
        type: 'image/png',
        sizes: '512x512',
      },
      {
        url: '/apple-touch-icon.png',
        type: 'image/png',
        sizes: '180x180',
      },
      {
        url: '/favicon-16x16.png',
        type: 'image/png',
        sizes: '16x16',
      },
      {
        url: '/favicon-32x32.png',
        type: 'image/png',
        sizes: '32x32',
      },
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
        sizes: 'any',
      },
      {
        url: '/stepup-logo.png',
        type: 'image/png',
        sizes: '593x620',
      },
    ],
    shortcut: '/favicon.ico',
    apple: {
      url: '/apple-touch-icon.png',
      type: 'image/png',
      sizes: '180x180',
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Structured Data for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Step Up",
              "url": "https://joinstepup.com",
              "logo": "https://joinstepup.com/stepup-logo.png",
              "description": "AI-powered platform connecting high school students with meaningful internships, volunteering, and skill-building opportunities.",
              "foundingDate": "2025",
              "sameAs": [
                "https://www.instagram.com/stepuphs.67/",
                "https://www.linkedin.com/company/join-step-up"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "url": "https://joinstepup.com/about/contact"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              }
            })
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased min-h-screen flex flex-col bg-transparent relative`}>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
} 