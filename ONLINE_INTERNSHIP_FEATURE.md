# Online/In-Person Internship Feature

## Overview
This feature adds the ability to mark internship postings as either "Online" or "In-Person". When an internship is marked as "Online", the address-related fields are not required and not saved to the database.

## Database Changes

### SQL Script
Run the SQL script located at: `add_work_location_type.sql`

**Steps:**
1. Open Supabase SQL Editor
2. Copy and paste the contents of `add_work_location_type.sql`
3. Run the script

**What the script does:**
- Adds a new column `work_location_type` to the `internships` table
- Sets default value to `'in_person'`
- Adds a check constraint to ensure only `'online'` or `'in_person'` values are allowed
- Updates all existing records to have `'in_person'` as default
- Makes the column NOT NULL

## UI Changes

### File Modified
`internx-new/app/company/opportunities/[companyId]/page.tsx`

### Changes Made:

1. **Added `work_location_type` to Internship interface**
   - Type: `'online' | 'in_person'`

2. **Added `work_location_type` to FormState interface**
   - Default value: `'in_person'`

3. **Added Work Location Type selector in the form**
   - Dropdown with two options:
     - "In-Person" (value: `in_person`)
     - "Online" (value: `online`)
   - Placed after the "Position" field

4. **Made address fields conditional**
   - Address, City, and State fields only show when `work_location_type === 'in_person'`
   - These fields are wrapped in a conditional render: `{form.work_location_type === 'in_person' && (<>...</>)}`

5. **Updated form submission**
   - Saves `work_location_type` to database
   - Only saves address, city, and state if `work_location_type === 'in_person'`
   - Sets these fields to `null` if the internship is online

## User Experience

### For Companies:
1. When posting a new internship, they see a "Work Location Type" dropdown
2. By default, "In-Person" is selected
3. If they select "Online":
   - Address, City, and State fields disappear
   - These fields are not required
4. If they select "In-Person":
   - Address, City, and State fields appear
   - These fields are required

### For Students:
- Can filter internships by location type
- Online internships won't display address information
- In-person internships will show full address details

## Testing

### To Test:
1. Run the SQL script in Supabase
2. Refresh the application
3. Go to "Post an Internship" as a company
4. Test both options:
   - **Online**: Verify address fields don't show
   - **In-Person**: Verify address fields are required
5. Submit both types and verify data is saved correctly

### Expected Database State:
- **Online Internship**: `work_location_type = 'online'`, `address = null`, `city = null`, `state = null`
- **In-Person Internship**: `work_location_type = 'in_person'`, `address`, `city`, and `state` contain values

## Notes

- All existing internships will be marked as "In-Person" by default
- The feature is fully backwards compatible
- No migration required for existing data (handled by SQL script)
