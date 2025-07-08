-- Safe fix for response_answers RLS policies
-- This ensures that users can properly insert and manage their form answers

-- Drop existing RLS policies for response_answers safely
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own answers" ON public.response_answers;
    DROP POLICY IF EXISTS "Companies can view answers to their forms" ON public.response_answers;
    DROP POLICY IF EXISTS "Users can insert their own answers" ON public.response_answers;
    DROP POLICY IF EXISTS "Users can view their own answers" ON public.response_answers;
    DROP POLICY IF EXISTS "Users can update their own answers" ON public.response_answers;
    DROP POLICY IF EXISTS "Users can delete their own answers" ON public.response_answers;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error dropping response_answers policies: %', SQLERRM;
END $$;

-- Create separate, more specific RLS policies for response_answers

-- 1. Allow users to INSERT their own answers
DO $$
BEGIN
    CREATE POLICY "Users can insert their own answers"
        ON public.response_answers FOR INSERT
        TO authenticated
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.form_responses 
                WHERE form_responses.id = response_answers.response_id 
                AND form_responses.applicant_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can insert their own answers" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Users can insert their own answers": %', SQLERRM;
END $$;

-- 2. Allow users to SELECT their own answers
DO $$
BEGIN
    CREATE POLICY "Users can view their own answers"
        ON public.response_answers FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.form_responses 
                WHERE form_responses.id = response_answers.response_id 
                AND form_responses.applicant_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can view their own answers" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Users can view their own answers": %', SQLERRM;
END $$;

-- 3. Allow users to UPDATE their own answers
DO $$
BEGIN
    CREATE POLICY "Users can update their own answers"
        ON public.response_answers FOR UPDATE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.form_responses 
                WHERE form_responses.id = response_answers.response_id 
                AND form_responses.applicant_id = auth.uid()
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.form_responses 
                WHERE form_responses.id = response_answers.response_id 
                AND form_responses.applicant_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can update their own answers" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Users can update their own answers": %', SQLERRM;
END $$;

-- 4. Allow users to DELETE their own answers (for updating responses)
DO $$
BEGIN
    CREATE POLICY "Users can delete their own answers"
        ON public.response_answers FOR DELETE
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.form_responses 
                WHERE form_responses.id = response_answers.response_id 
                AND form_responses.applicant_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can delete their own answers" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Users can delete their own answers": %', SQLERRM;
END $$;

-- 5. Allow companies to view answers to their forms
DO $$
BEGIN
    CREATE POLICY "Companies can view answers to their forms"
        ON public.response_answers FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.form_responses 
                JOIN public.forms ON forms.id = form_responses.form_id
                WHERE form_responses.id = response_answers.response_id 
                AND forms.company_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Companies can view answers to their forms" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Companies can view answers to their forms": %', SQLERRM;
END $$;

-- Also fix form_responses RLS policies to ensure they work correctly
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can manage their own responses" ON public.form_responses;
    DROP POLICY IF EXISTS "Companies can view responses to their forms" ON public.form_responses;
    DROP POLICY IF EXISTS "Users can insert their own responses" ON public.form_responses;
    DROP POLICY IF EXISTS "Users can view their own responses" ON public.form_responses;
    DROP POLICY IF EXISTS "Users can update their own responses" ON public.form_responses;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error dropping form_responses policies: %', SQLERRM;
END $$;

-- Create separate form_responses policies for better control
DO $$
BEGIN
    CREATE POLICY "Users can insert their own responses"
        ON public.form_responses FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = applicant_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can insert their own responses" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Users can insert their own responses": %', SQLERRM;
END $$;

DO $$
BEGIN
    CREATE POLICY "Users can view their own responses"
        ON public.form_responses FOR SELECT
        TO authenticated
        USING (auth.uid() = applicant_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can view their own responses" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Users can view their own responses": %', SQLERRM;
END $$;

DO $$
BEGIN
    CREATE POLICY "Users can update their own responses"
        ON public.form_responses FOR UPDATE
        TO authenticated
        USING (auth.uid() = applicant_id)
        WITH CHECK (auth.uid() = applicant_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can update their own responses" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Users can update their own responses": %', SQLERRM;
END $$;

DO $$
BEGIN
    CREATE POLICY "Companies can view responses to their forms"
        ON public.form_responses FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.forms 
                WHERE forms.id = form_responses.form_id 
                AND forms.company_id = auth.uid()
            )
        );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Companies can view responses to their forms" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Companies can view responses to their forms": %', SQLERRM;
END $$;

-- Create a debug function to check response_answers permissions
DO $$
BEGIN
    CREATE OR REPLACE FUNCTION debug_response_answers_access(target_response_id UUID)
    RETURNS TABLE (
        response_exists BOOLEAN,
        response_applicant_id UUID,
        current_user_id UUID,
        can_insert BOOLEAN,
        policies_active BOOLEAN
    ) AS $func$
    DECLARE
        response_record RECORD;
        current_uid UUID;
    BEGIN
        -- Get current user
        SELECT auth.uid() INTO current_uid;
        
        -- Get response details
        SELECT applicant_id INTO response_record
        FROM form_responses 
        WHERE id = target_response_id;

        -- Return debug information
        RETURN QUERY SELECT 
            FOUND, -- response_exists
            response_record.applicant_id, -- response_applicant_id
            current_uid, -- current_user_id
            (response_record.applicant_id = current_uid), -- can_insert
            true; -- policies_active
    END;
    $func$ LANGUAGE plpgsql;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating debug function: %', SQLERRM;
END $$;

-- Helpful debug queries (commented out)
/*
-- To debug response_answers access, run:
-- SELECT * FROM debug_response_answers_access('your-response-id-here');

-- To check if RLS is enabled:
-- SELECT schemaname, tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE tablename IN ('form_responses', 'response_answers');

-- To check current policies:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE tablename IN ('form_responses', 'response_answers');
*/ 