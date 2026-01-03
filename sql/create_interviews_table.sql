-- ============================================================================
-- OPTIONAL: INTERVIEWS CATALOG TABLE
-- ============================================================================
-- This is OPTIONAL. The interview types are already defined in the frontend.
-- Only run this if you want to store interview templates in the database.
-- 
-- If you just want to enable multiple interview types, run:
--   enable_multiple_interviews.sql
-- instead.
-- ============================================================================

-- Create a catalog of available interview types (optional - for admin management)
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    difficulty VARCHAR(50) NOT NULL DEFAULT 'Beginner',
    duration VARCHAR(50) NOT NULL DEFAULT '30 min',
    keywords TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    order_priority INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_interviews_slug ON interviews(slug);
CREATE INDEX IF NOT EXISTS idx_interviews_category ON interviews(category);
CREATE INDEX IF NOT EXISTS idx_interviews_active ON interviews(is_active);

-- Anyone can view active interviews
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active interviews" ON interviews;
CREATE POLICY "Anyone can view active interviews" ON interviews
    FOR SELECT USING (is_active = true);

-- Verification
SELECT 'interviews table created successfully' as status;
