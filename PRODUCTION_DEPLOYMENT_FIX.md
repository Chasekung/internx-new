# 🔧 Production Email Verification Fix

## Issue
Email verification links were redirecting to `localhost` instead of `joinstepup.com` in production.

## Root Cause
The `NEXT_PUBLIC_SITE_URL` environment variable was not set in production, causing the app to default to `http://localhost:3000` for email verification redirects.

## Solution Steps

### 1. ✅ Code Changes (COMPLETED)
- Updated `env.template` to include `NEXT_PUBLIC_SITE_URL`
- Updated `/app/api/auth/signup/route.ts` to use `emailRedirectTo` with the site URL
- Updated `/app/api/auth/resend-verification/route.ts` (already had this)

### 2. 🔴 Environment Variable Configuration (ACTION REQUIRED)

#### For Vercel Deployment:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add the following variable:
   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://joinstepup.com
   Environment: Production
   ```
5. Click "Save"
6. Redeploy your application for the changes to take effect

#### For Local Development:
Create `.env.local` file in the `internx-new` directory:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 🔴 Supabase Dashboard Configuration (ACTION REQUIRED)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Update the following settings:

   **Site URL:**
   ```
   https://joinstepup.com
   ```

   **Redirect URLs (Add both):**
   ```
   https://joinstepup.com/auth/callback
   https://joinstepup.com/**
   ```

5. Click "Save"

### 4. 🔴 Test Email Verification (ACTION REQUIRED)

After completing steps 2 and 3:

1. Create a test account on your production site
2. Check the verification email
3. Click the verification link
4. Verify it redirects to `https://joinstepup.com/auth/callback` (not localhost)
5. Ensure you're redirected to the appropriate sign-in page

## Technical Details

### Files Modified:
- `internx-new/env.template` - Added `NEXT_PUBLIC_SITE_URL` variable
- `internx-new/app/api/auth/signup/route.ts` - Added `emailRedirectTo` option

### How It Works:
1. When a user signs up, the app sends a verification email
2. The email contains a link to Supabase's auth endpoint
3. Supabase processes the verification and redirects to the URL specified in `emailRedirectTo`
4. The callback route (`/auth/callback`) exchanges the code for a session
5. User is redirected to the appropriate sign-in page based on their role

## Troubleshooting

### If emails still redirect to localhost:
1. Verify the environment variable is set in Vercel
2. Check that you've redeployed after adding the env variable
3. Verify Supabase URL configuration includes your production domain
4. Clear browser cache and test with a new email

### If verification fails:
1. Check Supabase Authentication logs for errors
2. Verify the redirect URLs in Supabase include `/auth/callback`
3. Ensure CORS settings in Supabase allow your domain

### If no emails are being sent:
1. Verify SMTP is configured in Supabase (see `email-verification-setup.md`)
2. Check Supabase email rate limits
3. Look in spam/junk folders

## Next Steps
- [ ] Set `NEXT_PUBLIC_SITE_URL` in Vercel environment variables
- [ ] Update Supabase URL configuration
- [ ] Test with a new user signup
- [ ] Verify email links point to production domain

