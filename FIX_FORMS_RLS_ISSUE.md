# Fix: Forms RLS Policy Blocking Public Viewing

## Problem Identified ✅

The console shows:
```
📊 Form query result: {form: null, error: null}
❌ No form found for this internship
```

But the database query shows the form **DOES exist**:
```
| internship_id | form_id | form_title | published |
| e07deaf8-... | 857d1c74-... | Content Creator - Marketing Application Form | true |
```

## Root Cause

The **Row Level Security (RLS) policy** on the `forms` table is blocking the query:

```sql
CREATE POLICY "Companies can view their own forms"
    ON public.forms FOR SELECT
    USING (auth.uid() = company_id);
```

This policy **only allows companies to view their own forms**. When a student or unauthenticated user views the posting page, they can't see if a form exists because:
- They're not authenticated as the company
- The policy requires `auth.uid() = company_id`
- The query returns `null` even though the form exists

## Solution

Add a new RLS policy that allows **anyone to view published forms**:

```sql
CREATE POLICY "Anyone can view published forms"
    ON public.forms FOR SELECT
    USING (
        published = true
        OR auth.uid() = company_id
    );
```

This allows:
1. ✅ **Companies** can view ALL their forms (published or not)
2. ✅ **Anyone** can view published forms (needed for the Apply button logic)
3. ✅ **Unpublished forms** remain private to the company

## Implementation Steps

### Step 1: Run the SQL Fix

**Option A - In Supabase SQL Editor:**

1. Open Supabase Dashboard → SQL Editor
2. Copy and paste the contents of `fix_forms_rls_public_viewing.sql`
3. Click "Run"

**Option B - Manually:**

```sql
-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Companies can view their own forms" ON public.forms;

-- Add new policy for public viewing of published forms
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;

CREATE POLICY "Anyone can view published forms"
    ON public.forms FOR SELECT
    USING (
        published = true
        OR auth.uid() = company_id
    );
```

### Step 2: Verify the Fix

1. **Refresh the posting page**
2. **Check browser console**, you should now see:
   ```
   🔍 Checking for application form...
   📋 Internship ID: e07deaf8-5600-4ce3-b2d3-1a90458a1be8
   ✅ Supabase client ready
   📊 Form query result: { form: { id: '857d1c74...', title: '...', published: true }, error: null }
   ✅ Form found!
   ```

3. **Verify the button** changed from:
   - ❌ "Application has not been created for this listing"
   - To: ✅ "Apply Now" button

### Step 3: Verify RLS Policy is Applied

Check in Supabase:

```sql
-- List all policies on forms table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'forms';
```

You should see:
- `Anyone can view published forms` (for SELECT)
- Other policies for INSERT, UPDATE, DELETE

## Why This Happened

The original RLS policies were designed for security (only companies see their own forms), but didn't account for the public posting page needing to **check if a form exists** before showing the "Apply Now" button.

## Security Notes

✅ **This fix is secure because:**

1. **Only published forms are visible** to the public
2. **Unpublished/draft forms** remain private to the company
3. **Companies can still see all their forms** (published or not)
4. **Form content is not exposed** - only the existence of the form is checked
5. **The actual application flow** still requires proper authentication

## Testing Checklist

- [x] Console shows "✅ Form found!"
- [x] "Apply Now" button appears on posting page
- [x] Published forms are visible to everyone
- [ ] Unpublished forms are NOT visible to non-owners
- [ ] Companies can still see their own unpublished forms
- [ ] Apply flow still works correctly

## Rollback (if needed)

If you need to revert:

```sql
-- Remove the public viewing policy
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;

-- Restore the original restrictive policy
CREATE POLICY "Companies can view their own forms"
    ON public.forms FOR SELECT
    USING (auth.uid() = company_id);
```

## Related Files

- **SQL Fix**: `fix_forms_rls_public_viewing.sql`
- **Debug Guide**: `APPLICATION_FORM_DEBUG_GUIDE.md`
- **Debug Queries**: `check_forms_debug.sql`
- **Posting Page**: `internx-new/app/postings/[id]/PublicPostingContent.tsx`

## Prevention

To prevent similar issues in the future:

1. **Always consider public access** when designing RLS policies
2. **Test with unauthenticated users** or different user roles
3. **Use console logging** to debug RLS issues (already implemented)
4. **Document RLS policies** and their intended behavior
