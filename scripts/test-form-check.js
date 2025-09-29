const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testFormChecking() {
  console.log('Testing form checking functionality...\n');

  try {
    // Get a sample internship
    const { data: internships, error: internshipError } = await supabase
      .from('internships')
      .select('id, title')
      .limit(1);

    if (internshipError) {
      console.error('Error fetching internships:', internshipError);
      return;
    }

    if (!internships || internships.length === 0) {
      console.log('No internships found in database');
      return;
    }

    const internship = internships[0];
    console.log(`Testing with internship: ${internship.title} (ID: ${internship.id})`);

    // Check if form exists for this internship
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('internship_id', internship.id)
      .maybeSingle();

    if (formError && formError.code !== 'PGRST116') {
      console.error('Error checking for form:', formError);
      return;
    }

    const hasForm = !!form;
    console.log(`Form exists for internship: ${hasForm}`);

    if (hasForm) {
      console.log('✅ Form found - Apply button should be shown');
    } else {
      console.log('❌ No form found - "Application has not been created" message should be shown');
    }

    // Test creating a form for this internship
    if (!hasForm) {
      console.log('\nTesting form creation...');
      
      const { data: newForm, error: createError } = await supabase
        .from('forms')
        .insert({
          title: `${internship.title} Application Form`,
          description: `Application form for ${internship.title}`,
          internship_id: internship.id
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating form:', createError);
        return;
      }

      console.log('✅ Form created successfully');
      console.log('Now the Apply button should be shown when the page is refreshed');

      // Clean up - delete the test form
      const { error: deleteError } = await supabase
        .from('forms')
        .delete()
        .eq('id', newForm.id);

      if (deleteError) {
        console.error('Error deleting test form:', deleteError);
      } else {
        console.log('✅ Test form cleaned up');
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testFormChecking(); 