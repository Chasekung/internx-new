import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get intern profile data
    const { data: internData, error: internError } = await supabase
      .from('interns')
      .select('*')
      .eq('id', user.id)
      .single();

    if (internError || !internData) {
      return NextResponse.json({ error: 'Intern data not found' }, { status: 404 });
    }

    // Get interview responses for this session
    const { data: responses, error: responsesError } = await supabase
      .from('interview_responses')
      .select('*')
      .eq('session_id', sessionId)
      .order('asked_at', { ascending: true });

    if (responsesError || !responses || responses.length === 0) {
      return NextResponse.json({ error: 'No interview responses found' }, { status: 404 });
    }

    // Check profile completion threshold
    const profileCompletionScore = calculateProfileCompletion(internData);
    const isProfileComplete = profileCompletionScore >= 70; // 70% threshold
    const strictProfileComplete = profileCompletionScore >= 80; // 80% threshold for combined scoring

    try {
      // Create comprehensive analysis prompt
      const analysisPrompt = `Analyze ONLY this specific interview transcript and user profile. DO NOT reference any external information, previous conversations, or other users' data.

INTERVIEW SESSION ID: ${sessionId}
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

Please provide:
1. Skill Score (0-100): Technical abilities and knowledge based ONLY on this user's responses
2. Experience Score (0-100): Relevant experience and background based ONLY on this user's responses
3. Personality Score (0-100): Communication, teamwork, motivation based ONLY on this user's responses
4. Overall Match Score (0-100): Weighted average
5. Interview Summary: 2-3 sentence summary based ONLY on this user's interview
6. Interview Feedback: Specific strengths and areas for improvement based ONLY on this user's responses
7. Interview Tags: 3-5 relevant tags based ONLY on this user's responses

8. Category-Specific Match Scores (0-100) based ONLY on this user's interview and profile:
   - Business & Finance Internships: Based on business acumen, leadership, financial knowledge
   - Technology & Engineering: Based on technical skills, problem-solving, coding ability
   - Education & Non-Profit: Based on communication, community involvement, teaching ability
   - Healthcare & Sciences: Based on analytical thinking, attention to detail, scientific interest
   - Creative & Media: Based on creativity, communication, marketing skills

9. Category-Specific Recommendations (1-2 sentences each) based ONLY on this user's specific background and interview responses:
   - Business & Finance Recommendation: Specific internship types and companies to target based on this user's actual experience
   - Technology & Engineering Recommendation: Specific technical roles and skill development based on this user's actual skills
   - Education & Non-Profit Recommendation: Specific programs and organizations to consider based on this user's actual background
   - Healthcare & Sciences Recommendation: Specific healthcare roles and preparation needed based on this user's actual experience
   - Creative & Media Recommendation: Specific creative roles and portfolio development based on this user's actual interests

Respond in JSON format:
{
  "skill_score": number,
  "experience_score": number,
  "personality_score": number,
  "overall_match_score": number,
  "interview_summary": "string",
  "interview_feedback": "string",
  "interview_tags": ["tag1", "tag2", "tag3"],
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

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "You are an AI interviewer analyzing a specific user's interview transcript and profile. You must base your analysis EXCLUSIVELY on the provided interview responses and user profile. Do NOT reference any external information, other users, or experiences not mentioned in the specific transcript and profile provided." 
          },
          { role: "user", content: analysisPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const aiAnalysis = JSON.parse(completion.choices[0].message.content || '{}');

      // Calculate combined scores based on profile completion
      let combinedScores = {};
      
      if (strictProfileComplete) {
        // For complete profiles, AI analyzes both interview and profile together
        // The AI already considers both in its analysis, so we use the score as-is
        combinedScores = {
          business_finance_combined_score: aiAnalysis.business_finance_score,
          technology_engineering_combined_score: aiAnalysis.technology_engineering_score,
          education_nonprofit_combined_score: aiAnalysis.education_nonprofit_score,
          healthcare_sciences_combined_score: aiAnalysis.healthcare_sciences_score,
          creative_media_combined_score: aiAnalysis.creative_media_score
        };
      } else {
        // 100% AI interview analysis (profile incomplete or moderately complete)
        combinedScores = {
          business_finance_combined_score: aiAnalysis.business_finance_score,
          technology_engineering_combined_score: aiAnalysis.technology_engineering_score,
          education_nonprofit_combined_score: aiAnalysis.education_nonprofit_score,
          healthcare_sciences_combined_score: aiAnalysis.healthcare_sciences_score,
          creative_media_combined_score: aiAnalysis.creative_media_score
        };
      }

      // Update the user's profile with all scores and recommendations
      const { error: updateError } = await supabase
        .from('interns')
        .update({
          interview_completed: true,
          interview_completed_at: new Date().toISOString(),
          skill_score: aiAnalysis.skill_score || 0,
          experience_score: aiAnalysis.experience_score || 0,
          personality_score: aiAnalysis.personality_score || 0,
          overall_match_score: aiAnalysis.overall_match_score || 0,
          interview_summary: aiAnalysis.interview_summary || '',
          interview_feedback: aiAnalysis.interview_feedback || '',
          interview_tags: aiAnalysis.interview_tags || [],
          business_finance_score: aiAnalysis.business_finance_score || 0,
          technology_engineering_score: aiAnalysis.technology_engineering_score || 0,
          education_nonprofit_score: aiAnalysis.education_nonprofit_score || 0,
          healthcare_sciences_score: aiAnalysis.healthcare_sciences_score || 0,
          creative_media_score: aiAnalysis.creative_media_score || 0,
          business_finance_recommendation: aiAnalysis.business_finance_recommendation || '',
          technology_engineering_recommendation: aiAnalysis.technology_engineering_recommendation || '',
          education_nonprofit_recommendation: aiAnalysis.education_nonprofit_recommendation || '',
          healthcare_sciences_recommendation: aiAnalysis.healthcare_sciences_recommendation || '',
          creative_media_recommendation: aiAnalysis.creative_media_recommendation || '',
          profile_completion_percentage: profileCompletionScore,
          is_profile_complete: strictProfileComplete,
          ...combinedScores
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating intern profile:', updateError);
        return NextResponse.json(
          { error: 'Failed to update profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Interview completed successfully',
        scores: {
          ...aiAnalysis,
          ...combinedScores,
          profile_completion: profileCompletionScore,
          is_profile_complete: isProfileComplete
        }
      });

    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      return NextResponse.json(
        { error: 'Failed to analyze interview' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error completing interview session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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