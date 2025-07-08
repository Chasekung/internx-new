-- Safe version of add-internship-id-to-forms.sql
-- Add internship_id column to forms table

-- Add internship_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'internship_id') THEN
        ALTER TABLE public.forms ADD COLUMN internship_id UUID REFERENCES public.internships(id) ON DELETE CASCADE;
    END IF;
END $$;

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