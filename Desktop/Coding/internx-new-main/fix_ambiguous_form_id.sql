-- Fix ambiguous form_id reference in is_form_accepting_responses function
-- This fixes the "column reference 'form_id' is ambiguous" error

-- Drop the existing function
DROP FUNCTION IF EXISTS is_form_accepting_responses(UUID);

-- Recreate the function with properly qualified column references
CREATE OR REPLACE FUNCTION is_form_accepting_responses(target_form_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  form_record RECORD;
BEGIN
  SELECT 
    accepting_responses,
    submission_deadline,
    max_responses,
    (SELECT COUNT(*) FROM form_responses WHERE form_responses.form_id = target_form_id) as current_responses
  INTO form_record
  FROM forms
  WHERE forms.id = target_form_id;

  -- Check if form exists
  IF NOT FOUND THEN
    RETURN false;
  END IF;

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

-- Also update the validate_form_submission function to be more robust
CREATE OR REPLACE FUNCTION validate_form_submission()
RETURNS TRIGGER AS $$
DECLARE
  form_privacy TEXT;
  target_company_id UUID;
BEGIN
  -- Check if form is accepting responses
  IF NOT is_form_accepting_responses(NEW.form_id) THEN
    RAISE EXCEPTION 'Form is not accepting responses';
  END IF;

  -- Get form privacy setting and company_id with qualified column references
  SELECT f.form_privacy, f.company_id 
  INTO form_privacy, target_company_id
  FROM forms f
  WHERE f.id = NEW.form_id;

  -- For organization-only forms, verify user belongs to organization
  IF form_privacy = 'organization' THEN
    IF NOT EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = target_company_id 
      AND c.id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'User is not authorized to submit to this form';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql; 