import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Common filler words to detect
const FILLER_WORDS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 
  'literally', 'kind of', 'sort of', 'i mean', 'right', 'so yeah',
  'well', 'okay so', 'i guess', 'honestly'
];

// Helper function to create OpenAI client when needed
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// Analyze transcript for filler words
function analyzeFillerWords(transcript: string): { count: number; percentage: number; found: string[] } {
  const lowerText = transcript.toLowerCase();
  const words = lowerText.split(/\s+/);
  const totalWords = words.length;
  
  const foundFillers: string[] = [];
  let fillerCount = 0;
  
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches) {
      fillerCount += matches.length;
      foundFillers.push(filler);
    }
  }
  
  return {
    count: fillerCount,
    percentage: totalWords > 0 ? Math.round((fillerCount / totalWords) * 100) : 0,
    found: [...new Set(foundFillers)]
  };
}

// Analyze voice quality indicators from transcript
async function analyzeVoiceQuality(
  openai: OpenAI, 
  transcript: string,
  durationSeconds: number
): Promise<{
  clarity: number;
  confidence: number;
  pacing: string;
  tone: string;
  suggestions: string[];
}> {
  const wordCount = transcript.split(/\s+/).length;
  const wordsPerMinute = durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : 0;
  
  // Analyze pacing based on words per minute
  let pacing = 'good';
  if (wordsPerMinute > 180) pacing = 'too fast';
  else if (wordsPerMinute < 100) pacing = 'too slow';
  else if (wordsPerMinute >= 140 && wordsPerMinute <= 160) pacing = 'excellent';
  
  try {
    // Quick AI analysis for tone and confidence
    const analysis = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Analyze this interview response for communication quality. Respond with ONLY a JSON object.'
        },
        {
          role: 'user',
          content: `Analyze this interview response transcript. Consider:
- Clarity: How clear and well-structured is the response? (0-100)
- Confidence: Does the language indicate confidence or uncertainty? (0-100)
- Tone: What is the overall tone? (professional/casual/nervous/enthusiastic/neutral)
- Suggestions: 1-2 brief tips to improve

Transcript: "${transcript}"

Respond with JSON only:
{"clarity": 85, "confidence": 75, "tone": "professional", "suggestions": ["tip 1", "tip 2"]}`
        }
      ],
      max_tokens: 150,
      temperature: 0.3
    });

    const responseText = analysis.choices[0]?.message?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        clarity: Math.min(100, Math.max(0, parsed.clarity || 75)),
        confidence: Math.min(100, Math.max(0, parsed.confidence || 70)),
        pacing,
        tone: parsed.tone || 'neutral',
        suggestions: parsed.suggestions || []
      };
    }
  } catch {
    // Fallback to basic analysis
  }
  
  // Fallback basic analysis
  return {
    clarity: 75,
    confidence: 70,
    pacing,
    tone: 'neutral',
    suggestions: []
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const includeAnalysis = formData.get('analyze') !== 'false';

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

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 });
    }

    // Use optimized Whisper settings for faster processing
    const transcript = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
      response_format: "text",
      language: "en",
      temperature: 0.1,
      prompt: "This is a high school student interview. Focus on clear speech and common interview vocabulary.",
    });

    // Validate transcript result
    if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
      return NextResponse.json({ 
        error: 'No speech detected in audio. Please speak clearly and try again.',
        transcript: '',
        confidence: 0 
      }, { status: 400 });
    }

    const trimmedTranscript = transcript.trim();
    const wordCount = trimmedTranscript.split(/\s+/).length;
    const durationEstimate = Math.max(1, Math.round(audioBuffer.byteLength / 16000));
    
    // Analyze filler words
    const fillerAnalysis = analyzeFillerWords(trimmedTranscript);
    
    // Base response
    const response: {
      transcript: string;
      word_count: number;
      duration_estimate: number;
      filler_words: { count: number; percentage: number; found: string[] };
      voice_analysis?: {
        clarity: number;
        confidence: number;
        pacing: string;
        tone: string;
        suggestions: string[];
      };
    } = {
      transcript: trimmedTranscript,
      word_count: wordCount,
      duration_estimate: durationEstimate,
      filler_words: fillerAnalysis
    };
    
    // Add voice quality analysis if requested (async, in parallel with response)
    if (includeAnalysis && wordCount > 5) {
      const voiceAnalysis = await analyzeVoiceQuality(openai, trimmedTranscript, durationEstimate);
      response.voice_analysis = voiceAnalysis;
    }

    return NextResponse.json(response);

  } catch (error) {
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