const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NjczNSwiZXhwIjoyMDY1OTIyNzM1fQ.xR1ltK7UrMaCS0Jj6GZIwqfQlU61lxXnuifxt1511cs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFormSystem() {
  console.log('🔍 Testing form system...\n');

  try {
    // Check if forms exist
    const { data: forms, error: formsError } = await supabase
      .from('forms')
      .select('id, title, company_id, internship_id, published, accepting_responses')
      .limit(5);

    if (formsError) {
      console.error('❌ Error fetching forms:', formsError);
      return;
    }

    console.log(`📋 Found ${forms.length} forms:`);
    forms.forEach((form, index) => {
      console.log(`${index + 1}. "${form.title}" (ID: ${form.id})`);
      console.log(`   Company: ${form.company_id}`);
      console.log(`   Internship: ${form.internship_id}`);
      console.log(`   Published: ${form.published}`);
      console.log(`   Accepting Responses: ${form.accepting_responses}`);
      console.log('');
    });

    // Test a specific form's questions
    if (forms.length > 0) {
      const testFormId = forms[0].id;
      console.log(`🔍 Testing questions for form: ${testFormId}`);
      
      const { data: sections, error: sectionsError } = await supabase
        .from('form_sections')
        .select('id, title, order_index')
        .eq('form_id', testFormId)
        .order('order_index');

      if (sectionsError) {
        console.error('❌ Error fetching sections:', sectionsError);
        return;
      }

      console.log(`📋 Found ${sections.length} sections for this form:`);
      sections.forEach((section, index) => {
        console.log(`${index + 1}. "${section.title}" (ID: ${section.id})`);
      });

      // Check questions for first section
      if (sections.length > 0) {
        const { data: questions, error: questionsError } = await supabase
          .from('form_questions')
          .select('id, question_text, type, required')
          .eq('section_id', sections[0].id)
          .order('order_index');

        if (questionsError) {
          console.error('❌ Error fetching questions:', questionsError);
          return;
        }

        console.log(`\n💬 Found ${questions.length} questions in first section:`);
        questions.forEach((question, index) => {
          console.log(`${index + 1}. ${question.question_text.substring(0, 50)}...`);
          console.log(`   Type: ${question.type}, Required: ${question.required}`);
        });
      }
    }

    // Check for recent form responses
    console.log('\n📝 Checking recent form responses...');
    const { data: responses, error: responsesError } = await supabase
      .from('form_responses')
      .select('id, form_id, applicant_id, status, created_at, submitted_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (responsesError) {
      console.error('❌ Error fetching responses:', responsesError);
      return;
    }

    console.log(`📊 Found ${responses.length} recent form responses:`);
    responses.forEach((response, index) => {
      console.log(`${index + 1}. Response ${response.id}`);
      console.log(`   Form: ${response.form_id}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Created: ${response.created_at}`);
      console.log(`   Submitted: ${response.submitted_at || 'Not submitted'}`);
      console.log('');
    });

    // Test form API endpoint
    console.log('🌐 Testing form questions API endpoint...');
    if (forms.length > 0) {
      const testFormId = forms[0].id;
      try {
        const response = await fetch(`http://localhost:3000/api/companies/forms/${testFormId}/questions`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ API endpoint working! Sections returned:', data.sections?.length || 0);
        } else {
          const errorText = await response.text();
          console.error('❌ API endpoint failed:', response.status, errorText);
        }
      } catch (apiError) {
        console.error('❌ API test failed:', apiError);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFormSystem().catch(console.error);