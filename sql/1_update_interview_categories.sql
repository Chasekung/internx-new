-- STEP 1: Update interview_sessions table for new categories
-- Run this FIRST in Supabase SQL Editor

-- Add difficulty level to sessions
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'medium' 
CHECK (difficulty_level IN ('easy', 'medium', 'hard'));

-- Add interview subcategory for specific interview types
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS interview_subcategory VARCHAR(100);

-- Add task type for interactive sections (coding, whiteboard, etc.)
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS task_type VARCHAR(50);

-- Add task content (code, equations, drawings stored as JSON)
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS task_submissions JSONB DEFAULT '[]'::jsonb;

-- Verify columns added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'interview_sessions' 
AND column_name IN ('difficulty_level', 'interview_subcategory', 'task_type', 'task_submissions')
ORDER BY column_name;

