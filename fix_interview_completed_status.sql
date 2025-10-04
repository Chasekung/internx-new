-- Fix for users who have interview_completed_at but interview_completed is false
-- This happens when the complete-session API fails or doesn't run properly

-- Check how many users are affected
SELECT 
  COUNT(*) as affected_users,
  'Users with completion date but status false' as description
FROM interns
WHERE interview_completed_at IS NOT NULL
  AND interview_completed = false;

-- See the affected users
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
  AND interview_completed = false;

-- FIX: Set interview_completed to true for all users with a completion date
UPDATE interns
SET interview_completed = true
WHERE interview_completed_at IS NOT NULL
  AND interview_completed = false;

-- Verify the fix
SELECT 
  id,
  full_name,
  interview_completed,
  interview_completed_at,
  skill_score,
  experience_score,
  personality_score
FROM interns
WHERE interview_completed_at IS NOT NULL
ORDER BY interview_completed_at DESC
LIMIT 10;
