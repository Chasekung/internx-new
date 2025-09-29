# Form Checking Feature

## Overview

This feature automatically checks if an application form exists for a listing and displays different UI based on the form's existence.

## How it Works

### 1. Form Existence Check
When a user visits a posting page (`/postings/[id]`), the system automatically checks if a form exists for that internship in the `forms` table.

### 2. UI States

#### Loading State
- Shows a loading spinner with "Checking Application Status..." message
- Displayed while the system is checking for form existence

#### Form Exists
- Shows the standard "Apply Now" button
- Links to `/apply?internshipId={id}`

#### No Form Exists
- Shows a warning message: "Application has not been created for this listing"
- Uses a yellow background with an exclamation triangle icon
- Indicates that the company hasn't created an application form yet

### 3. Automatic Form Creation
When a user clicks "Apply Now" and no form exists:
1. The API endpoint (`/api/applications/start`) automatically creates a basic form template
2. The application process continues normally
3. The form is created with the internship ID and basic title/description

## Implementation Details

### Files Modified
- `internx-new/app/postings/[id]/PublicPostingContent.tsx`
  - Added form checking logic using `useEffect`
  - Added state management for form existence
  - Updated UI to show different states based on form existence

### Database Query
```sql
SELECT id FROM forms 
WHERE internship_id = {posting.id}
```

### State Management
- `hasApplicationForm`: Boolean indicating if form exists
- `isCheckingForm`: Boolean indicating if check is in progress

## Benefits

1. **Better User Experience**: Users immediately know if they can apply
2. **Clear Communication**: Explicit message when no application form exists
3. **Automatic Recovery**: Forms are created automatically when needed
4. **Consistent UI**: Loading states prevent confusion during checks

## Testing

Run the test script to verify functionality:
```bash
cd internx-new
node scripts/test-form-check.js
```

## Future Enhancements

1. **Real-time Updates**: Use WebSockets to update UI when forms are created
2. **Company Notifications**: Notify companies when users try to apply without forms
3. **Form Templates**: Pre-populate forms with common questions
4. **Analytics**: Track how often forms are missing vs. created automatically 