-- Modify company_logo column in companies table if it exists
DO $$ 
BEGIN 
    -- Check if the column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'companies' 
        AND column_name = 'company_logo'
    ) THEN
        -- Alter existing column
        ALTER TABLE companies 
        ALTER COLUMN company_logo TYPE VARCHAR(255);
    ELSE
        -- Add new column if it doesn't exist
        ALTER TABLE companies 
        ADD COLUMN company_logo VARCHAR(255);
    END IF;
END $$;

-- Add comment to describe the column
COMMENT ON COLUMN companies.company_logo IS 'URL or path to the company''s logo image (max 255 characters)';

-- Update storage policy to allow company logo uploads (if using Supabase Storage)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'storage.objects' 
        AND policyname = 'Allow public company logo access'
    ) THEN
        CREATE POLICY "Allow public company logo access"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'company-logos');
    END IF;
END $$;

-- Create a bucket for company logos if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('company-logos', 'company-logos')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on the companies table if not already enabled
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Add policy to allow companies to update their own logo
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Companies can update their own logo'
    ) THEN
        CREATE POLICY "Companies can update their own logo"
        ON companies
        FOR UPDATE
        USING (auth.uid() = id)
        WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- Add policy to allow public to view company logos
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'companies' 
        AND policyname = 'Public can view company logos'
    ) THEN
        CREATE POLICY "Public can view company logos"
        ON companies
        FOR SELECT
        TO public
        USING (true);
    END IF;
END $$; 