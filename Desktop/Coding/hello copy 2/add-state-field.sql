-- Add state field to interns table
-- This script adds a state column to separate state from general location

-- Add the state column
ALTER TABLE interns ADD COLUMN IF NOT EXISTS state VARCHAR(100);

-- Add an index for better performance when searching by state
CREATE INDEX IF NOT EXISTS idx_interns_state ON interns(state);

-- Update the table comment to reflect the new field
COMMENT ON TABLE interns IS 'High school student profiles for internship opportunities with location and state information';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'interns' 
AND column_name IN ('location', 'state')
ORDER BY ordinal_position; 