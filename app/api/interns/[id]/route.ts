import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Use the admin client

// Helper function to create public Supabase client when needed
function getSupabasePublicClient() {
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase public environment variables');
}

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    console.log('🔍 API Debug - GET /api/interns/[id] called with params:', params);

    // Create public client when needed for auth
    const supabase = getSupabasePublicClient();

    // The auth check is still a good security measure to ensure only logged-in users can view profiles.
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ Auth successful for user:', user.id);
    
    console.log('🔍 Looking for profile with ID/username:', params.id);

    // First try to find by ID
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('interns')
      .select('*')
      .eq('id', params.id)
      .maybeSingle();

    // If not found by ID, try by username
    if (!profile && !profileError) {
      const { data: usernameProfile, error: usernameError } = await supabaseAdmin
        .from('interns')
        .select('*')
        .eq('username', params.id)
        .maybeSingle();
      
      profile = usernameProfile;
      profileError = usernameError;
    }

    console.log('📊 Admin DB query result - profile:', profile ? 'Found' : 'null');
    console.log('📊 Admin DB query result - error:', profileError);

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Error fetching profile' }, { status: 500 });
    }

    if (!profile) {
      console.log('❌ No profile found for ID/username:', params.id);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    console.log('✅ Profile found:', profile.full_name);

    // Transform the data to match the frontend expectations
    const transformedProfile = {
      data: {
      id: profile.id,
      fullName: profile.full_name,
      username: profile.username,
      email: profile.email,
      phoneNumber: profile.phone,
      location: profile.location,
      state: profile.state,
      highSchool: profile.high_school,
      gradeLevel: profile.grade_level,
      age: profile.age,
      extracurriculars: profile.extracurriculars,
      achievements: profile.achievements,
      careerInterests: profile.career_interests,
      skills: profile.skills,
      experience: profile.experience,
      bio: profile.bio,
      headline: profile.headline,
      interests: profile.interests,
      resumeUrl: profile.resume_url || '',
      profilePhotoUrl: profile.profile_photo_url,
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      portfolioUrl: profile.portfolio_url,
      languages: profile.languages,
      certifications: profile.certifications || [],
      created_at: profile.created_at,
      updated_at: profile.updated_at
      }
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error('Unexpected error in /api/interns/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 