-- Verify that RLS policies were applied correctly
-- Run this to check if the policies exist

-- Check all policies on forms-related tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('forms', 'form_sections', 'form_questions', 'form_responses', 'response_answers')
ORDER BY tablename, policyname;

-- Specific check for the "Anyone can view published forms" policy
SELECT 
    policyname,
    tablename,
    cmd,
    qual
FROM pg_policies
WHERE policyname LIKE '%Anyone can view%'
   OR policyname LIKE '%published%';
