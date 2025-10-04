-- VERIFY THE SQL FIX WORKED
-- Run this in Supabase SQL Editor to check

-- Check 1: Are there still users with completion date but false status?
SELECT 
  COUNT(*) as users_with_completion_date_but_false_status
FROM interns
WHERE interview_completed_at IS NOT NULL
  AND interview_completed = false;

-- Check 2: Show all users with completion dates
SELECT 
  id,
  full_name,
  email,
  interview_completed,
  interview_completed_at,
  skill_score,
  experience_score,
  personality_score
FROM interns
WHERE interview_completed_at IS NOT NULL
ORDER BY interview_completed_at DESC
LIMIT 10;

-- Check 3: Count total completed users
SELECT 
  COUNT(*) as total_with_completion_date,
  COUNT(CASE WHEN interview_completed = true THEN 1 END) as marked_completed,
  COUNT(CASE WHEN interview_completed = false THEN 1 END) as marked_incomplete
FROM interns
WHERE interview_completed_at IS NOT NULL;