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
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify this is a company user
    const { data: companyData, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', user.id)
      .single();

    if (companyError || !companyData) {
      console.error('Company verification failed:', companyError);
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing application ID' }, { status: 400 });
    }

    // Update the application status to 'rejected'
    const { error: appError } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', applicationId);

    if (appError) {
      console.error('Error updating application:', appError);
      return NextResponse.json({ error: 'Failed to decline application' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Application declined successfully'
    });

  } catch (error) {
    console.error('Error in decline application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
