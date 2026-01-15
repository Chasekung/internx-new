-- Update RLS policies to include Albert as admin
-- Run this in Supabase SQL Editor to add Albert as an admin

-- Drop existing policies
DROP POLICY IF EXISTS "Admin can insert hs_news" ON public.hs_news;
DROP POLICY IF EXISTS "Admin can update hs_news" ON public.hs_news;
DROP POLICY IF EXISTS "Admin can delete hs_news" ON public.hs_news;

-- Policy: Only admin (chasekung or Albert) can insert
CREATE POLICY "Admin can insert hs_news"
ON public.hs_news
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.interns
        WHERE interns.id = auth.uid()
        AND interns.username IN ('chasekung', 'Albert')
    )
);

-- Policy: Only admin (chasekung or Albert) can update
CREATE POLICY "Admin can update hs_news"
ON public.hs_news
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.interns
        WHERE interns.id = auth.uid()
        AND interns.username IN ('chasekung', 'Albert')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.interns
        WHERE interns.id = auth.uid()
        AND interns.username IN ('chasekung', 'Albert')
    )
);

-- Policy: Only admin (chasekung or Albert) can delete
CREATE POLICY "Admin can delete hs_news"
ON public.hs_news
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.interns
        WHERE interns.id = auth.uid()
        AND interns.username IN ('chasekung', 'Albert')
    )
);

