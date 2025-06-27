const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testStoragePolicies() {
  try {
    console.log('Testing storage policies as a company user...');

    // First, sign in as a company user
    console.log('\nAuthenticating company user...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: process.env.TEST_COMPANY_EMAIL,
      password: process.env.TEST_COMPANY_PASSWORD
    });

    if (authError) {
      console.error('Authentication error:', authError);
      return;
    }

    console.log('Company authentication successful:', authData.user?.id);

    // Test 1: Public read access
    console.log('\n1. Testing public read access...');
    const { data: publicFiles, error: readError } = await supabase.storage
      .from('internship-pictures')
      .list();
    console.log('Public read test:', readError ? '❌ Failed' : '✅ Success');
    if (readError) console.error('Read error:', readError);
    else console.log('Files found:', publicFiles.length);

    // Test 2: Authenticated company upload
    console.log('\n2. Testing authenticated company upload...');
    // Create a small test file
    const testFile = new Uint8Array([0, 1, 2, 3]);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('internship-pictures')
      .upload(`test-file-${Date.now()}.bin`, testFile);
    console.log('Authenticated company upload test:', uploadError ? '❌ Failed' : '✅ Success');
    if (uploadError) console.error('Upload error:', uploadError);
    else console.log('Upload successful:', uploadData);

    // Test 3: Authenticated company delete
    if (uploadData) {
      console.log('\n3. Testing authenticated company delete...');
      const { data: deleteData, error: deleteError } = await supabase.storage
        .from('internship-pictures')
        .remove([uploadData.path]);
      console.log('Authenticated company delete test:', deleteError ? '❌ Failed' : '✅ Success');
      if (deleteError) console.error('Delete error:', deleteError);
      else console.log('Delete successful');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
console.log('Starting storage policy tests...');
testStoragePolicies(); 