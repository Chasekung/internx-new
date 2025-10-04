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
      .select('id, company_name')
      .eq('id', user.id)
      .single();

    if (companyError || !companyData) {
      console.error('Company verification failed:', companyError);
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const { applicationId, internId, teamName } = await request.json();

    if (!applicationId || !internId || !teamName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Start a transaction by doing multiple updates
    // 1. Update the application status to 'accepted'
    console.log('🔄 Updating application status to accepted:', applicationId);
    const { data: updatedApp, error: appError } = await supabase
      .from('applications')
      .update({ status: 'accepted' })
      .eq('id', applicationId)
      .select('id, status');

    if (appError) {
      console.error('❌ Error updating application:', appError);
      return NextResponse.json({ error: 'Failed to accept application' }, { status: 500 });
    }

    console.log('✅ Application status updated:', updatedApp);

    // 2. Add the intern to the team
    const { data: internData, error: teamError } = await supabase
      .from('interns')
      .update({ team: teamName })
      .eq('id', internId)
      .select('id, full_name, team');

    if (teamError) {
      console.error('Error adding to team:', teamError);
      return NextResponse.json({ error: 'Failed to add intern to team' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Application accepted and intern added to team successfully',
      data: internData 
    });

  } catch (error) {
    console.error('Error in accept application:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
