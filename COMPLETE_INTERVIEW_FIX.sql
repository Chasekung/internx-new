-- ==========================================
-- COMPLETE FIX FOR AI INTERVIEW STATUS ISSUE
-- ==========================================

-- STEP 1: Identify the problem
-- Check users with completion date but false status
SELECT 
  id,
  full_name,
  email,
  interview_completed,
  interview_completed_at,
  skill_score,
  experience_score,
  personality_score,
  overall_match_score
FROM interns
WHERE interview_completed_at IS NOT NULL
ORDER BY interview_completed_at DESC;

-- STEP 2: Fix existing users
-- Set interview_completed to true for all users with a completion date
UPDATE interns
SET interview_completed = true
WHERE interview_completed_at IS NOT NULL
  AND interview_completed = false;

-- STEP 3: Verify the fix worked
SELECT 
  COUNT(*) as total_completed,
  COUNT(CASE WHEN interview_completed = true THEN 1 END) as marked_completed,
  COUNT(CASE WHEN interview_completed = false THEN 1 END) as marked_incomplete
FROM interns
WHERE interview_completed_at IS NOT NULL;

-- STEP 4: Check for users without scores (these might need re-interview)
SELECT 
  id,
  full_name,
  interview_completed,
  skill_score,
  experience_score,
  personality_score
FROM interns
WHERE interview_completed = true
  AND (skill_score IS NULL OR experience_score IS NULL OR personality_score IS NULL);

-- STEP 5: Optional - Reset users who need to retake interview
-- (Only run this if you want users without scores to retake)
-- UPDATE interns
-- SET 
--   interview_completed = false,
--   interview_completed_at = NULL
-- WHERE interview_completed = true
--   AND (skill_score IS NULL OR experience_score IS NULL OR personality_score IS NULL);
