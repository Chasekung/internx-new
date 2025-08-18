const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkPosting() {
  const id = 'ec5c714e-ec60-4f14-8139-b6a4d8ee0fc3'; // Using the ID from your image URL
  
  try {
    console.log('🔍 Checking internships table for posting:', id);
    
    const { data: posting, error } = await supabase
      .from('internships')
      .select(`
          id,
        title,
        company_name,
        internship_picture_1,
        internship_picture_2,
        internship_picture_3,
        internship_picture_4,
        internship_picture_5
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching posting:', error);
      return;
    }

    if (!posting) {
      console.log('❌ No posting found with ID:', id);
      return;
    }

    console.log('✅ Found posting:');
    console.log('Title:', posting.title);
    console.log('Company:', posting.company_name);
    console.log('\nImage URLs:');
    console.log('- Picture 1:', posting.internship_picture_1 || 'None');
    console.log('- Picture 2:', posting.internship_picture_2 || 'None');
    console.log('- Picture 3:', posting.internship_picture_3 || 'None');
    console.log('- Picture 4:', posting.internship_picture_4 || 'None');
    console.log('- Picture 5:', posting.internship_picture_5 || 'None');
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkPosting(); 