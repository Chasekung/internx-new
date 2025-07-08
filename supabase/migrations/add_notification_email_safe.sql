-- Safe version of add_notification_email.sql
-- Add notification_email column to forms table

-- Add notification_email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'forms' AND column_name = 'notification_email') THEN
        ALTER TABLE public.forms ADD COLUMN notification_email TEXT;
    END IF;
END $$;

-- Add comment for the column
DO $$
BEGIN
    EXECUTE 'COMMENT ON COLUMN forms.notification_email IS ''Email address to send notifications to when form is submitted''';
END $$;

-- Create index for better performance when querying by notification email
CREATE INDEX IF NOT EXISTS idx_forms_notification_email ON forms(notification_email);

-- Update RLS policies to allow access to notification_email
DROP POLICY IF EXISTS "Companies can manage their own forms" ON public.forms;
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