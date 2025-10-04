# Supabase Client Initialization Fix

## Problem
When navigating to the "Preview & Publish" page, the browser console showed:
```
❌ Supabase client not initialized
```

The form preview page was trying to load form data before the Supabase client was ready, causing the page to fail and show "Form not found".

## Root Cause
The `useSupabase()` hook is asynchronous and takes time to initialize the Supabase client. However, the `loadFormData()` function was being called immediately in a `useEffect` with an empty dependency array `[]`, before the `supabase` client was ready:

```typescript
const { supabase, error: supabaseError } = useSupabase();

useEffect(() => {
  // Detect user role
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      setUserRole(user.role);
    } catch (e) {
      console.error('Error parsing user data:', e);
    }
  }
  
  loadFormData();  // ❌ Called before supabase is ready!
}, []);
```

## Solution
Implemented a two-part fix:

### 1. Wrapped `loadFormData` in `useCallback`
This allows the function to be used as a dependency in `useEffect` without causing infinite re-renders:

```typescript
const loadFormData = useCallback(async () => {
  // ... function body ...
}, [supabase, formId, companyId, router]);
```

### 2. Added a separate `useEffect` that waits for Supabase
Only calls `loadFormData()` when the `supabase` client is ready:

```typescript
useEffect(() => {
  // Only load form data when supabase is ready
  if (supabase) {
    console.log('✅ Supabase client ready, loading form data...');
    loadFormData();
  }
}, [supabase, loadFormData]);
```

## Files Modified

### `internx-new/app/company/form-builder-pnp/[companyId]/[formId]/page.tsx`

**Changes:**

1. **Line 3**: Added `useCallback` import
   ```typescript
   import { useState, useEffect, useCallback } from 'react';
   ```

2. **Lines 95-208**: Wrapped `loadFormData` in `useCallback` with proper dependencies
   ```typescript
   const loadFormData = useCallback(async () => {
     // ... function body ...
   }, [supabase, formId, companyId, router]);
   ```

3. **Lines 210-216**: Added new `useEffect` that waits for Supabase client
   ```typescript
   useEffect(() => {
     if (supabase) {
       console.log('✅ Supabase client ready, loading form data...');
       loadFormData();
     }
   }, [supabase, loadFormData]);
   ```

## Benefits
1. ✅ **Supabase client is initialized before use** - no more "not initialized" errors
2. ✅ **Proper React dependency management** - no infinite re-renders
3. ✅ **Clear console logging** - shows when Supabase is ready
4. ✅ **Preview & Publish now works correctly**

## Testing
To verify the fix:

1. Open browser console (F12)
2. Navigate to form builder
3. Click "Preview & Publish"
4. You should see in console:
   ```
   🔍 Loading form data for formId: ... companyId: ...
   ✅ Supabase client ready, loading form data...
   📡 Fetching form from database...
   ✅ Form loaded successfully: ...
   ```
5. The form preview should display correctly without errors

## Related Issues
This fix works together with the fallback query strategy in `FORM_PREVIEW_FIX.md` to ensure:
- The Supabase client is ready before making queries
- Queries handle both company-created and auto-generated forms
