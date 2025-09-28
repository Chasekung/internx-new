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

    const { internId } = await request.json();

    if (!internId) {
      return NextResponse.json({ error: 'Intern ID is required' }, { status: 400 });
    }

    console.log('🗑️ Removing intern from team:', { internId });

    // Remove the intern's team assignment
    const { data, error } = await supabase
      .from('interns')
      .update({ team: null })
      .eq('id', internId)
      .select('id, full_name, team');

    if (error) {
      console.error('Error removing from team:', error);
      return NextResponse.json({ error: 'Failed to remove from team' }, { status: 500 });
    }

    // Also update any related applications back to "submitted" status
    const { error: appError } = await supabase
      .from('applications')
      .update({ 
        status: 'submitted',
        status_updated_at: new Date().toISOString(),
        accepted_by: null,
        rejected_by: null,
        rejection_reason: null
      })
      .eq('intern_id', internId)
      .eq('status', 'accepted');

    if (appError) {
      console.warn('Warning: Could not update application status:', appError);
      // Don't fail the request, just log the warning
    }

    console.log('✅ Intern removed from team successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'Intern removed from team successfully',
      data 
    });

  } catch (error) {
    console.error('Error in remove-from-team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}