const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NjczNSwiZXhwIjoyMDY1OTIyNzM1fQ.xR1ltK7UrMaCS0Jj6GZIwqfQlU61lxXnuifxt1511cs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFormPublishing() {
  console.log('🔍 Testing form publishing and application flow...\n');

  try {
    // Get the problematic form
    const formId = 'dc318dbd-5beb-4134-9d37-4b0146fe0d22';
    const companyId = '3c4f3273-6b4f-42e2-8355-0e8eceac6054';

    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .eq('company_id', companyId)
      .single();

    if (formError) {
      console.error('❌ Error fetching form:', formError);
      return;
    }

    console.log('📋 Form Details:');
    console.log(`Title: ${form.title}`);
    console.log(`Published: ${form.published}`);
    console.log(`Accepting Responses: ${form.accepting_responses}`);
    console.log(`Internship ID: ${form.internship_id}`);
    console.log('');

    // Check the associated internship
    if (form.internship_id) {
      const { data: internship, error: internshipError } = await supabase
        .from('internships')
        .select('id, title, position, is_active')
        .eq('id', form.internship_id)
        .single();

      if (internshipError) {
        console.error('❌ Error fetching internship:', internshipError);
      } else {
        console.log('🏢 Associated Internship:');
        console.log(`Title: ${internship.title}`);
        console.log(`Position: ${internship.position}`);
        console.log(`Active: ${internship.is_active}`);
        console.log('');
      }
    }

    // Check form sections and questions
    const { data: sections, error: sectionsError } = await supabase
      .from('form_sections')
      .select(`
        id, 
        title, 
        order_index,
        form_questions (
          id,
          question_text,
          type,
          required,
          order_index
        )
      `)
      .eq('form_id', formId)
      .order('order_index');

    if (sectionsError) {
      console.error('❌ Error fetching sections:', sectionsError);
      return;
    }

    console.log(`📝 Form Structure (${sections.length} sections):`);
    sections.forEach((section, index) => {
      console.log(`${index + 1}. Section: "${section.title}"`);
      console.log(`   Questions: ${section.form_questions?.length || 0}`);
      if (section.form_questions && section.form_questions.length > 0) {
        section.form_questions.forEach((q, qIndex) => {
          console.log(`   ${qIndex + 1}. ${q.question_text.substring(0, 50)}... (${q.type})`);
        });
      }
      console.log('');
    });

    // Check for in-progress responses
    const { data: inProgressResponses, error: responsesError } = await supabase
      .from('form_responses')
      .select('id, applicant_id, status, created_at')
      .eq('form_id', formId)
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(3);

    if (responsesError) {
      console.error('❌ Error fetching responses:', responsesError);
      return;
    }

    console.log(`🔄 Recent In-Progress Responses (${inProgressResponses.length}):`);
    inProgressResponses.forEach((response, index) => {
      console.log(`${index + 1}. Response ${response.id}`);
      console.log(`   Applicant: ${response.applicant_id}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Started: ${response.created_at}`);
      console.log('');
    });

    // Test form questions API call
    console.log('🌐 Testing form questions API...');
    try {
      const apiResponse = await fetch(`http://localhost:3000/api/companies/forms/${formId}/questions`);
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        console.log('✅ Form questions API working');
        console.log(`📊 API returned ${apiData.sections?.length || 0} sections`);
      } else {
        const errorText = await apiResponse.text();
        console.error('❌ Form questions API failed:', apiResponse.status, errorText);
      }
    } catch (apiError) {
      console.error('❌ API call failed:', apiError);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFormPublishing().catch(console.error);