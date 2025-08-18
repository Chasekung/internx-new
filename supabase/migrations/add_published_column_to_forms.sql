-- Add published column to forms table
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- Add share_url column for published forms
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS share_url TEXT;

-- Update existing published forms based on status
UPDATE public.forms 
SET published = true 
WHERE status = 'published';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_forms_published ON forms(published);
CREATE INDEX IF NOT EXISTS idx_forms_share_url ON forms(share_url);

-- Add comment for the column
COMMENT ON COLUMN forms.published IS 'Whether the form is published and accessible to applicants';
COMMENT ON COLUMN forms.share_url IS 'URL for sharing the published form'; 