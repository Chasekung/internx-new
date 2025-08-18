-- Add internship picture columns to internships table
ALTER TABLE internships 
ADD COLUMN IF NOT EXISTS internship_picture_1 TEXT,
ADD COLUMN IF NOT EXISTS internship_picture_2 TEXT,
ADD COLUMN IF NOT EXISTS internship_picture_3 TEXT,
ADD COLUMN IF NOT EXISTS internship_picture_4 TEXT,
ADD COLUMN IF NOT EXISTS internship_picture_5 TEXT;

-- Create a bucket for internship pictures if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('internship-pictures', 'internship-pictures')
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public internship picture access" ON storage.objects;
DROP POLICY IF EXISTS "Companies can upload internship pictures" ON storage.objects;
DROP POLICY IF EXISTS "Companies can update internship pictures" ON storage.objects;
DROP POLICY IF EXISTS "Companies can delete internship pictures" ON storage.objects;

-- Enable RLS on the storage bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public access to read internship pictures
CREATE POLICY "Allow public internship picture access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'internship-pictures');

-- Allow company users to upload pictures
CREATE POLICY "Companies can upload internship pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'internship-pictures'
    AND EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = auth.uid()
    )
);

-- Allow company users to update their own pictures
CREATE POLICY "Companies can update internship pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'internship-pictures'
    AND EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = auth.uid()
    )
)
WITH CHECK (
    bucket_id = 'internship-pictures'
    AND EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = auth.uid()
    )
);

-- Allow company users to delete their own pictures
CREATE POLICY "Companies can delete internship pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'internship-pictures'
    AND EXISTS (
        SELECT 1 FROM companies
        WHERE companies.id = auth.uid()
    )
);

-- Add comment to describe the columns
COMMENT ON COLUMN internships.internship_picture_1 IS 'URL or path to the first internship workplace image';
COMMENT ON COLUMN internships.internship_picture_2 IS 'URL or path to the second internship workplace image';
COMMENT ON COLUMN internships.internship_picture_3 IS 'URL or path to the third internship workplace image';
COMMENT ON COLUMN internships.internship_picture_4 IS 'URL or path to the fourth internship workplace image';
COMMENT ON COLUMN internships.internship_picture_5 IS 'URL or path to the fifth internship workplace image'; 