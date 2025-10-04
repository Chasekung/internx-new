import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the route handler
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('🔍 API Debug - GET /api/interns/applications called');
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

    // Fetch applications for this intern (all statuses)
    const { data: applications, error: applicationsError } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        internship_id,
        internships (
          title,
          position,
          description,
          duration,
          start_date,
          end_date,
          salary_min,
          salary_max,
          location,
          address,
          city,
          state,
          pay,
          companies (
            company_name,
            logo_url
          )
        )
      `)
      .eq('intern_id', user.id)
      .order('applied_at', { ascending: false });

    console.log('📊 Applications query result:', applications);
    console.log('📊 Applications query error:', applicationsError);

    if (applicationsError) {
      console.error('❌ Applications fetch error:', applicationsError);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    console.log('✅ Applications fetched successfully, count:', applications?.length || 0);
    return NextResponse.json({
      success: true,
      applications: applications || []
    });

  } catch (error) {
    console.error('💥 Error in /api/interns/applications:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
} 