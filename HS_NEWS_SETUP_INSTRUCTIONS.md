# High School News Section - Setup Instructions

## Overview
A complete News section for high school users with admin-only editing capabilities. Only the username "chasekung" can create, edit, and delete news articles.

## SQL Scripts - Run in Order

### Step 1: Create the News Table
Run this script first in your Supabase SQL Editor:

**File:** `sql/create_hs_news_table.sql`

This creates:
- `hs_news` table with all required fields
- Indexes for performance
- Row Level Security (RLS) policies
- Admin-only permissions (chasekung only)

### Step 2: Create Storage Bucket
Run this script second in your Supabase SQL Editor:

**File:** `sql/create_hs_news_storage_bucket.sql`

This creates:
- `hs-news-images` storage bucket
- RLS policies for image uploads
- Public read access for images

## Features Implemented

### ✅ Part 1 - Navigation
- Added "News" link under "About" dropdown in signed-out navbar
- Added to both desktop and mobile menus
- Only visible when user is signed out

### ✅ Part 2 - Public News List Page
- Route: `/hs-news`
- Modern grid-based layout (responsive)
- News cards with:
  - Headline image
  - Title and subtitle
  - Up to 2 tags displayed on top of image
  - Author and publish date
- Clicking card routes to individual article

### ✅ Part 3 - Individual Article Page
- Route: `/hs-news/[id]`
- Displays:
  - Headline image
  - Title and subtitle
  - Author and publish date
  - Full article body with rich text formatting
- **MLA Compatibility:**
  - All required metadata fields present
  - MLA citation generator included
  - Hidden metadata attributes for citation tools

### ✅ Part 4 - Admin Permissions
- **Frontend:** Admin check on all admin pages
- **Backend:** API routes verify username "chasekung"
- Non-admins see read-only access
- No admin UI visible to non-admins

### ✅ Part 5 - Admin Editor (CMS)
- **Create:** `/hs-news/admin`
- **Edit:** `/hs-news/admin/[id]`
- Features:
  - Title and subtitle inputs
  - Headline image upload
  - Tag input (max 2)
  - Rich text editor with:
    - Bold, Italic, Underline
    - Bullet points and numbered lists
    - Headings
    - Paragraphs
  - Clean, easy-to-use UI
  - Formatting renders correctly on article page

### ✅ Part 6 - Data & Safety
- News content stored in Supabase
- Unauthorized users cannot modify posts
- Admin UI hidden from non-admins
- 404 handling for missing articles
- Image uploads secured with admin checks

## API Routes

### Public Routes
- `GET /api/hs-news` - Fetch all articles
- `GET /api/hs-news/[id]` - Fetch single article

### Admin Routes (require authentication + chasekung username)
- `POST /api/hs-news` - Create article
- `PUT /api/hs-news/[id]` - Update article
- `DELETE /api/hs-news/[id]` - Delete article
- `POST /api/hs-news/upload-image` - Upload headline image

## Admin Access

To access admin features:
1. Sign in with username "chasekung"
2. Navigate to `/hs-news` - you'll see "Create Article" button
3. Or go directly to `/hs-news/admin` to create new article
4. Click "Edit Article" button on any article page to edit

## Testing Checklist

- [ ] Run SQL scripts in order
- [ ] Verify News appears in About dropdown (signed out)
- [ ] Verify `/hs-news` shows grid layout
- [ ] Verify `/hs-news/[id]` renders article correctly
- [ ] Sign in as "chasekung" and verify admin buttons appear
- [ ] Create a test article with all fields
- [ ] Verify rich text formatting works
- [ ] Verify image upload works
- [ ] Verify tags (max 2) work correctly
- [ ] Verify MLA citation is generated correctly
- [ ] Sign in as different user and verify no admin UI
- [ ] Test 404 handling for non-existent articles

## Notes

- All admin checks verify username "chasekung" in the `interns` table
- Images are stored in `hs-news-images` bucket (5MB limit)
- Rich text content is stored as HTML
- Tags are limited to maximum 2 per article (enforced in database)
- MLA citation includes all required fields for academic referencing

