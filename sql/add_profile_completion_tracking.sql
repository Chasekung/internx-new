-- ============================================================================
-- PROFILE COMPLETION TRACKING FOR SUPABASE
-- ============================================================================
-- Copy and paste this into the Supabase SQL Editor and run it.
-- This adds optional profile completion tracking to the interns table.
-- ============================================================================

-- ============================================================================
-- 1. ADD PROFILE COMPLETION COLUMN TO INTERNS TABLE
-- ============================================================================
-- This column caches the computed profile completion percentage
-- It's updated via a trigger whenever profile fields change

ALTER TABLE interns 
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0;

-- Add index for faster queries on completion percentage
CREATE INDEX IF NOT EXISTS idx_interns_profile_completion 
ON interns(profile_completion_percentage);

-- ============================================================================
-- 2. FUNCTION TO CALCULATE PROFILE COMPLETION
-- ============================================================================
-- This mirrors the client-side calculation logic
-- Fields are weighted based on importance

CREATE OR REPLACE FUNCTION calculate_profile_completion(intern_record interns)
RETURNS INTEGER AS $$
DECLARE
    filled_weight DECIMAL := 0;
    total_weight DECIMAL := 0;
    percentage INTEGER := 0;
BEGIN
    -- Core identity fields (weight: 2)
    total_weight := total_weight + 2; -- full_name
    IF intern_record.full_name IS NOT NULL AND intern_record.full_name != '' THEN
        filled_weight := filled_weight + 2;
    END IF;
    
    total_weight := total_weight + 2; -- email
    IF intern_record.email IS NOT NULL AND intern_record.email != '' THEN
        filled_weight := filled_weight + 2;
    END IF;
    
    total_weight := total_weight + 2; -- username
    IF intern_record.username IS NOT NULL AND intern_record.username != '' THEN
        filled_weight := filled_weight + 2;
    END IF;
    
    -- Important profile fields (weight: 1.5)
    total_weight := total_weight + 1.5; -- bio
    IF intern_record.bio IS NOT NULL AND intern_record.bio != '' THEN
        filled_weight := filled_weight + 1.5;
    END IF;
    
    total_weight := total_weight + 1.5; -- skills
    IF intern_record.skills IS NOT NULL AND intern_record.skills != '' THEN
        filled_weight := filled_weight + 1.5;
    END IF;
    
    total_weight := total_weight + 1.5; -- career_interests
    IF intern_record.career_interests IS NOT NULL AND intern_record.career_interests != '' THEN
        filled_weight := filled_weight + 1.5;
    END IF;
    
    total_weight := total_weight + 1.5; -- high_school
    IF intern_record.high_school IS NOT NULL AND intern_record.high_school != '' THEN
        filled_weight := filled_weight + 1.5;
    END IF;
    
    total_weight := total_weight + 1.5; -- grade_level
    IF intern_record.grade_level IS NOT NULL AND intern_record.grade_level != '' THEN
        filled_weight := filled_weight + 1.5;
    END IF;
    
    -- Standard profile fields (weight: 1)
    total_weight := total_weight + 1; -- headline
    IF intern_record.headline IS NOT NULL AND intern_record.headline != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- phone
    IF intern_record.phone IS NOT NULL AND intern_record.phone != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- location
    IF intern_record.location IS NOT NULL AND intern_record.location != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- state
    IF intern_record.state IS NOT NULL AND intern_record.state != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- age
    IF intern_record.age IS NOT NULL THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- experience
    IF intern_record.experience IS NOT NULL AND intern_record.experience != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- extracurriculars
    IF intern_record.extracurriculars IS NOT NULL AND intern_record.extracurriculars != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- achievements
    IF intern_record.achievements IS NOT NULL AND intern_record.achievements != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- interests
    IF intern_record.interests IS NOT NULL AND intern_record.interests != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    total_weight := total_weight + 1; -- languages
    IF intern_record.languages IS NOT NULL AND intern_record.languages != '' THEN
        filled_weight := filled_weight + 1;
    END IF;
    
    -- Optional but valuable fields (weight: 0.5)
    total_weight := total_weight + 0.5; -- profile_photo_url
    IF intern_record.profile_photo_url IS NOT NULL AND intern_record.profile_photo_url != '' THEN
        filled_weight := filled_weight + 0.5;
    END IF;
    
    total_weight := total_weight + 0.5; -- resume_url
    IF intern_record.resume_url IS NOT NULL AND intern_record.resume_url != '' THEN
        filled_weight := filled_weight + 0.5;
    END IF;
    
    total_weight := total_weight + 0.5; -- linkedin_url
    IF intern_record.linkedin_url IS NOT NULL AND intern_record.linkedin_url != '' THEN
        filled_weight := filled_weight + 0.5;
    END IF;
    
    total_weight := total_weight + 0.5; -- github_url
    IF intern_record.github_url IS NOT NULL AND intern_record.github_url != '' THEN
        filled_weight := filled_weight + 0.5;
    END IF;
    
    total_weight := total_weight + 0.5; -- portfolio_url
    IF intern_record.portfolio_url IS NOT NULL AND intern_record.portfolio_url != '' THEN
        filled_weight := filled_weight + 0.5;
    END IF;
    
    -- Calculate percentage
    IF total_weight > 0 THEN
        percentage := ROUND((filled_weight / total_weight) * 100);
    END IF;
    
    RETURN percentage;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- 3. TRIGGER TO UPDATE PROFILE COMPLETION ON CHANGE
-- ============================================================================

CREATE OR REPLACE FUNCTION update_profile_completion_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_percentage := calculate_profile_completion(NEW);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON interns;

-- Create trigger
CREATE TRIGGER trigger_update_profile_completion
    BEFORE INSERT OR UPDATE ON interns
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion_trigger();

-- ============================================================================
-- 4. UPDATE EXISTING RECORDS
-- ============================================================================
-- This updates the profile_completion_percentage for all existing interns

UPDATE interns 
SET profile_completion_percentage = calculate_profile_completion(interns)
WHERE profile_completion_percentage IS NULL OR profile_completion_percentage = 0;

-- ============================================================================
-- 5. HELPER VIEW FOR INCOMPLETE PROFILES
-- ============================================================================
-- Creates a view to easily query interns with incomplete profiles

CREATE OR REPLACE VIEW interns_incomplete_profiles AS
SELECT 
    id,
    full_name,
    email,
    username,
    profile_completion_percentage,
    created_at
FROM interns
WHERE profile_completion_percentage < 50
ORDER BY profile_completion_percentage DESC;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Run this to verify the changes were applied successfully

SELECT 
    id,
    full_name,
    email,
    profile_completion_percentage
FROM interns
ORDER BY profile_completion_percentage DESC
LIMIT 10;

