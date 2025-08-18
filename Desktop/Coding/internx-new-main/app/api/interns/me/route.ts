import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create Supabase client when needed
function getSupabaseClient() {
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    console.log('🔍 API Debug - GET /api/interns/me called');
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted, length:', token.length);
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('✅ Auth successful, user ID:', user.id);

    // Fetch the intern profile from the database
    const { data: internProfile, error: profileError } = await supabase
      .from('interns')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    console.log('📊 Database query result - profile:', internProfile);
    console.log('📊 Database query result - error:', profileError);

    if (profileError) {
      // Log the error but don't treat it as a fatal error if it's just about no rows found
      if (profileError.code !== 'PGRST116') {
        console.error('❌ Profile fetch error:', profileError);
        return NextResponse.json(
          { error: 'Failed to fetch intern profile' },
          { status: 500 }
        );
      }
    }

    if (!internProfile) {
      console.log('❌ No profile found for user ID:', user.id);
      return NextResponse.json(
        { error: 'Intern profile not found' },
        { status: 404 }
      );
    }

    console.log('✅ Profile found, returning data');
    return NextResponse.json({
      success: true,
      data: internProfile
    });

  } catch (error) {
    console.error('💥 Error in /api/interns/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    console.log('🔍 API Debug - PUT /api/interns/me called');
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted, length:', token.length);
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    console.log('✅ Auth successful, user ID:', user.id);

    // Get the update data from the request body
    const updateData = await request.json();
    console.log('📝 Update data:', updateData);

    // Update the profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('interns')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    console.log('✅ Profile updated successfully');
    return NextResponse.json({
      success: true,
      data: updatedProfile
    });

  } catch (error) {
    console.error('💥 Error in PUT /api/interns/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 