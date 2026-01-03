import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { INTERVIEW_QUESTIONS, getQuestionsForInterview } from '@/lib/interviewQuestions';
import { convertMathWorkToLatex } from '@/lib/mathToLatex';
import { type MathStep } from '@/components/interview/MathEditorEnhanced';
import { devLogger } from '@/lib/devLogger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Initialize clients - create fresh each request for reliability
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase config:', { 
      hasUrl: !!supabaseUrl, 
      hasServiceKey: !!supabaseServiceKey 
    });
    return null;
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

// Fallback generic questions for interview flow
const GENERIC_QUESTIONS: Record<string, string[]> = {
  introduction: [
    "Tell me about yourself and your background.",
    "What made you interested in this field?",
  ],
  experience: [
    "What relevant projects or experiences have you worked on?",
    "Tell me about something you're particularly proud of.",
  ],
  technical: [
    "Walk me through your approach to solving complex problems.",
    "How do you stay current with developments in this field?",
  ],
  challenges: [
    "Tell me about a time when you faced a significant challenge.",
    "Describe a situation where you had to learn something new quickly.",
  ],
  goals: [
    "Where do you see yourself developing in this area?",
    "What skills are you most eager to develop?",
  ]
};

const GENERIC_CATEGORIES = Object.keys(GENERIC_QUESTIONS);

// Get domain-specific system prompt based on interview type
function getDomainPrompt(category: string, subcategory: string, difficulty: string): string {
  const difficultyGuidance = {
    easy: 'Ask basic, foundational questions. Focus on definitions, simple scenarios, and intro-level reasoning. No advanced math or multi-layer logic.',
    medium: 'Ask applied reasoning questions with multi-step logic. Use realistic professional scenarios with moderate technical depth.',
    hard: 'Ask deep domain expertise questions. Include edge cases, ambiguous scenarios, high-pressure reasoning, and advanced theory.'
  }[difficulty] || 'Ask balanced questions appropriate for the candidate level.';

  const domainPrompts: Record<string, string> = {
    'Computer Science': `You are a technical interviewer for a software engineering role. Focus on ${subcategory}. ${difficultyGuidance} Ask about data structures, algorithms, system design, code quality, and problem-solving approaches.`,
    'Finance': `You are an investment banking/finance interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask about financial modeling, valuation, markets, and analytical skills.`,
    'Mathematics': `You are a quantitative interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask probability puzzles, stochastic calculus, optimization, and trading logic questions.`,
    'Consulting': `You are a management consulting interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask structured business problems, frameworks, and numerical reasoning questions.`,
    'Design': `You are a design interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask about design process, user research, visual reasoning, and portfolio work.`,
    'Engineering': `You are an engineering interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask domain-specific technical questions requiring calculations and engineering reasoning.`,
    'Healthcare': `You are a medical/healthcare interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask ethical dilemmas, patient scenarios, and clinical reasoning questions.`,
    'Business': `You are a business/product interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask product sense, strategy, prioritization, and metrics questions.`,
    'Law': `You are a legal interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask legal hypotheticals, argumentation, and case interpretation questions.`,
    'Science': `You are a research/science interviewer. Focus on ${subcategory}. ${difficultyGuidance} Ask experimental design, hypothesis testing, and data interpretation questions.`,
  };

  return domainPrompts[category] || 'You are a professional interviewer conducting a comprehensive interview.';
}

// Get questions from the domain-specific bank or fall back to AI generation
function getDomainQuestion(
  category: string, 
  subcategory: string, 
  difficulty: string,
  askedQuestions: string[]
): string | null {
  const diffLevel = difficulty.toLowerCase() as 'easy' | 'medium' | 'hard';
  const questions = getQuestionsForInterview(category, subcategory, diffLevel);
  const available = questions.filter(q => !askedQuestions.some(asked => asked.includes(q.slice(0, 30))));
  
  if (available.length > 0) {
    return available[Math.floor(Math.random() * available.length)];
  }
  return null;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  // Create a streaming response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const supabase = getSupabaseClient();
        if (!supabase) {
          console.error('Supabase client not initialized - check SUPABASE_SERVICE_ROLE_KEY');
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Database not available - service key missing' })}\n\n`));
          controller.close();
          return;
        }

        const openai = getOpenAIClient();
        if (!openai) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'OpenAI not configured' })}\n\n`));
          controller.close();
          return;
        }

        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Unauthorized' })}\n\n`));
          controller.close();
          return;
        }

        const token = authHeader.substring(7);
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        
        if (authError || !user) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Unauthorized' })}\n\n`));
          controller.close();
          return;
        }

        const body = await request.json();
        const { 
          session_id, 
          user_response, 
          current_question, 
          interview_type,
          interview_category,
          interview_subcategory,
          difficulty_level = 'medium',
          math_steps // Structured math steps from WYSIWYG editor
        } = body;

        // Verify session
        const { data: session, error: sessionError } = await supabase
          .from('interview_sessions')
          .select('*')
          .eq('id', session_id)
          .eq('intern_id', user.id)
          .single();

        if (sessionError || !session) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Invalid session' })}\n\n`));
          controller.close();
          return;
        }

        // Get previous responses for context
        const { data: previousResponses } = await supabase
          .from('interview_responses')
          .select('question_text, response_text, question_category')
          .eq('session_id', session_id)
          .order('asked_at', { ascending: true });

        // Count previous questions + 1 for the current one being answered
        const questionsAnswered = (previousResponses?.length || 0) + 1;

        // Check if interview should complete (after 12 questions answered)
        if (questionsAnswered > 12) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'complete',
            message: 'Thank you for completing the interview! Your responses are being analyzed.',
            total_questions: questionsAnswered - 1
          })}\n\n`));
          controller.close();
          return;
        }

        // Build conversation context (last 6 exchanges for speed)
        const conversationHistory = previousResponses?.slice(-6).map(r => 
          `Q: ${r.question_text}\nA: ${r.response_text}`
        ).join('\n\n') || '';

        // Get asked questions to avoid repeats
        const askedQuestions = previousResponses?.map(r => r.question_text) || [];

        // Determine interview category and subcategory
        const category = interview_category || session.interview_category || 'General';
        const subcategory = interview_subcategory || session.interview_subcategory || '';
        const difficulty = difficulty_level || session.difficulty_level || 'medium';

        // Try to get a domain-specific question first
        let domainQuestion = getDomainQuestion(category, subcategory, difficulty, askedQuestions);

        // For generic categories, use the fallback
        const nextGenericCategory = GENERIC_CATEGORIES[questionsAnswered % GENERIC_CATEGORIES.length];

        // Send start event with current progress
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'start', 
          category: subcategory || category,
          progress: { current: questionsAnswered, total: 12 }
        })}\n\n`));

        // Check if this is a mathematical work submission (BEFORE AI call)
        let taskSubmission = null;
        let mathLatex = '';
        let mathAnalysisData = null;
        
        // Priority 1: Use structured math_steps from WYSIWYG editor (preferred)
        if (math_steps && Array.isArray(math_steps) && math_steps.length > 0) {
          try {
            const mathSteps = math_steps as MathStep[];
            // Convert structured math to LaTeX internally (user never sees this)
            const { latex, stepCount, hasExplanations } = convertMathWorkToLatex(mathSteps);
            mathLatex = latex;
            
            taskSubmission = {
              type: 'math_work',
              steps: mathSteps.map((step, idx) => ({
                step_number: idx + 1,
                latex: convertMathWorkToLatex([step]).latex,
                explanation: step.explanation || null,
                structured_content: step.content // Keep structured format for detailed analysis
              })),
              submitted_at: new Date().toISOString(),
              step_count: stepCount,
              has_explanations: hasExplanations
            };
            
            mathAnalysisData = {
              latex: mathLatex,
              step_count: stepCount,
              has_explanations: hasExplanations,
              steps: mathSteps
            };
            
            // Dev logging
            devLogger.logMathConverted(mathLatex, stepCount);
          } catch (error) {
            console.error('Error converting math steps to LaTeX:', error);
            devLogger.logConversionError(String(error));
            // Fall through to text extraction fallback
          }
        }
        
        // Fallback: Extract from text response if structured data not available
        if (!taskSubmission && user_response.includes("I've submitted my mathematical work with")) {
          const workMatch = user_response.match(/step\(s\):\n\n([\s\S]+)/);
          if (workMatch) {
            const stepsText = workMatch[1];
            const steps = stepsText.split('\n').filter((s: string) => s.trim()).map((step: string) => {
              const stepMatch = step.match(/Step (\d+): (.+?)(?:\s*\((.+)\))?$/);
              if (stepMatch) {
                return {
                  step_number: parseInt(stepMatch[1]),
                  latex: stepMatch[2].trim(),
                  explanation: stepMatch[3]?.trim() || null
                };
              }
              return null;
            }).filter(Boolean);
            
            if (steps.length > 0) {
              taskSubmission = {
                type: 'math_work',
                steps: steps,
                submitted_at: new Date().toISOString()
              };
              mathLatex = steps.map((s: any) => s.latex).join(' \\\\\n');
            }
          }
        }

        // Build structured work breakdown for AI analysis
        let structuredWorkBreakdown = '';
        if (mathAnalysisData && mathAnalysisData.steps) {
          structuredWorkBreakdown = mathAnalysisData.steps.map((step: MathStep, idx: number) => {
            const stepLatex = convertMathWorkToLatex([step]).latex;
            return `Step ${idx + 1}: ${stepLatex}${step.explanation ? `\n  Explanation: ${step.explanation}` : ''}`;
          }).join('\n\n');
        }

        // Get domain-specific system prompt
        const systemPrompt = getDomainPrompt(category, subcategory, difficulty);

        // Generate response with domain-specific context
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            { 
              role: "user", 
              content: `Interview Context:
- Category: ${category}
- Subcategory: ${subcategory}
- Difficulty: ${difficulty.toUpperCase()}
- Question ${questionsAnswered} of 12

Previous exchanges:
${conversationHistory}

The candidate just answered: "${current_question}"
Their response: "${user_response}"

${taskSubmission && mathAnalysisData ? `
⚠️ MATHEMATICAL WORK SUBMITTED - CRITICAL: You MUST analyze the actual mathematical work.

The candidate has submitted ${mathAnalysisData.step_count} step(s) of mathematical work.

LaTeX representation (for your analysis):
${mathLatex}

${structuredWorkBreakdown ? `
Structured work breakdown:
${structuredWorkBreakdown}
` : ''}

YOU MUST EVALUATE:
1. **Correctness of each step** - Is the math correct at each stage?
2. **Logical approach** - Does the method make sense for the problem?
3. **Mathematical reasoning** - Is the thought process sound?
4. **Errors identification** - Where did they go wrong (if applicable)?
5. **Notation usage** - Are they using proper mathematical notation?
6. **Efficiency** - Is there a better or more efficient approach?

CRITICAL REQUIREMENTS:
- Your acknowledgment MUST specifically reference their mathematical work
- Point out specific steps that are correct or incorrect
- If they made an error, identify WHERE (which step) and WHY
- If their approach is sound but arithmetic is wrong, acknowledge the good reasoning
- If their approach is wrong but they got lucky with the answer, point this out
- DO NOT give generic praise like "good job" - be specific about the mathematics

Example good acknowledgment: "Your approach to solving this equation is correct - you correctly isolated the variable in step 2. However, in step 3, you made an arithmetic error when dividing by 2. The correct result should be x = 5, not x = 3."

Example bad acknowledgment: "Good job submitting your work." ❌
` : taskSubmission ? `
⚠️ MATHEMATICAL WORK SUBMITTED - Please analyze the work shown below:
${JSON.stringify(taskSubmission.steps, null, 2)}

Evaluate the correctness, approach, and reasoning. Be specific in your feedback.
` : ''}

${domainQuestion ? `
Suggested next question (use this or generate a similar one):
"${domainQuestion}"
` : ''}

Respond with ONLY a JSON object (no markdown):
{
  "acknowledgment": "brief 1-sentence acknowledgment of their answer${taskSubmission ? ' - be specific about their mathematical work and any errors/strengths you notice' : ' - be specific to what they said'}",
  "next_question": "your next ${difficulty} difficulty ${subcategory || category} interview question"
}

IMPORTANT: 
- Do NOT ask about motivation or 'why this field' repeatedly
- Ask domain-specific technical/practical questions appropriate for ${difficulty} difficulty
- For ${difficulty === 'hard' ? 'HARD: test deep expertise with edge cases and complex scenarios' : difficulty === 'easy' ? 'EASY: focus on fundamentals and basic concepts' : 'MEDIUM: balance theory and practical application'}
${taskSubmission ? '- Since they submitted mathematical work, your acknowledgment MUST comment on the actual mathematics, not just generic praise' : ''}`
            }
          ],
          max_tokens: 300,
          temperature: 0.6,
        });

        const responseText = completion.choices[0]?.message?.content || '';
        
        // Parse JSON response
        let acknowledgment = 'Thank you for that response.';
        let nextQuestion = domainQuestion || GENERIC_QUESTIONS[nextGenericCategory]?.[0] || 'Tell me more about your experience.';
        
        try {
          // Try to parse as JSON
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            acknowledgment = parsed.acknowledgment || acknowledgment;
            nextQuestion = parsed.next_question || nextQuestion;
          }
        } catch {
          // Fallback: extract from text if JSON parsing fails
          const lines = responseText.split('\n').filter(l => l.trim());
          if (lines.length >= 2) {
            acknowledgment = lines[0].replace(/^[^:]*:\s*/, '').trim();
            nextQuestion = lines[1].replace(/^[^:]*:\s*/, '').trim();
          }
        }

        // Store the response in database (with all required fields)
        console.log('💾 Saving interview response:', {
          session_id,
          question_preview: current_question?.slice(0, 50),
          response_preview: user_response?.slice(0, 50)
        });

        // Try to insert with question_category first, fall back to without it if column doesn't exist
        let insertData = null;
        let insertError = null;

        // First try with question_category and task_submission (taskSubmission was extracted earlier)
        const result1 = await supabase.from('interview_responses').insert({
          session_id,
          question_id: null,
          question_text: current_question,
          question_category: subcategory || category,
          response_text: user_response,
          task_submission: taskSubmission,
          asked_at: new Date().toISOString(),
          answered_at: new Date().toISOString()
        }).select();

        if (result1.error?.code === 'PGRST204' && result1.error?.message?.includes('question_category')) {
          // Column doesn't exist, try without it but keep task_submission
          console.log('⚠️ question_category column not found, inserting without it');
          const result2 = await supabase.from('interview_responses').insert({
            session_id,
            question_id: null,
            question_text: current_question,
            response_text: user_response,
            task_submission: taskSubmission,
            asked_at: new Date().toISOString(),
            answered_at: new Date().toISOString()
          }).select();
          insertData = result2.data;
          insertError = result2.error;
        } else {
          insertData = result1.data;
          insertError = result1.error;
        }

        if (insertError) {
          // Log the full error for debugging
          console.error('❌ Failed to save response to interview_responses:', {
            code: insertError.code,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            session_id
          });
          
          // Fallback: Append to session transcript so we don't lose data
          const transcriptEntry = `Q: ${current_question}\nA: ${user_response}\n\n`;
          const { error: transcriptError } = await supabase
            .from('interview_sessions')
            .update({
              transcript: transcriptEntry,
              ai_notes: `${new Date().toISOString()}: Response saved to transcript as fallback due to insert error: ${insertError.message}`
            })
            .eq('id', session_id);
          
          if (transcriptError) {
            console.error('❌ Failed to save to transcript fallback:', transcriptError);
          } else {
            console.log('✅ Saved to transcript fallback');
          }
        } else {
          console.log('✅ Response saved successfully:', insertData?.[0]?.id);
        }

        // ALWAYS update transcript in session as backup (regardless of insert result)
        const transcriptEntry = `Q${questionsAnswered}: ${current_question}\nA${questionsAnswered}: ${user_response}\n\n`;
        const existingTranscript = session.transcript || '';
        await supabase
          .from('interview_sessions')
          .update({
            transcript: existingTranscript + transcriptEntry
          })
          .eq('id', session_id);

        // Send final parsed data with correct progress
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'done',
          acknowledgment,
          next_question: nextQuestion,
          category: subcategory || category,
          progress: {
            current: questionsAnswered,
            total: 12
          }
        })}\n\n`));

        controller.close();
      } catch (error) {
        console.error('Stream error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          type: 'error', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

