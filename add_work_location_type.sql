-- Add work_location_type field to internships table
-- This field will store whether the internship is 'online' or 'in_person'

-- Step 1: Add the new column
ALTER TABLE internships 
ADD COLUMN work_location_type TEXT DEFAULT 'in_person';

-- Step 2: Add a check constraint to ensure only valid values
ALTER TABLE internships 
ADD CONSTRAINT work_location_type_check 
CHECK (work_location_type IN ('online', 'in_person'));

-- Step 3: Add a comment to document the column
COMMENT ON COLUMN internships.work_location_type IS 'Indicates whether the internship is online or in-person. Valid values: online, in_person';

-- Step 4: Update existing records to have 'in_person' as default (if any don't have it)
UPDATE internships 
SET work_location_type = 'in_person' 
WHERE work_location_type IS NULL;

-- Step 5: Make the column NOT NULL after setting defaults
ALTER TABLE internships 
ALTER COLUMN work_location_type SET NOT NULL;
