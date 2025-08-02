-- Add Category-Specific Interview Scores
-- Migration: add_category_scores.sql

-- Add category-specific score columns to interns table
ALTER TABLE interns ADD COLUMN IF NOT EXISTS business_finance_score INTEGER CHECK (business_finance_score >= 0 AND business_finance_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS technology_engineering_score INTEGER CHECK (technology_engineering_score >= 0 AND technology_engineering_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS education_nonprofit_score INTEGER CHECK (education_nonprofit_score >= 0 AND education_nonprofit_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS healthcare_sciences_score INTEGER CHECK (healthcare_sciences_score >= 0 AND healthcare_sciences_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS creative_media_score INTEGER CHECK (creative_media_score >= 0 AND creative_media_score <= 100);

-- Add combined score columns (30% AI + 70% Mathematical)
ALTER TABLE interns ADD COLUMN IF NOT EXISTS business_finance_combined_score INTEGER CHECK (business_finance_combined_score >= 0 AND business_finance_combined_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS technology_engineering_combined_score INTEGER CHECK (technology_engineering_combined_score >= 0 AND technology_engineering_combined_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS education_nonprofit_combined_score INTEGER CHECK (education_nonprofit_combined_score >= 0 AND education_nonprofit_combined_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS healthcare_sciences_combined_score INTEGER CHECK (healthcare_sciences_combined_score >= 0 AND healthcare_sciences_combined_score <= 100);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS creative_media_combined_score INTEGER CHECK (creative_media_combined_score >= 0 AND creative_media_combined_score <= 100);

-- Create function to calculate combined scores
CREATE OR REPLACE FUNCTION calculate_combined_category_scores()
RETURNS TRIGGER AS $$
BEGIN
    -- Business & Finance: 30% AI + 70% Mathematical
    NEW.business_finance_combined_score = 
        COALESCE(NEW.business_finance_score, 0) * 0.3 + 
        COALESCE(
            (NEW.experience_score * 0.5 + NEW.skill_score * 0.3 + NEW.personality_score * 0.2) + 15, 
            0
        ) * 0.7;
    
    -- Technology & Engineering: 30% AI + 70% Mathematical
    NEW.technology_engineering_combined_score = 
        COALESCE(NEW.technology_engineering_score, 0) * 0.3 + 
        COALESCE(
            (NEW.skill_score * 0.6 + NEW.experience_score * 0.3 + NEW.personality_score * 0.1) + 8, 
            0
        ) * 0.7;
    
    -- Education & Non-Profit: 30% AI + 70% Mathematical
    NEW.education_nonprofit_combined_score = 
        COALESCE(NEW.education_nonprofit_score, 0) * 0.3 + 
        COALESCE(
            (NEW.personality_score * 0.4 + NEW.experience_score * 0.4 + NEW.skill_score * 0.2) + 12, 
            0
        ) * 0.7;
    
    -- Healthcare & Sciences: 30% AI + 70% Mathematical
    NEW.healthcare_sciences_combined_score = 
        COALESCE(NEW.healthcare_sciences_score, 0) * 0.3 + 
        COALESCE(
            (NEW.personality_score * 0.5 + NEW.skill_score * 0.3 + NEW.experience_score * 0.2) - 5, 
            0
        ) * 0.7;
    
    -- Creative & Media: 30% AI + 70% Mathematical
    NEW.creative_media_combined_score = 
        COALESCE(NEW.creative_media_score, 0) * 0.3 + 
        COALESCE(
            (NEW.personality_score * 0.5 + NEW.skill_score * 0.3 + NEW.experience_score * 0.2) + 5, 
            0
        ) * 0.7;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate combined scores
CREATE TRIGGER trigger_calculate_combined_category_scores
    BEFORE UPDATE ON interns
    FOR EACH ROW
    EXECUTE FUNCTION calculate_combined_category_scores(); 