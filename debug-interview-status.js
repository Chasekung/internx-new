const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NjczNSwiZXhwIjoyMDY1OTIyNzM1fQ.xR1ltK7UrMaCS0Jj6GZIwqfQlU61lxXnuifxt1511cs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugInterviewStatus() {
  console.log('🔍 Debugging interview status...\n');

  // Check all users with interview data
  const { data: users, error: usersError } = await supabase
    .from('interns')
    .select('id, full_name, email, interview_completed, interview_completed_at, skill_score, experience_score, personality_score, overall_match_score')
    .not('interview_completed', 'is', null);

  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }

  console.log(`📊 Found ${users.length} users with interview data:\n`);

  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.full_name} (${user.email})`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Interview Completed: ${user.interview_completed}`);
    console.log(`   Completed At: ${user.interview_completed_at}`);
    console.log(`   Skill Score: ${user.skill_score}`);
    console.log(`   Experience Score: ${user.experience_score}`);
    console.log(`   Personality Score: ${user.personality_score}`);
    console.log(`   Overall Match Score: ${user.overall_match_score}`);
    
    const hasValidScores = (
      user.skill_score !== null && user.skill_score !== undefined &&
      user.experience_score !== null && user.experience_score !== undefined &&
      user.personality_score !== null && user.personality_score !== undefined
    );
    const interviewTrulyCompleted = user.interview_completed && hasValidScores;
    
    console.log(`   Has Valid Scores: ${hasValidScores}`);
    console.log(`   Interview Truly Completed: ${interviewTrulyCompleted}`);
    console.log('');
  });

  // Check interview sessions
  console.log('📋 Checking interview sessions...\n');
  
  const { data: sessions, error: sessionsError } = await supabase
    .from('interview_sessions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);

  if (sessionsError) {
    console.error('❌ Error fetching sessions:', sessionsError);
    return;
  }

  sessions.forEach((session, index) => {
    console.log(`${index + 1}. Session ${session.id}`);
    console.log(`   Intern ID: ${session.intern_id}`);
    console.log(`   Status: ${session.session_status}`);
    console.log(`   Started: ${session.started_at}`);
    console.log(`   Completed: ${session.completed_at}`);
    console.log('');
  });

  // Check interview responses for recent sessions
  console.log('💬 Checking recent interview responses...\n');
  
  const { data: responses, error: responsesError } = await supabase
    .from('interview_responses')
    .select('session_id, question_text, response_text, ai_analysis, response_score, asked_at')
    .order('asked_at', { ascending: false })
    .limit(5);

  if (responsesError) {
    console.error('❌ Error fetching responses:', responsesError);
    return;
  }

  responses.forEach((response, index) => {
    console.log(`${index + 1}. Response for session ${response.session_id}`);
    console.log(`   Question: ${response.question_text?.substring(0, 50)}...`);
    console.log(`   Response: ${response.response_text?.substring(0, 50)}...`);
    console.log(`   Score: ${response.response_score}`);
    console.log(`   Asked At: ${response.asked_at}`);
    console.log('');
  });
}

debugInterviewStatus().catch(console.error);