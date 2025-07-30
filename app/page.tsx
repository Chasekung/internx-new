import Link from 'next/link'
import { Metadata } from 'next'
import HomeClient from './HomeClient'

// SEO metadata for the homepage
export const metadata: Metadata = {
  title: 'Step Up - AI-Powered High School Internship & Opportunity Platform',
  description: 'Breaking down barriers for high school students to connect with meaningful opportunities. AI-powered matching and mentorship for internships, volunteering, and skill-building.',
  keywords: ['high school internships', 'student opportunities', 'teen internships', 'AI matching', 'career development', 'volunteering opportunities'],
  openGraph: {
    title: 'Step Up - AI-Powered High School Internship & Opportunity Platform',
    description: 'Breaking down barriers for high school students to connect with meaningful opportunities. AI-powered matching and mentorship.',
    url: 'https://joinstepup.com',
    siteName: 'Step Up',
    images: [
      {
        url: '/stepup-logo.png',
        width: 1200,
        height: 630,
        alt: 'Step Up - AI-Powered High School Internship Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Step Up - AI-Powered High School Internship & Opportunity Platform',
    description: 'Breaking down barriers for high school students to connect with meaningful opportunities.',
    images: ['/stepup-logo.png'],
  },
  alternates: {
    canonical: 'https://joinstepup.com',
  },
}

export default function Home() {
  return <HomeClient />;
}
