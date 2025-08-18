import React from "react";
import { Metadata } from 'next';
import BlogClient from './BlogClient';

// SEO metadata for the blog page
export const metadata: Metadata = {
  title: 'Blog - Step Up',
  description: 'Insights, tips, and stories from the world of high school opportunities and career development. Expert advice for students and career guidance.',
  keywords: ['high school blog', 'student career advice', 'internship tips', 'career development blog', 'student success stories'],
  openGraph: {
    title: 'Blog - Step Up',
    description: 'Insights, tips, and stories from the world of high school opportunities and career development.',
    url: 'https://joinstepup.com/blog',
    siteName: 'Step Up',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Blog - Step Up',
    description: 'Insights, tips, and stories from the world of high school opportunities and career development.',
  },
  alternates: {
    canonical: 'https://joinstepup.com/blog',
  },
}

export default function BlogPage() {
  return <BlogClient />;
} 