-- Simple approach: Drop all GIN indexes and convert columns to text
-- This script handles the skills, career_interests, interests, languages, extracurriculars, and achievements fields

-- First, let's check the current schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interns' 
AND column_name IN ('skills', 'career_interests', 'interests', 'languages', 'extracurriculars', 'achievements');

-- Drop the view that depends on these columns
DROP VIEW IF EXISTS high_school_students;

-- Drop ALL GIN indexes on the interns table (this will handle any GIN indexes that exist)
DO $$
DECLARE
    index_record RECORD;
BEGIN
    FOR index_record IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'interns' 
        AND indexdef LIKE '%gin%'
    LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || index_record.indexname;
    END LOOP;
END $$;

-- Now convert all the columns to text (this should work without GIN index conflicts)
ALTER TABLE interns ALTER COLUMN skills TYPE TEXT;
ALTER TABLE interns ALTER COLUMN career_interests TYPE TEXT;
ALTER TABLE interns ALTER COLUMN interests TYPE TEXT;
ALTER TABLE interns ALTER COLUMN languages TYPE TEXT;
ALTER TABLE interns ALTER COLUMN extracurriculars TYPE TEXT;
ALTER TABLE interns ALTER COLUMN achievements TYPE TEXT;

-- Recreate the high_school_students view with the updated column types
CREATE VIEW high_school_students AS
SELECT 
  id,
  full_name,
  email,
  username,
  phone,
  location,
  high_school,
  grade_level,
  age,
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

-- Verify the changes were applied correctly
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interns' 
AND column_name IN ('skills', 'career_interests', 'interests', 'languages', 'extracurriculars', 'achievements'); 