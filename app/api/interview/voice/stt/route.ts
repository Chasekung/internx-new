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
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate file size (max 25MB for Whisper API)
    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio file too large (max 25MB)' }, { status: 400 });
    }

    // Validate file type
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Invalid file type, must be audio' }, { status: 400 });
    }

    // Create a proper File object for OpenAI with size optimization
    const audioBuffer = await audioFile.arrayBuffer();
    
    // For very small files, they might be empty/silent
    if (audioBuffer.byteLength < 1000) {
      return NextResponse.json({ error: 'Audio file too small or empty' }, { status: 400 });
    }
    
    const file = new File([audioBuffer], 'audio.wav', { type: 'audio/wav' });

    // Use optimized Whisper settings for faster processing
    const transcript = await getOpenAIClient().audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "text", // Faster than verbose_json
      language: "en", // Specifying language speeds up processing
      temperature: 0.1, // Even lower temperature for faster, more consistent results
      prompt: "This is a high school student interview. Focus on clear speech and common interview vocabulary.", // Helps with accuracy and speed
    });

    // Validate transcript result
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json({ 
        error: 'No speech detected in audio. Please speak clearly and try again.',
        transcript: '',
        confidence: 0 
      }, { status: 400 });
    }

    return NextResponse.json({
      transcript: transcript.trim(),
      confidence: 0.95, // Mock confidence score - could be enhanced with actual confidence from API
      word_count: transcript.trim().split(/\s+/).length,
      duration_estimate: Math.max(1, Math.round(audioBuffer.byteLength / 16000)), // Rough estimate
    });

  } catch (error) {
    console.error('STT error:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json({ error: 'Rate limit exceeded, please try again in a moment' }, { status: 429 });
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json({ error: 'Transcription timeout, please try with shorter audio' }, { status: 408 });
      }
      if (error.message.includes('invalid_request_error')) {
        return NextResponse.json({ error: 'Invalid audio format or corrupted file' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Transcription failed. Please check your audio and try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 