-- Debug script to check forms in the database
-- Run this in Supabase SQL Editor to see all forms and their internship associations

-- 1. Show all forms with their internship IDs
SELECT 
  f.id as form_id,
  f.title as form_title,
  f.internship_id,
  f.company_id,
  f.published,
  f.status,
  f.created_at
FROM forms f
ORDER BY f.created_at DESC
LIMIT 20;

-- 2. Show forms with matching internships
SELECT 
  f.id as form_id,
  f.title as form_title,
  f.internship_id,
  i.id as internship_id_check,
  i.title as internship_title,
  i.company_id as internship_company_id,
  f.published,
  f.status
FROM forms f
LEFT JOIN internships i ON f.internship_id = i.id
ORDER BY f.created_at DESC
LIMIT 20;

-- 3. Show internships without forms
SELECT 
  i.id as internship_id,
  i.title as internship_title,
  i.company_id,
  i.is_active,
  COUNT(f.id) as form_count
FROM internships i
LEFT JOIN forms f ON i.id = f.internship_id
GROUP BY i.id, i.title, i.company_id, i.is_active
HAVING COUNT(f.id) = 0
ORDER BY i.created_at DESC
LIMIT 10;

-- 4. Show the specific internship from your screenshot (Marketing)
-- Replace with your actual internship ID if you know it
SELECT 
  i.id as internship_id,
  i.title as internship_title,
  i.position,
  i.category,
  i.company_id,
  f.id as form_id,
  f.title as form_title,
  f.published
FROM internships i
LEFT JOIN forms f ON i.id = f.internship_id
WHERE i.category = 'Marketing'
   OR i.position LIKE '%Marketing%'
   OR i.title LIKE '%Marketing%'
ORDER BY i.created_at DESC;
