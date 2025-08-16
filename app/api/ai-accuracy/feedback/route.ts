import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      feedback_type,
      rating,
      feedback_text,
      category
    } = body;

    // Validate required fields
    if (!feedback_type || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ 
        error: 'Missing or invalid required fields: feedback_type, rating (1-5)' 
      }, { status: 400 });
    }

    // Get intern ID for the current user
    const { data: internData, error: internError } = await supabase
      .from('interns')
      .select('id')
      .eq('id', user.id)
      .single();

    if (internError || !internData) {
      return NextResponse.json({ 
        error: 'Intern profile not found' 
      }, { status: 404 });
    }

    // Insert feedback record
    const { data: feedback, error: insertError } = await supabase
      .from('ai_feedback')
      .insert({
        intern_id: internData.id,
        feedback_type,
        rating,
        feedback_text,
        category
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting feedback:', insertError);
      return NextResponse.json({ 
        error: 'Failed to save feedback' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      feedback,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting AI feedback:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const feedback_type = searchParams.get('feedback_type');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('ai_feedback')
      .select('*')
      .eq('intern_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (feedback_type) {
      query = query.eq('feedback_type', feedback_type);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: feedback, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching feedback:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch feedback' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      feedback,
      count: feedback?.length || 0
    });

  } catch (error) {
    console.error('Error fetching AI feedback:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 