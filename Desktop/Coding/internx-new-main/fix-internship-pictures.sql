-- Change column types to TEXT to prevent URL truncation
ALTER TABLE internships
ALTER COLUMN internship_picture_1 TYPE TEXT,
ALTER COLUMN internship_picture_2 TYPE TEXT,
ALTER COLUMN internship_picture_3 TYPE TEXT,
ALTER COLUMN internship_picture_4 TYPE TEXT,
ALTER COLUMN internship_picture_5 TYPE TEXT;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public internship picture access" ON storage.objects;
DROP POLICY IF EXISTS "Companies can upload internship pictures" ON storage.objects;
DROP POLICY IF EXISTS "Companies can update internship pictures" ON storage.objects;
DROP POLICY IF EXISTS "Companies can delete internship pictures" ON storage.objects;

-- Make bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'internship-pictures';

-- Create simple public access policy
CREATE POLICY "Public Access for internship-pictures"
ON storage.objects FOR ALL
USING (bucket_id = 'internship-pictures')
WITH CHECK (bucket_id = 'internship-pictures');

-- Update existing URLs in internships table to full URLs
UPDATE internships
SET 
  internship_picture_1 = CASE 
    WHEN internship_picture_1 IS NOT NULL AND NOT internship_picture_1 LIKE 'http%'
    THEN 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/internship-pictures/' || internship_picture_1
    ELSE internship_picture_1
  END,
  internship_picture_2 = CASE 
    WHEN internship_picture_2 IS NOT NULL AND NOT internship_picture_2 LIKE 'http%'
    THEN 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/internship-pictures/' || internship_picture_2
    ELSE internship_picture_2
  END,
  internship_picture_3 = CASE 
    WHEN internship_picture_3 IS NOT NULL AND NOT internship_picture_3 LIKE 'http%'
    THEN 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/internship-pictures/' || internship_picture_3
    ELSE internship_picture_3
  END,
  internship_picture_4 = CASE 
    WHEN internship_picture_4 IS NOT NULL AND NOT internship_picture_4 LIKE 'http%'
    THEN 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/internship-pictures/' || internship_picture_4
    ELSE internship_picture_4
  END,
  internship_picture_5 = CASE 
    WHEN internship_picture_5 IS NOT NULL AND NOT internship_picture_5 LIKE 'http%'
    THEN 'https://bhoudamowgpsbwwmmuay.supabase.co/storage/v1/object/public/internship-pictures/' || internship_picture_5
    ELSE internship_picture_5
  END; 