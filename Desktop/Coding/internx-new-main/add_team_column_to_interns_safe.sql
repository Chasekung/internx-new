-- Safe script to add team column to interns table
-- This script checks if the column exists before adding it

-- Check if team column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'interns' 
        AND column_name = 'team'
    ) THEN
        ALTER TABLE interns ADD COLUMN team VARCHAR(255);
        RAISE NOTICE 'Team column added to interns table';
    ELSE
        RAISE NOTICE 'Team column already exists in interns table';
    END IF;
END $$;

-- Add comment to document the purpose (if column exists, this will be ignored)
COMMENT ON COLUMN interns.team IS 'Team assignment for the intern (e.g., "Engineering", "Marketing", "Sales")';

-- Create an index for efficient team-based queries (if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_indexes 
        WHERE tablename = 'interns' 
        AND indexname = 'idx_interns_team'
    ) THEN
        CREATE INDEX idx_interns_team ON interns(team);
        RAISE NOTICE 'Team index created on interns table';
    ELSE
        RAISE NOTICE 'Team index already exists on interns table';
    END IF;
END $$; 