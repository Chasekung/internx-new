const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NjczNSwiZXhwIjoyMDY1OTIyNzM1fQ.xR1ltK7UrMaCS0Jj6GZIwqfQlU61lxXnuifxt1511cs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupOrphanedSessions() {
  console.log('🧹 Cleaning up orphaned interview sessions...\n');

  // Find all users who have completed interviews but still have active sessions
  const { data: usersWithCompletedInterviews, error: usersError } = await supabase
    .from('interns')
    .select('id, full_name, email, interview_completed')
    .eq('interview_completed', true);

  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }

  console.log(`📊 Found ${usersWithCompletedInterviews.length} users with completed interviews\n`);

  for (const user of usersWithCompletedInterviews) {
    // Check for active sessions for this user
    const { data: activeSessions, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, started_at')
      .eq('intern_id', user.id)
      .eq('session_status', 'in_progress');

    if (sessionError) {
      console.error(`❌ Error checking sessions for ${user.full_name}:`, sessionError);
      continue;
    }

    if (activeSessions.length > 0) {
      console.log(`🔧 ${user.full_name} (${user.email}) has ${activeSessions.length} orphaned sessions`);
      
      // Update all active sessions to completed
      const { error: updateError } = await supabase
        .from('interview_sessions')
        .update({ 
          session_status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('intern_id', user.id)
        .eq('session_status', 'in_progress');

      if (updateError) {
        console.error(`❌ Error updating sessions for ${user.full_name}:`, updateError);
      } else {
        console.log(`✅ Updated ${activeSessions.length} sessions to completed for ${user.full_name}`);
      }
    }
  }

  console.log('\n🎉 Cleanup completed!');
}

cleanupOrphanedSessions().catch(console.error);