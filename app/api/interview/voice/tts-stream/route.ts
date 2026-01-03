import { NextRequest } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    const { text, voice = 'alloy' } = await request.json();

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Limit text length for faster generation - shorter = faster response
    const truncatedText = text.slice(0, 500);

    const openai = getOpenAIClient();
    if (!openai) {
      return new Response(JSON.stringify({ error: 'OpenAI not configured' }), { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Validate voice option
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
    const selectedVoice = validVoices.includes(voice) ? voice : 'nova';

    // Use the fastest TTS model with optimized settings
    const response = await openai.audio.speech.create({
      model: "tts-1", // Fastest model (vs tts-1-hd which is higher quality but slower)
      voice: selectedVoice as typeof validVoices[number],
      input: truncatedText,
      speed: 1.1, // Slightly faster speaking rate
      response_format: "mp3" // mp3 is well-supported and fast
    });

    // Get the audio as a buffer and return immediately
    const arrayBuffer = await response.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      return new Response(JSON.stringify({ error: 'No audio generated' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Return audio response with proper headers for fast playback
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': arrayBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Duration': '0', // Hint for immediate playback
      },
    });

  } catch (error) {
    console.error('TTS stream error:', error);
    return new Response(JSON.stringify({ 
      error: 'TTS generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

