import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    // Check if user already completed interview
    const { data: internData, error: internError } = await supabase
      .from('interns')
      .select('interview_completed')
      .eq('id', user.id)
      .single();

    if (internError) {
      console.error('Error checking intern status:', internError);
      return NextResponse.json(
        { error: 'Failed to check intern status' },
        { status: 500 }
      );
    }

    if (internData.interview_completed) {
      return NextResponse.json(
        { error: 'Interview already completed' },
        { status: 400 }
      );
    }

    // Check for existing active session
    const { data: existingSession, error: sessionCheckError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('intern_id', user.id)
      .eq('session_status', 'in_progress')
      .single();

    if (existingSession) {
      return NextResponse.json({
        session_id: existingSession.id,
        message: 'Resuming existing session'
      });
    }

    // Create new interview session
    const { data: newSession, error: createError } = await supabase
      .from('interview_sessions')
      .insert({
        intern_id: user.id,
        session_status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating interview session:', createError);
      return NextResponse.json(
        { error: 'Failed to create interview session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session_id: newSession.id,
      message: 'Interview session started successfully'
    });

  } catch (error) {
    console.error('Start interview session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 