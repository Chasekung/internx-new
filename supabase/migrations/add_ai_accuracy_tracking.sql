-- Add AI Accuracy Tracking System
-- Migration: add_ai_accuracy_tracking.sql

-- Create AI accuracy validation table
CREATE TABLE IF NOT EXISTS ai_accuracy_validation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    interview_session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    ai_score INTEGER NOT NULL,
    human_score INTEGER,
    category VARCHAR(50),
    score_type VARCHAR(50) CHECK (score_type IN ('skill', 'experience', 'personality', 'overall', 'business_finance', 'technology_engineering', 'education_nonprofit', 'healthcare_sciences', 'creative_media')),
    confidence_difference INTEGER,
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    feedback_notes TEXT,
    validated_by UUID REFERENCES auth.users(id),
    is_validated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI score history table
CREATE TABLE IF NOT EXISTS ai_score_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    interview_session_id UUID REFERENCES interview_sessions(id) ON DELETE CASCADE,
    score_type VARCHAR(50) NOT NULL,
    score_value INTEGER NOT NULL,
    ai_confidence DECIMAL(3,2),
    prompt_version VARCHAR(100),
    model_version VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI accuracy metrics table
CREATE TABLE IF NOT EXISTS ai_accuracy_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_date DATE DEFAULT CURRENT_DATE,
    total_validations INTEGER DEFAULT 0,
    accurate_predictions INTEGER DEFAULT 0,
    accuracy_percentage DECIMAL(5,2),
    average_confidence_difference DECIMAL(5,2),
    category_accuracy JSONB,
    model_performance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI feedback collection table
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    intern_id UUID REFERENCES interns(id) ON DELETE CASCADE,
    feedback_type VARCHAR(50) CHECK (feedback_type IN ('score_accuracy', 'interview_quality', 'recommendation_helpfulness')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE ai_accuracy_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_accuracy_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own accuracy data" ON ai_accuracy_validation
    FOR SELECT USING (intern_id IN (
        SELECT id FROM interns WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view all accuracy data" ON ai_accuracy_validation
    FOR ALL USING (true);

CREATE POLICY "Users can view their own score history" ON ai_score_history
    FOR SELECT USING (intern_id IN (
        SELECT id FROM interns WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view all score history" ON ai_score_history
    FOR ALL USING (true);

CREATE POLICY "Users can view accuracy metrics" ON ai_accuracy_metrics
    FOR ALL USING (true);

CREATE POLICY "Users can submit feedback" ON ai_feedback
    FOR INSERT WITH CHECK (intern_id IN (
        SELECT id FROM interns WHERE id = auth.uid()
    ));

CREATE POLICY "Users can view their own feedback" ON ai_feedback
    FOR SELECT USING (intern_id IN (
        SELECT id FROM interns WHERE id = auth.uid()
    ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_accuracy_validation_intern_id ON ai_accuracy_validation(intern_id);
CREATE INDEX IF NOT EXISTS idx_ai_accuracy_validation_category ON ai_accuracy_validation(category);
CREATE INDEX IF NOT EXISTS idx_ai_accuracy_validation_date ON ai_accuracy_validation(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_score_history_intern_id ON ai_score_history(intern_id);
CREATE INDEX IF NOT EXISTS idx_ai_score_history_score_type ON ai_score_history(score_type);
CREATE INDEX IF NOT EXISTS idx_ai_accuracy_metrics_date ON ai_accuracy_metrics(metric_date);

-- Create function to calculate accuracy percentage
CREATE OR REPLACE FUNCTION calculate_accuracy_percentage()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate accuracy percentage for the day
    INSERT INTO ai_accuracy_metrics (metric_date, total_validations, accurate_predictions, accuracy_percentage, average_confidence_difference, category_accuracy)
    SELECT 
        CURRENT_DATE,
        COUNT(*),
        COUNT(CASE WHEN ABS(ai_score - human_score) <= 10 THEN 1 END),
        ROUND(
            (COUNT(CASE WHEN ABS(ai_score - human_score) <= 10 THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
            2
        ),
        ROUND(AVG(ABS(ai_score - human_score)), 2),
        jsonb_build_object(
            'business_finance', jsonb_build_object(
                'total', COUNT(CASE WHEN category = 'business_finance' THEN 1 END),
                'accurate', COUNT(CASE WHEN category = 'business_finance' AND ABS(ai_score - human_score) <= 10 THEN 1 END)
            ),
            'technology_engineering', jsonb_build_object(
                'total', COUNT(CASE WHEN category = 'technology_engineering' THEN 1 END),
                'accurate', COUNT(CASE WHEN category = 'technology_engineering' AND ABS(ai_score - human_score) <= 10 THEN 1 END)
            ),
            'education_nonprofit', jsonb_build_object(
                'total', COUNT(CASE WHEN category = 'education_nonprofit' THEN 1 END),
                'accurate', COUNT(CASE WHEN category = 'education_nonprofit' AND ABS(ai_score - human_score) <= 10 THEN 1 END)
            ),
            'healthcare_sciences', jsonb_build_object(
                'total', COUNT(CASE WHEN category = 'healthcare_sciences' THEN 1 END),
                'accurate', COUNT(CASE WHEN category = 'healthcare_sciences' AND ABS(ai_score - human_score) <= 10 THEN 1 END)
            ),
            'creative_media', jsonb_build_object(
                'total', COUNT(CASE WHEN category = 'creative_media' THEN 1 END),
                'accurate', COUNT(CASE WHEN category = 'creative_media' AND ABS(ai_score - human_score) <= 10 THEN 1 END)
            )
        )
    FROM ai_accuracy_validation 
    WHERE DATE(created_at) = CURRENT_DATE
    ON CONFLICT (metric_date) DO UPDATE SET
        total_validations = EXCLUDED.total_validations,
        accurate_predictions = EXCLUDED.accurate_predictions,
        accuracy_percentage = EXCLUDED.accuracy_percentage,
        average_confidence_difference = EXCLUDED.average_confidence_difference,
        category_accuracy = EXCLUDED.category_accuracy,
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate accuracy metrics
CREATE TRIGGER trigger_calculate_accuracy_metrics
    AFTER INSERT OR UPDATE ON ai_accuracy_validation
    FOR EACH ROW
    EXECUTE FUNCTION calculate_accuracy_percentage();

-- Create function to check if user is admin (for future use)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- For now, return false. You can modify this function later to implement admin logic
    -- Example: Check against a separate admins table, or add an is_admin column to interns
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Create function to track score history
CREATE OR REPLACE FUNCTION track_score_history()
RETURNS TRIGGER AS $$
BEGIN
    -- Track skill score changes
    IF OLD.skill_score IS DISTINCT FROM NEW.skill_score AND NEW.skill_score IS NOT NULL THEN
        INSERT INTO ai_score_history (intern_id, interview_session_id, score_type, score_value, created_at)
        VALUES (NEW.id, NULL, 'skill', NEW.skill_score, NOW());
    END IF;
    
    -- Track experience score changes
    IF OLD.experience_score IS DISTINCT FROM NEW.experience_score AND NEW.experience_score IS NOT NULL THEN
        INSERT INTO ai_score_history (intern_id, interview_session_id, score_type, score_value, created_at)
        VALUES (NEW.id, NULL, 'experience', NEW.experience_score, NOW());
    END IF;
    
    -- Track personality score changes
    IF OLD.personality_score IS DISTINCT FROM NEW.personality_score AND NEW.personality_score IS NOT NULL THEN
        INSERT INTO ai_score_history (intern_id, interview_session_id, score_type, score_value, created_at)
        VALUES (NEW.id, NULL, 'personality', NEW.personality_score, NOW());
    END IF;
    
    -- Track overall score changes
    IF OLD.overall_match_score IS DISTINCT FROM NEW.overall_match_score AND NEW.overall_match_score IS NOT NULL THEN
        INSERT INTO ai_score_history (intern_id, interview_session_id, score_type, score_value, created_at)
        VALUES (NEW.id, NULL, 'overall', NEW.overall_match_score, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track score history
CREATE TRIGGER trigger_track_score_history
    AFTER UPDATE ON interns
    FOR EACH ROW
    EXECUTE FUNCTION track_score_history(); 