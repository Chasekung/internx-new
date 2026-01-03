-- Fix interview_responses table - add missing column
-- Run this in Supabase SQL Editor

-- Add the missing question_category column
ALTER TABLE interview_responses ADD COLUMN IF NOT EXISTS question_category VARCHAR(50);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interview_responses' 
ORDER BY ordinal_position;

-- Test: Check if there are any responses saved
SELECT COUNT(*) as total_responses, 
       COUNT(question_text) as with_question,
       COUNT(response_text) as with_response
FROM interview_responses;

