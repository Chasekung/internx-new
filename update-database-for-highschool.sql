-- Update interns table schema for high school students
-- Run this in your Supabase SQL Editor

-- First, let's add the new high school specific columns
ALTER TABLE interns ADD COLUMN IF NOT EXISTS high_school VARCHAR(255);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS grade_level VARCHAR(20);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS extracurriculars TEXT;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS achievements TEXT;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS career_interests TEXT[];

-- Now let's remove the old university and major columns
-- Note: We'll drop them if they exist to avoid errors
DO $$ 
BEGIN
    -- Drop university column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'interns' AND column_name = 'university') THEN
        ALTER TABLE interns DROP COLUMN university;
    END IF;
    
    -- Drop major column if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'interns' AND column_name = 'major') THEN
        ALTER TABLE interns DROP COLUMN major;
    END IF;
END $$;

-- Update the table comment to reflect the change
COMMENT ON TABLE interns IS 'High school student profiles for internship opportunities';

-- Create a view for easier access to high school student data
CREATE OR REPLACE VIEW high_school_students AS
SELECT 
    id,
    full_name,
    username,
    email,
    phone,
    location,
    high_school,
    grade_level,
    age,
    graduation_year,
    gpa,
    skills,
    experience,
    extracurriculars,
    achievements,
    career_interests,
    resume_url,
    profile_photo_url,
    linkedin_url,
    github_url,
    portfolio_url,
    bio,
    interests,
    languages,
    certifications,
    created_at,
    updated_at
FROM interns;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_interns_high_school ON interns(high_school);
CREATE INDEX IF NOT EXISTS idx_interns_grade_level ON interns(grade_level);
CREATE INDEX IF NOT EXISTS idx_interns_age ON interns(age);
CREATE INDEX IF NOT EXISTS idx_interns_career_interests ON interns USING GIN(career_interests);

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interns' 
ORDER BY ordinal_position; 