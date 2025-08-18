-- Safe version of add_published_column_to_forms.sql
-- Add published column to forms table

-- Add published column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'published') THEN
        ALTER TABLE public.forms ADD COLUMN published BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Add share_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'share_url') THEN
        ALTER TABLE public.forms ADD COLUMN share_url TEXT;
    END IF;
END $$;

-- Update existing published forms based on status
UPDATE public.forms 
SET published = true 
WHERE status = 'published' AND published IS NOT TRUE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forms_published ON forms(published);
CREATE INDEX IF NOT EXISTS idx_forms_share_url ON forms(share_url);

-- Add comments for the columns
DO $$
BEGIN
    EXECUTE 'COMMENT ON COLUMN forms.published IS ''Whether the form is published and accessible to applicants''';
    EXECUTE 'COMMENT ON COLUMN forms.share_url IS ''URL for sharing the published form''';
END $$; 