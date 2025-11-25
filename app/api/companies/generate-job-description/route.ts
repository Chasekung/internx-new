import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { query, conversationHistory, formContext } = await request.json();
    console.log('API called with:', { query, hasFormContext: !!formContext, historyLength: conversationHistory?.length || 0 });

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
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
    let websiteInstruction = '';
    
    if (formContext) {
      const details = [];
      
      // Prioritize company website as primary information source
      if (formContext.company_website) {
        websiteInstruction = `\n\n🌐 IMPORTANT - Company Website Provided: ${formContext.company_website}

You MUST reference this company website as your PRIMARY source of information about the company. Use the website to:
- Understand the company's mission, values, and culture
- Match the company's tone and voice in the description
- Identify the company's actual products, services, and focus areas
- Ensure accuracy by using real company information instead of assumptions

DO NOT generate generic descriptions. Use the company website to create a description that is specific and authentic to THIS company.`;
      }
      
      if (formContext.company_name) details.push(`Company: ${formContext.company_name}`);
      if (formContext.category) details.push(`Category: ${formContext.category}`);
      if (formContext.position) details.push(`Position: ${formContext.position}`);
      if (formContext.for_profit) details.push(`Type: ${formContext.for_profit === 'true' ? 'For-Profit' : 'Non-Profit'}`);
      if (formContext.work_location_type) details.push(`Location Type: ${formContext.work_location_type}`);
      if (formContext.hours_per_week) details.push(`Hours per Week: ${formContext.hours_per_week}`);
      if (formContext.pay) details.push(`Pay: $${formContext.pay}/hr`);
      if (formContext.address && formContext.city && formContext.state) {
        details.push(`Work Location: ${formContext.city}, ${formContext.state}`);
      }
      if (formContext.current_description) details.push(`Current Description: ${formContext.current_description}`);
      
      if (details.length > 0) {
        contextDetails = `\n\nOpportunity Details Already Selected:\n${details.map(d => `- ${d}`).join('\n')}

Please tailor the description specifically for this ${formContext.position || 'internship'} role${formContext.category ? ` in ${formContext.category}` : ''}.`;
      }
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

CRITICAL RULES:
1. **COMPANY WEBSITE IS PRIMARY SOURCE**: When a company website URL is provided, you MUST use it as your main reference. Research the actual company, understand their mission, products, services, culture, and tone. Generate company-specific content, NOT generic descriptions.
2. Write for high school students (clear, approachable language)
3. Be realistic about expectations for high school interns
4. NO gradients, NO emojis, NO fancy formatting
5. Use clean, professional tone similar to YC job posts
6. Match the company's authentic voice and values from their website
7. Include specific details about the company's work, products, or services
8. If requirements are vague, make reasonable assumptions based on the company website
9. Skip sections gracefully if there's insufficient information
10. Keep it concise but informative (400-600 words total)
11. DO NOT confuse companies with similar names - use the website URL to identify the correct company`;

    const userPrompt = `${query}${websiteInstruction}${contextDetails}

Please generate a complete, structured job description following the format exactly. Make sure the description aligns with the opportunity details provided above and is tailored specifically to this company based on their website information.`;

    const messages: any[] = [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
      { role: 'user', content: userPrompt }
    ];

    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Faster and cheaper model
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000, // Reduced for faster response
      top_p: 0.9,
      frequency_penalty: 0.3,
      presence_penalty: 0.3
    });

    const generatedDescription = completion.choices[0].message.content;
    
    if (!generatedDescription) {
      console.error('OpenAI returned empty response');
      return NextResponse.json(
        { error: 'AI generated empty response. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Successfully generated description, length:', generatedDescription.length);

    return NextResponse.json({
      success: true,
      response: "I've generated a professional job description for you! Click 'Insert into Form' to add it to your posting.",
      generatedDescription: generatedDescription
    });

  } catch (error: any) {
    console.error('Job description generation error:', {
      message: error.message,
      type: error.constructor.name,
      status: error.status,
      code: error.code
    });
    
    // Provide user-friendly error messages
    let userMessage = 'Failed to generate job description. ';
    
    if (error.code === 'insufficient_quota') {
      userMessage += 'OpenAI API quota exceeded. Please check your API key billing.';
    } else if (error.code === 'invalid_api_key') {
      userMessage += 'Invalid OpenAI API key. Please check your .env.local configuration.';
    } else if (error.message?.includes('timeout')) {
      userMessage += 'Request timed out. Please try again.';
    } else {
      userMessage += error.message || 'Unknown error occurred.';
    }
    
    return NextResponse.json(
      { error: userMessage, details: error.message },
      { status: 500 }
    );
  }
}

