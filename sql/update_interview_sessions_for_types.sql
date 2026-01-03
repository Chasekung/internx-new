-- ============================================================================
-- UPDATE INTERVIEW SESSIONS TABLE FOR INTERVIEW TYPES
-- ============================================================================
-- Copy and paste this into the Supabase SQL Editor and run it.
-- This adds support for different interview types and retakable interviews.
-- ============================================================================

-- ============================================================================
-- 1. ADD NEW COLUMNS TO INTERVIEW_SESSIONS TABLE
-- ============================================================================

-- Add interview_type column to identify which interview was taken
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS interview_type VARCHAR(255);

-- Add interview_title for display purposes
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS interview_title VARCHAR(255);

-- Add interview_category for grouping
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS interview_category VARCHAR(100);

-- Add overall_score for the session (0-100)
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS overall_score DECIMAL(5,2);

-- Add feedback_summary for quick display
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS feedback_summary TEXT;

-- Add detailed_feedback for expanded view
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS detailed_feedback TEXT;

-- Add skill_scores as JSONB for breakdown (e.g., {"communication": 85, "technical": 72})
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS skill_scores JSONB DEFAULT '{}';

-- Add strengths array
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS strengths TEXT[] DEFAULT '{}';

-- Add improvements array  
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS improvements TEXT[] DEFAULT '{}';

-- Add duration_seconds for tracking
ALTER TABLE interview_sessions 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- ============================================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_interview_sessions_interview_type 
ON interview_sessions(interview_type);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_intern_type 
ON interview_sessions(intern_id, interview_type);

CREATE INDEX IF NOT EXISTS idx_interview_sessions_completed 
ON interview_sessions(intern_id, session_status, started_at DESC);

-- ============================================================================
-- 3. UPDATE RLS POLICIES (if not already set)
-- ============================================================================

-- Ensure RLS is enabled
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them (safe approach)
DROP POLICY IF EXISTS "Users can view own sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON interview_sessions;
DROP POLICY IF EXISTS "Users can update own sessions" ON interview_sessions;

-- Users can view their own sessions
CREATE POLICY "Users can view own sessions" ON interview_sessions
    FOR SELECT USING (auth.uid() = intern_id);

-- Users can create their own sessions
CREATE POLICY "Users can insert own sessions" ON interview_sessions
    FOR INSERT WITH CHECK (auth.uid() = intern_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions" ON interview_sessions
    FOR UPDATE USING (auth.uid() = intern_id);

-- ============================================================================
-- 4. CREATE FUNCTION TO CALCULATE SESSION DURATION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.session_status = 'completed' AND NEW.completed_at IS NOT NULL AND NEW.started_at IS NOT NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_calculate_session_duration ON interview_sessions;

-- Create trigger
CREATE TRIGGER trigger_calculate_session_duration
    BEFORE UPDATE ON interview_sessions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();

-- ============================================================================
-- 5. CREATE VIEW FOR USER INTERVIEW HISTORY
-- ============================================================================

CREATE OR REPLACE VIEW user_interview_history AS
SELECT 
    is2.id,
    is2.intern_id,
    is2.interview_type,
    is2.interview_title,
    is2.interview_category,
    is2.session_status,
    is2.started_at,
    is2.completed_at,
    is2.overall_score,
    is2.feedback_summary,
    is2.duration_seconds,
    is2.skill_scores,
    is2.strengths,
    is2.improvements,
    i.full_name as intern_name
FROM interview_sessions is2
LEFT JOIN interns i ON is2.intern_id = i.id
WHERE is2.session_status = 'completed'
ORDER BY is2.completed_at DESC;

-- ============================================================================
-- 6. CREATE AGGREGATE VIEW FOR USER STATS
-- ============================================================================

CREATE OR REPLACE VIEW user_interview_stats AS
SELECT 
    intern_id,
    interview_type,
    COUNT(*) as total_attempts,
    MAX(overall_score) as best_score,
    AVG(overall_score)::DECIMAL(5,2) as avg_score,
    MIN(started_at) as first_attempt,
    MAX(completed_at) as last_attempt,
    AVG(duration_seconds)::INTEGER as avg_duration
FROM interview_sessions
WHERE session_status = 'completed'
GROUP BY intern_id, interview_type;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify the changes were applied successfully

SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'interview_sessions'
ORDER BY ordinal_position;

