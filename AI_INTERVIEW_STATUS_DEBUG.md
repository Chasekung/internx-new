# AI Interview Status Not Saving - Debug Guide

## Problem
Users who complete the AI interview are sent back to the "Start Interview" page on subsequent logins, even though the system knows they've completed it (prevents retaking).

## Root Cause Analysis

The issue is in the interview completion check logic:

```typescript
// In /api/interview/check-status/route.ts
const hasValidScores = !!(internData.skill_score && internData.experience_score && internData.personality_score);
const interviewTrulyCompleted = internData.interview_completed && hasValidScores;
```

The API requires **BOTH**:
1. ✅ `interview_completed = true` in the database
2. ✅ All three scores must exist (skill, experience, personality)

If the scores aren't being saved properly during interview completion, `hasValidScores` will be `false`, causing `interviewTrulyCompleted` to be `false`, which shows the gate again.

## Debugging Steps

### Step 1: Check Console Logs

After the changes, refresh the dashboard and check browser console:

**Expected logs:**
```
📊 Interview Status Check: {
  userId: "...",
  raw_interview_completed: true,
  hasValidScores: true,
  interviewTrulyCompleted: true,
  scores: { skill: X, experience: Y, personality: Z }
}
✅ Interview status loaded: { interview_completed: true, ... }
✅ Interview completed, showing dashboard
```

**Problem indicators:**
```
📊 Interview Status Check: {
  raw_interview_completed: true,  // ✅ This is true
  hasValidScores: false,           // ❌ But no scores!
  interviewTrulyCompleted: false   // ❌ So shows gate
}
⚠️ Interview not completed, showing gate
```

### Step 2: Check Database

Run in Supabase SQL Editor:

```sql
SELECT 
  id,
  full_name,
  interview_completed,
  interview_completed_at,
  skill_score,
  experience_score,
  personality_score,
  overall_match_score
FROM interns
WHERE interview_completed = true
ORDER BY interview_completed_at DESC
LIMIT 10;
```

**Check for users with**:
- ✅ `interview_completed = true`
- ❌ `skill_score = NULL`
- ❌ `experience_score = NULL`  
- ❌ `personality_score = NULL`

If scores are NULL, the interview completion isn't saving scores properly!

### Step 3: Check Interview Complete API

Look at `/api/interview/complete-session/route.ts` - verify it's setting all the scores:

```typescript
await supabase
  .from('interns')
  .update({
    interview_completed: true,
    interview_completed_at: new Date().toISOString(),
    skill_score: scores.skill_score,           // These must be set!
    experience_score: scores.experience_score,
    personality_score: scores.personality_score,
    overall_match_score: scores.overall_match_score
  })
  .eq('id', user.id);
```

## Solutions

### Solution 1: If Scores Are Missing - Fix Complete Session API

Check if `/api/interview/complete-session/route.ts` is properly calculating and saving scores.

### Solution 2: For Existing Users With Missing Scores

If users have `interview_completed = true` but no scores, you can either:

**A. Allow them through anyway:**
```typescript
// Change the logic to NOT require scores
const interviewTrulyCompleted = internData.interview_completed;
```

**B. Reset their interview status:**
```sql
UPDATE interns
SET interview_completed = false,
    interview_completed_at = NULL
WHERE interview_completed = true
AND (skill_score IS NULL OR experience_score IS NULL OR personality_score IS NULL);
```

### Solution 3: Add Fallback for Legacy Users

```typescript
// In check-status/route.ts
const hasValidScores = !!(internData.skill_score && internData.experience_score && internData.personality_score);

// Allow completed interviews even without scores (legacy users)
const interviewTrulyCompleted = internData.interview_completed;

// But flag users who need scores
const needsScoreUpdate = internData.interview_completed && !hasValidScores;
```

## Files Modified

1. ✅ `/app/api/interview/check-status/route.ts` - Added logging
2. ✅ `/src/components/AIInterviewGate.tsx` - Added logging

## Testing Procedure

### Test with New User:
1. Create new student account
2. Complete AI interview
3. **Check terminal logs** - should show scores being saved
4. Refresh dashboard
5. **Check browser console** - should show all scores present
6. Should go straight to dashboard (no gate)

### Test with Existing User:
1. Login as user who already completed interview
2. **Check browser console**
3. Look for the status check log
4. If `hasValidScores: false`, run SQL to check if scores exist
5. If no scores, run Solution 2B to reset their interview

## Quick Fix for Testing

To test if the gate is working correctly, temporarily change the logic:

```typescript
// In /app/api/interview/check-status/route.ts
// Comment out the scores requirement:
const interviewTrulyCompleted = internData.interview_completed; // Always trust interview_completed flag
```

Then test:
- ✅ Should go straight to dashboard if `interview_completed = true`
- ✅ Should show gate if `interview_completed = false`

## Next Steps

1. **Check browser console** for the new logs
2. **Check database** for users with missing scores
3. **Based on findings**, choose Solution 1, 2, or 3
4. **Share console logs** if still not working

The logs will tell us exactly what's happening!
