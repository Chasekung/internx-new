import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing authentication...');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Test getting the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth result:', { user: user?.id, error: authError });
    
    if (authError) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json({ 
        error: 'Authentication failed', 
        details: authError.message 
      }, { status: 401 });
    }
    
    if (!user) {
      console.log('❌ No user found');
      return NextResponse.json({ 
        error: 'No user found' 
      }, { status: 401 });
    }
    
    console.log('✅ Authentication successful for user:', user.id);
    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, email: user.email } 
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}