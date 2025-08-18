-- Safe version of add_form_settings_fields.sql
-- Add form settings fields to forms table

-- Add columns only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'accepting_responses') THEN
        ALTER TABLE forms ADD COLUMN accepting_responses BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'form_privacy') THEN
        ALTER TABLE forms ADD COLUMN form_privacy TEXT NOT NULL DEFAULT 'private' CHECK (form_privacy IN ('public', 'private', 'organization'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'max_responses') THEN
        ALTER TABLE forms ADD COLUMN max_responses INTEGER;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'submission_deadline') THEN
        ALTER TABLE forms ADD COLUMN submission_deadline TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'notify_on_submission') THEN
        ALTER TABLE forms ADD COLUMN notify_on_submission BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'allow_editing') THEN
        ALTER TABLE forms ADD COLUMN allow_editing BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'auto_save') THEN
        ALTER TABLE forms ADD COLUMN auto_save BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'created_by') THEN
        ALTER TABLE forms ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'notification_email') THEN
        ALTER TABLE forms ADD COLUMN notification_email TEXT;
    END IF;
END $$;

-- Backfill created_by with the company_id since companies are users
UPDATE forms f
SET created_by = company_id
WHERE created_by IS NULL AND company_id IS NOT NULL;

-- Add comment descriptions for the new columns
DO $$
BEGIN
    EXECUTE 'COMMENT ON COLUMN forms.accepting_responses IS ''Whether the form is currently accepting responses''';
    EXECUTE 'COMMENT ON COLUMN forms.form_privacy IS ''Privacy level of the form: public, private, or organization''';
    EXECUTE 'COMMENT ON COLUMN forms.max_responses IS ''Maximum number of responses allowed (null means unlimited)''';
    EXECUTE 'COMMENT ON COLUMN forms.submission_deadline IS ''Deadline for form submissions (null means no deadline)''';
    EXECUTE 'COMMENT ON COLUMN forms.notify_on_submission IS ''Whether to send email notifications on form submissions''';
    EXECUTE 'COMMENT ON COLUMN forms.allow_editing IS ''Whether applicants can edit their responses after submission''';
    EXECUTE 'COMMENT ON COLUMN forms.auto_save IS ''Whether to automatically save form responses as applicants type''';
    EXECUTE 'COMMENT ON COLUMN forms.created_by IS ''The user who created this form''';
    EXECUTE 'COMMENT ON COLUMN forms.notification_email IS ''Email address to send notifications to when form is submitted''';
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_forms_submission_deadline ON forms(submission_deadline);

-- Create or replace function to check if a form is accepting responses
CREATE OR REPLACE FUNCTION is_form_accepting_responses(form_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  form_record RECORD;
BEGIN
  SELECT 
    accepting_responses,
    submission_deadline,
    max_responses,
    (SELECT COUNT(*) FROM form_responses WHERE form_id = $1) as current_responses
  INTO form_record
  FROM forms
  WHERE id = form_id;

  -- Form must be explicitly accepting responses
  IF NOT form_record.accepting_responses THEN
    RETURN false;
  END IF;

  -- Check if deadline has passed
  IF form_record.submission_deadline IS NOT NULL AND form_record.submission_deadline < NOW() THEN
    RETURN false;
  END IF;

  -- Check if max responses reached
  IF form_record.max_responses IS NOT NULL AND form_record.current_responses >= form_record.max_responses THEN
    RETURN false;
  END IF;

  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to validate form submissions
CREATE OR REPLACE FUNCTION validate_form_submission()
RETURNS TRIGGER AS $$
DECLARE
  form_privacy TEXT;
  company_id UUID;
BEGIN
  -- Check if form is accepting responses
  IF NOT is_form_accepting_responses(NEW.form_id) THEN
    RAISE EXCEPTION 'Form is not accepting responses';
  END IF;

  -- Get form privacy setting and company_id
  SELECT forms.form_privacy, forms.company_id 
  INTO form_privacy, company_id
  FROM forms
  WHERE id = NEW.form_id;

  -- For organization-only forms, verify user belongs to organization
  IF form_privacy = 'organization' THEN
    IF NOT EXISTS (
      SELECT 1 FROM companies 
      WHERE id = company_id 
      AND id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'User is not authorized to submit to this form';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for form submissions if it doesn't exist
DROP TRIGGER IF EXISTS before_form_submission ON form_responses;
CREATE TRIGGER before_form_submission
  BEFORE INSERT ON form_responses
  FOR EACH ROW
  EXECUTE FUNCTION validate_form_submission();

-- Drop and recreate policy to avoid conflicts
DROP POLICY IF EXISTS "Forms are viewable based on privacy setting" ON forms;
CREATE POLICY "Forms are viewable based on privacy setting"
  ON forms
  FOR SELECT
  USING (
    CASE
      WHEN form_privacy = 'public' THEN true
      WHEN form_privacy = 'private' AND auth.uid() = created_by THEN true
      WHEN form_privacy = 'organization' AND EXISTS (
        SELECT 1 FROM companies 
        WHERE id = forms.company_id 
        AND id = auth.uid()
      ) THEN true
      ELSE false
    END
  ); 