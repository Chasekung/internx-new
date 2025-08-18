const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with hardcoded values for testing
const supabase = createClient(
  'https://bhoudamowgpsbwwmmuay.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDY3MzUsImV4cCI6MjAyNTkyMjczNX0.erHJkM5uq0om5ZxM-dy8XH5mSAr6q_nFUtfuIIaVfyw'
);

async function checkCompany() {
  try {
    console.log('Authenticating as company user...');
    
    // First, sign in as the company user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'stepuphs.67@gmail.com',
      password: 'Albertisfire.67'
    });

    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }

    console.log('✅ Authentication successful:', {
      id: authData.user.id,
      email: authData.user.email,
      created_at: authData.user.created_at
    });

    // Check if user exists in companies table
    console.log('\nChecking companies table...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (companyError) {
      console.error('Error checking company:', companyError);
      return;
    }

    if (!company) {
      console.log('❌ User not found in companies table');
    } else {
      console.log('✅ User found in companies table:', {
        id: company.id,
        name: company.company_name,
        email: company.email
      });
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the check
console.log('Starting company check...');
checkCompany(); 