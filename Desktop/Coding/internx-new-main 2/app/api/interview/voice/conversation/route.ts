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

    const { sessionId, message, audioData } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    // Process the voice message and generate AI response
    const aiResponse = await processVoiceMessage(message, sessionId);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      sessionId: sessionId
    });

  } catch (error) {
    console.error('Voice conversation error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice conversation' },
      { status: 500 }
    );
  }
}

async function processVoiceMessage(message: string, sessionId: string) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not available');
    }

    // Get the current interview session
    const { data: session } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (!session) {
      throw new Error('Session not found');
    }

    // Generate AI response based on the voice message
    const response = await fetch('/api/interview/ai-conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId: sessionId,
        message: message,
        type: 'voice'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const aiResponse = await response.json();
    return aiResponse.response;

  } catch (error) {
    console.error('Error processing voice message:', error);
    return "I'm sorry, I couldn't process your voice message. Could you please try again?";
  }
} 