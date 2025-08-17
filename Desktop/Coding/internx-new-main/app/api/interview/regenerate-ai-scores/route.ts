import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
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

export async function GET(request: Request) {
  return await POST(request);
}

export async function POST(request: Request) {
  try {
    console.log('🔄 Starting AI score regeneration...');
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ User authenticated:', user.id);

    // Get user's interview session and responses
    console.log('🔍 Looking for completed interview sessions for user:', user.id);
    const { data: session, error: sessionError } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('intern_id', user.id)
      .eq('session_status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !session) {
      console.log('❌ No completed interview found. Error:', sessionError);
      return NextResponse.json({ error: 'No completed interview found' }, { status: 404 });
    }
    console.log('✅ Found interview session:', session.id);

    // Get all responses for this session
    console.log('🔍 Fetching interview responses for session:', session.id);
    const { data: responses, error: responsesError } = await supabase
      .from('interview_responses')
      .select('*')
      .eq('session_id', session.id)
      .order('asked_at', { ascending: true });

    if (responsesError || !responses || responses.length === 0) {
      console.log('❌ No interview responses found. Error:', responsesError);
      return NextResponse.json({ error: 'No interview responses found' }, { status: 404 });
    }
    console.log('✅ Found', responses.length, 'interview responses');

    // Get intern profile data for comprehensive analysis
    console.log('🔍 Fetching intern profile data for user:', user.id);
    const { data: internData, error: internError } = await supabase
      .from('interns')
      .select('*')
      .eq('id', user.id)
      .single();

    if (internError || !internData) {
      console.log('❌ Intern data not found. Error:', internError);
      return NextResponse.json({ error: 'Intern data not found' }, { status: 404 });
    }
    console.log('✅ Found intern profile for:', internData.full_name);

    // Check profile completion threshold
    const profileCompletionScore = calculateProfileCompletion(internData);
    const isProfileComplete = profileCompletionScore >= 70; // 70% threshold
    console.log('📊 Profile completion score:', profileCompletionScore + '%', isProfileComplete ? '(Complete)' : '(Incomplete)');

    // Create comprehensive analysis prompt
    console.log('🤖 Creating AI analysis prompt...');
    const analysisPrompt = `Analyze ONLY this specific interview transcript and user profile. DO NOT reference any external information, previous conversations, or other users' data.

INTERVIEW SESSION ID: ${session.id}
USER ID: ${user.id}
USER NAME: ${internData.full_name}

USER PROFILE (ONLY for this specific user):
- Name: ${internData.full_name}
- Bio: ${internData.bio || 'Not provided'}
- Skills: ${internData.skills || 'Not provided'}
- Experience: ${internData.experience || 'Not provided'}
- Extracurriculars: ${internData.extracurriculars || 'Not provided'}
- Achievements: ${internData.achievements || 'Not provided'}
- Career Interests: ${internData.career_interests || 'Not provided'}
- High School: ${internData.high_school || 'Not provided'}
- Grade Level: ${internData.grade_level || 'Not provided'}

INTERVIEW TRANSCRIPT (ONLY for this specific user):
${responses.map(r => `Q: ${r.question_text}\nA: ${r.response_text}`).join('\n\n')}

PROFILE COMPLETION: ${profileCompletionScore}% (${isProfileComplete ? 'Complete' : 'Incomplete'})

CRITICAL: Base your analysis EXCLUSIVELY on the interview responses and profile data above. Do NOT reference any other users, companies, or experiences not mentioned in this specific transcript and profile.

Please provide category-specific match scores (0-100) and personalized recommendations based ONLY on this user's specific background and interview responses:

1. Business & Finance Internships: Based on business acumen, leadership, financial knowledge, entrepreneurial thinking
2. Technology & Engineering: Based on technical skills, problem-solving, coding ability, analytical thinking
3. Education & Non-Profit: Based on communication, community involvement, teaching ability, leadership
4. Healthcare & Sciences: Based on analytical thinking, attention to detail, scientific interest, precision
5. Creative & Media: Based on creativity, communication, marketing skills, storytelling

For each category, provide:
- Score (0-100) based ONLY on this user's interview and profile
- Personalized recommendation (1-2 sentences) based ONLY on this user's actual background and interview responses

Respond in JSON format:
{
  "business_finance_score": number,
  "technology_engineering_score": number,
  "education_nonprofit_score": number,
  "healthcare_sciences_score": number,
  "creative_media_score": number,
  "business_finance_recommendation": "string",
  "technology_engineering_recommendation": "string",
  "education_nonprofit_recommendation": "string",
  "healthcare_sciences_recommendation": "string",
  "creative_media_recommendation": "string"
}`;

    // Generate AI scores
    console.log('🤖 Calling OpenAI API...');
    let aiScores;
    
    try {
      const completion = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an AI interviewer analyzing a specific user's interview transcript and profile. You must base your analysis EXCLUSIVELY on the provided interview responses and user profile. Do NOT reference any external information, other users, or experiences not mentioned in the specific transcript and profile provided." 
          },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      console.log('✅ OpenAI API call completed');
      aiScores = JSON.parse(completion.choices[0].message.content || '{}');
      console.log('📊 AI scores generated:', Object.keys(aiScores));
    } catch (openaiError) {
      console.error('❌ OpenAI API Error:', openaiError);
      
      // If OpenAI fails, use fallback scores based on existing data
      console.log('🔄 Using fallback scores based on existing interview data...');
      aiScores = {
        business_finance_score: internData.business_finance_score || 50,
        technology_engineering_score: internData.technology_engineering_score || 50,
        education_nonprofit_score: internData.education_nonprofit_score || 50,
        healthcare_sciences_score: internData.healthcare_sciences_score || 50,
        creative_media_score: internData.creative_media_score || 50,
        business_finance_recommendation: internData.business_finance_recommendation || 'Consider exploring business and finance opportunities based on your interview responses.',
        technology_engineering_recommendation: internData.technology_engineering_recommendation || 'Your technical interests show potential for technology and engineering roles.',
        education_nonprofit_recommendation: internData.education_nonprofit_recommendation || 'Consider educational and nonprofit opportunities that align with your interests.',
        healthcare_sciences_recommendation: internData.healthcare_sciences_recommendation || 'Healthcare and sciences may be areas to explore based on your background.',
        creative_media_recommendation: internData.creative_media_recommendation || 'Your creative interests suggest potential in media and creative roles.'
      };
      console.log('📊 Using fallback scores:', aiScores);
    }

    // Calculate combined scores based on profile completion
    console.log('🧮 Calculating combined scores...');
    let combinedScores = {};
    
    // More strict profile completion threshold (80% instead of 70%)
    const strictProfileComplete = profileCompletionScore >= 80;
    
    if (strictProfileComplete) {
      // For complete profiles, AI analyzes both interview and profile together
      // The AI already considers both in its analysis, so we use the score as-is
      combinedScores = {
        business_finance_combined_score: aiScores.business_finance_score,
        technology_engineering_combined_score: aiScores.technology_engineering_score,
        education_nonprofit_combined_score: aiScores.education_nonprofit_score,
        healthcare_sciences_combined_score: aiScores.healthcare_sciences_score,
        creative_media_combined_score: aiScores.creative_media_score
      };
      console.log('📊 Using combined AI analysis (profile very complete)');
    } else {
      // 100% AI interview analysis (profile incomplete or moderately complete)
      combinedScores = {
        business_finance_combined_score: aiScores.business_finance_score,
        technology_engineering_combined_score: aiScores.technology_engineering_score,
        education_nonprofit_combined_score: aiScores.education_nonprofit_score,
        healthcare_sciences_combined_score: aiScores.healthcare_sciences_score,
        creative_media_combined_score: aiScores.creative_media_score
      };
      console.log('📊 Using 100% interview analysis (profile incomplete or moderately complete)');
    }
    
    console.log('📊 Combined scores calculated:', combinedScores);

    // Update the user's profile with AI scores, recommendations, and combined scores
    console.log('💾 Updating user profile with new scores...');
    const { error: updateError } = await supabase
      .from('interns')
      .update({
        business_finance_score: aiScores.business_finance_score || 0,
        technology_engineering_score: aiScores.technology_engineering_score || 0,
        education_nonprofit_score: aiScores.education_nonprofit_score || 0,
        healthcare_sciences_score: aiScores.healthcare_sciences_score || 0,
        creative_media_score: aiScores.creative_media_score || 0,
        business_finance_recommendation: aiScores.business_finance_recommendation || '',
        technology_engineering_recommendation: aiScores.technology_engineering_recommendation || '',
        education_nonprofit_recommendation: aiScores.education_nonprofit_recommendation || '',
        healthcare_sciences_recommendation: aiScores.healthcare_sciences_recommendation || '',
        creative_media_recommendation: aiScores.creative_media_recommendation || '',
        profile_completion_percentage: profileCompletionScore,
        is_profile_complete: strictProfileComplete,
        ...combinedScores
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('❌ Error updating intern profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }
    console.log('✅ Profile updated successfully');

    console.log('🎉 AI score regeneration completed successfully!');
    return NextResponse.json({
      success: true,
      message: 'AI scores regenerated successfully',
      scores: {
        ...aiScores,
        ...combinedScores,
        profile_completion: profileCompletionScore,
        is_profile_complete: isProfileComplete
      }
    });

  } catch (error) {
    console.error('💥 Error regenerating AI scores:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to calculate profile completion percentage
function calculateProfileCompletion(internData: any): number {
  const requiredFields = [
    'full_name', 'bio', 'skills', 'experience', 'extracurriculars', 
    'achievements', 'career_interests', 'high_school', 'grade_level'
  ];
  
  const optionalFields = [
    'linkedin_url', 'github_url', 'portfolio_url', 'resume_url'
  ];
  
  let completedRequiredFields = 0;
  let completedOptionalFields = 0;
  
  // Check required fields (weighted more heavily)
  requiredFields.forEach(field => {
    const value = internData[field];
    if (value && value !== '' && value !== '[]' && value !== 'Not provided') {
      completedRequiredFields++;
    }
  });
  
  // Check optional fields
  optionalFields.forEach(field => {
    const value = internData[field];
    if (value && value !== '' && value !== '[]' && value !== 'Not provided') {
      completedOptionalFields++;
    }
  });
  
  // Calculate weighted completion: 70% required fields + 30% optional fields
  const requiredCompletion = (completedRequiredFields / requiredFields.length) * 70;
  const optionalCompletion = (completedOptionalFields / optionalFields.length) * 30;
  
  return Math.round(requiredCompletion + optionalCompletion);
} 