-- Clean up duplicate entries in interns table
-- This will keep only the most recent entry for each email

DELETE FROM interns 
WHERE id NOT IN (
  SELECT MAX(id) 
  FROM interns 
  GROUP BY email
);

-- Also clean up any orphaned auth users (optional)
-- You can run this in Supabase SQL Editor if needed 