import React from "react";
import { Metadata } from 'next';
import ResourcesClient from './ResourcesClient';

// SEO metadata for the resources page
export const metadata: Metadata = {
  title: 'Social Media - Step Up',
  description: 'Connect with Step Up on social media for updates, tips, and opportunities. Follow us on Instagram and LinkedIn for the latest news and insights.',
  keywords: ['Step Up social media', 'Instagram', 'LinkedIn', 'student opportunities', 'career updates'],
  openGraph: {
    title: 'Social Media - Step Up',
    description: 'Connect with Step Up on social media for updates, tips, and opportunities.',
    url: 'https://joinstepup.com/resources',
    siteName: 'Step Up',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Social Media - Step Up',
    description: 'Connect with Step Up on social media for updates, tips, and opportunities.',
  },
  alternates: {
    canonical: 'https://joinstepup.com/resources',
  },
}

export default function ResourcesPage() {
  return <ResourcesClient />;
} 