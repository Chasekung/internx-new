-- Add notification_email column to forms table
ALTER TABLE public.forms
ADD COLUMN IF NOT EXISTS notification_email TEXT;

-- Add comment for the column
COMMENT ON COLUMN forms.notification_email IS 'Email address to send notifications to when form is submitted';

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