-- QUICK VERIFICATION - Run this in Supabase SQL Editor

-- Check what the actual data looks like
SELECT 
  id,
  full_name,
  interview_completed,
  interview_completed_at,
  skill_score,
  experience_score,
  personality_score,
  overall_match_score
FROM interns
WHERE interview_completed_at IS NOT NULL
ORDER BY interview_completed_at DESC
LIMIT 5;