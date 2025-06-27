import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Use admin client to bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const all = searchParams.get('all');

    // If all=true, return all users
    if (all === 'true') {
      const { data: profiles, error } = await supabaseAdmin
        .from('interns')
        .select(`
          id,
          full_name,
          username,
          high_school,
          grade_level,
          profile_photo_url,
          bio,
          location,
          state,
          skills,
          career_interests,
          headline
        `)
        .limit(100); // Increased limit to get more users

      if (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
      }

      console.log(`Found ${profiles?.length || 0} users in database`);

      // Transform the data to match frontend expectations
      const transformedResults = profiles?.map(profile => ({
        id: profile.id,
        fullName: profile.full_name,
        username: profile.username,
        highSchool: profile.high_school,
        gradeLevel: profile.grade_level,
        profilePhotoUrl: profile.profile_photo_url,
        bio: profile.bio,
        location: profile.location,
        state: profile.state,
        skills: profile.skills,
        careerInterests: profile.career_interests,
        headline: profile.headline
      })) || [];

      return NextResponse.json({ results: transformedResults });
    }

    // If no query provided, return all users (same as all=true)
    if (!query || query.trim().length === 0) {
      const { data: profiles, error } = await supabaseAdmin
        .from('interns')
        .select(`
          id,
          full_name,
          username,
          high_school,
          grade_level,
          profile_photo_url,
          bio,
          location,
          state,
          skills,
          career_interests,
          headline
        `)
        .limit(100);

      if (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to load users' }, { status: 500 });
      }

      const transformedResults = profiles?.map(profile => ({
        id: profile.id,
        fullName: profile.full_name,
        username: profile.username,
        highSchool: profile.high_school,
        gradeLevel: profile.grade_level,
        profilePhotoUrl: profile.profile_photo_url,
        bio: profile.bio,
        location: profile.location,
        state: profile.state,
        skills: profile.skills,
        careerInterests: profile.career_interests,
        headline: profile.headline
      })) || [];

      return NextResponse.json({ results: transformedResults });
    }

    // Search for interns by name, username, school, or skills (case insensitive)
    const { data: profiles, error } = await supabaseAdmin
      .from('interns')
      .select(`
        id,
        full_name,
        username,
        high_school,
        grade_level,
        profile_photo_url,
        bio,
        location,
        state,
        skills,
        career_interests,
        headline
      `)
      .or(`full_name.ilike.%${query}%,username.ilike.%${query}%,high_school.ilike.%${query}%,skills.ilike.%${query}%,career_interests.ilike.%${query}%,location.ilike.%${query}%,state.ilike.%${query}%`)
      .limit(50);

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    // Transform the data to match frontend expectations
    const transformedResults = profiles?.map(profile => ({
      id: profile.id,
      fullName: profile.full_name,
      username: profile.username,
      highSchool: profile.high_school,
      gradeLevel: profile.grade_level,
      profilePhotoUrl: profile.profile_photo_url,
      bio: profile.bio,
      location: profile.location,
      state: profile.state,
      skills: profile.skills,
      careerInterests: profile.career_interests,
      headline: profile.headline
    })) || [];

    return NextResponse.json({ results: transformedResults });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 