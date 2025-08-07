import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Helper function to create OpenAI client when needed
function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is missing or empty');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

export async function POST(request: Request) {
  try {
    const { text, voice = 'alloy', speed = 1.0 } = await request.json();

    // Validate input
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 4096) {
      return NextResponse.json({ error: 'Text too long (max 4096 characters)' }, { status: 400 });
    }

    // Use faster tts-1 model for better performance
    const response = await getOpenAIClient().audio.speech.create({
      model: "tts-1", // Use faster tts-1 model for speed
      voice: "alloy",
      input: text,
      speed: Math.max(1.2, Math.min(1.5, speed || 1.3)), // Faster speed for better performance
      response_format: "mp3"
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('TTS error:', error);
    console.error('TTS error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ error: 'Rate limit exceeded, please try again later' }, { status: 429 });
      }
      if (error.message.includes('invalid')) {
        return NextResponse.json({ error: 'Invalid request parameters' }, { status: 400 });
      }
      if (error.message.includes('authentication')) {
        return NextResponse.json({ error: 'OpenAI API authentication failed' }, { status: 401 });
      }
    }
    
    return NextResponse.json({ 
      error: 'TTS generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 