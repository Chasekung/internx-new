-- Add internship_id column to forms table
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_internship_id ON public.forms(internship_id);

-- Update RLS policy to use internship_id instead of company_id
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
CREATE POLICY "Interns can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    ); 
 
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_internship_id ON public.forms(internship_id);

-- Update RLS policy to use internship_id instead of company_id
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
CREATE POLICY "Interns can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    ); 
 
 
 
 
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_internship_id ON public.forms(internship_id);

-- Update RLS policy to use internship_id instead of company_id
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
CREATE POLICY "Interns can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    ); 
 
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_internship_id ON public.forms(internship_id);

-- Update RLS policy to use internship_id instead of company_id
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
CREATE POLICY "Interns can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    ); 
 
 
 
 
 
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_internship_id ON public.forms(internship_id);

-- Update RLS policy to use internship_id instead of company_id
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
CREATE POLICY "Interns can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    ); 
 
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_internship_id ON public.forms(internship_id);

-- Update RLS policy to use internship_id instead of company_id
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
CREATE POLICY "Interns can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    ); 
 
 
 
 
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_internship_id ON public.forms(internship_id);

-- Update RLS policy to use internship_id instead of company_id
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
CREATE POLICY "Interns can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    ); 
 
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_forms_internship_id ON public.forms(internship_id);

-- Update RLS policy to use internship_id instead of company_id
DROP POLICY IF EXISTS "Interns can create application forms" ON public.forms;
CREATE POLICY "Interns can create application forms"
    ON public.forms FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM internships
            WHERE internships.id = forms.internship_id
            AND internships.is_active = true
        )
    ); 
 
 
 
 
 
 
 
 
 
 
 