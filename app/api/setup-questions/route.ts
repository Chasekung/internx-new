import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    // Use service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if questions already exist
    const { data: existingQuestions, error: checkError } = await supabase
      .from('interview_questions')
      .select('id')
      .limit(1);

    if (checkError) {
      return NextResponse.json({ 
        error: 'Failed to check existing questions', 
        details: checkError.message 
      }, { status: 500 });
    }

    // Always add sample questions (this will replace existing ones)
    console.log('Adding sample questions to database...');

    // Add sample questions
    const sampleQuestions = [
      {
        category: 'experience',
        question_text: 'Tell me about your background and what interests you about this internship opportunity.',
        expected_duration_seconds: 120,
        difficulty_level: 'easy',
        is_active: true
      },
      {
        category: 'experience',
        question_text: 'What relevant experience do you have that would make you a good fit for this role?',
        expected_duration_seconds: 120,
        difficulty_level: 'medium',
        is_active: true
      },
      {
        category: 'goals',
        question_text: 'Why are you interested in this internship program, and what do you hope to gain from it?',
        expected_duration_seconds: 120,
        difficulty_level: 'easy',
        is_active: true
      },
      {
        category: 'technical',
        question_text: 'What technical skills do you have that would be relevant to this position?',
        expected_duration_seconds: 120,
        difficulty_level: 'medium',
        is_active: true
      },
      {
        category: 'behavioral',
        question_text: 'Tell me about a time when you had to work with a difficult team member. How did you handle it?',
        expected_duration_seconds: 180,
        difficulty_level: 'medium',
        is_active: true
      },
      {
        category: 'goals',
        question_text: 'What are your career goals and how does this internship align with them?',
        expected_duration_seconds: 120,
        difficulty_level: 'easy',
        is_active: true
      },
      {
        category: 'interests',
        question_text: 'What extracurricular activities or hobbies do you have that might be relevant to this role?',
        expected_duration_seconds: 120,
        difficulty_level: 'easy',
        is_active: true
      },
      {
        category: 'behavioral',
        question_text: 'Describe a situation where you had to learn something new quickly. How did you approach it?',
        expected_duration_seconds: 150,
        difficulty_level: 'medium',
        is_active: true
      },
      {
        category: 'technical',
        question_text: 'Describe a project or problem you solved using your technical skills.',
        expected_duration_seconds: 180,
        difficulty_level: 'hard',
        is_active: true
      },
      {
        category: 'goals',
        question_text: 'Where do you see yourself in 5 years, and how will this experience help you get there?',
        expected_duration_seconds: 150,
        difficulty_level: 'medium',
        is_active: true
      }
    ];

    const { data: insertedQuestions, error: insertError } = await supabase
      .from('interview_questions')
      .insert(sampleQuestions)
      .select();

    if (insertError) {
      return NextResponse.json({ 
        error: 'Failed to insert sample questions', 
        details: insertError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Sample questions added successfully',
      count: insertedQuestions?.length || 0,
      questions: insertedQuestions
    });

  } catch (error) {
    console.error('Setup questions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 