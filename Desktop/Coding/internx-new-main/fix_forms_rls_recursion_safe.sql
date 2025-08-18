-- Safe version of fix_forms_rls_recursion.sql
-- Fix infinite recursion in forms RLS policies with error handling

-- Drop all existing RLS policies for forms table safely
DO $$
BEGIN
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
    DROP POLICY IF EXISTS "Companies can manage forms by company_id" ON public.forms;
    DROP POLICY IF EXISTS "Companies can manage forms by internship ownership" ON public.forms;
    DROP POLICY IF EXISTS "Public can view published forms" ON public.forms;
    DROP POLICY IF EXISTS "Authenticated users can view accessible forms" ON public.forms;
    DROP POLICY IF EXISTS "Allow form creation" ON public.forms;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error dropping policies: %', SQLERRM;
END $$;

-- Safely disable and re-enable RLS
DO $$
BEGIN
    ALTER TABLE public.forms DISABLE ROW LEVEL SECURITY;
    ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error managing RLS: %', SQLERRM;
END $$;

-- Create simplified RLS policies that avoid circular dependencies

-- 1. Companies can manage forms where they are the company_id owner
DO $$
BEGIN
    CREATE POLICY "Companies can manage forms by company_id"
        ON public.forms FOR ALL
        TO authenticated
        USING (auth.uid() = company_id);
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Companies can manage forms by company_id" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Companies can manage forms by company_id": %', SQLERRM;
END $$;

-- 2. Companies can manage forms where company_id is NULL but they own the internship
DO $$
BEGIN
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
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Companies can manage forms by internship ownership" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Companies can manage forms by internship ownership": %', SQLERRM;
END $$;

-- 3. Allow public read access for published forms (avoid complex nested queries)
DO $$
BEGIN
    CREATE POLICY "Public can view published forms"
        ON public.forms FOR SELECT
        TO public
        USING (
            published = true 
            AND (form_privacy = 'public' OR form_privacy IS NULL)
        );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Public can view published forms" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Public can view published forms": %', SQLERRM;
END $$;

-- 4. Allow authenticated users to view forms they have permission to see
DO $$
BEGIN
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
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Authenticated users can view accessible forms" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Authenticated users can view accessible forms": %', SQLERRM;
END $$;

-- 5. Allow form creation for companies and internship forms
DO $$
BEGIN
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
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Allow form creation" already exists';
WHEN others THEN
    RAISE NOTICE 'Error creating policy "Allow form creation": %', SQLERRM;
END $$; 