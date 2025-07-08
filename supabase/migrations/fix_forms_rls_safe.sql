-- Safe version of fix-forms-rls.sql
-- Updates RLS policies for forms

-- Drop existing RLS policies for forms table
DROP POLICY IF EXISTS "Companies can create forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can update their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can delete their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can manage their own forms" ON public.forms;
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
DROP POLICY IF EXISTS "Interns can view their application forms" ON public.forms;
DROP POLICY IF EXISTS "Interns can update their draft forms" ON public.forms;
DROP POLICY IF EXISTS "Anyone can create application forms" ON public.forms;

-- Make company_id nullable if not already
DO $$
BEGIN
    ALTER TABLE public.forms ALTER COLUMN company_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Create new RLS policies for forms

-- Companies can manage forms where they are the owner
CREATE POLICY "Companies can manage their own forms"
    ON public.forms FOR ALL
    USING (
        auth.uid() = company_id
        OR (
            company_id IS NULL
            AND EXISTS (
                SELECT 1 FROM internships
                WHERE internships.id = forms.internship_id
                AND internships.company_id = auth.uid()
            )
        )
    );

-- Anyone can create application forms for active internships
CREATE POLICY "Anyone can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        company_id IS NULL
        AND EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    );

-- Interns can view their application forms
CREATE POLICY "Interns can view their application forms"
    ON public.forms FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.form_id = forms.id
            AND form_responses.applicant_id = auth.uid()
        )
    );

-- Interns can update their draft application forms
CREATE POLICY "Interns can update their draft forms"
    ON public.forms FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.form_id = forms.id
            AND form_responses.applicant_id = auth.uid()
            AND form_responses.status = 'in_progress'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.form_id = forms.id
            AND form_responses.applicant_id = auth.uid()
            AND form_responses.status = 'in_progress'
        )
    ); 