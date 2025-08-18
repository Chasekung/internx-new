-- Add Profile Text Analysis for Mathematical Calculations
-- Migration: add_profile_text_analysis.sql

-- Create function to analyze profile text and calculate mathematical scores
CREATE OR REPLACE FUNCTION analyze_profile_for_mathematical_scores()
RETURNS TRIGGER AS $$
DECLARE
    business_score INTEGER := 0;
    technology_score INTEGER := 0;
    education_score INTEGER := 0;
    healthcare_score INTEGER := 0;
    creative_score INTEGER := 0;
    
    -- Text analysis variables
    skills_text TEXT;
    experience_text TEXT;
    bio_text TEXT;
    extracurriculars_text TEXT;
    achievements_text TEXT;
    career_interests_text TEXT;
BEGIN
    -- Get profile text fields
    skills_text := COALESCE(NEW.skills, '');
    experience_text := COALESCE(NEW.experience, '');
    bio_text := COALESCE(NEW.bio, '');
    extracurriculars_text := COALESCE(NEW.extracurriculars, '');
    achievements_text := COALESCE(NEW.achievements, '');
    career_interests_text := COALESCE(NEW.career_interests, '');
    
    -- Business & Finance Analysis
    IF (skills_text ILIKE '%business%' OR skills_text ILIKE '%finance%' OR skills_text ILIKE '%entrepreneur%' OR 
        experience_text ILIKE '%founder%' OR experience_text ILIKE '%startup%' OR experience_text ILIKE '%company%' OR
        bio_text ILIKE '%business%' OR bio_text ILIKE '%finance%' OR bio_text ILIKE '%entrepreneur%' OR
        career_interests_text ILIKE '%business%' OR career_interests_text ILIKE '%finance%') THEN
        business_score := business_score + 25;
    END IF;
    
    IF (extracurriculars_text ILIKE '%finance club%' OR extracurriculars_text ILIKE '%business club%' OR 
        extracurriculars_text ILIKE '%entrepreneur%' OR extracurriculars_text ILIKE '%investment%') THEN
        business_score := business_score + 20;
    END IF;
    
    IF (achievements_text ILIKE '%business%' OR achievements_text ILIKE '%finance%' OR 
        achievements_text ILIKE '%entrepreneur%' OR achievements_text ILIKE '%competition%') THEN
        business_score := business_score + 15;
    END IF;
    
    -- Technology & Engineering Analysis
    IF (skills_text ILIKE '%programming%' OR skills_text ILIKE '%coding%' OR skills_text ILIKE '%python%' OR 
        skills_text ILIKE '%javascript%' OR skills_text ILIKE '%java%' OR skills_text ILIKE '%engineering%' OR
        experience_text ILIKE '%coding%' OR experience_text ILIKE '%programming%' OR experience_text ILIKE '%software%' OR
        bio_text ILIKE '%coding%' OR bio_text ILIKE '%programming%' OR bio_text ILIKE '%engineering%' OR
        career_interests_text ILIKE '%computer%' OR career_interests_text ILIKE '%engineering%') THEN
        technology_score := technology_score + 25;
    END IF;
    
    IF (extracurriculars_text ILIKE '%coding club%' OR extracurriculars_text ILIKE '%robotics%' OR 
        extracurriculars_text ILIKE '%computer%' OR extracurriculars_text ILIKE '%engineering%') THEN
        technology_score := technology_score + 20;
    END IF;
    
    IF (achievements_text ILIKE '%coding%' OR achievements_text ILIKE '%programming%' OR 
        achievements_text ILIKE '%engineering%' OR achievements_text ILIKE '%hackathon%') THEN
        technology_score := technology_score + 15;
    END IF;
    
    -- Education & Non-Profit Analysis
    IF (skills_text ILIKE '%teaching%' OR skills_text ILIKE '%mentoring%' OR skills_text ILIKE '%leadership%' OR
        experience_text ILIKE '%teaching%' OR experience_text ILIKE '%tutoring%' OR experience_text ILIKE '%volunteer%' OR
        bio_text ILIKE '%teaching%' OR bio_text ILIKE '%mentoring%' OR bio_text ILIKE '%community%' OR
        career_interests_text ILIKE '%education%' OR career_interests_text ILIKE '%teaching%') THEN
        education_score := education_score + 25;
    END IF;
    
    IF (extracurriculars_text ILIKE '%tutoring%' OR extracurriculars_text ILIKE '%teaching%' OR 
        extracurriculars_text ILIKE '%volunteer%' OR extracurriculars_text ILIKE '%community%') THEN
        education_score := education_score + 20;
    END IF;
    
    IF (achievements_text ILIKE '%teaching%' OR achievements_text ILIKE '%mentoring%' OR 
        achievements_text ILIKE '%volunteer%' OR achievements_text ILIKE '%community%') THEN
        education_score := education_score + 15;
    END IF;
    
    -- Healthcare & Sciences Analysis
    IF (skills_text ILIKE '%science%' OR skills_text ILIKE '%biology%' OR skills_text ILIKE '%chemistry%' OR
        skills_text ILIKE '%medical%' OR skills_text ILIKE '%health%' OR skills_text ILIKE '%research%' OR
        experience_text ILIKE '%medical%' OR experience_text ILIKE '%health%' OR experience_text ILIKE '%research%' OR
        bio_text ILIKE '%science%' OR bio_text ILIKE '%medical%' OR bio_text ILIKE '%health%' OR
        career_interests_text ILIKE '%medicine%' OR career_interests_text ILIKE '%health%') THEN
        healthcare_score := healthcare_score + 25;
    END IF;
    
    IF (extracurriculars_text ILIKE '%science club%' OR extracurriculars_text ILIKE '%medical%' OR 
        extracurriculars_text ILIKE '%health%' OR extracurriculars_text ILIKE '%research%') THEN
        healthcare_score := healthcare_score + 20;
    END IF;
    
    IF (achievements_text ILIKE '%science%' OR achievements_text ILIKE '%medical%' OR 
        achievements_text ILIKE '%health%' OR achievements_text ILIKE '%research%') THEN
        healthcare_score := healthcare_score + 15;
    END IF;
    
    -- Creative & Media Analysis
    IF (skills_text ILIKE '%design%' OR skills_text ILIKE '%creative%' OR skills_text ILIKE '%art%' OR
        skills_text ILIKE '%marketing%' OR skills_text ILIKE '%communication%' OR skills_text ILIKE '%writing%' OR
        experience_text ILIKE '%design%' OR experience_text ILIKE '%creative%' OR experience_text ILIKE '%marketing%' OR
        bio_text ILIKE '%design%' OR bio_text ILIKE '%creative%' OR bio_text ILIKE '%art%' OR
        career_interests_text ILIKE '%design%' OR career_interests_text ILIKE '%creative%') THEN
        creative_score := creative_score + 25;
    END IF;
    
    IF (extracurriculars_text ILIKE '%art club%' OR extracurriculars_text ILIKE '%design%' OR 
        extracurriculars_text ILIKE '%creative%' OR extracurriculars_text ILIKE '%media%') THEN
        creative_score := creative_score + 20;
    END IF;
    
    IF (achievements_text ILIKE '%art%' OR achievements_text ILIKE '%design%' OR 
        achievements_text ILIKE '%creative%' OR achievements_text ILIKE '%media%') THEN
        creative_score := creative_score + 15;
    END IF;
    
    -- Base scores from core metrics
    business_score := business_score + (COALESCE(NEW.experience_score, 0) * 0.3 + COALESCE(NEW.skill_score, 0) * 0.2);
    technology_score := technology_score + (COALESCE(NEW.skill_score, 0) * 0.4 + COALESCE(NEW.experience_score, 0) * 0.2);
    education_score := education_score + (COALESCE(NEW.personality_score, 0) * 0.3 + COALESCE(NEW.experience_score, 0) * 0.3);
    healthcare_score := healthcare_score + (COALESCE(NEW.personality_score, 0) * 0.3 + COALESCE(NEW.skill_score, 0) * 0.2);
    creative_score := creative_score + (COALESCE(NEW.personality_score, 0) * 0.3 + COALESCE(NEW.skill_score, 0) * 0.2);
    
    -- Cap scores at 100
    business_score := LEAST(business_score, 100);
    technology_score := LEAST(technology_score, 100);
    education_score := LEAST(education_score, 100);
    healthcare_score := LEAST(healthcare_score, 100);
    creative_score := LEAST(creative_score, 100);
    
    -- Update the mathematical scores (these will be used for 70% of combined score)
    NEW.business_finance_score := COALESCE(NEW.business_finance_score, business_score);
    NEW.technology_engineering_score := COALESCE(NEW.technology_engineering_score, technology_score);
    NEW.education_nonprofit_score := COALESCE(NEW.education_nonprofit_score, education_score);
    NEW.healthcare_sciences_score := COALESCE(NEW.healthcare_sciences_score, healthcare_score);
    NEW.creative_media_score := COALESCE(NEW.creative_media_score, creative_score);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically analyze profile text when updated
CREATE TRIGGER trigger_analyze_profile_text
    BEFORE UPDATE ON interns
    FOR EACH ROW
    EXECUTE FUNCTION analyze_profile_for_mathematical_scores(); 