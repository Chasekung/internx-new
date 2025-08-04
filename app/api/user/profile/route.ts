import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    
    // Get user from Supabase session
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Create a Supabase client with the user's token
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('interns')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
        console.error('Profile fetch error:', profileError);
        console.error('User ID:', user.id);
        return NextResponse.json({ error: 'Error fetching profile', details: profileError.message }, { status: 500 });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Transform the data to match the frontend expectations
    const transformedProfile = {
      id: profile.id,
      fullName: profile.full_name,
      name: profile.full_name,
      email: profile.email,
      username: profile.username,
      phoneNumber: profile.phone,
      location: profile.location,
      address: profile.location,
      state: profile.state,
      highSchool: profile.high_school,
      gradeLevel: profile.grade_level,
      age: profile.age ? profile.age.toString() : '',
      skills: profile.skills || '',
      experience: profile.experience,
      extracurriculars: profile.extracurriculars || '',
      achievements: profile.achievements || '',
      careerInterests: profile.career_interests || '',
      resumeUrl: profile.resume_url,
      profilePhotoUrl: profile.profile_photo_url,
      linkedinUrl: profile.linkedin_url,
      githubUrl: profile.github_url,
      portfolioUrl: profile.portfolio_url,
      bio: profile.bio,
      headline: profile.headline,
      interests: profile.interests || '',
      languages: profile.languages || '',
      certifications: profile.certifications || [],
      referral_code: profile.referral_code,
      referred_by: profile.referred_by,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error('Profile GET error:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check if Supabase admin client is available
    if (!supabaseAdmin) {
      console.error('Supabase admin client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const body = await request.json();
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Transform frontend data to match database schema
    const updateData = {
      full_name: body.name || body.fullName,
      email: body.email,
      username: body.username,
      phone: body.phoneNumber,
      location: body.location || body.address,
      state: body.state,
      high_school: body.highSchool,
      grade_level: body.gradeLevel,
      age: body.age ? parseInt(body.age) : null,
      skills: body.skills || '',
      experience: body.experience,
      extracurriculars: body.extracurriculars || '',
      achievements: body.achievements || '',
      career_interests: body.careerInterests || '',
      resume_url: body.resumeUrl,
      profile_photo_url: body.profilePhotoUrl,
      linkedin_url: body.linkedinUrl,
      github_url: body.githubUrl,
      portfolio_url: body.portfolioUrl,
      bio: body.bio,
      headline: body.headline,
      interests: body.interests || '',
      languages: body.languages || '',
      certifications: body.certifications || [],
      updated_at: new Date().toISOString()
    };

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('interns')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    // Transform the response back to frontend format
    const transformedProfile = {
      id: updatedProfile.id,
      fullName: updatedProfile.full_name,
      name: updatedProfile.full_name,
      email: updatedProfile.email,
      username: updatedProfile.username,
      phoneNumber: updatedProfile.phone,
      location: updatedProfile.location,
      address: updatedProfile.location,
      state: updatedProfile.state,
      highSchool: updatedProfile.high_school,
      gradeLevel: updatedProfile.grade_level,
      age: updatedProfile.age ? updatedProfile.age.toString() : '',
      skills: updatedProfile.skills || '',
      experience: updatedProfile.experience,
      extracurriculars: updatedProfile.extracurriculars || '',
      achievements: updatedProfile.achievements || '',
      careerInterests: updatedProfile.career_interests || '',
      resumeUrl: updatedProfile.resume_url,
      profilePhotoUrl: updatedProfile.profile_photo_url,
      linkedinUrl: updatedProfile.linkedin_url,
      githubUrl: updatedProfile.github_url,
      portfolioUrl: updatedProfile.portfolio_url,
      bio: updatedProfile.bio,
      headline: updatedProfile.headline,
      interests: updatedProfile.interests || '',
      languages: updatedProfile.languages || '',
      certifications: updatedProfile.certifications || [],
      referral_code: updatedProfile.referral_code,
      referred_by: updatedProfile.referred_by,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at
    };

    return NextResponse.json(transformedProfile);
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 