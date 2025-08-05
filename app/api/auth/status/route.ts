import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking authentication status...');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError);
      return NextResponse.json({ 
        authenticated: false,
        error: 'Session error',
        details: sessionError.message 
      });
    }
    
    if (!session) {
      console.log('❌ No active session');
      return NextResponse.json({ 
        authenticated: false,
        message: 'No active session' 
      });
    }
    
    // Get user details
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ User error:', userError);
      return NextResponse.json({ 
        authenticated: false,
        error: 'User error',
        details: userError.message 
      });
    }
    
    console.log('✅ Authentication successful for user:', user?.id);
    return NextResponse.json({ 
      authenticated: true,
      user: {
        id: user?.id,
        email: user?.email,
        sessionExpiresAt: session.expires_at
      },
      session: {
        accessToken: session.access_token ? 'PRESENT' : 'MISSING',
        refreshToken: session.refresh_token ? 'PRESENT' : 'MISSING',
        expiresAt: session.expires_at
      }
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return NextResponse.json({ 
      authenticated: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}