-- Add team column to interns table
-- This allows companies to organize interns into teams

ALTER TABLE interns 
ADD COLUMN team VARCHAR(255);

-- Add comment to document the purpose
COMMENT ON COLUMN interns.team IS 'Team assignment for the intern (e.g., "Engineering", "Marketing", "Sales")';

-- Create an index for efficient team-based queries
CREATE INDEX idx_interns_team ON interns(team); 