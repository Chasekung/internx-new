import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openaiApiKey = process.env.OPENAI_API_KEY!;
const openai = new OpenAI({ apiKey: openaiApiKey });

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { companyWebsite, roleDescription, conversationHistory } = await request.json();

    if (!companyWebsite && !roleDescription) {
      return NextResponse.json(
        { error: 'Please provide either a company website or role description' },
        { status: 400 }
      );
    }

    // Build conversation context
    const conversationContext = conversationHistory
      ?.slice(-4) // Keep last 4 messages for context
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })) || [];

    // Create AI prompt for job description generation
    const systemPrompt = `You are a professional job description writer specializing in creating opportunities for high school students.

Your task is to generate a clean, structured, professional internship/opportunity description that:
1. Is written FOR high school students (age 14-18)
2. Uses clear, encouraging, realistic language
3. Follows YC-style clarity and professionalism
4. NO EMOJIS, NO GRADIENTS, clean formatting only

Format Structure (USE EXACTLY THIS):

About the Team
[2-3 sentences describing the company/team. Make it welcoming and informative.]

About the Role
[2-3 sentences explaining what this internship/position is about.]

Team Focus Areas
• [Focus area 1]
• [Focus area 2]
• [Focus area 3]

In this role, you will:
• [Responsibility 1]
• [Responsibility 2]
• [Responsibility 3]
• [Responsibility 4]

You might thrive in this role if you:
• [Quality/skill 1]
• [Quality/skill 2]
• [Quality/skill 3]
• [Quality/skill 4]

Guidelines:
- If company website is provided, research and incorporate company info
- If only role description provided, focus on that role
- Keep language appropriate for high school students
- Be realistic about expectations
- Make it encouraging but professional
- No corporate jargon that high schoolers won't understand
- Use bullet points (•) for lists
- Each section should be clear and concise

If information is missing or vague, make reasonable assumptions but keep it general and adaptable.

Respond with ONLY the formatted description text, nothing else.`;

    const userPrompt = `
${companyWebsite ? `Company Website: ${companyWebsite}` : ''}
${roleDescription ? `Role Details: ${roleDescription}` : ''}

Generate a professional internship description following the exact format specified.`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationContext,
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    const generatedDescription = completion.choices[0]?.message?.content;
    
    if (!generatedDescription) {
      throw new Error('No response from AI');
    }

    return NextResponse.json({
      description: generatedDescription,
      success: true
    });

  } catch (error) {
    console.error('Job description generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate description',
        description: 'Sorry, I encountered an error. Please try again with more details.',
        success: false
      },
      { status: 500 }
    );
  }
}

