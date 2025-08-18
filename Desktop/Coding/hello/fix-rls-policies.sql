-- Drop existing RLS policies to make script idempotent
DROP POLICY IF EXISTS "Users can insert their own company profile" ON companies;
DROP POLICY IF EXISTS "Users can insert their own intern profile" ON interns;
DROP POLICY IF EXISTS "Allow all users to view intern profiles" ON interns;
DROP POLICY IF EXISTS "Authenticated users can view all intern profiles" ON interns;
DROP POLICY IF EXISTS "Allow company profile creation during signup" ON companies;
DROP POLICY IF EXISTS "Allow intern profile creation during signup" ON interns;

-- Create new RLS policies that allow inserts during signup
CREATE POLICY "Allow company profile creation during signup" ON companies
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow intern profile creation during signup" ON interns
    FOR INSERT WITH CHECK (true);

-- Allow authenticated users to search and view all intern profiles
CREATE POLICY "Authenticated users can view all intern profiles" ON interns
    FOR SELECT TO authenticated
    USING (true);

-- Keep the existing policies for other operations
-- (These should already exist from the original setup) 