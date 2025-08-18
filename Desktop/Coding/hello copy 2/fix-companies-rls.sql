-- Drop existing RLS policies for companies table
DROP POLICY IF EXISTS "Users can view their own company profile" ON companies;
DROP POLICY IF EXISTS "Users can update their own company profile" ON companies;
DROP POLICY IF EXISTS "Users can insert their own company profile" ON companies;
DROP POLICY IF EXISTS "Allow company profile creation during signup" ON companies;
DROP POLICY IF EXISTS "Companies can view own profile" ON companies;
DROP POLICY IF EXISTS "Companies can update own profile" ON companies;
DROP POLICY IF EXISTS "Companies can insert own profile" ON companies;
DROP POLICY IF EXISTS "Public can view company basic info" ON companies;

-- Drop existing RLS policies for company_locations table
DROP POLICY IF EXISTS "Companies can manage their own locations" ON company_locations;
DROP POLICY IF EXISTS "Companies can view their own locations" ON company_locations;
DROP POLICY IF EXISTS "Companies can insert their own locations" ON company_locations;
DROP POLICY IF EXISTS "Companies can update their own locations" ON company_locations;
DROP POLICY IF EXISTS "Companies can delete their own locations" ON company_locations;

-- Create a stored procedure for creating/updating the company_locations table
CREATE OR REPLACE FUNCTION create_company_locations_table(sql_commands text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_commands;
END;
$$;

-- Create company_locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS company_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    is_headquarters BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on company_locations table
ALTER TABLE company_locations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company_locations table
CREATE POLICY "Companies can view their own locations" 
  ON company_locations FOR SELECT 
  USING (auth.uid() = company_id);

CREATE POLICY "Companies can insert their own locations" 
  ON company_locations FOR INSERT 
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update their own locations" 
  ON company_locations FOR UPDATE 
  USING (auth.uid() = company_id)
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can delete their own locations" 
  ON company_locations FOR DELETE 
  USING (auth.uid() = company_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_company_locations_company_id ON company_locations(company_id);

-- Create RLS policies for companies table
CREATE POLICY "Companies can view own profile"
ON companies FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Companies can update own profile"
ON companies FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Companies can insert own profile"
ON companies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Public can view company basic info"
ON companies FOR SELECT
TO public
USING (true);

-- Create new RLS policies that allow inserts during signup
CREATE POLICY "Allow company profile creation during signup" ON companies
    FOR INSERT WITH CHECK (true);

-- Keep the existing policies for other operations
-- (These should already exist from the original setup) 