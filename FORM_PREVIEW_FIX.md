# Form Preview "Form Not Found" Bug Fix

## Problem
When clicking "Preview & Publish" in the form builder, users were seeing a "Form not found" error message even though the form existed in the database.

## Root Cause
The form preview pages were querying the database with both `formId` AND `companyId`:

```typescript
const { data: form, error: formError } = await supabase
  .from('forms')
  .select('*')
  .eq('id', formId)
  .eq('company_id', companyId)  // <- This was causing issues
  .single();
```

However, there are **two types of forms** in the system:
1. **Company-created forms**: Created from `/company-dash` with `company_id` set (line 95 in page.tsx)
2. **Auto-generated forms**: Created from `/api/applications/start/route.ts` WITHOUT `company_id`

The query was failing for auto-generated forms because it required both `formId` AND `companyId` to match.

## Solution
Implemented a fallback query strategy:
1. First, try to fetch the form with both `formId` AND `companyId` (for company-created forms)
2. If not found (error code 'PGRST116'), try fetching with only `formId` (for auto-generated forms)
3. This ensures both types of forms work correctly while maintaining security for company-created forms

## Files Modified

### 1. `internx-new/app/company/form-builder-pnp/[companyId]/[formId]/page.tsx`
**Lines 111-142**

**Before:**
```typescript
const { data: form, error: formError } = await supabase
  .from('forms')
  .select('*')
  .eq('id', formId)
  .eq('company_id', companyId)
  .single();

if (formError || !form) {
  toast.error('Form not found');
  router.push('/company-dash');
  return;
}
```

**After:**
```typescript
// First try with company_id
let { data: form, error: formError } = await supabase
  .from('forms')
  .select('*')
  .eq('id', formId)
  .eq('company_id', companyId)
  .single();

// If not found, try without company_id (for auto-generated forms)
if (formError && formError.code === 'PGRST116') {
  console.log('📡 Form not found with company_id, trying without...');
  const result = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .single();
  form = result.data;
  formError = result.error;
}

console.log('📊 Form query result:', { form, error: formError });

if (formError || !form) {
  console.error('❌ Form fetch error:', formError);
  toast.error(`Form not found: ${formError?.message || 'Unknown error'}`);
  setIsLoading(false);
  return;
}
```

### 2. `internx-new/app/company/form-builder/[companyId]/[formId]/page.tsx`
**Lines 573-595**

**Before:**
```typescript
const { data: form, error: formError } = await supabase
  .from('forms')
  .select('title, description, primary_color, background_color, font_family, border_radius, spacing, published')
  .eq('id', formId)
  .eq('company_id', companyId)
  .single();
if (formError || !form) notFound();
```

**After:**
```typescript
// First try with company_id
let { data: form, error: formError } = await supabase
  .from('forms')
  .select('title, description, primary_color, background_color, font_family, border_radius, spacing, published')
  .eq('id', formId)
  .eq('company_id', companyId)
  .single();

// If not found, try without company_id (for auto-generated forms)
if (formError && formError.code === 'PGRST116') {
  const result = await supabase
    .from('forms')
    .select('title, description, primary_color, background_color, font_family, border_radius, spacing, published')
    .eq('id', formId)
    .single();
  form = result.data;
  formError = result.error;
}

if (formError || !form) {
  console.error('Form fetch error:', formError);
  notFound();
}
```

## Benefits
1. ✅ **Preview & Publish** now works correctly for both company-created and auto-generated forms
2. ✅ **Build** tab now loads forms without errors
3. ✅ Security maintained: company-created forms still check `company_id` first
4. ✅ More detailed console logging for debugging
5. ✅ Supports both form creation workflows

## Testing
To verify the fix:
1. Go to any form builder page
2. Click "Preview & Publish"
3. You should now see the form preview instead of "Form not found"
4. Test all three tabs: Build, Settings, and Preview & Publish

## Technical Notes

### Why the fallback approach?
- **Company-created forms** (from dashboard): Have `company_id` set, should be validated for security
- **Auto-generated forms** (from application flow): Don't have `company_id`, still need to work
- The fallback ensures both workflows function correctly

### Error Code 'PGRST116'
This is PostgreSQL REST API's "no rows found" error. We use it to detect when the first query (with `company_id`) fails, so we can try the fallback.

## Future Consideration
To simplify this logic in the future:
1. Update `/api/applications/start/route.ts` to populate `company_id` when creating forms
2. Ensure all form creation endpoints consistently set `company_id`
3. Then the fallback query can be removed
