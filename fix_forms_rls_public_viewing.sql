-- Fix RLS policy to allow public viewing of published forms
-- This allows the posting page to check if an application form exists

-- Add policy for anyone to view published forms
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;

CREATE POLICY "Anyone can view published forms"
    ON public.forms FOR SELECT
    USING (
        published = true
        OR auth.uid() = company_id
    );

-- Note: This replaces the more restrictive policy that only allowed
-- companies to view their own forms. Now:
-- 1. Companies can view their own forms (published or not)
-- 2. Anyone can view published forms (needed for the Apply button logic)

-- You may need to drop the old restrictive policy first:
DROP POLICY IF EXISTS "Companies can view their own forms" ON public.forms;
