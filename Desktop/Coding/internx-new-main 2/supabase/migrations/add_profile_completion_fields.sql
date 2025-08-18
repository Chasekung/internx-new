-- Add profile completion tracking fields to interns table
ALTER TABLE interns 
ADD COLUMN IF NOT EXISTS profile_completion_percentage INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT false;

-- Add comments to document the new fields
COMMENT ON COLUMN interns.profile_completion_percentage IS 'Percentage of profile completion (0-100)';
COMMENT ON COLUMN interns.is_profile_complete IS 'Whether profile is complete enough for combined AI analysis (80%+ threshold)'; 