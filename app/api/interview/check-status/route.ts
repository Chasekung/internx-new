import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper function to create Supabase client when needed
function getSupabaseClient() {
  return createRouteHandlerClient({ cookies });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check interview status for the intern
    const { data: internData, error: internError } = await supabase
      .from('interns')
      .select('interview_completed, interview_completed_at, skill_score, experience_score, personality_score, overall_match_score')
      .eq('id', user.id)
      .single();

    if (internError) {
      console.error('Error checking interview status:', internError);
      return NextResponse.json(
        { error: 'Failed to check interview status' },
        { status: 500 }
      );
    }

    // Also check for any active interview sessions
    const { data: activeSession, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('intern_id', user.id)
      .eq('session_status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1);

    // Check if interview is TRULY completed with AI system
    // We need both interview_completed AND valid scores from our AI system
    const hasValidScores = !!(internData.skill_score && internData.experience_score && internData.personality_score);
    const interviewTrulyCompleted = internData.interview_completed && hasValidScores;

    return NextResponse.json({
      interview_completed: interviewTrulyCompleted,
      interview_completed_at: internData.interview_completed_at,
      has_scores: hasValidScores,
      scores: {
        skill_score: internData.skill_score,
        experience_score: internData.experience_score,
        personality_score: internData.personality_score,
        overall_match_score: internData.overall_match_score
      },
      active_session: activeSession?.[0] || null,
      // Debug info to help understand user status
      raw_interview_completed: internData.interview_completed,
      needs_real_interview: internData.interview_completed && !hasValidScores
    });

  } catch (error) {
    console.error('Interview status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 