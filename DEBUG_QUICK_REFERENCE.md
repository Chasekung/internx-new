# 🚀 Debug Quick Reference - AI Form Builder

## Quick Test

```bash
1. npm run dev
2. Open form builder in browser
3. Press F12 (open console)
4. Click "AI Assistant" button
5. Click "🧪 Test AI (Debug)" button
6. Watch console logs
```

## What to Look For

### ✅ Success Pattern
```
[TIME] [AI-FORM] 🔧 applyAiForm() CALLED
[TIME] [AI-FORM] 📝 Starting section creation loop...
[TIME] [FORM-BUILDER] ✅ addSection() SUCCESS
[TIME] [FORM-BUILDER] ✅ addQuestion() SUCCESS
[TIME] [AI-FORM] ✅ AI form application complete
[TIME] [AI-FORM] 🔧 Calling saveForm(skipToast=true)
[TIME] [FORM-SAVE] ✅ Form metadata updated
[TIME] [FORM-SAVE] ✅ Sections upserted successfully
[TIME] [FORM-SAVE] ✅ API response: {success: true}
[TIME] [FORM-SAVE] ✅ Form saved successfully
[TIME] [AI-FORM] ✅ AI-generated form saved to Supabase successfully
```

### ❌ Common Failure Points

#### 1. Sections Not Created
```
Look for: [FORM-BUILDER] ❌ addSection() FAILED
Cause: Section creation failed
Fix: Check React state, verify form builder initialized
```

#### 2. Questions Not Created
```
Look for: [FORM-BUILDER] ❌ Section not found
Cause: Section ID doesn't exist when adding question
Fix: Verify section was created and ID was returned
```

#### 3. Save Not Triggered
```
Missing: [AI-FORM] 🔧 Calling saveForm(skipToast=true)
Cause: isAiApplying became false during creation
Fix: Check for errors during section/question creation
```

#### 4. Metadata Save Failed
```
Look for: [FORM-SAVE] ❌ Form metadata update error
Cause: Supabase client or permissions issue
Fix: Check env vars, RLS policies, network
```

#### 5. Sections Save Failed
```
Look for: [FORM-SAVE] ❌ Sections upsert error
Cause: Foreign key constraint or schema issue
Fix: Verify form_sections table exists, form_id is valid
```

#### 6. Questions Save Failed
```
Look for: [FORM-SAVE] ❌ API error (status 500)
Cause: Backend API error
Fix: Check server logs, verify question schema
```

## Key Logs to Examine

### Before Operation
```
[FORM-SAVE] 📊 REACT STATE BEFORE SAVE
- Shows: sections, questions, full structure
- Use: Verify data is in React state before save
```

### During Operation
```
[FORM-SAVE] 📤 Sections payload
[FORM-SAVE] 📤 Questions payload (full)
- Shows: Exact data being sent to Supabase
- Use: Verify payload structure is correct
```

### After Operation
```
[FORM-SAVE] 📥 Supabase response
- Shows: What Supabase returned
- Use: Verify data was actually saved
```

### On Error
```
[FORM-SAVE] ❌ API error: {...}
[FORM-SAVE] 📋 Error details: {message, code, hint}
[FORM-SAVE] 📊 State at error: {...}
[FORM-SAVE] 📋 Checkpoint state: {...}
- Shows: Complete error context
- Use: Diagnose exact problem and recover state
```

## Timing Reference

Expected durations:
```
addSection():      < 10ms
addQuestion():     < 10ms
saveForm():        500-2000ms (depends on data)
  - Metadata:      100-300ms
  - Sections:      100-300ms
  - Questions API: 200-1500ms
applyAiForm():     2000-5000ms (depends on size)
```

If timing is much longer:
- Network issue
- Supabase performance issue
- Too many questions
- Browser performance issue

## Log Icons Reference

| Icon | Meaning |
|------|---------|
| 🔧 | Function called |
| 📥 | Input received |
| 📤 | Output returned |
| ✅ | Success |
| ❌ | Error |
| 📊 | State snapshot |
| 💾 | Save operation |
| ⏱️ | Duration |
| 🧪 | Test mode |

## Quick Debug Checklist

When data doesn't persist:

- [ ] Check: `[AI-FORM] ✅ AI form application complete` appears
- [ ] Check: `[AI-FORM] 🔧 Calling saveForm()` appears
- [ ] Check: `[FORM-SAVE] 🔧 saveForm() CALLED` appears
- [ ] Check: All 3 save steps complete (metadata, sections, questions)
- [ ] Check: `[FORM-SAVE] ✅ Form saved successfully` appears
- [ ] Check: No ❌ errors in console
- [ ] Verify: React state before save has all data
- [ ] Verify: Payloads being sent are correct
- [ ] Verify: Supabase responses return data
- [ ] Check: Database tables have the data

## Test Function Details

The test creates:
- **2 sections**
- **3 questions total**
  - 1 short_text (required)
  - 1 multiple_choice (3 options)
  - 1 long_text (required)

Small enough to debug easily, complex enough to test all paths.

## Console Tips

```javascript
// Clear console before test
console.clear()

// Filter logs by prefix
// In Chrome DevTools console filter:
[AI-FORM]      // Only AI form logs
[FORM-SAVE]    // Only save logs
❌             // Only errors
✅             // Only successes

// Copy all logs
// Right-click console → Save as...
```

## If Everything Looks Good But Still Not Persisting

1. Check Network Tab (F12 → Network)
   - Look for POST requests to `/api/companies/forms/[formId]/questions`
   - Check request payload
   - Check response status

2. Check Supabase Dashboard
   - Tables → forms → Check row exists
   - Tables → form_sections → Check sections exist
   - Tables → form_questions → Check questions exist

3. Check Server Logs
   - Terminal where `npm run dev` is running
   - Look for API errors
   - Check Supabase connection

4. Check Environment Variables
   - `.env.local` exists
   - `NEXT_PUBLIC_SUPABASE_URL` set
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` set

5. Check Permissions
   - Supabase → Authentication → RLS policies
   - Verify policies allow INSERT/UPDATE

## Rollback

If something goes wrong:
```
1. Click "Undo AI Changes" button
2. Check console for: [AI-FORM] ↩️ Reverting to checkpoint
3. Verify: [AI-FORM] ✅ Reverted to checkpoint
4. State should restore to before AI ran
```

---

**Remember:** The logs will tell you exactly where the problem is! 🎯

Every step is logged with timestamps and full details.


