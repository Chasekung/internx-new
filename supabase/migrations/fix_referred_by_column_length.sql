-- Fix referred_by column to handle UUIDs properly
-- UUIDs are 36 characters long, but the column was created as VARCHAR(32)

-- First, clear any invalid data (UUIDs that got truncated)
UPDATE interns SET referred_by = NULL WHERE referred_by IS NOT NULL AND length(referred_by) != 36;

-- Alter the column to be UUID type instead of VARCHAR(32)
ALTER TABLE interns ALTER COLUMN referred_by TYPE UUID USING (
  CASE 
    WHEN referred_by IS NOT NULL AND length(referred_by) = 36 THEN referred_by::UUID
    ELSE NULL
  END
);

-- Add foreign key constraint to ensure referred_by references a valid intern
ALTER TABLE interns ADD CONSTRAINT fk_interns_referred_by 
  FOREIGN KEY (referred_by) REFERENCES interns(id) ON DELETE SET NULL; 