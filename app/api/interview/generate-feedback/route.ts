import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { convertMathWorkToLatex } from '@/lib/mathToLatex';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = await request.json();

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
    }

    // Get session data
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('intern_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get responses for this session (including task submissions for math work)
    const { data: responses } = await supabase
      .from('interview_responses')
      .select('question_text, response_text, question_category, task_submission')
      .eq('session_id', session_id)
      .order('asked_at', { ascending: true });

    // Get intern profile for context
    const { data: internData } = await supabase
      .from('interns')
      .select('full_name, skills, experience, career_interests')
      .eq('id', user.id)
      .single();

    // Build transcript for analysis - try interview_responses first, then session transcript
    let transcript = '';
    let questionsAnswered = responses?.length || 0;
    let mathWorkAnalysis = '';

    if (responses && responses.length > 0) {
      // Extract math work from task_submission fields
      const mathWorkResponses = responses.filter(r => 
        r.task_submission && 
        typeof r.task_submission === 'object' && 
        'type' in r.task_submission && 
        r.task_submission.type === 'math_work'
      );

      if (mathWorkResponses.length > 0) {
        const mathWorkSections = mathWorkResponses.map((r, idx) => {
          const taskSub = r.task_submission as any;
          if (taskSub.steps && Array.isArray(taskSub.steps)) {
            const stepsLatex = taskSub.steps.map((step: any) => 
              step.latex || step.structured_content ? convertMathWorkToLatex([{
                id: `step-${idx}`,
                content: step.structured_content || { type: 'equation', parts: [] },
                explanation: step.explanation
              }]).latex : ''
            ).filter(Boolean).join(' \\\\\n');
            
            return `Mathematical Work ${idx + 1} (for question "${r.question_text}"):\n${stepsLatex}`;
          }
          return '';
        }).filter(Boolean);
        
        if (mathWorkSections.length > 0) {
          mathWorkAnalysis = `\n\nMATHEMATICAL WORK SUBMITTED:\n${mathWorkSections.join('\n\n')}\n\nIMPORTANT: You MUST evaluate:\n- Correctness of mathematical steps\n- Logical approach and reasoning\n- Any errors in calculation or method\n- Quality of mathematical presentation\n- Whether the approach was sound even if final answer was wrong\n`;
        }
      }

      transcript = responses.map((r, i) => 
        `Q${i + 1}: ${r.question_text}\nA${i + 1}: ${r.response_text || '[No response recorded]'}`
      ).join('\n\n');
      console.log(`📝 Using ${responses.length} responses from interview_responses table`);
    } else if (session.transcript && session.transcript.trim()) {
      // Fallback: Use session transcript if interview_responses is empty
      transcript = session.transcript;
      // Count Q&A pairs in transcript
      const qMatches = transcript.match(/Q\d+:/g);
      questionsAnswered = qMatches ? qMatches.length : 0;
      console.log(`📝 Using session transcript fallback with ${questionsAnswered} Q&A pairs`);
    }

    // Generate AI feedback
    const analysisPrompt = `Analyze this interview performance and provide detailed, constructive feedback.

INTERVIEW TRANSCRIPT:
${transcript || 'No transcript available - evaluate based on completion metrics only.'}
${mathWorkAnalysis}

INTERVIEW DETAILS:
- Questions Answered: ${questionsAnswered}
- Interview Type: ${session.interview_type || 'General'}
- Duration: ${session.duration_seconds ? Math.round(session.duration_seconds / 60) + ' minutes' : 'Not recorded'}

CANDIDATE INFO:
- Name: ${internData?.full_name || 'Unknown'}
- Skills: ${internData?.skills || 'Not specified'}
- Career Interests: ${internData?.career_interests || 'Not specified'}

Provide a comprehensive analysis in the following JSON format:
{
  "overall_score": <number 0-100 based on response quality>,
  "feedback_summary": "<2-3 sentence overview of performance>",
  "detailed_feedback": "<Detailed paragraph with specific observations, what went well, and actionable improvement suggestions>",
  "skill_scores": {
    "communication": <0-100>,
    "confidence": <0-100>,
    "content_quality": <0-100>,
    "professionalism": <0-100>
  },
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "improvements": ["<improvement 1>", "<improvement 2>", "<improvement 3>"]
}

SCORING GUIDELINES:
- 90-100: Exceptional - articulate, confident, specific examples, clear structure
- 75-89: Strong - good answers with minor areas for improvement
- 60-74: Satisfactory - adequate responses but could be more specific or confident
- 40-59: Needs Work - vague responses, lack of examples, unclear communication
- 0-39: Poor - incomplete, off-topic, or very unclear responses

Be honest but constructive. If no transcript is available, score based on completion (completing all 12 questions = base 60, fewer = proportionally lower).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach providing detailed, constructive feedback. Be specific and actionable. Return only valid JSON.'
        },
        { role: 'user', content: analysisPrompt }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const feedbackText = completion.choices[0]?.message?.content || '{}';
    let feedback;

    try {
      feedback = JSON.parse(feedbackText);
    } catch {
      // Fallback if JSON parsing fails
      feedback = {
        overall_score: questionsAnswered >= 12 ? 70 : Math.round((questionsAnswered / 12) * 60),
        feedback_summary: 'Interview completed. Retake with voice responses for detailed AI feedback.',
        detailed_feedback: 'Complete more questions and speak clearly for a comprehensive performance analysis.',
        skill_scores: {
          communication: 65,
          confidence: 60,
          content_quality: 65,
          professionalism: 70
        },
        strengths: ['Completed the interview'],
        improvements: ['Provide more detailed responses', 'Use specific examples']
      };
    }

    // Update the session with feedback
    const { error: updateError } = await supabase
      .from('interview_sessions')
      .update({
        overall_score: feedback.overall_score || 0,
        feedback_summary: feedback.feedback_summary || '',
        detailed_feedback: feedback.detailed_feedback || '',
        skill_scores: feedback.skill_scores || {},
        strengths: feedback.strengths || [],
        improvements: feedback.improvements || []
      })
      .eq('id', session_id);

    if (updateError) {
      console.error('Failed to update session with feedback:', updateError);
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      feedback: {
        overall_score: feedback.overall_score,
        feedback_summary: feedback.feedback_summary,
        detailed_feedback: feedback.detailed_feedback,
        skill_scores: feedback.skill_scores,
        strengths: feedback.strengths,
        improvements: feedback.improvements
      }
    });

  } catch (error) {
    console.error('Generate feedback error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

