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
      intern_id,
      interview_session_id,
      ai_score,
      human_score,
      category,
      score_type,
      accuracy_rating,
      feedback_notes
    } = body;

    // Validate required fields
    if (!intern_id || !ai_score || !score_type) {
      return NextResponse.json({ 
        error: 'Missing required fields: intern_id, ai_score, score_type' 
      }, { status: 400 });
    }

    // Calculate confidence difference
    const confidenceDifference = human_score ? Math.abs(ai_score - human_score) : null;

    // Insert validation record
    const { data: validation, error: insertError } = await supabase
      .from('ai_accuracy_validation')
      .insert({
        intern_id,
        interview_session_id,
        ai_score,
        human_score,
        category,
        score_type,
        confidence_difference: confidenceDifference,
        accuracy_rating,
        feedback_notes,
        validated_by: user.id,
        is_validated: !!human_score
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting validation:', insertError);
      return NextResponse.json({ 
        error: 'Failed to save validation' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      validation,
      message: 'AI accuracy validation saved successfully'
    });

  } catch (error) {
    console.error('Error in AI accuracy validation:', error);
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
    const intern_id = searchParams.get('intern_id');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = supabase
      .from('ai_accuracy_validation')
      .select(`
        *,
        intern:interns(full_name, email),
        validator:auth.users(email)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (intern_id) {
      query = query.eq('intern_id', intern_id);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: validations, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching validations:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch validations' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      validations,
      count: validations?.length || 0
    });

  } catch (error) {
    console.error('Error fetching AI accuracy validations:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 