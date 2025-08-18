-- Fix storage bucket size limits for large video uploads
-- This script ensures the buckets are properly configured for large file uploads

-- First, let's check the current bucket configuration
SELECT 
  id,
  name,
  public,
  file_size_limit,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  allowed_mime_types
FROM storage.buckets 
WHERE name IN ('application-files', 'application-videos');

-- Update the bucket configurations with proper size limits
UPDATE storage.buckets 
SET 
  file_size_limit = 1073741824,  -- 1GB for videos
  allowed_mime_types = NULL,     -- Allow all video types
  public = true
WHERE id = 'application-videos';

UPDATE storage.buckets 
SET 
  file_size_limit = 10485760,    -- 10MB for files
  allowed_mime_types = NULL,     -- Allow all file types
  public = true
WHERE id = 'application-files';

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES 
  (
    'application-files',
    'application-files', 
    true,
    NULL,
    10485760  -- 10MB limit for files
  ),
  (
    'application-videos',
    'application-videos',
    true, 
    NULL,
    1073741824  -- 1GB limit for videos
  )
ON CONFLICT (id) DO UPDATE SET
  allowed_mime_types = EXCLUDED.allowed_mime_types,
  file_size_limit = EXCLUDED.file_size_limit,
  public = EXCLUDED.public;

-- Verify the updates
SELECT 
  id,
  name,
  public,
  file_size_limit,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  allowed_mime_types,
  CASE 
    WHEN file_size_limit >= 1073741824 THEN '✅ Ready for large videos'
    WHEN file_size_limit >= 10485760 THEN '✅ Ready for files'
    ELSE '❌ Size limit too small'
  END as status
FROM storage.buckets 
WHERE name IN ('application-files', 'application-videos');

-- Check if RLS policies exist
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects' 
  AND policyname LIKE '%application%';

-- Success message
SELECT 'Storage bucket configuration updated successfully!' as result; 