import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if environment variables are available
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the latest interview session for this user
    const { data: latestSession, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('id, session_status, created_at, completed_at')
      .eq('intern_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError) {
      console.error('Error fetching latest session:', sessionError);
      return NextResponse.json(
        { error: 'No interview sessions found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session_id: latestSession.id,
      session_status: latestSession.session_status,
      created_at: latestSession.created_at,
      completed_at: latestSession.completed_at
    });

  } catch (error) {
    console.error('Get latest session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 