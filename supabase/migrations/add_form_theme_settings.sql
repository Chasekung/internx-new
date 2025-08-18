-- Add theme settings to forms table
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS theme_settings JSONB DEFAULT jsonb_build_object(
    'primaryColor', '#3b82f6',
    'backgroundColor', '#ffffff',
    'fontFamily', 'Inter',
    'borderRadius', '0.5rem',
    'spacing', '1rem'
);

-- Add index for better performance when querying theme settings
CREATE INDEX IF NOT EXISTS idx_forms_theme_settings ON forms USING GIN (theme_settings);

-- Update the settings column to include additional form configuration
ALTER TABLE public.forms
ALTER COLUMN settings SET DEFAULT jsonb_build_object(
    'allowSave', false,
    'showProgressBar', true,
    'requireLogin', true,
    'autoSave', true,
    'showSectionNumbers', true,
    'showQuestionNumbers', true
);

-- Add columns for form metadata
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS submission_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE;

-- Add function to update last_edited_at timestamp
CREATE OR REPLACE FUNCTION update_form_last_edited_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_edited_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update last_edited_at
DROP TRIGGER IF EXISTS update_forms_last_edited_at ON forms;
CREATE TRIGGER update_forms_last_edited_at
    BEFORE UPDATE ON forms
    FOR EACH ROW
    EXECUTE FUNCTION update_form_last_edited_at();

-- Create function to handle view count increments
CREATE OR REPLACE FUNCTION increment_view_count()
RETURNS TRIGGER AS $$
BEGIN
    NEW.view_count = OLD.view_count + 1;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for view count increments
DROP TRIGGER IF EXISTS increment_forms_view_count ON forms;
CREATE TRIGGER increment_forms_view_count
    BEFORE UPDATE OF view_count ON forms
    FOR EACH ROW
    EXECUTE FUNCTION increment_view_count();

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_forms_view_count ON forms(view_count);
CREATE INDEX IF NOT EXISTS idx_forms_submission_count ON forms(submission_count);
CREATE INDEX IF NOT EXISTS idx_forms_last_edited_at ON forms(last_edited_at);
CREATE INDEX IF NOT EXISTS idx_forms_published_at ON forms(published_at);
CREATE INDEX IF NOT EXISTS idx_forms_archived_at ON forms(archived_at); 