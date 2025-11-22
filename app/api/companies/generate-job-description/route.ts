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

    const { companyWebsite, requirements, conversationHistory, opportunityContext } = await request.json();

    if (!companyWebsite && !requirements) {
      return NextResponse.json(
        { error: 'At least company website or requirements must be provided' },
        { status: 400 }
      );
    }

    // Build context from conversation history (last 3 messages)
    const contextMessages = conversationHistory
      ? conversationHistory.slice(-3).map((msg: any) => ({
          role: msg.role,
          content: msg.content
        }))
      : [];

    // Build additional context from opportunity form fields if provided
    let contextDetails = '';
    if (opportunityContext) {
      contextDetails = `\n\nOpportunity Details Already Selected:
- Category: ${opportunityContext.category}
- Position: ${opportunityContext.position}
- Type: ${opportunityContext.profitType === 'for-profit' ? 'For-Profit' : 'Non-Profit'}
- Location: ${opportunityContext.location}
- Hours per Week: ${opportunityContext.hoursPerWeek}
- Pay: $${opportunityContext.pay}/hr

Please tailor the description specifically for this ${opportunityContext.position} role in ${opportunityContext.category}.`;
    }

    // System prompt for job description generation
    const systemPrompt = `You are an expert job description writer specializing in internship opportunities for high school students. 

Your task is to generate clear, professional, and engaging internship descriptions using this EXACT structure:

**About the Team**
[2-3 sentences describing the team and company culture]

**About the Role**
[2-3 sentences explaining what this internship position is and why it matters]

**Team Focus Areas**
• [Focus area 1]
• [Focus area 2]
• [Focus area 3]

**In this role, you will:**
• [Responsibility 1]
• [Responsibility 2]
• [Responsibility 3]
• [Responsibility 4]

**You might thrive in this role if you:**
• [Quality/skill 1]
• [Quality/skill 2]
• [Quality/skill 3]
• [Quality/skill 4]

IMPORTANT RULES:
1. Write for high school students (clear, approachable language)
2. Be realistic about expectations for high school interns
3. NO gradients, NO emojis, NO fancy formatting
4. Use clean, professional tone similar to YC job posts
5. If company website is provided, research the company and match their voice
6. If requirements are vague, make reasonable assumptions
7. Skip sections if there's insufficient information
8. Keep it concise but informative (400-600 words total)`;

    const userPrompt = `Generate an internship job description with the following information:

${companyWebsite ? `Company Website: ${companyWebsite}` : ''}
${requirements ? `Requirements/Details: ${requirements}` : ''}
${contextDetails}

Please generate a complete, structured job description following the format exactly. Make sure the description aligns with the opportunity details provided above.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
      { role: 'user', content: userPrompt }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500
    });

    const generatedDescription = completion.choices[0].message.content;

    return NextResponse.json({
      response: "I've generated a job description for you. Would you like me to paste this into your Opportunity Description field?",
      description: generatedDescription
    });

  } catch (error: any) {
    console.error('Job description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate job description', details: error.message },
      { status: 500 }
    );
  }
}

