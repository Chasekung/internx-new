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

    // Get all active questions
    const { data: questions, error: questionsError } = await supabase
      .from('interview_questions')
      .select('id, category, question_text, expected_duration_seconds, difficulty_level')
      .eq('is_active', true)
      .order('category', { ascending: true });

    if (questionsError) {
      return NextResponse.json({ 
        error: 'Failed to fetch questions', 
        details: questionsError.message 
      }, { status: 500 });
    }

    // Group questions by category
    const questionsByCategory = questions?.reduce((acc, question) => {
      if (!acc[question.category]) {
        acc[question.category] = [];
      }
      acc[question.category].push({
        id: question.id,
        text: question.question_text,
        duration: question.expected_duration_seconds,
        difficulty: question.difficulty_level
      });
      return acc;
    }, {} as Record<string, any[]>) || {};

    return NextResponse.json({
      message: 'Interview questions retrieved successfully',
      total_questions: questions?.length || 0,
      questions_by_category: questionsByCategory,
      all_questions: questions || []
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 