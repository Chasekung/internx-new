const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NjczNSwiZXhwIjoyMDY1OTIyNzM1fQ.xR1ltK7UrMaCS0Jj6GZIwqfQlU61lxXnuifxt1511cs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function regenerateTest1Scores() {
  console.log('🔄 Testing AI score regeneration for Test1...\n');

  const test1UserId = '99575c9f-293c-45f6-bf86-eb7b216eb868';

  try {
    // Call the regenerate API endpoint
    const response = await fetch('http://localhost:3000/api/interview/regenerate-ai-scores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: We'd need the actual session token, but for testing we can modify the endpoint temporarily
      }
    });

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const errorData = await response.text();
      console.error('Error details:', errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ Regeneration successful!');
    console.log('📊 New scores:', result.scores);

    // Check the updated recommendations in the database
    const { data: updatedData, error } = await supabase
      .from('interns')
      .select('business_finance_recommendation, technology_engineering_recommendation, education_nonprofit_recommendation, healthcare_sciences_recommendation, creative_media_recommendation')
      .eq('id', test1UserId)
      .single();

    if (error) {
      console.error('❌ Error fetching updated data:', error);
      return;
    }

    console.log('\n📝 Updated Recommendations:');
    console.log('Business & Finance:', updatedData.business_finance_recommendation);
    console.log('Technology & Engineering:', updatedData.technology_engineering_recommendation);
    console.log('Education & Non-Profit:', updatedData.education_nonprofit_recommendation);
    console.log('Healthcare & Sciences:', updatedData.healthcare_sciences_recommendation);
    console.log('Creative & Media:', updatedData.creative_media_recommendation);

  } catch (error) {
    console.error('❌ Error during regeneration:', error);
  }
}

regenerateTest1Scores().catch(console.error);