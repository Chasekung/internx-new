-- Add AI Interview System to InternX Database
-- Migration: add_ai_interview_system.sql

-- Add interview-related columns to interns table
ALTER TABLE interns ADD COLUMN IF NOT EXISTS interview_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS interview_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS interview_report_url TEXT;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS skill_score INTEGER CHECK (skill_score >= 0 AND skill_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS experience_score INTEGER CHECK (experience_score >= 0 AND experience_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS personality_score INTEGER CHECK (personality_score >= 0 AND personality_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS overall_match_score INTEGER CHECK (overall_match_score >= 0 AND overall_match_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS interview_summary TEXT;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS interview_feedback TEXT;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS interview_tags TEXT[];

-- Create interview_sessions table to track interview progress
CREATE TABLE IF NOT EXISTS interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    session_status VARCHAR(20) DEFAULT 'pending' CHECK (session_status IN ('pending', 'in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    video_call_id TEXT,
    transcript TEXT,
    ai_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_questions table for dynamic question management
CREATE TABLE IF NOT EXISTS interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'behavioral', 'experience', 'interests', 'goals')),
    question_text TEXT NOT NULL,
    follow_up_questions TEXT[],
    expected_duration_seconds INTEGER DEFAULT 120,
    difficulty_level VARCHAR(20) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_responses table to store individual question responses
CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES interview_questions(id) NULL, -- Allow NULL for AI-generated questions
    question_text TEXT NOT NULL,
    question_category VARCHAR(50),
    response_text TEXT,
    response_duration_seconds INTEGER,
    ai_analysis TEXT,
    response_score INTEGER CHECK (response_score >= 0 AND response_score <= 100),
    asked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE
);

-- Create personalized_internship_scores table for caching match scores
CREATE TABLE IF NOT EXISTS personalized_internship_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    internship_id UUID NOT NULL, -- References internships table
    match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
    match_level VARCHAR(20) CHECK (match_level IN ('high', 'moderate', 'low')),
    factors_analysis JSONB,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(intern_id, internship_id)
);

-- Enable RLS on new tables
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE personalized_internship_scores ENABLE ROW LEVEL SECURITY;

-- RLS policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions" ON interview_sessions
    FOR SELECT USING (auth.uid() = intern_id);

CREATE POLICY "Users can update their own interview sessions" ON interview_sessions
    FOR UPDATE USING (auth.uid() = intern_id);

CREATE POLICY "System can insert interview sessions" ON interview_sessions
    FOR INSERT WITH CHECK (true);

-- RLS policies for interview_questions (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view interview questions" ON interview_questions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert interview questions" ON interview_questions
    FOR INSERT WITH CHECK (true);

-- RLS policies for interview_responses
CREATE POLICY "Users can view their own interview responses" ON interview_responses
    FOR SELECT USING (
        auth.uid() IN (
            SELECT intern_id FROM interview_sessions WHERE id = session_id
        )
    );

CREATE POLICY "System can insert interview responses" ON interview_responses
    FOR INSERT WITH CHECK (true);

-- RLS policies for personalized_internship_scores
CREATE POLICY "Users can view their own internship scores" ON personalized_internship_scores
    FOR SELECT USING (auth.uid() = intern_id);

-- Insert sample interview questions
INSERT INTO interview_questions (category, question_text, follow_up_questions, expected_duration_seconds) VALUES
-- Technical/Skills questions
('technical', 'Tell me about a technical project you''ve worked on, even if it was for a class or personal interest.', 
 ARRAY['What technologies did you use?', 'What challenges did you face?', 'How did you overcome them?'], 180),

('technical', 'Describe a time when you had to learn a new skill or technology quickly. How did you approach it?',
 ARRAY['What resources did you use?', 'How long did it take you to become comfortable with it?'], 150),

-- Behavioral questions
('behavioral', 'Tell me about a time when you had to work as part of a team. What role did you play?',
 ARRAY['How did you handle any conflicts or disagreements?', 'What did you learn from this experience?'], 180),

('behavioral', 'Describe a situation where you had to manage multiple responsibilities or deadlines.',
 ARRAY['How did you prioritize your tasks?', 'What strategies did you use to stay organized?'], 150),

-- Experience questions
('experience', 'What extracurricular activities, volunteer work, or part-time jobs have you been involved in?',
 ARRAY['What did you learn from these experiences?', 'How do they relate to your career interests?'], 180),

('experience', 'Tell me about a time when you took initiative to start something new or improve a process.',
 ARRAY['What motivated you to take action?', 'What was the outcome?'], 150),

-- Interests questions
('interests', 'What subjects or areas are you most passionate about, and why?',
 ARRAY['How do you stay current with developments in these areas?', 'Have you worked on any projects related to these interests?'], 180),

('interests', 'What type of work environment do you think you would thrive in?',
 ARRAY['Do you prefer working independently or collaboratively?', 'What motivates you most?'], 120),

-- Goals questions
('goals', 'Where do you see yourself in 5 years, and what steps are you taking to get there?',
 ARRAY['What skills do you want to develop?', 'What kind of impact do you want to make?'], 180),

('goals', 'Why are you interested in this internship program, and what do you hope to gain from it?',
 ARRAY['How does this align with your career goals?', 'What specific experiences are you looking for?'], 150);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_interview_sessions_intern_id ON interview_sessions(intern_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_session_id ON interview_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_personalized_scores_intern_id ON personalized_internship_scores(intern_id);
CREATE INDEX IF NOT EXISTS idx_personalized_scores_internship_id ON personalized_internship_scores(internship_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_category ON interview_questions(category);
CREATE INDEX IF NOT EXISTS idx_interview_questions_active ON interview_questions(is_active);

-- Add trigger to update overall_match_score when individual scores change
CREATE OR REPLACE FUNCTION calculate_overall_match_score()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate weighted average: skill_score (50%) + experience_score (30%) + personality_score (20%)
    IF NEW.skill_score IS NOT NULL AND NEW.experience_score IS NOT NULL AND NEW.personality_score IS NOT NULL THEN
        NEW.overall_match_score := ROUND(
            (NEW.skill_score * 0.5) + 
            (NEW.experience_score * 0.3) + 
            (NEW.personality_score * 0.2)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_overall_match_score
    BEFORE UPDATE ON interns
    FOR EACH ROW
    EXECUTE FUNCTION calculate_overall_match_score(); 