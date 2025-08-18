-- Add AI recommendation fields to interns table
ALTER TABLE interns 
ADD COLUMN IF NOT EXISTS business_finance_recommendation TEXT,
ADD COLUMN IF NOT EXISTS technology_engineering_recommendation TEXT,
ADD COLUMN IF NOT EXISTS education_nonprofit_recommendation TEXT,
ADD COLUMN IF NOT EXISTS healthcare_sciences_recommendation TEXT,
ADD COLUMN IF NOT EXISTS creative_media_recommendation TEXT;

-- Add comments to document the new fields
COMMENT ON COLUMN interns.business_finance_recommendation IS 'AI-generated personalized recommendation for business & finance internships';
COMMENT ON COLUMN interns.technology_engineering_recommendation IS 'AI-generated personalized recommendation for technology & engineering internships';
COMMENT ON COLUMN interns.education_nonprofit_recommendation IS 'AI-generated personalized recommendation for education & nonprofit internships';
COMMENT ON COLUMN interns.healthcare_sciences_recommendation IS 'AI-generated personalized recommendation for healthcare & sciences internships';
COMMENT ON COLUMN interns.creative_media_recommendation IS 'AI-generated personalized recommendation for creative & media internships'; 