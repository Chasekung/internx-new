-- ============================================================================
-- ENABLE MULTIPLE INTERVIEW TYPES
-- ============================================================================
-- This script modifies your existing interview system to support:
-- 1. Multiple different interview types (not just one interview per user)
-- 2. Unlimited retakes per interview type
-- 3. Tracking scores and feedback per session
--
-- Run this in Supabase SQL Editor.
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD INTERVIEW TYPE COLUMNS TO INTERVIEW_SESSIONS
-- ============================================================================
-- These columns identify which type of interview was taken

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS interview_type VARCHAR(255);

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS interview_title VARCHAR(255);

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS interview_category VARCHAR(100);

-- ============================================================================
-- STEP 2: ADD SCORE AND FEEDBACK COLUMNS TO INTERVIEW_SESSIONS
-- ============================================================================
-- Each session can have its own scores (not just on interns table)

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS overall_score DECIMAL(5,2);

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS feedback_summary TEXT;

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS detailed_feedback TEXT;

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS skill_scores JSONB DEFAULT '{}';

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}';

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS improvements TEXT[] DEFAULT '{}';

ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- ============================================================================
-- STEP 3: CREATE INDEX FOR FASTER LOOKUPS BY TYPE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_interview_sessions_type 
ON interview_sessions(intern_id, interview_type);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_status_type 
ON interview_sessions(intern_id, session_status, interview_type);

-- ============================================================================
-- STEP 4: CREATE A VIEW FOR EASY QUERYING OF COMPLETED INTERVIEWS
-- ============================================================================

CREATE OR REPLACE VIEW user_completed_interviews AS
SELECT 
    id,
    intern_id,
    interview_type,
    interview_title,
    interview_category,
    session_status,
    started_at,
    completed_at,
    overall_score,
    feedback_summary,
    duration_seconds,
    skill_scores,
    strengths,
    improvements
FROM interview_sessions
WHERE session_status = 'completed'
ORDER BY completed_at DESC;

-- ============================================================================
-- STEP 5: UPDATE EXISTING SESSIONS (Optional)
-- ============================================================================
-- Set a default interview_type for existing sessions that don't have one

UPDATE interview_sessions 
SET interview_type = 'general-interview',
    interview_title = 'General Interview',
    interview_category = 'General'
WHERE interview_type IS NULL;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Check that the new columns were added

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interview_sessions' 
AND column_name IN ('interview_type', 'interview_title', 'interview_category', 'overall_score', 'feedback_summary', 'skill_scores')
ORDER BY column_name;

