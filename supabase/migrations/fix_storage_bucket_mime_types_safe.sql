-- Fix storage bucket mime type restrictions to allow all file types including images (SAFE VERSION)
-- This migration ensures PNG and other image files can be uploaded to application-files bucket

-- Check if buckets exist before updating
DO $$
BEGIN
  -- Update application-files bucket if it exists
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'application-files') THEN
    UPDATE storage.buckets 
    SET 
      allowed_mime_types = ARRAY['*/*'],
      file_size_limit = 10485760  -- 10MB limit for files
    WHERE id = 'application-files';
    
    RAISE NOTICE 'Updated application-files bucket mime types and size limit';
  END IF;

  -- Update application-videos bucket if it exists
  IF EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'application-videos') THEN
    UPDATE storage.buckets 
    SET 
      allowed_mime_types = ARRAY['video/*'],
      file_size_limit = 1073741824  -- 1GB limit for videos
    WHERE id = 'application-videos';
    
    RAISE NOTICE 'Updated application-videos bucket mime types and size limit';
  END IF;
END $$;

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES 
  (
    'application-files',
    'application-files', 
    true,
    ARRAY['*/*'],
    10485760  -- 10MB limit for files
  ),
  (
    'application-videos',
    'application-videos',
    true, 
    ARRAY['video/*'],
    1073741824  -- 1GB limit for videos
  )
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit = EXCLUDED.file_size_limit,
  public = EXCLUDED.public;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Policies for application-files bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload application files'
  ) THEN
    CREATE POLICY "Authenticated users can upload application files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'application-files');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view application files'
  ) THEN
    CREATE POLICY "Public can view application files"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'application-files');
  END IF;

  -- Policies for application-videos bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload application videos'
  ) THEN
    CREATE POLICY "Authenticated users can upload application videos"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'application-videos');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view application videos'
  ) THEN
    CREATE POLICY "Public can view application videos"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'application-videos');
  END IF;
END $$;

-- Verify the bucket configurations
SELECT 
  id,
  name,
  public,
  allowed_mime_types,
  file_size_limit
FROM storage.buckets 
WHERE name IN ('application-files', 'application-videos'); 