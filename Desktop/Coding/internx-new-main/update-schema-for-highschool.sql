-- Update interns table schema for high school students
-- This script modifies the existing interns table to be more appropriate for high school students

-- First, let's add the new high school specific columns
ALTER TABLE interns ADD COLUMN IF NOT EXISTS high_school VARCHAR(255);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS grade_level VARCHAR(20);
ALTER TABLE interns ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS extracurriculars TEXT;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS achievements TEXT;
ALTER TABLE interns ADD COLUMN IF NOT EXISTS career_interests TEXT[];

-- Rename existing columns to be more appropriate for high school students
-- Note: We'll keep the existing columns for now to avoid breaking existing data
-- but we'll update the API to use the new high school specific fields

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