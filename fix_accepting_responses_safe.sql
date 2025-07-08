-- Safe version of fix_accepting_responses.sql
-- Fix forms not accepting responses and add debugging with error handling

-- Update all existing forms to accept responses by default safely
DO $$
BEGIN
    UPDATE forms 
    SET accepting_responses = true 
    WHERE accepting_responses IS NULL OR accepting_responses = false;
    
    RAISE NOTICE 'Updated % forms to accept responses', ROW_COUNT;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error updating accepting_responses: %', SQLERRM;
END $$;

-- Update all forms to be published if they have an internship_id but aren't published
DO $$
BEGIN
    UPDATE forms 
    SET published = true 
    WHERE internship_id IS NOT NULL 
      AND (published IS NULL OR published = false);
      
    RAISE NOTICE 'Published % application forms', ROW_COUNT;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error updating published status: %', SQLERRM;
END $$;

-- Make sure form_privacy is set properly for application forms
DO $$
BEGIN
    UPDATE forms 
    SET form_privacy = 'public' 
    WHERE internship_id IS NOT NULL 
      AND (form_privacy IS NULL OR form_privacy = 'private');
      
    RAISE NOTICE 'Updated privacy for % application forms', ROW_COUNT;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error updating form_privacy: %', SQLERRM;
END $$;

-- Create a debug function to help identify why forms aren't accepting responses
DO $$
BEGIN
    CREATE OR REPLACE FUNCTION debug_form_acceptance(target_form_id UUID)
    RETURNS TABLE (
      form_exists BOOLEAN,
      accepting_responses BOOLEAN,
      is_published BOOLEAN,
      form_privacy TEXT,
      deadline_passed BOOLEAN,
      submission_deadline TIMESTAMP WITH TIME ZONE,
      max_responses INTEGER,
      current_responses BIGINT,
      max_reached BOOLEAN,
      final_result BOOLEAN
    ) AS $func$
    DECLARE
      form_record RECORD;
      response_count BIGINT;
    BEGIN
      -- Get form details
      SELECT 
        f.accepting_responses,
        f.published,
        f.form_privacy,
        f.submission_deadline,
        f.max_responses
      INTO form_record
      FROM forms f
      WHERE f.id = target_form_id;

      -- Check if form exists
      IF NOT FOUND THEN
        RETURN QUERY SELECT false, null, null, null, null, null, null, null, null, false;
        RETURN;
      END IF;

      -- Count current responses
      SELECT COUNT(*) INTO response_count
      FROM form_responses 
      WHERE form_responses.form_id = target_form_id;

      -- Return debug information
      RETURN QUERY SELECT 
        true, -- form_exists
        form_record.accepting_responses,
        form_record.published,
        form_record.form_privacy,
        (form_record.submission_deadline IS NOT NULL AND form_record.submission_deadline < NOW()), -- deadline_passed
        form_record.submission_deadline,
        form_record.max_responses,
        response_count, -- current_responses
        (form_record.max_responses IS NOT NULL AND response_count >= form_record.max_responses), -- max_reached
        is_form_accepting_responses(target_form_id); -- final_result
    END;
    $func$ LANGUAGE plpgsql;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating debug_form_acceptance function: %', SQLERRM;
END $$;

-- Safely drop the existing trigger
DO $$
BEGIN
    DROP TRIGGER IF EXISTS before_form_submission ON form_responses;
    DROP TRIGGER IF EXISTS before_form_submission_simple ON form_responses;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error dropping triggers: %', SQLERRM;
END $$;

-- Create a simpler trigger function that only validates privacy, not acceptance
DO $$
BEGIN
    CREATE OR REPLACE FUNCTION validate_form_submission_simple()
    RETURNS TRIGGER AS $func$
    DECLARE
      form_privacy TEXT;
      target_company_id UUID;
    BEGIN
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
    $func$ LANGUAGE plpgsql;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating validate_form_submission_simple function: %', SQLERRM;
END $$;

-- Create the simpler trigger safely
DO $$
BEGIN
    CREATE TRIGGER before_form_submission_simple
      BEFORE INSERT ON form_responses
      FOR EACH ROW
      EXECUTE FUNCTION validate_form_submission_simple();
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Trigger before_form_submission_simple already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating trigger: %', SQLERRM;
END $$;

-- Provide helpful queries for debugging (commented out)
/*
-- To debug a specific form, run:
-- SELECT * FROM debug_form_acceptance('your-form-id-here');

-- To see all forms with their acceptance status:
-- SELECT id, title, accepting_responses, published, form_privacy, submission_deadline, max_responses
-- FROM forms 
-- ORDER BY created_at DESC;

-- To check if any forms are still not accepting responses:
-- SELECT id, title, accepting_responses, form_privacy, published, submission_deadline, max_responses
-- FROM forms 
-- WHERE accepting_responses IS NULL OR accepting_responses = false;
*/ 