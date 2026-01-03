-- Create storage bucket for hs_news images
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'hs-news-images',
  'hs-news-images', 
  true,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  10485760  -- 10MB limit for higher quality images
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760;

-- RLS policies for hs-news-images bucket
-- Allow authenticated users to upload (admin check done in API)
CREATE POLICY "Authenticated users can upload hs_news images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hs-news-images');

-- Allow public to view images
CREATE POLICY "Public can view hs_news images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hs-news-images');

-- Allow authenticated users to delete (admin check done in API)
CREATE POLICY "Authenticated users can delete hs_news images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hs-news-images');

