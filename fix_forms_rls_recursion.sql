-- Fix infinite recursion in forms RLS policies
-- This script simplifies the RLS policies to prevent circular dependencies

-- Drop all existing RLS policies for forms table
DROP POLICY IF EXISTS "Companies can create forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can update their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can delete their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can manage their own forms" ON public.forms;
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
DROP POLICY IF EXISTS "Interns can view their application forms" ON public.forms;
DROP POLICY IF EXISTS "Interns can update their draft forms" ON public.forms;
DROP POLICY IF EXISTS "Anyone can create application forms" ON public.forms;
DROP POLICY IF EXISTS "Forms are viewable based on privacy setting" ON public.forms;

-- Disable RLS temporarily to avoid issues
ALTER TABLE public.forms DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

-- Create simplified RLS policies that avoid circular dependencies

-- 1. Companies can manage forms where they are the company_id owner
CREATE POLICY "Companies can manage forms by company_id"
    ON public.forms FOR ALL
    TO authenticated
    USING (auth.uid() = company_id);

-- 2. Companies can manage forms where company_id is NULL but they own the internship
CREATE POLICY "Companies can manage forms by internship ownership"
    ON public.forms FOR ALL
    TO authenticated
    USING (
        company_id IS NULL
        AND internship_id IS NOT NULL
        AND auth.uid() IN (
            SELECT company_id FROM internships 
            WHERE id = forms.internship_id
        )
    );

-- 3. Allow public read access for published forms (avoid complex nested queries)
CREATE POLICY "Public can view published forms"
    ON public.forms FOR SELECT
    TO public
    USING (
        published = true 
        AND (form_privacy = 'public' OR form_privacy IS NULL)
    );

-- 4. Allow authenticated users to view forms they have permission to see
CREATE POLICY "Authenticated users can view accessible forms"
    ON public.forms FOR SELECT
    TO authenticated
    USING (
        -- Company owns the form directly
        auth.uid() = company_id
        OR
        -- Company owns the internship (simplified check)
        (company_id IS NULL AND internship_id IS NOT NULL AND auth.uid() IN (
            SELECT company_id FROM internships WHERE id = forms.internship_id
        ))
        OR
        -- Form is public
        (published = true AND (form_privacy = 'public' OR form_privacy IS NULL))
    );

-- 5. Allow form creation for companies and internship forms
CREATE POLICY "Allow form creation"
    ON public.forms FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Company creating their own form
        auth.uid() = company_id
        OR
        -- Creating application form for an internship they own
        (company_id IS NULL AND internship_id IS NOT NULL AND auth.uid() IN (
            SELECT company_id FROM internships WHERE id = forms.internship_id
        ))
    ); 