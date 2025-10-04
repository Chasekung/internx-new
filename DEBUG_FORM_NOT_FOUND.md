# Debug "Form Not Found" Issue - Step by Step

## Current Status
Student user sees "Form not found" when trying to access application form, even after running RLS policy fixes.

## Immediate Debugging Steps

### Step 1: Verify SQL Was Actually Run

Run this in Supabase SQL Editor:

```sql
-- Check if the new policies exist
SELECT policyname, tablename, cmd
FROM pg_policies
WHERE policyname LIKE '%Anyone can view%'
ORDER BY tablename;
```

**Expected Result**: Should show policies like:
- `Anyone can view published forms` on `forms`
- `Anyone can view sections of published forms` on `form_sections`
- `Anyone can view questions of published forms` on `form_questions`

**If NO results**: The SQL didn't run or failed silently. Try running it again.

### Step 2: Check Browser Console Logs

Refresh the form page and look for these console logs:

**Expected successful flow:**
```
✅ Supabase ready, loading form data...
🔍 Looking for form for internship: e07deaf8-...
📊 Form query result: { form: {...}, error: null }
✅ Form found: {...}
```

**Problem indicators:**
```
⏳ Waiting for Supabase client...  // Supabase not ready
❌ Form not found. Error: {...}    // RLS blocking or form doesn't exist
📊 Form query result: { form: null, error: {...} }  // Query failed
```

### Step 3: Verify Form Actually Exists and is Published

Run in Supabase SQL Editor:

```sql
SELECT 
  f.id,
  f.title,
  f.internship_id,
  f.published,
  f.company_id,
  i.title as internship_title
FROM forms f
LEFT JOIN internships i ON f.internship_id = i.id
WHERE f.internship_id = 'e07deaf8-5600-4ce3-b2d3-1a90458a1be8';
```

**Check:**
- ✅ Does the form exist?
- ✅ Is `published = true`?
- ✅ Does `internship_id` match?

### Step 4: Test RLS Policy Directly

Run this in Supabase SQL Editor **as the student user** (if possible):

```sql
-- This simulates what the student's query does
SELECT *
FROM forms
WHERE internship_id = 'e07deaf8-5600-4ce3-b2d3-1a90458a1be8'
  AND published = true;
```

If this returns **no results**, the RLS policy is still blocking.

### Step 5: Check for Policy Conflicts

Sometimes old policies conflict with new ones:

```sql
-- List ALL policies on forms table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'forms';
```

**Look for:**
- Multiple SELECT policies (might be conflicting)
- Restrictive policies that came after the "Anyone can view" policy
- Policies with `roles` that don't include `public`

## Common Issues and Fixes

### Issue 1: SQL Didn't Actually Run

**Symptom**: No new policies in pg_policies

**Fix**: 
1. Copy SQL from `fix_all_form_rls_policies.sql`
2. Open Supabase SQL Editor (make sure you're on the right project!)
3. Paste and click "Run"
4. Wait for "Success" notification
5. Verify with: `SELECT * FROM pg_policies WHERE tablename = 'forms';`

### Issue 2: Form Isn't Published

**Symptom**: `published = false` in database

**Fix**:
```sql
UPDATE forms
SET published = true
WHERE internship_id = 'e07deaf8-5600-4ce3-b2d3-1a90458a1be8';
```

### Issue 3: Old Restrictive Policy Still Active

**Symptom**: Policies show both old and new

**Fix**:
```sql
-- Drop ALL old form policies
DROP POLICY IF EXISTS "Companies can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can create forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can update their own forms" ON public.forms;
DROP POLICY IF EXISTS "Companies can delete their own forms" ON public.forms;

-- Then re-run the new policies from fix_all_form_rls_policies.sql
```

### Issue 4: RLS Enabled But No Policies

**Symptom**: Table has RLS enabled but queries return empty

**Check**:
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'forms';
```

If `rowsecurity = true` but no SELECT policies exist, **nothing** can read the table.

**Fix**: Run the policies from `fix_all_form_rls_policies.sql`

### Issue 5: Using Wrong Project/Environment

**Symptom**: Everything looks correct but still doesn't work

**Check**:
- Are you logged into the correct Supabase project?
- Is localhost pointing to the right Supabase URL?
- Check `.env.local` for correct `NEXT_PUBLIC_SUPABASE_URL`

## Testing Procedure

1. **Run verification SQL**:
   ```sql
   -- From verify_rls_policies.sql
   SELECT * FROM pg_policies WHERE tablename = 'forms';
   ```

2. **Clear browser cache** (Cmd+Shift+R / Ctrl+Shift+R)

3. **Open console** (F12)

4. **Refresh form page**

5. **Check console logs**:
   - Should see "✅ Supabase ready"
   - Should see "✅ Form found"

6. **If still failing**, screenshot:
   - Browser console logs
   - Result of `SELECT * FROM pg_policies WHERE tablename = 'forms'`
   - Result of `SELECT * FROM forms WHERE internship_id = '...'`

## Nuclear Option - Complete Reset

If nothing else works:

```sql
-- 1. Disable RLS temporarily (CAUTION!)
ALTER TABLE public.forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_sections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions DISABLE ROW LEVEL SECURITY;

-- 2. Test if form loads now
-- If YES, the issue is definitely RLS policies

-- 3. Re-enable RLS
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;

-- 4. Drop ALL existing policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE tablename LIKE 'form%') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- 5. Re-run fresh policies from fix_all_form_rls_policies.sql
```

## What to Share for Help

If still stuck, provide:

1. **Browser console output** (copy entire console)
2. **Result of**: `SELECT * FROM pg_policies WHERE tablename IN ('forms', 'form_sections', 'form_questions')`
3. **Result of**: `SELECT id, title, published, internship_id FROM forms WHERE internship_id = 'YOUR_ID'`
4. **Screenshot** of the error page
5. **Confirm**: Did you see "Success" when running the SQL?
