-- Fix storage bucket mime type restrictions to allow all file types including images
-- This migration ensures PNG and other image files can be uploaded to application-files bucket

-- Update application-files bucket to allow all file types including images
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['*/*'],
  file_size_limit = 10485760  -- 10MB limit for files
WHERE id = 'application-files';

-- Update application-videos bucket with 1GB limit and ensure video types are allowed
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY['video/*'],
  file_size_limit = 1073741824  -- 1GB limit for videos
WHERE id = 'application-videos';

-- Ensure both buckets exist with correct settings
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

-- Verify the bucket configurations
SELECT 
  id,
  name,
  public,
  allowed_mime_types,
  file_size_limit
FROM storage.buckets 
WHERE name IN ('application-files', 'application-videos'); 