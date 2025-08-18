import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique channel name for this interview session
    const channelName = `interview-${session_id}`;
    
    // For Agora, you'll need to get these from your Agora Console:
    // 1. App ID: Your Agora application ID
    // 2. App Certificate: For generating tokens (server-side)
    // 3. Channel Name: Unique identifier for this interview
    
    // For now, we'll use placeholder values
    // In production, you should:
    // 1. Get your Agora App ID from https://console.agora.io/
    // 2. Generate tokens server-side using your App Certificate
    // 3. Store these securely in environment variables
    
    const agoraCredentials = {
      appId: process.env.AGORA_APP_ID,
      channel: channelName,
      token: null, // Use null for testing without authentication
      uid: Math.floor(Math.random() * 1000000) // Random user ID
    };

    // Update the interview session with Agora channel info
    await supabase
      .from('interview_sessions')
      .update({
        video_room_url: `agora://${channelName}`,
        video_room_id: channelName,
        updated_at: new Date().toISOString()
      })
      .eq('id', session_id)
      .eq('intern_id', user.id);

    return NextResponse.json({
      success: true,
      ...agoraCredentials
    });

  } catch (error) {
    console.error('Error creating Agora room:', error);
    return NextResponse.json({ error: 'Failed to create video room' }, { status: 500 });
  }
} 