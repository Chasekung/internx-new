import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Note: OpenAI client will be initialized when package is installed
// For now, we'll simulate AI responses for development

export async function POST(request: Request) {
  try {
    const { session_id, action, response_text, current_question } = await request.json();
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify session belongs to user
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('id', session_id)
      .eq('intern_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 400 }
      );
    }

    if (action === 'analyze_and_respond') {
      // Get previous responses for context (ONLY from current session)
      const { data: previousResponses } = await supabase
        .from('interview_responses')
        .select('question_text, response_text, question_id, interview_questions(category)')
        .eq('session_id', session_id)
        .order('asked_at');

      // Check if we've reached the 20 question limit
      const totalQuestionsAsked = previousResponses ? previousResponses.length : 0;
      if (totalQuestionsAsked >= 20) {
        return NextResponse.json({
          interview_complete: true,
          message: 'Thank you for completing the interview! I have enough information to provide a comprehensive evaluation. Your responses have been recorded and will be analyzed to generate your personalized match scores.',
          total_questions: totalQuestionsAsked
        });
      }

      // Core questions by category with follow-up tracking
      const coreQuestions: Record<string, string[]> = {
        introduction: [
          "Tell me about yourself and your background.",
          "What are your main interests and what drives you?",
          "What made you interested in applying for internships?"
        ],
        experience: [
          "What extracurricular activities, volunteer work, or part-time jobs have you been involved in?",
          "Tell me about a project or activity you're particularly proud of.",
          "Describe a time when you had to learn something completely new."
        ],
        motivation: [
          "Why are you interested in this internship program, and what do you hope to gain from it?",
          "What specific skills do you want to develop during your internship?",
          "How do you think this internship aligns with your future career goals?"
        ],
        challenges: [
          "Tell me about a time when you faced a significant challenge. How did you handle it?",
          "Describe a situation where you had to work as part of a team.",
          "What's something you've struggled with, and how are you working to improve?"
        ],
        goals: [
          "Where do you see yourself in 5 years?",
          "What are your short-term and long-term career goals?",
          "What type of work environment do you think you'd thrive in?"
        ]
      };

      // Count follow-up questions per category
      const categoryFollowupCounts: Record<string, number> = {};
      let currentQuestionCategory = '';
      
      if (previousResponses) {
        // Find the current question's category
        const currentQuestionResponse = previousResponses
          .filter(r => r.question_text === current_question)
          .pop();
        
        if (currentQuestionResponse?.interview_questions) {
          currentQuestionCategory = (currentQuestionResponse.interview_questions as any).category || '';
        }

        // Count follow-ups per category
        for (const category of Object.keys(coreQuestions)) {
          const categoryResponses = previousResponses.filter(r => 
            r.interview_questions && (r.interview_questions as any).category === category
          );
          
          // Count how many are follow-ups (not the first core question in that category)
          const coreCount = categoryResponses.filter(r => 
            coreQuestions[category].some(cq => r.question_text.includes(cq.substring(0, 20)))
          ).length;
          
          categoryFollowupCounts[category] = Math.max(0, categoryResponses.length - Math.min(1, coreCount));
        }
      }

      // Enhanced context with better conversation history
      const conversationHistory = previousResponses?.slice(-12).map(r => 
        `Q: ${r.question_text}\nA: ${r.response_text}`
      ).join('\n\n') || 'None';

      // Determine next question category based on interview progress
      const totalQuestions = (previousResponses?.length || 0) + 1;
      let nextCategory = currentQuestionCategory;
      
      // Prioritize introduction in first 3 questions
      if (totalQuestions <= 3) {
        const uncoveredCategories = Object.keys(coreQuestions).filter(cat => 
          !previousResponses?.some(r => 
            r.interview_questions && (r.interview_questions as any).category === cat
          )
        );
        
        if (uncoveredCategories.includes('introduction')) {
          nextCategory = 'introduction';
        } else if (uncoveredCategories.includes('goals')) {
          nextCategory = 'goals';
        } else {
          nextCategory = uncoveredCategories[0] || Object.keys(coreQuestions)[0];
        }
      } else {
        // After first 3 questions, check if current category has reached limit
        if ((categoryFollowupCounts[currentQuestionCategory] || 0) >= 3) {
          // Find next uncovered category
          const uncoveredCategories = Object.keys(coreQuestions).filter(cat => 
            !previousResponses?.some(r => 
              r.interview_questions && (r.interview_questions as any).category === cat
            )
          );
          nextCategory = uncoveredCategories[0] || Object.keys(coreQuestions)[0];
        }
      }

      // Analyze the response and determine next question using AI
      const analysisPrompt = `
        You are an expert interview AI conducting a comprehensive internship interview. 

        CURRENT SESSION CONTEXT:
        - This is a fresh interview session
        - Only use information from the conversation below
        - Do NOT reference any external profile data or previous sessions

        PREVIOUS CONVERSATION (Last 12 exchanges):
        ${conversationHistory}

        CURRENT INTERACTION:
        Question: "${current_question}"
        Student Response: "${response_text}"

        FOLLOW-UP TRACKING:
        Current question category: ${currentQuestionCategory}
        Follow-up counts per category: ${JSON.stringify(categoryFollowupCounts)}
        Next category to focus on: ${nextCategory}

        INTERVIEW STRATEGY:
        1. You have ${Object.keys(coreQuestions).length} core question categories: ${Object.keys(coreQuestions).join(', ')}
        2. MAX 3 follow-up questions per core area (currently: ${categoryFollowupCounts[currentQuestionCategory] || 0}/3 for ${currentQuestionCategory})
        3. Follow-ups should dig deeper into specific examples, skills, or experiences mentioned
        4. Maximum 15 total questions for the entire interview
        5. Progress naturally through different topics
        6. If max follow-ups reached for current category, move to next core area
        7. Prioritize introduction and goals categories early in the interview

        TASK:
        Analyze the student's response and decide what to ask next. Consider:
        - How detailed and relevant was their answer?
        - What specific aspects need follow-up questions?
        - Which core categories haven't been covered yet?
        - Have you reached the 3 follow-up limit for the current category?

        IMPORTANT: Always acknowledge their response briefly before asking the next question.

        Respond with JSON:
        {
          "response_analysis": {
            "quality": "excellent|good|fair|poor",
            "key_points": ["point1", "point2"],
            "needs_followup": true/false,
            "followup_reason": "why a followup is/isn't needed"
          },
          "acknowledgment": "Brief acknowledgment of their response (1-2 sentences)",
          "next_question": "the actual next question to ask",
          "question_type": "core|followup",
          "category": "introduction|experience|motivation|challenges|goals",
          "interview_complete": false,
          "progress_summary": "brief summary of interview progress"
        }

        If this is question 15+ or all core areas have been thoroughly covered, set interview_complete to true.
        If follow-up limit (3) reached for current category, move to next core area.
      `;

      let analysisResponse;
      try {
        analysisResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini", // Use faster model
          messages: [
            {
              role: "system",
              content: "You are an expert interview AI. Always respond with valid JSON only, no markdown formatting or code blocks. Keep responses concise and focused."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          max_tokens: 400, // Reduced from 800 for faster response
          temperature: 0.4, // Slightly increased for faster generation
          response_format: { type: "json_object" }
        });
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        throw new Error(`OpenAI API error: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`);
      }

      let responseData;
      try {
        let rawContent = analysisResponse.choices[0].message.content || '{}';
        
        // Strip markdown code blocks if present
        if (rawContent.includes('```json')) {
          rawContent = rawContent.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (rawContent.includes('```')) {
          rawContent = rawContent.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        rawContent = rawContent.trim();
        responseData = JSON.parse(rawContent);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        
        // Fallback: Continue with next core question or complete if too many questions
        const totalQuestions = (previousResponses?.length || 0) + 1;
        
        if (totalQuestions >= 15) {
          responseData = {
            response_analysis: { quality: "fair", key_points: ["Response received"], needs_followup: false, followup_reason: "Interview completing" },
            interview_complete: true,
            progress_summary: "Interview complete"
          };
        } else {
          // Find next category that hasn't been exhausted
          const categories = Object.keys(coreQuestions);
          let nextCategory = categories.find(cat => (categoryFollowupCounts[cat] || 0) < 3) || categories[0];
          const randomQuestion = coreQuestions[nextCategory][Math.floor(Math.random() * coreQuestions[nextCategory].length)];
          
          responseData = {
            response_analysis: { quality: "fair", key_points: ["Response received"], needs_followup: false, followup_reason: "Moving to next core area" },
            next_question: randomQuestion,
            question_type: "core",
            category: nextCategory,
            interview_complete: false,
            progress_summary: "Continuing interview with core questions"
          };
        }
      }

      // Store the response with analysis using proper UUID
      const { error: responseError } = await supabase
        .from('interview_responses')
        .insert({
          session_id: session_id,
          question_text: current_question,
          response_text: response_text,
          question_id: null, // Set to NULL for AI-generated questions
          ai_analysis: responseData.response_analysis,
          response_score: responseData.response_analysis.quality === 'excellent' ? 90 : 
                         responseData.response_analysis.quality === 'good' ? 75 :
                         responseData.response_analysis.quality === 'fair' ? 60 : 40,
          asked_at: new Date().toISOString(),
          answered_at: new Date().toISOString()
        });

      if (responseError) {
        console.error('Error storing response:', responseError);
      }

      // Update session transcript
      const currentTranscript = session.full_transcript?.conversation || [];
      const updatedTranscript = [
        ...currentTranscript,
        {
          timestamp: new Date().toISOString(),
          speaker: 'STUDENT',
          content: response_text
        },
        {
          timestamp: new Date().toISOString(),
          speaker: 'AI',
          content: responseData.next_question
        }
      ];

      await supabase
        .from('interview_sessions')
        .update({ 
          full_transcript: { conversation: updatedTranscript },
          updated_at: new Date().toISOString()
        })
        .eq('id', session_id);

      return NextResponse.json({
        next_question: responseData.next_question,
        question_type: responseData.question_type,
        category: responseData.category,
        interview_complete: responseData.interview_complete,
        analysis: responseData.response_analysis,
        progress_summary: responseData.progress_summary
      });
    }

    if (action === 'get_next_question') {
      // Get previous responses to understand interview progress (ONLY from current session)
      const { data: previousResponses, error: responsesError } = await supabase
        .from('interview_responses')
        .select('*')
        .eq('session_id', session_id)
        .order('asked_at', { ascending: true });

      if (responsesError) {
        console.error('Error fetching previous responses:', responsesError);
        return NextResponse.json({ error: 'Failed to fetch interview progress' }, { status: 500 });
      }

      // Check if this is a restart (no previous responses or very few)
      const isRestart = !previousResponses || previousResponses.length === 0;
      
      // Check if we've reached the 20 question limit
      const totalQuestionsAsked = previousResponses ? previousResponses.length : 0;
      if (totalQuestionsAsked >= 20) {
        return NextResponse.json({
          action: 'interview_complete',
          message: 'Thank you for completing the interview! I have enough information to provide a comprehensive evaluation. Your responses have been recorded and will be analyzed to generate your personalized match scores.',
          total_questions: totalQuestionsAsked
        });
      }

      // Get available questions from the database
      const { data: availableQuestions, error: questionsError } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (questionsError || !availableQuestions || availableQuestions.length === 0) {
        console.error('Error fetching questions:', questionsError);
        return NextResponse.json({ error: 'No questions available' }, { status: 500 });
      }

      // Calculate follow-up counts per category
      const categoryFollowupCounts: Record<string, number> = {};
      if (previousResponses) {
        previousResponses.forEach(response => {
          const category = response.question_category || 'unknown';
          categoryFollowupCounts[category] = (categoryFollowupCounts[category] || 0) + 1;
        });
      }

      // For restart or first question, start with a core question
      let selectedQuestion;
      if (isRestart) {
        // Start with introduction or goals (prioritize underrepresented categories)
        selectedQuestion = availableQuestions.find(q => 
          q.category === 'introduction' || q.category === 'goals'
        ) || availableQuestions[0];
      } else {
        // Continue with next question based on progress
        // Since we don't have question_category in responses, we'll use a simpler approach
        const askedQuestionIds = previousResponses.map(r => r.question_id);
        const unaskedQuestions = availableQuestions.filter(q => 
          !askedQuestionIds.includes(q.id)
        );
        
        // If no unasked questions, check if we can ask follow-ups
        if (unaskedQuestions.length === 0) {
          // Find categories that haven't reached the 3 follow-up limit
          const categoriesUnderLimit = availableQuestions.filter(q => {
            const currentCount = categoryFollowupCounts[q.category] || 0;
            return currentCount < 3; // Max 3 follow-ups per category
          });
          
          if (categoriesUnderLimit.length > 0) {
            // Prioritize underrepresented categories
            const priorityCategories = ['introduction', 'goals', 'experience', 'motivation', 'challenges'];
            selectedQuestion = categoriesUnderLimit.find(q => 
              priorityCategories.includes(q.category)
            ) || categoriesUnderLimit[0];
          } else {
            // All categories have reached their follow-up limit
            return NextResponse.json({
              action: 'interview_complete',
              message: 'Thank you for completing the interview! I have gathered comprehensive information across all categories. Your responses will be analyzed to generate your personalized match scores.',
              total_questions: totalQuestionsAsked,
              categories_covered: Object.keys(categoryFollowupCounts)
            });
          }
        } else {
          // Prioritize underrepresented categories when selecting unasked questions
          const priorityCategories = ['introduction', 'goals', 'experience', 'motivation', 'challenges'];
          selectedQuestion = unaskedQuestions.find(q => 
            priorityCategories.includes(q.category)
          ) || unaskedQuestions[0];
        }
      }

      // Personalize the question
      const personalizedQuestion = isRestart 
        ? `Hi there! Let's start with this question: ${selectedQuestion.question_text}`
        : `Great! Now I'd like to ask you about something different. ${selectedQuestion.question_text}`;

      // Store the question in interview_responses
      const { data: newResponse, error: responseError } = await supabase
        .from('interview_responses')
        .insert({
          session_id: session_id,
          question_id: selectedQuestion.id, // Use the actual question ID from database
          question_text: personalizedQuestion,
          asked_at: new Date().toISOString()
        })
        .select()
        .single();

      if (responseError) {
        console.error('Error storing question:', responseError);
        return NextResponse.json({ error: 'Failed to store question' }, { status: 500 });
      }

      // Get the current session to build transcript
      const { data: session, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('full_transcript')
        .eq('id', session_id)
        .single();

      if (sessionError) {
        console.error('Error fetching session:', sessionError);
        return NextResponse.json({ error: 'Failed to fetch session' }, { status: 500 });
      }

      // Add AI question to transcript
      const currentTranscript = session.full_transcript || { 
        conversation: [], 
        metadata: { 
          total_turns: 0, 
          total_duration: 0,
          categories_covered: [],
          follow_up_counts: {}
        } 
      };
      
      // Ensure metadata exists
      if (!currentTranscript.metadata) {
        currentTranscript.metadata = {
          total_turns: 0,
          total_duration: 0,
          categories_covered: [],
          follow_up_counts: {}
        };
      }
      
      const newTranscriptEntry = {
        timestamp: new Date().toISOString(),
        speaker: "AI",
        content: selectedQuestion.question_text,
        metadata: {
          question_category: selectedQuestion.category,
          question_id: selectedQuestion.id,
          expected_duration: selectedQuestion.expected_duration_seconds
        }
      };

      currentTranscript.conversation.push(newTranscriptEntry);
      currentTranscript.metadata.total_turns = currentTranscript.conversation.length;

      // Update session with new transcript entry
      const { error: transcriptError } = await supabase
        .from('interview_sessions')
        .update({ full_transcript: currentTranscript })
        .eq('id', session_id);

      if (transcriptError) {
        console.error('Error updating transcript:', transcriptError);
        // Continue anyway - transcript is not critical for functionality
      }

      return NextResponse.json({
        question: personalizedQuestion,
        question_id: selectedQuestion.id,
        response_id: newResponse?.id,
        category: selectedQuestion.category,
        expected_duration: selectedQuestion.expected_duration_seconds,
        follow_up_questions: selectedQuestion.follow_up_questions,
        transcript_entry: newTranscriptEntry
      });

    } else if (action === 'analyze_response') {
      // Analyze the student's response using AI
      const { data: questionData, error: questionError } = await supabase
        .from('interview_responses')
        .select(`
          question_text,
          question_id
        `)
        .eq('session_id', session_id)
        .is('response_text', null)
        .order('asked_at', { ascending: false })
        .limit(1);

      if (questionError || !questionData || questionData.length === 0) {
        return NextResponse.json({ error: 'No pending question found' }, { status: 404 });
      }

      const question = questionData[0];
      
      // Get the question category from the questions table
      const { data: questionInfo, error: questionInfoError } = await supabase
        .from('interview_questions')
        .select('category')
        .eq('id', question.question_id)
        .single();
      
      const category = questionInfo?.category || 'general';

      // Add student response to transcript
      const { data: sessionData, error: sessionError } = await supabase
        .from('interview_sessions')
        .select('full_transcript')
        .eq('id', session_id)
        .single();

      if (!sessionError && sessionData?.full_transcript) {
        const currentTranscript = sessionData.full_transcript;
        
        // Ensure metadata exists
        if (!currentTranscript.metadata) {
          currentTranscript.metadata = {
            total_turns: 0,
            total_duration: 0,
            categories_covered: [],
            follow_up_counts: {}
          };
        }
        
        const responseEntry = {
          timestamp: new Date().toISOString(),
          speaker: "STUDENT",
          content: response_text,
          metadata: {
            question_category: category || 'general',
            response_duration: 30, // Mock duration - would be real in voice interface
            key_points: [], // Will be filled by AI analysis
            sentiment: "neutral", // Will be analyzed by AI
            confidence: 0.85 // Mock confidence
          }
        };

        currentTranscript.conversation.push(responseEntry);
        currentTranscript.metadata.total_turns = currentTranscript.conversation.length;
        currentTranscript.metadata.total_duration += responseEntry.metadata.response_duration;

        // Update transcript
        await supabase
          .from('interview_sessions')
          .update({ full_transcript: currentTranscript })
          .eq('id', session_id);
      }

      // Analyze the response using GPT-4o-mini with transcript context
      const transcriptContext = sessionData?.full_transcript ? 
        `Previous conversation context:\n${sessionData.full_transcript.conversation.slice(-6).map((turn: any) => 
          `${turn.speaker}: ${turn.content}`
        ).join('\n')}\n\n` : '';

      const analysisPrompt = `
        ${transcriptContext}
        Analyze this interview response for a ${category || 'general'} question.
        
        Question: "${question.question_text}"
        Response: "${response_text}"
        
        IMPORTANT: Respond with ONLY a valid JSON object. Do not include markdown formatting, code blocks, or any other text.
        
        Provide analysis in this exact JSON format:
        {
          "response_quality": "excellent|good|fair|poor",
          "key_points": ["point1", "point2", "point3"],
          "skills_demonstrated": ["skill1", "skill2"],
          "personality_traits": ["trait1", "trait2"],
          "improvement_areas": ["area1", "area2"],
          "score": 0-100,
          "detailed_feedback": "2-3 sentences of constructive feedback",
          "sentiment": "positive|neutral|negative",
          "confidence": 0.0-1.0
        }
      `;

      let analysisResponse;
      try {
        analysisResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are an expert interview analyst. Provide detailed, constructive analysis of interview responses. Always respond with valid JSON only, no markdown formatting or code blocks."
            },
            {
              role: "user",
              content: analysisPrompt
            }
          ],
          max_tokens: 500,
          temperature: 0.3,
          response_format: { type: "json_object" }
        });
      } catch (openaiError) {
        console.error('OpenAI API error:', openaiError);
        throw new Error(`OpenAI API error: ${openaiError instanceof Error ? openaiError.message : 'Unknown error'}`);
      }

      let responseAnalysis;
      try {
        let rawContent = analysisResponse.choices[0].message.content || '{}';
        
        // Strip markdown code blocks if present
        if (rawContent.includes('```json')) {
          rawContent = rawContent.replace(/```json\s*/, '').replace(/\s*```$/, '');
        } else if (rawContent.includes('```')) {
          rawContent = rawContent.replace(/```\s*/, '').replace(/\s*```$/, '');
        }
        
        // Clean up any extra whitespace
        rawContent = rawContent.trim();
        
        responseAnalysis = JSON.parse(rawContent);
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        console.error('Raw response:', analysisResponse.choices[0].message.content);
        
        // Fallback analysis if JSON parsing fails
        responseAnalysis = {
          response_quality: "fair",
          key_points: ["Response received"],
          skills_demonstrated: [],
          personality_traits: [],
          improvement_areas: ["Please provide more detailed responses"],
          score: 50,
          detailed_feedback: "Analysis temporarily unavailable. Please continue with the interview.",
          sentiment: "neutral",
          confidence: 0.5
        };
        console.log('Using fallback analysis due to parsing error');
      }

      // Update the interview response with the analysis
      const { error: updateError } = await supabase
        .from('interview_responses')
        .update({
          response_text: response_text,
          response_duration_seconds: 30, // Mock duration
          ai_analysis: responseAnalysis,
          response_score: responseAnalysis.score,
          answered_at: new Date().toISOString()
        })
        .eq('session_id', session_id)
        .is('response_text', null);

      if (updateError) {
        console.error('Error updating response:', updateError);
        return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
      }

      return NextResponse.json({
        analysis: responseAnalysis,
        score: responseAnalysis.score,
        feedback: responseAnalysis.detailed_feedback,
        transcript_updated: true
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in AI conversation:', error);
    
    // Provide more specific error information
    let errorMessage = 'Internal server error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 