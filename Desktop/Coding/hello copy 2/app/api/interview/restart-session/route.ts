import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json();
    
    if (!session_id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the session belongs to the current user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('intern_id, session_status')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.intern_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Restart session request:', { session_id, user_id: user.id });
    console.log('Verifying session:', { session_id, user_id: user.id });
    console.log('Session verified:', { session_id, status: session.session_status });

    // COMPLETELY DELETE THE OLD SESSION AND ALL ITS DATA
    // Delete all interview responses for this session
    const { error: deleteResponsesError } = await supabase
      .from('interview_responses')
      .delete()
      .eq('session_id', session_id);

    if (deleteResponsesError) {
      console.error('Error deleting interview responses:', deleteResponsesError);
      return NextResponse.json(
        { error: 'Failed to reset interview responses' },
        { status: 500 }
      );
    }

    // Delete the old session
    const { error: deleteSessionError } = await supabase
      .from('interview_sessions')
      .delete()
      .eq('id', session_id);

    if (deleteSessionError) {
      console.error('Error deleting session:', deleteSessionError);
      return NextResponse.json(
        { error: 'Failed to delete old session' },
        { status: 500 }
      );
    }

    // CREATE A COMPLETELY NEW SESSION
    const { data: newSession, error: createSessionError } = await supabase
      .from('interview_sessions')
      .insert({
        intern_id: user.id,
        session_status: 'in_progress',
        started_at: new Date().toISOString(),
        full_transcript: {
          conversation: [],
          metadata: {
            total_turns: 0,
            total_duration: 0,
            categories_covered: [],
            follow_up_counts: {}
          }
        }
      })
      .select()
      .single();

    if (createSessionError) {
      console.error('Error creating new session:', createSessionError);
      return NextResponse.json(
        { error: 'Failed to create new session' },
        { status: 500 }
      );
    }

    console.log('Session restarted successfully:', { 
      old_session_id: session_id, 
      new_session_id: newSession.id 
    });

    return NextResponse.json({
      success: true,
      message: 'Interview session restarted successfully',
      new_session_id: newSession.id
    });

  } catch (error) {
    console.error('Error in restart session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 