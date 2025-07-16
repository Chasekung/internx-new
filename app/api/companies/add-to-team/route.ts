import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
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

    const { internId, teamName } = await request.json();

    if (!internId || !teamName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Update the intern's team
    const { data, error } = await supabase
      .from('interns')
      .update({ team: teamName })
      .eq('id', internId)
      .select('id, full_name, team');

    if (error) {
      console.error('Error updating team:', error);
      return NextResponse.json({ error: 'Failed to add to team' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Intern added to team successfully',
      data 
    });

  } catch (error) {
    console.error('Error in add-to-team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 