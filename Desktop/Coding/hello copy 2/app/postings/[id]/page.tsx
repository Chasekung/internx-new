import { notFound } from 'next/navigation';
import { getPostingAndCompanyDetails } from '@/lib/postingUtils';
import PublicPostingContent from './PublicPostingContent';

export default async function PostingPage({ params }: { params: { id: string } }) {
  const posting = await getPostingAndCompanyDetails(params.id);

  if (!posting) {
    console.log('Redirecting to 404 - no posting found for ID:', params.id);
    notFound();
  }

  return <PublicPostingContent posting={posting} />;
} 