-- Add form settings fields to forms table
ALTER TABLE forms
  ADD COLUMN accepting_responses BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN form_privacy TEXT NOT NULL DEFAULT 'private' CHECK (form_privacy IN ('public', 'private', 'organization')),
  ADD COLUMN max_responses INTEGER,
  ADD COLUMN submission_deadline TIMESTAMP WITH TIME ZONE,
  ADD COLUMN notify_on_submission BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN allow_editing BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN auto_save BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN created_by UUID REFERENCES auth.users(id),
  ADD COLUMN notification_email TEXT;

-- Backfill created_by with the company_id since companies are users
UPDATE forms f
SET created_by = company_id
WHERE created_by IS NULL;

-- Add comment descriptions for the new columns
COMMENT ON COLUMN forms.accepting_responses IS 'Whether the form is currently accepting responses';
COMMENT ON COLUMN forms.form_privacy IS 'Privacy level of the form: public, private, or organization';
COMMENT ON COLUMN forms.max_responses IS 'Maximum number of responses allowed (null means unlimited)';
COMMENT ON COLUMN forms.submission_deadline IS 'Deadline for form submissions (null means no deadline)';
COMMENT ON COLUMN forms.notify_on_submission IS 'Whether to send email notifications on form submissions';
COMMENT ON COLUMN forms.allow_editing IS 'Whether applicants can edit their responses after submission';
COMMENT ON COLUMN forms.auto_save IS 'Whether to automatically save form responses as applicants type';
COMMENT ON COLUMN forms.created_by IS 'The user who created this form';
COMMENT ON COLUMN forms.notification_email IS 'Email address to send notifications to when form is submitted';

-- Create an index on submission_deadline to optimize queries filtering by deadline
CREATE INDEX IF NOT EXISTS idx_forms_submission_deadline ON forms(submission_deadline);

-- Create a function to check if a form is accepting responses
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

-- Create a trigger to validate form submissions
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

-- Create trigger for form submissions
DROP TRIGGER IF EXISTS before_form_submission ON form_responses;
CREATE TRIGGER before_form_submission
  BEFORE INSERT ON form_responses
  FOR EACH ROW
  EXECUTE FUNCTION validate_form_submission();

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Forms are viewable based on privacy setting" ON forms;

-- Create new policy
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