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

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔍 Auth Header:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted, length:', token.length);
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    console.log('🔍 Auth Debug:', { user: user?.id, authError });
    
    if (authError || !user) {
      console.error('🚨 Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized', debug: { authError, hasUser: !!user } }, { status: 401 });
    }

    // Verify this is a company user
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', user.id)
      .single();

    console.log('🔍 Company Debug:', { userId: user.id, companyData, companyError });

    if (companyError || !companyData) {
      console.error('🚨 Company verification failed:', companyError);
      return NextResponse.json({ error: 'Company not found', debug: { companyError, userId: user.id } }, { status: 404 });
    }

    const { applicationId, internId } = await request.json();

    if (!applicationId || !internId) {
      return NextResponse.json({ error: 'Application ID and Intern ID are required' }, { status: 400 });
    }

    console.log('🔄 Undoing acceptance:', { applicationId, internId });

    // Remove intern from team
    const { error: teamError } = await supabase
      .from('interns')
      .update({ team: null })
      .eq('id', internId);

    if (teamError) {
      console.error('Error removing from team:', teamError);
      return NextResponse.json({ error: 'Failed to remove from team' }, { status: 500 });
    }

    // Update application status back to "submitted"
    const { error: appError } = await supabase
      .from('applications')
      .update({ 
        status: 'submitted',
        status_updated_at: new Date().toISOString(),
        accepted_by: null, // Remove acceptance tracking
        rejected_by: null,
        rejection_reason: null
      })
      .eq('id', applicationId);

    if (appError) {
      console.error('Error updating application status:', appError);
      return NextResponse.json({ error: 'Failed to update application status' }, { status: 500 });
    }

    console.log('✅ Acceptance undone successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Acceptance undone successfully',
      applicationId,
      internId
    });

  } catch (error) {
    console.error('Error in undo-acceptance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}