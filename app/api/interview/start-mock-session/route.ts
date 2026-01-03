import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if environment variables are available
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
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

    // Get interview details from request body
    const body = await request.json();
    const { 
      interview_type, 
      interview_title, 
      interview_category,
      interview_subcategory,
      difficulty_level = 'medium'
    } = body;

    if (!interview_type) {
      return NextResponse.json(
        { error: 'Interview type is required' },
        { status: 400 }
      );
    }

    // Check for existing in-progress session for this interview type
    // Note: interview_type column must exist (run enable_multiple_interviews.sql first)
    let existingSession = null;
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*')
        .eq('intern_id', user.id)
        .eq('interview_type', interview_type)
        .eq('session_status', 'in_progress')
        .maybeSingle();

      if (!error && data) {
        existingSession = data;
      }
    } catch (e) {
      // Column might not exist yet, continue to create new session
      console.log('interview_type column may not exist, creating new session');
    }

    if (existingSession) {
      // Return existing session
      return NextResponse.json({
        session_id: existingSession.id,
        message: 'Resuming existing session',
        is_resume: true
      });
    }

    // Create new interview session (allow unlimited retakes)
    // First try with new columns, fall back to basic columns if they don't exist
    let newSession;
    let createError;

    // Try with interview_type columns (including subcategory and difficulty)
    const result = await supabase
      .from('interview_sessions')
      .insert({
        intern_id: user.id,
        interview_type: interview_type,
        interview_title: interview_title || interview_type,
        interview_category: interview_category || 'General',
        interview_subcategory: interview_subcategory || '',
        difficulty_level: difficulty_level || 'medium',
        session_status: 'in_progress',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    newSession = result.data;
    createError = result.error;

    // If failed due to column not existing, try without interview_type columns
    if (createError && createError.message?.includes('column')) {
      console.log('Trying without interview_type columns...');
      const fallbackResult = await supabase
        .from('interview_sessions')
        .insert({
          intern_id: user.id,
          session_status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();
      
      newSession = fallbackResult.data;
      createError = fallbackResult.error;
    }

    if (createError) {
      console.error('Error creating interview session:', createError);
      return NextResponse.json(
        { error: 'Failed to create interview session. Please run the database migration first.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      session_id: newSession.id,
      message: 'Interview session started successfully',
      is_resume: false
    });

  } catch (error) {
    console.error('Start mock interview session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

