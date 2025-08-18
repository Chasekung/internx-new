-- Safe version of add-form-response-id.sql
-- Add form_response_id column to applications table

-- Add form_response_id column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'applications' AND column_name = 'form_response_id') THEN
        ALTER TABLE public.applications ADD COLUMN form_response_id UUID REFERENCES public.form_responses(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_applications_form_response_id ON applications(form_response_id);

-- Update RLS policy to allow interns to update their own applications
DROP POLICY IF EXISTS "Interns can manage their own applications" ON applications;
CREATE POLICY "Interns can manage their own applications" ON applications
    FOR ALL USING (auth.uid() = intern_id);

-- Update RLS policy to allow companies to view applications for their internships
DROP POLICY IF EXISTS "Companies can view applications for their internships" ON applications;
CREATE POLICY "Companies can view applications for their internships" ON applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM internships 
            WHERE internships.id = applications.internship_id 
            AND internships.company_id = auth.uid()
        )
    ); 