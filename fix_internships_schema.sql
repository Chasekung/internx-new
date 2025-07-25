-- Fix internships table to add missing fields that the API expects
ALTER TABLE internships ADD COLUMN IF NOT EXISTS position VARCHAR(255);

-- Check if salary_min and salary_max already exist (they should from the schema)
-- If not, add them
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internships' AND column_name = 'salary_min') THEN
        ALTER TABLE internships ADD COLUMN salary_min INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internships' AND column_name = 'salary_max') THEN
        ALTER TABLE internships ADD COLUMN salary_max INTEGER;
    END IF;
END $$;

-- Check if location field exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internships' AND column_name = 'location') THEN
        ALTER TABLE internships ADD COLUMN location VARCHAR(255);
    END IF;
END $$;

-- Add separate address, city, state fields for better location handling
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internships' AND column_name = 'address') THEN
        ALTER TABLE internships ADD COLUMN address VARCHAR(255);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internships' AND column_name = 'city') THEN
        ALTER TABLE internships ADD COLUMN city VARCHAR(100);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'internships' AND column_name = 'state') THEN
        ALTER TABLE internships ADD COLUMN state VARCHAR(50);
    END IF;
END $$;

-- Update existing internships to use title as position if position is null
UPDATE internships SET position = title WHERE position IS NULL;

-- Verify the update worked
SELECT COUNT(*) as total_internships, 
       COUNT(position) as internships_with_position,
       COUNT(salary_min) as internships_with_salary_min,
       COUNT(salary_max) as internships_with_salary_max,
       COUNT(location) as internships_with_location,
       COUNT(address) as internships_with_address,
       COUNT(city) as internships_with_city,
       COUNT(state) as internships_with_state
FROM internships; 