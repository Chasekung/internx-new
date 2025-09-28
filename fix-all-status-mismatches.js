const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NjczNSwiZXhwIjoyMDY1OTIyNzM1fQ.xR1ltK7UrMaCS0Jj6GZIwqfQlU61lxXnuifxt1511cs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAllStatusMismatches() {
  console.log('🔍 Finding and fixing all application status mismatches...\n');

  try {
    // Get all interns who have team assignments
    const { data: internsWithTeams, error: internError } = await supabase
      .from('interns')
      .select('id, full_name, team')
      .not('team', 'is', null);

    if (internError) {
      console.error('❌ Error fetching interns:', internError);
      return;
    }

    console.log(`👥 Found ${internsWithTeams.length} interns with team assignments`);
    console.log('');

    let fixedCount = 0;
    let totalChecked = 0;

    for (const intern of internsWithTeams) {
      console.log(`🔍 Checking ${intern.full_name} (Team: ${intern.team})...`);
      
      // Get their applications
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select(`
          id,
          status,
          internships (
            title,
            position,
            companies (
              company_name
            )
          )
        `)
        .eq('intern_id', intern.id);

      if (appError) {
        console.error(`❌ Error fetching applications for ${intern.full_name}:`, appError);
        continue;
      }

      totalChecked++;

      // Look for applications that should be "accepted" based on team assignment
      for (const app of applications) {
        const internshipTitle = app.internships?.title || '';
        const internshipPosition = app.internships?.position || '';
        const companyName = app.internships?.companies?.company_name || '';
        
        // Check if this application matches their team assignment
        const isMatchingTeamPosition = 
          internshipTitle.toLowerCase().includes(intern.team.toLowerCase()) ||
          internshipPosition.toLowerCase().includes(intern.team.toLowerCase());

        if (isMatchingTeamPosition && app.status !== 'accepted') {
          console.log(`⚠️  MISMATCH: ${intern.full_name}`);
          console.log(`   Team: ${intern.team}`);
          console.log(`   Position: ${internshipTitle}`);
          console.log(`   Current Status: ${app.status} → Should be: accepted`);
          
          // Fix the status
          const { error: updateError } = await supabase
            .from('applications')
            .update({ 
              status: 'accepted',
              status_updated_at: new Date().toISOString()
            })
            .eq('id', app.id);

          if (updateError) {
            console.error(`❌ Error updating application for ${intern.full_name}:`, updateError);
          } else {
            console.log(`✅ Fixed application status for ${intern.full_name}`);
            fixedCount++;
          }
        } else if (isMatchingTeamPosition && app.status === 'accepted') {
          console.log(`✅ ${intern.full_name} - Status already correct`);
        }
      }
      console.log('');
    }

    console.log('📊 Summary:');
    console.log(`Total interns checked: ${totalChecked}`);
    console.log(`Applications fixed: ${fixedCount}`);
    console.log('');
    
    if (fixedCount > 0) {
      console.log('🎉 All status mismatches have been resolved!');
    } else {
      console.log('✅ No mismatches found - all statuses are correct!');
    }

  } catch (error) {
    console.error('❌ Fix process failed:', error);
  }
}

fixAllStatusMismatches().catch(console.error);