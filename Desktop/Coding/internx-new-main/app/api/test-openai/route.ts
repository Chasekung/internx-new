import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    // Create OpenAI client inside the route handler
    const apiKey = process.env.OPENAI_API_KEY;
  
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is missing or empty');
    }
  
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Changed from gpt-4o-audio to gpt-4o
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant."
        },
        {
          role: "user",
          content: "Say 'Hello from GPT-4o!' and provide a brief analysis of why this model is good for interview analysis."
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    return NextResponse.json({
      success: true,
      message: response.choices[0].message.content,
      model: "gpt-4o",
      usage: response.usage
    });

  } catch (error) {
    console.error('OpenAI test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 