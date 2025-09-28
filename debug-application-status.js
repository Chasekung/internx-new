const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NjczNSwiZXhwIjoyMDY1OTIyNzM1fQ.xR1ltK7UrMaCS0Jj6GZIwqfQlU61lxXnuifxt1511cs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugApplicationStatus() {
  console.log('🔍 Debugging application status for Chase Kung...\n');

  try {
    // Get Chase Kung's intern record
    const { data: chaseIntern, error: internError } = await supabase
      .from('interns')
      .select('id, full_name, team')
      .eq('full_name', 'Chase Kung')
      .single();

    if (internError) {
      console.error('❌ Error fetching intern:', internError);
      return;
    }

    console.log('👤 Chase Kung Intern Record:');
    console.log(`ID: ${chaseIntern.id}`);
    console.log(`Name: ${chaseIntern.full_name}`);
    console.log(`Team: ${chaseIntern.team || 'No team assigned'}`);
    console.log('');

    // Get Chase's applications
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        status_updated_at,
        accepted_by,
        rejected_by,
        internships (
          title,
          position
        )
      `)
      .eq('intern_id', chaseIntern.id);

    if (appError) {
      console.error('❌ Error fetching applications:', appError);
      return;
    }

    console.log(`📋 Chase's Applications (${applications.length}):`);
    applications.forEach((app, index) => {
      console.log(`${index + 1}. Application ${app.id}`);
      console.log(`   Position: ${app.internships?.title || 'Unknown'}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Applied: ${app.applied_at}`);
      console.log(`   Status Updated: ${app.status_updated_at || 'Never'}`);
      console.log(`   Accepted By: ${app.accepted_by || 'N/A'}`);
      console.log(`   Rejected By: ${app.rejected_by || 'N/A'}`);
      console.log('');
    });

    // Check if there's a mismatch
    const financeApp = applications.find(app => 
      app.internships?.title?.includes('Finance') || 
      app.internships?.position?.includes('Finance')
    );

    if (financeApp) {
      console.log('🔍 Finance Application Analysis:');
      console.log(`Application Status: ${financeApp.status}`);
      console.log(`Team Assignment: ${chaseIntern.team}`);
      
      if (chaseIntern.team === 'Finance' && financeApp.status !== 'accepted') {
        console.log('⚠️  MISMATCH DETECTED:');
        console.log('   - Chase is assigned to Finance team');
        console.log(`   - But application status is "${financeApp.status}"`);
        console.log('   - Should be "accepted"');
        
        // Fix the mismatch
        console.log('\n🔧 Fixing application status...');
        const { error: updateError } = await supabase
          .from('applications')
          .update({ 
            status: 'accepted',
            status_updated_at: new Date().toISOString()
          })
          .eq('id', financeApp.id);

        if (updateError) {
          console.error('❌ Error updating application:', updateError);
        } else {
          console.log('✅ Application status updated to "accepted"');
        }
      } else if (chaseIntern.team === 'Finance' && financeApp.status === 'accepted') {
        console.log('✅ Status is correct - both team assignment and application status match');
      }
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugApplicationStatus().catch(console.error);