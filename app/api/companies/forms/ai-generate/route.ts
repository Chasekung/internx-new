import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Fetch and parse website content
async function fetchWebsiteContent(url: string): Promise<string> {
  console.debug('[AI-API] 🌐 Fetching website:', url);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; InternX-Bot/1.0)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });
    
    console.debug('[AI-API] 📥 Website response status:', response.status);
    
    if (!response.ok) {
      console.warn('[AI-API] ⚠️ Website returned non-OK status:', response.status);
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    console.debug('[AI-API] 📄 HTML length:', html.length);
    
    // Extract text content from HTML (simple approach)
    // Remove script and style tags
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    console.debug('[AI-API] 📝 Extracted text length:', textContent.length);
    
    // Limit to first 3000 characters to avoid token limits
    const limitedContent = textContent.slice(0, 3000);
    console.debug('[AI-API] ✅ Website content fetched:', limitedContent.length, 'chars');
    
    return limitedContent;
  } catch (error) {
    console.error('[AI-API] ❌ Website fetch error:', error);
    console.debug('[AI-API] ⚠️ Falling back to no website content');
    return '';
  }
}

export async function POST(request: NextRequest) {
  console.debug('[AI-API] 🚀 AI form generation request received');
  
  try {
    if (!supabase) {
      console.error('[AI-API] ❌ Database connection not available');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const { companyId, formId } = await request.json();
    console.debug('[AI-API] 📥 Request params:', { companyId, formId });

    if (!companyId) {
      console.error('[AI-API] ❌ Company ID missing');
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    // Fetch company profile
    console.debug('[AI-API] 🔍 Fetching company profile...');
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_name, description, industry, website')
      .eq('id', companyId)
      .single();

    if (companyError || !company) {
      console.error('[AI-API] ❌ Company not found:', companyError);
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    console.debug('[AI-API] ✅ Company profile fetched:', {
      name: company.company_name,
      hasWebsite: !!company.website,
      hasDescription: !!company.description,
      industry: company.industry
    });

    // Fetch website content if URL exists
    let websiteContent = '';
    if (company.website) {
      console.debug('[AI-API] 🌐 Fetching website content from:', company.website);
      websiteContent = await fetchWebsiteContent(company.website);
      console.debug('[AI-API] 📄 Website content length:', websiteContent.length);
    } else {
      console.debug('[AI-API] ⚠️ No website URL available');
    }

    // Fetch existing opportunity posts for this company
    console.debug('[AI-API] 🔍 Fetching opportunity posts...');
    const { data: opportunities, error: opportunitiesError } = await supabase
      .from('internships')
      .select('id, title, position, category, description')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .limit(10);

    console.debug('[AI-API] 📋 Opportunities found:', opportunities?.length || 0);

    // Prepare context for AI
    const companyContext = {
      name: company.company_name,
      description: company.description || '',
      industry: company.industry || '',
      website: company.website || '',
      websiteContent: websiteContent || 'No website content available',
      opportunities: opportunities || [],
    };

    console.debug('[AI-API] 📦 Company context prepared:', {
      name: companyContext.name,
      hasDescription: !!companyContext.description,
      hasWebsiteContent: websiteContent.length > 0,
      opportunityCount: companyContext.opportunities.length
    });

    // Build AI prompt - CRITICAL: Produces COMPLETE Supabase-ready objects
    const systemPrompt = `You are an expert form builder assistant. Your task is to analyze a company's profile and website, then generate a COMPLETE application form structure ready for database storage.

CRITICAL RULES:
1. Use the company website content as the PRIMARY source of truth
2. Generate forms specific to this company's actual work and culture
3. Create 2-4 sections with 3-6 questions per section
4. Use appropriate question types: short_text, long_text, multiple_choice, checkboxes, dropdown, file_upload, video_upload
5. Make questions relevant to high school students applying for internships
6. Include standard questions (contact info, availability) and role-specific questions
7. ALWAYS include ALL fields for every question - no optional fields should be omitted

REQUIRED: Every question MUST have these fields (provide empty string or default if not applicable):
- type: REQUIRED - one of: short_text, long_text, multiple_choice, checkboxes, dropdown, file_upload, video_upload
- question_text: REQUIRED - the actual question
- description: REQUIRED - explanation or context (use "" if none)
- required: REQUIRED - true or false
- placeholder: REQUIRED - hint text shown in empty field (use "" if none)
- hint: REQUIRED - helper text below the question (use "" if none)
- options: REQUIRED for multiple_choice, checkboxes, dropdown - array of strings. MUST have at least 2 options.

Respond with ONLY valid JSON in this exact structure:
{
  "summary": "1-3 sentence summary of what the company does",
  "matchedOpportunityId": null,
  "sections": [
    {
      "title": "Section Title (REQUIRED)",
      "description": "Section description (use empty string if none)",
      "questions": [
        {
          "type": "short_text",
          "question_text": "Question text (REQUIRED)",
          "description": "Description or empty string",
          "required": true,
          "placeholder": "Placeholder or empty string",
          "hint": "Hint or empty string"
        },
        {
          "type": "multiple_choice",
          "question_text": "Question with options",
          "description": "",
          "required": false,
          "placeholder": "",
          "hint": "",
          "options": ["Option 1", "Option 2", "Option 3"]
        }
      ]
    }
  ]
}`;

    const userPrompt = `Company Information:
- Name: ${companyContext.name}
- Industry: ${companyContext.industry}
- Description: ${companyContext.description}
- Website: ${companyContext.website}

Website Content (first 3000 chars):
${companyContext.websiteContent}

Existing Opportunities:
${companyContext.opportunities.map(opp => `- ${opp.title} (${opp.position}): ${opp.description?.slice(0, 200)}...`).join('\n')}

Generate a comprehensive internship application form for this company. Make it specific to their actual work based on the website content.`;

    console.debug('[AI-API] 🤖 Calling OpenAI API...');
    console.debug('[AI-API] 📝 Prompt length:', userPrompt.length);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    console.debug('[AI-API] ✅ OpenAI response received');

    const generatedContent = completion.choices[0].message.content;
    
    if (!generatedContent) {
      console.error('[AI-API] ❌ AI returned empty response');
      throw new Error('AI returned empty response');
    }

    console.debug('[AI-API] 📄 Generated content length:', generatedContent.length);

    const rawFormStructure = JSON.parse(generatedContent);
    console.debug('[AI-API] 📋 Parsed raw form structure:', {
      hasSummary: !!rawFormStructure.summary,
      sectionCount: rawFormStructure.sections?.length,
      hasMatchedOpportunity: !!rawFormStructure.matchedOpportunityId
    });

    // Validate structure
    if (!rawFormStructure.sections || !Array.isArray(rawFormStructure.sections)) {
      console.error('[AI-API] ❌ Invalid form structure - missing sections array:', rawFormStructure);
      throw new Error('Invalid form structure returned by AI: missing sections array');
    }

    // NORMALIZE: Ensure ALL fields are present with proper defaults
    // This guarantees the client receives COMPLETE Supabase-ready objects
    console.debug('[AI-API] 🔧 Normalizing AI response to ensure complete objects...');
    
    const normalizedSections = rawFormStructure.sections.map((section: any, sIdx: number) => {
      // Validate section
      if (!section.title) {
        console.warn(`[AI-API] ⚠️ Section ${sIdx + 1} missing title, using default`);
      }
      
      const normalizedQuestions = (section.questions || []).map((question: any, qIdx: number) => {
        // Ensure question has all required fields
        const questionType = question.type || 'short_text';
        const needsOptions = ['multiple_choice', 'checkboxes', 'dropdown'].includes(questionType);
        
        // Log if important fields are missing
        if (!question.question_text) {
          console.warn(`[AI-API] ⚠️ Question ${qIdx + 1} in section "${section.title}" missing question_text`);
        }
        
        // Create COMPLETE question object
        return {
          type: questionType,
          question_text: question.question_text || 'Untitled Question',
          description: question.description || '',
          required: question.required ?? false,
          placeholder: question.placeholder || '',
          hint: question.hint || '',
          // Options: required for choice-type questions
          options: needsOptions 
            ? (question.options && question.options.length >= 2 ? question.options : ['Option 1', 'Option 2'])
            : undefined
        };
      });
      
      // Create COMPLETE section object
      return {
        title: section.title || `Section ${sIdx + 1}`,
        description: section.description || '',
        questions: normalizedQuestions
      };
    });

    const formStructure = {
      summary: rawFormStructure.summary || 'No summary provided',
      matchedOpportunityId: rawFormStructure.matchedOpportunityId || null,
      sections: normalizedSections
    };

    console.debug('[AI-API] ✅ Normalization complete');
    console.debug('[AI-API] 📊 Normalized form details:', {
      sections: formStructure.sections.map((s: any) => ({
        title: s.title,
        hasDescription: !!s.description,
        questionCount: s.questions?.length,
        questions: s.questions?.map((q: any) => ({
          type: q.type,
          hasOptions: !!q.options,
          optionCount: q.options?.length
        }))
      }))
    });

    // Log which sources were used
    const sourcesUsed = [];
    if (websiteContent) sourcesUsed.push(`Website content (${websiteContent.length} chars)`);
    if (company.description) sourcesUsed.push('Company description');
    if (opportunities && opportunities.length > 0) sourcesUsed.push(`${opportunities.length} opportunity posts`);

    console.debug('[AI-API] 📚 Sources used:', sourcesUsed);

    const response = {
      success: true,
      summary: formStructure.summary,
      matchedOpportunityId: formStructure.matchedOpportunityId,
      sections: formStructure.sections,
      sourcesUsed,
      companyName: company.company_name,
    };

    console.debug('[AI-API] 📤 Sending response:', {
      success: true,
      sectionCount: response.sections.length,
      sourcesUsed: response.sourcesUsed
    });

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[AI-API] ❌ AI form generation error:', error);
    console.error('[AI-API] 📋 Error details:', {
      message: error.message,
      stack: error.stack?.slice(0, 500)
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to generate form',
        details: error.message
      },
      { status: 500 }
    );
  }
}

