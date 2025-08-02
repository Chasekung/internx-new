import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
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