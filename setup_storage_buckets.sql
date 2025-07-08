-- Setup Storage Buckets for File Uploads
-- Run this in your Supabase SQL Editor to create the required storage buckets

-- Create application-files bucket for file uploads
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'application-files',
  'application-files', 
  true,
  ARRAY['*/*'],
  10485760  -- 10MB limit for files
)
ON CONFLICT (id) DO NOTHING;

-- Create application-videos bucket for video uploads  
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'application-videos',
  'application-videos',
  true, 
  ARRAY['video/*'],
  1073741824  -- 1GB limit for videos
)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for application-files bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload application files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'application-files');

-- Allow authenticated users to view files
CREATE POLICY "Authenticated users can view application files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'application-files');

-- Allow public access to files (for viewing uploaded files)
CREATE POLICY "Public can view application files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'application-files');

-- Create RLS policies for application-videos bucket
-- Allow authenticated users to upload videos
CREATE POLICY "Authenticated users can upload application videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'application-videos');

-- Allow authenticated users to view videos
CREATE POLICY "Authenticated users can view application videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'application-videos');

-- Allow public access to videos (for viewing uploaded videos)
CREATE POLICY "Public can view application videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'application-videos');

-- Verify buckets were created
SELECT 
  id,
  name,
  public,
  allowed_mime_types,
  file_size_limit
FROM storage.buckets 
WHERE name IN ('application-files', 'application-videos'); 