import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper function to create Supabase client when needed
function getSupabaseClient() {
  return createRouteHandlerClient({ cookies });
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    // Check if there are any questions in the database
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('*')
      .limit(10);

    if (questionsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch questions', 
        details: questionsError.message,
        questions_found: 0,
        questions: []
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Database check completed',
      questions_found: questions ? questions.length : 0,
      questions: questions || []
    });

  } catch (error) {
    console.error('Test DB error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 