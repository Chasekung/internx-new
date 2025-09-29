const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkInterns() {
  try {
    console.log('🔍 Checking interns table...');
    
    const { data: interns, error } = await supabase
      .from('interns')
      .select('id, full_name, username, email')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching interns:', error);
      return;
    }

    console.log('📊 Found', interns?.length || 0, 'interns:');
    if (interns && interns.length > 0) {
      interns.forEach((intern, index) => {
        console.log(`${index + 1}. ID: ${intern.id}`);
        console.log(`   Name: ${intern.full_name}`);
        console.log(`   Username: ${intern.username}`);
        console.log(`   Email: ${intern.email}`);
        console.log('');
      });
    } else {
      console.log('❌ No interns found in the table');
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkInterns(); 