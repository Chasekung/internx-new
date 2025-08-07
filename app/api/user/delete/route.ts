import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create Supabase client when needed
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const body = await request.json();
    const { confirmation } = body;
    
    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Confirmation text must be exactly "DELETE"' }, { status: 400 });
    }
    
    // Verify the token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Delete the user's profile from interns table
    const { error: profileDeleteError } = await supabase
      .from('interns')
      .delete()
      .eq('id', user.id);

    if (profileDeleteError) {
      console.error('Profile deletion error:', profileDeleteError);
      return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }

    // Delete the user from auth.users (this will cascade to other tables)
    const { error: userDeleteError } = await supabase.auth.admin.deleteUser(user.id);

    if (userDeleteError) {
      console.error('User deletion error:', userDeleteError);
      return NextResponse.json({ error: 'Failed to delete user account' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Account deleted successfully' 
    });

  } catch (error) {
    console.error('Account deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 