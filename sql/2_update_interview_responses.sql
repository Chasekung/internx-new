-- STEP 2: Update interview_responses for task submissions
-- Run this SECOND in Supabase SQL Editor

-- Add difficulty level to each question
ALTER TABLE interview_responses 
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'medium';

-- Add task submission for coding/whiteboard questions
ALTER TABLE interview_responses 
ADD COLUMN IF NOT EXISTS task_submission JSONB;

-- Add AI evaluation of task (for coding, math, etc.)
ALTER TABLE interview_responses 
ADD COLUMN IF NOT EXISTS task_evaluation JSONB;

-- Verify columns added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interview_responses' 
AND column_name IN ('difficulty_level', 'task_submission', 'task_evaluation')
ORDER BY column_name;

