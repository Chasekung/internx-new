# Complete RLS Fix - Forms, Sections, Questions, and Responses

## Problem

Students trying to fill out application forms see "Form not found" even though the form exists and is published.

## Root Cause

Row Level Security (RLS) policies are blocking access to:
1. ❌ `forms` table - Can't see if form exists
2. ❌ `form_sections` table - Can't see form sections
3. ❌ `form_questions` table - Can't see questions
4. ❌ `form_responses` table - Can't create responses
5. ❌ `response_answers` table - Can't save answers

The current policies only allow companies to access their own forms, preventing students from viewing or filling them out.

## Solution

Run the comprehensive SQL script that fixes ALL related tables.

## SQL Script to Run

**File**: `fix_all_form_rls_policies.sql`

**Copy and paste this into Supabase SQL Editor:**

```sql
-- Comprehensive RLS fix for all form-related tables
-- This allows students to view and fill out published application forms

-- 1. FORMS TABLE - Allow viewing published forms
DROP POLICY IF EXISTS "Companies can view their own forms" ON public.forms;
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;

CREATE POLICY "Anyone can view published forms"
    ON public.forms FOR SELECT
    USING (
        published = true
        OR auth.uid() = company_id
    );

-- 2. FORM_SECTIONS TABLE - Allow viewing sections of published forms
DROP POLICY IF EXISTS "Anyone can view sections of published forms" ON public.form_sections;

CREATE POLICY "Anyone can view sections of published forms"
    ON public.form_sections FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM forms
            WHERE forms.id = form_sections.form_id
            AND (forms.published = true OR forms.company_id = auth.uid())
        )
    );

-- 3. FORM_QUESTIONS TABLE - Allow viewing questions of published forms
DROP POLICY IF EXISTS "Anyone can view questions of published forms" ON public.form_questions;

CREATE POLICY "Anyone can view questions of published forms"
    ON public.form_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM form_sections
            JOIN forms ON forms.id = form_sections.form_id
            WHERE form_sections.id = form_questions.section_id
            AND (forms.published = true OR forms.company_id = auth.uid())
        )
    );

-- 4. FORM_RESPONSES TABLE - Allow users to create and view their own responses
DROP POLICY IF EXISTS "Users can create their own form responses" ON public.form_responses;
DROP POLICY IF EXISTS "Users can view their own form responses" ON public.form_responses;
DROP POLICY IF EXISTS "Users can update their own form responses" ON public.form_responses;
DROP POLICY IF EXISTS "Companies can view responses to their forms" ON public.form_responses;

CREATE POLICY "Users can create their own form responses"
    ON public.form_responses FOR INSERT
    WITH CHECK (
        auth.uid() = applicant_id
        AND EXISTS (
            SELECT 1 FROM forms
            WHERE forms.id = form_responses.form_id
            AND forms.published = true
        )
    );

CREATE POLICY "Users can view their own form responses"
    ON public.form_responses FOR SELECT
    USING (auth.uid() = applicant_id);

CREATE POLICY "Users can update their own form responses"
    ON public.form_responses FOR UPDATE
    USING (auth.uid() = applicant_id);

CREATE POLICY "Companies can view responses to their forms"
    ON public.form_responses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM forms
            WHERE forms.id = form_responses.form_id
            AND forms.company_id = auth.uid()
        )
    );

-- 5. RESPONSE_ANSWERS TABLE - Allow users to manage their own answers
DROP POLICY IF EXISTS "Users can create their own response answers" ON public.response_answers;
DROP POLICY IF EXISTS "Users can view their own response answers" ON public.response_answers;
DROP POLICY IF EXISTS "Users can update their own response answers" ON public.response_answers;
DROP POLICY IF EXISTS "Companies can view answers to their forms" ON public.response_answers;

CREATE POLICY "Users can create their own response answers"
    ON public.response_answers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.id = response_answers.response_id
            AND form_responses.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own response answers"
    ON public.response_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.id = response_answers.response_id
            AND form_responses.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own response answers"
    ON public.response_answers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM form_responses
            WHERE form_responses.id = response_answers.response_id
            AND form_responses.applicant_id = auth.uid()
        )
    );

CREATE POLICY "Companies can view answers to their forms"
    ON public.response_answers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM form_responses
            JOIN forms ON forms.id = form_responses.form_id
            WHERE form_responses.id = response_answers.response_id
            AND forms.company_id = auth.uid()
        )
    );
```

## What This Fixes

### ✅ For Students (Interns)
- Can **view** published forms
- Can **view** sections and questions of published forms
- Can **create** form responses (applications)
- Can **view and update** their own responses
- Can **submit** answers to questions

### ✅ For Companies
- Can **view ALL** their forms (published or not)
- Can **view** all responses to their forms
- Can **view** all answers to their form questions
- Unpublished forms remain **private**

### ✅ Security Maintained
- Students can ONLY see **published** forms
- Students can ONLY manage their **own** responses
- Companies can ONLY see responses to **their** forms
- Unpublished/draft forms remain **company-only**

## Steps to Apply

1. **Open Supabase Dashboard**
   - Go to your project
   - Click "SQL Editor" in the sidebar

2. **Paste the SQL**
   - Copy the entire SQL from `fix_all_form_rls_policies.sql`
   - Paste into the editor

3. **Run the Script**
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for "Success" message

4. **Test the Fix**
   - Refresh the form page as a student
   - The form should now load correctly
   - You should be able to fill it out and submit

## Verification

After running the SQL, verify the policies are in place:

```sql
-- Check policies on forms table
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'forms';

-- Check policies on form_sections table
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'form_sections';

-- Check policies on form_questions table
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'form_questions';

-- Check policies on form_responses table
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'form_responses';

-- Check policies on response_answers table
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'response_answers';
```

You should see the new policies listed.

## Testing Checklist

- [ ] Student can view posting page with "Apply Now" button
- [ ] Student can click "Apply Now"
- [ ] Student can see the application form
- [ ] Student can view all sections and questions
- [ ] Student can fill out answers
- [ ] Student can submit the form
- [ ] Company can view form in form builder
- [ ] Company can view submitted responses
- [ ] Unpublished forms are NOT visible to students

## Troubleshooting

### Still seeing "Form not found"?

1. **Verify the form is published**
   ```sql
   SELECT id, title, published FROM forms WHERE id = 'YOUR_FORM_ID';
   ```
   Make sure `published = true`

2. **Check if policies were applied**
   ```sql
   SELECT * FROM pg_policies WHERE tablename LIKE '%form%';
   ```

3. **Try refreshing the page** with cache clear (Cmd+Shift+R or Ctrl+Shift+R)

4. **Check browser console** for any errors

### Policy conflicts?

If you get errors about existing policies:
- The script drops old policies first
- If still erroring, manually drop the conflicting policy:
  ```sql
  DROP POLICY IF EXISTS "policy_name" ON public.table_name;
  ```

## Rollback (if needed)

To revert to company-only access:

```sql
-- Remove public viewing policies
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;
DROP POLICY IF EXISTS "Anyone can view sections of published forms" ON public.form_sections;
DROP POLICY IF EXISTS "Anyone can view questions of published forms" ON public.form_questions;

-- Restore restrictive policy
CREATE POLICY "Companies can view their own forms"
    ON public.forms FOR SELECT
    USING (auth.uid() = company_id);
```

## Related Files

- **Complete Fix**: `fix_all_form_rls_policies.sql`
- **Forms Only**: `fix_forms_rls_public_viewing.sql` 
- **Debug Guide**: `APPLICATION_FORM_DEBUG_GUIDE.md`
- **Form Page**: `app/forms/[id]/[internship_id]/page.tsx`
