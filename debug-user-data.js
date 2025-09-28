const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM0NjczNSwiZXhwIjoyMDY1OTIyNzM1fQ.xR1ltK7UrMaCS0Jj6GZIwqfQlU61lxXnuifxt1511cs';

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugTest1UserData() {
  console.log('🔍 Debugging Test1 user data...\n');

  const test1UserId = '99575c9f-293c-45f6-bf86-eb7b216eb868';

  // Get Test1's profile data
  const { data: internData, error: internError } = await supabase
    .from('interns')
    .select('*')
    .eq('id', test1UserId)
    .single();

  if (internError) {
    console.error('❌ Error fetching intern data:', internError);
    return;
  }

  console.log('👤 Test1 Profile Data:');
  console.log(`Name: ${internData.full_name}`);
  console.log(`Bio: ${internData.bio || 'Not provided'}`);
  console.log(`Skills: ${internData.skills || 'Not provided'}`);
  console.log(`Experience: ${internData.experience || 'Not provided'}`);
  console.log(`Extracurriculars: ${internData.extracurriculars || 'Not provided'}`);
  console.log(`Achievements: ${internData.achievements || 'Not provided'}`);
  console.log(`Career Interests: ${internData.career_interests || 'Not provided'}`);
  console.log(`High School: ${internData.high_school || 'Not provided'}`);
  console.log(`Grade Level: ${internData.grade_level || 'Not provided'}`);
  console.log('');

  // Get Test1's latest completed session
  const { data: session, error: sessionError } = await supabase
    .from('interview_sessions')
    .select('*')
    .eq('intern_id', test1UserId)
    .eq('session_status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  if (sessionError) {
    console.error('❌ Error fetching session:', sessionError);
    return;
  }

  console.log(`📋 Latest Interview Session: ${session.id}`);
  console.log(`Status: ${session.session_status}`);
  console.log(`Started: ${session.started_at}`);
  console.log(`Completed: ${session.completed_at}`);
  console.log('');

  // Get Test1's interview responses
  const { data: responses, error: responsesError } = await supabase
    .from('interview_responses')
    .select('*')
    .eq('session_id', session.id)
    .order('asked_at', { ascending: true });

  if (responsesError) {
    console.error('❌ Error fetching responses:', responsesError);
    return;
  }

  console.log(`💬 Interview Responses (${responses.length}):`);
  responses.forEach((response, index) => {
    console.log(`${index + 1}. Q: ${response.question_text}`);
    console.log(`   A: ${response.response_text}`);
    console.log(`   Score: ${response.response_score}`);
    console.log('');
  });

  // Check if there are any other users with entrepreneurial data
  console.log('🔍 Searching for users with entrepreneurial experience...\n');
  
  const { data: entrepreneurialUsers, error: searchError } = await supabase
    .from('interns')
    .select('id, full_name, email, bio, experience, achievements, extracurriculars')
    .or('bio.ilike.%founder%,experience.ilike.%founder%,achievements.ilike.%founder%,extracurriculars.ilike.%founder%,bio.ilike.%stepup%,experience.ilike.%stepup%,achievements.ilike.%stepup%,extracurriculars.ilike.%stepup%');

  if (!searchError && entrepreneurialUsers) {
    console.log(`Found ${entrepreneurialUsers.length} users with entrepreneurial/StepUp experience:`);
    entrepreneurialUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.full_name} (${user.email})`);
      if (user.bio && (user.bio.toLowerCase().includes('founder') || user.bio.toLowerCase().includes('stepup'))) {
        console.log(`   Bio: ${user.bio.substring(0, 100)}...`);
      }
      if (user.experience && (user.experience.toLowerCase().includes('founder') || user.experience.toLowerCase().includes('stepup'))) {
        console.log(`   Experience: ${user.experience.substring(0, 100)}...`);
      }
      console.log('');
    });
  }
}

debugTest1UserData().catch(console.error);