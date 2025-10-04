-- Check the current status of applications for Chase Kung
SELECT 
  a.id,
  a.status,
  a.applied_at,
  i.full_name,
  i.team,
  int.title as internship_title,
  int.position
FROM applications a
JOIN interns i ON a.intern_id = i.id
JOIN internships int ON a.internship_id = int.id
WHERE i.full_name LIKE '%Chase%Kung%'
ORDER BY a.applied_at DESC;
