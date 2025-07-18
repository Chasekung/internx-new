-- Clean up large data URLs that are causing database performance issues
-- This script removes the problematic data URLs from the database

-- First, let's see what we're dealing with
SELECT 
  COUNT(*) as total_answers,
  COUNT(CASE WHEN answer_text LIKE 'data:%' THEN 1 END) as data_urls,
  COUNT(CASE WHEN answer_text LIKE 'https://%' THEN 1 END) as storage_urls,
  COUNT(CASE WHEN LENGTH(answer_text) > 1000000 THEN 1 END) as large_answers
FROM response_answers;

-- Remove all data URLs (they're causing the performance issues)
DELETE FROM response_answers 
WHERE answer_text LIKE 'data:%';

-- Remove any broken URLs that have the storage prefix + data URL pattern
DELETE FROM response_answers 
WHERE answer_text LIKE 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/application-files/data:%';

-- Verify cleanup
SELECT 
  COUNT(*) as remaining_answers,
  COUNT(CASE WHEN answer_text LIKE 'data:%' THEN 1 END) as remaining_data_urls,
  COUNT(CASE WHEN answer_text LIKE 'https://%' THEN 1 END) as remaining_storage_urls
FROM response_answers;

-- Show remaining answers (should be much faster now)
SELECT 
  id,
  question_id,
  LEFT(answer_text, 100) as answer_preview,
  LENGTH(answer_text) as answer_length
FROM response_answers 
LIMIT 10;

-- Clean up any orphaned form responses
DELETE FROM form_responses 
WHERE id NOT IN (
  SELECT DISTINCT response_id 
  FROM response_answers 
  WHERE response_id IS NOT NULL
);

-- Clean up any orphaned applications
DELETE FROM applications 
WHERE form_response_id NOT IN (
  SELECT id FROM form_responses
);

-- Verify the cleanup worked
SELECT 'Cleanup complete!' as status; 
-- This script removes the problematic data URLs from the database

-- First, let's see what we're dealing with
SELECT 
  COUNT(*) as total_answers,
  COUNT(CASE WHEN answer_text LIKE 'data:%' THEN 1 END) as data_urls,
  COUNT(CASE WHEN answer_text LIKE 'https://%' THEN 1 END) as storage_urls,
  COUNT(CASE WHEN LENGTH(answer_text) > 1000000 THEN 1 END) as large_answers
FROM response_answers;

-- Remove all data URLs (they're causing the performance issues)
DELETE FROM response_answers 
WHERE answer_text LIKE 'data:%';

-- Remove any broken URLs that have the storage prefix + data URL pattern
DELETE FROM response_answers 
WHERE answer_text LIKE 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/application-files/data:%';

-- Verify cleanup
SELECT 
  COUNT(*) as remaining_answers,
  COUNT(CASE WHEN answer_text LIKE 'data:%' THEN 1 END) as remaining_data_urls,
  COUNT(CASE WHEN answer_text LIKE 'https://%' THEN 1 END) as remaining_storage_urls
FROM response_answers;

-- Show remaining answers (should be much faster now)
SELECT 
  id,
  question_id,
  LEFT(answer_text, 100) as answer_preview,
  LENGTH(answer_text) as answer_length
FROM response_answers 
LIMIT 10;

-- Clean up any orphaned form responses
DELETE FROM form_responses 
WHERE id NOT IN (
  SELECT DISTINCT response_id 
  FROM response_answers 
  WHERE response_id IS NOT NULL
);

-- Clean up any orphaned applications
DELETE FROM applications 
WHERE form_response_id NOT IN (
  SELECT id FROM form_responses
);

-- Verify the cleanup worked
SELECT 'Cleanup complete!' as status; 
-- This script removes the problematic data URLs from the database

-- First, let's see what we're dealing with
SELECT 
  COUNT(*) as total_answers,
  COUNT(CASE WHEN answer_text LIKE 'data:%' THEN 1 END) as data_urls,
  COUNT(CASE WHEN answer_text LIKE 'https://%' THEN 1 END) as storage_urls,
  COUNT(CASE WHEN LENGTH(answer_text) > 1000000 THEN 1 END) as large_answers
FROM response_answers;

-- Remove all data URLs (they're causing the performance issues)
DELETE FROM response_answers 
WHERE answer_text LIKE 'data:%';

-- Remove any broken URLs that have the storage prefix + data URL pattern
DELETE FROM response_answers 
WHERE answer_text LIKE 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/application-files/data:%';

-- Verify cleanup
SELECT 
  COUNT(*) as remaining_answers,
  COUNT(CASE WHEN answer_text LIKE 'data:%' THEN 1 END) as remaining_data_urls,
  COUNT(CASE WHEN answer_text LIKE 'https://%' THEN 1 END) as remaining_storage_urls
FROM response_answers;

-- Show remaining answers (should be much faster now)
SELECT 
  id,
  question_id,
  LEFT(answer_text, 100) as answer_preview,
  LENGTH(answer_text) as answer_length
FROM response_answers 
LIMIT 10;

-- Clean up any orphaned form responses
DELETE FROM form_responses 
WHERE id NOT IN (
  SELECT DISTINCT response_id 
  FROM response_answers 
  WHERE response_id IS NOT NULL
);

-- Clean up any orphaned applications
DELETE FROM applications 
WHERE form_response_id NOT IN (
  SELECT id FROM form_responses
);

-- Verify the cleanup worked
SELECT 'Cleanup complete!' as status; 
-- This script removes the problematic data URLs from the database

-- First, let's see what we're dealing with
SELECT 
  COUNT(*) as total_answers,
  COUNT(CASE WHEN answer_text LIKE 'data:%' THEN 1 END) as data_urls,
  COUNT(CASE WHEN answer_text LIKE 'https://%' THEN 1 END) as storage_urls,
  COUNT(CASE WHEN LENGTH(answer_text) > 1000000 THEN 1 END) as large_answers
FROM response_answers;

-- Remove all data URLs (they're causing the performance issues)
DELETE FROM response_answers 
WHERE answer_text LIKE 'data:%';

-- Remove any broken URLs that have the storage prefix + data URL pattern
DELETE FROM response_answers 
WHERE answer_text LIKE 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/application-files/data:%';

-- Verify cleanup
SELECT 
  COUNT(*) as remaining_answers,
  COUNT(CASE WHEN answer_text LIKE 'data:%' THEN 1 END) as remaining_data_urls,
  COUNT(CASE WHEN answer_text LIKE 'https://%' THEN 1 END) as remaining_storage_urls
FROM response_answers;

-- Show remaining answers (should be much faster now)
SELECT 
  id,
  question_id,
  LEFT(answer_text, 100) as answer_preview,
  LENGTH(answer_text) as answer_length
FROM response_answers 
LIMIT 10;

-- Clean up any orphaned form responses
DELETE FROM form_responses 
WHERE id NOT IN (
  SELECT DISTINCT response_id 
  FROM response_answers 
  WHERE response_id IS NOT NULL
);

-- Clean up any orphaned applications
DELETE FROM applications 
WHERE form_response_id NOT IN (
  SELECT id FROM form_responses
);

-- Verify the cleanup worked
SELECT 'Cleanup complete!' as status; 