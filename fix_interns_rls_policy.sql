-- Fix infinite recursion in interns table RLS policy
-- This script removes the problematic policy that's causing infinite recursion

-- Drop the problematic policy if it exists
DROP POLICY IF EXISTS "Companies can view interns on their team" ON interns;
DROP POLICY IF EXISTS "Companies can update team assignments" ON interns;

-- Check if there are any other policies that might be causing recursion
-- List all policies on interns table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'interns'; 