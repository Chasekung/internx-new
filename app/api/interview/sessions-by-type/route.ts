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

    // Get interview_type from query params
    const { searchParams } = new URL(request.url);
    const interviewType = searchParams.get('interview_type');

    if (!interviewType) {
      return NextResponse.json(
        { error: 'Interview type is required' },
        { status: 400 }
      );
    }

    // Get all completed interview sessions for this user and interview type
    // Try with full columns first, fall back to basic columns
    let sessions = null;
    let sessionsError = null;

    try {
      const result = await supabase
        .from('interview_sessions')
        .select(`
          id,
          session_status,
          started_at,
          completed_at,
          interview_type,
          overall_score,
          feedback_summary,
          detailed_feedback,
          skill_scores,
          strengths,
          improvements,
          duration_seconds
        `)
        .eq('intern_id', user.id)
        .eq('interview_type', interviewType)
        .in('session_status', ['completed', 'in_progress'])
        .order('started_at', { ascending: false });

      sessions = result.data;
      sessionsError = result.error;
    } catch (e) {
      // New columns might not exist yet
      console.log('Some columns may not exist, trying basic query');
    }

    // If error (likely columns don't exist), try basic query
    if (sessionsError) {
      try {
        const basicResult = await supabase
          .from('interview_sessions')
          .select('id, session_status, started_at, completed_at')
          .eq('intern_id', user.id)
          .in('session_status', ['completed', 'in_progress'])
          .order('started_at', { ascending: false });

        // Return with null values for missing columns
        sessions = (basicResult.data || []).map(s => ({
          ...s,
          interview_type: null,
          overall_score: null,
          feedback_summary: null,
          detailed_feedback: null,
          skill_scores: null,
          strengths: null,
          improvements: null,
          duration_seconds: null
        }));
      } catch (e) {
        console.error('Basic query also failed:', e);
        return NextResponse.json({ sessions: [], total: 0 });
      }
    }

    return NextResponse.json({
      sessions: sessions || [],
      total: sessions?.length || 0
    });

  } catch (error) {
    console.error('Get sessions by type error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

