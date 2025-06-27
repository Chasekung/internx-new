const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function cleanupUsers() {
  try {
    console.log('Fetching all users from Supabase Auth...');
    
    // Get all users from Supabase Auth
    const { data: users, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users:', authError);
      return;
    }

    console.log(`Found ${users.users.length} users in Supabase Auth:`);
    
    for (const user of users.users) {
      console.log(`- ${user.email} (ID: ${user.id})`);
      
      // Check if user has a profile in interns table
      const { data: profile, error: profileError } = await supabase
        .from('interns')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code === 'PGRST116') {
        console.log(`  ❌ No profile found in interns table`);
        
        // Ask if user wants to delete this orphaned user
        console.log(`  💡 This user exists in Auth but not in interns table`);
        console.log(`  💡 You can either:`);
        console.log(`     1. Delete the user from Auth (will allow re-registration)`);
        console.log(`     2. Create a profile for this user`);
        console.log(`     3. Skip this user`);
        
        // For now, let's just show the info
        console.log(`  📝 To delete this user, you can use the Supabase dashboard or API`);
      } else if (profileError) {
        console.log(`  ❌ Error checking profile:`, profileError);
      } else {
        console.log(`  ✅ Profile found in interns table`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanupUsers(); 