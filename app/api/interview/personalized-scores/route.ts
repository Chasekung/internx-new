import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Helper function to create Supabase client when needed
function getSupabaseClient() {
  return createRouteHandlerClient({ cookies });
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has completed interview
    const { data: internData, error: internError } = await supabase
      .from('interns')
      .select('interview_completed, skill_score, experience_score, personality_score, overall_match_score, interview_tags, career_interests')
      .eq('id', user.id)
      .single();

    if (internError) {
      console.error('Error checking intern status:', internError);
      return NextResponse.json(
        { error: 'Failed to check intern status' },
        { status: 500 }
      );
    }

    if (!internData.interview_completed) {
      return NextResponse.json(
        { error: 'Interview not completed' },
        { status: 400 }
      );
    }

    // Get all available internships
    const { data: internships, error: internshipsError } = await supabase
      .from('internships')
      .select('id, title, description, category, position')
      .eq('is_active', true);

    if (internshipsError) {
      console.error('Error fetching internships:', internshipsError);
      return NextResponse.json(
        { error: 'Failed to fetch internships' },
        { status: 500 }
      );
    }

    // Calculate personalized scores for each internship
    const personalizedScores = [];

    for (const internship of internships || []) {
      // Base score from interview
      let matchScore = internData.overall_match_score || 70;

      // Adjust based on category alignment
      const categoryBonus = calculateCategoryBonus(
        internship.category,
        internship.description,
        internData.career_interests,
        internData.interview_tags
      );

      matchScore = Math.min(100, Math.max(0, matchScore + categoryBonus));

      // Determine match level
      let matchLevel = 'low';
      if (matchScore >= 75) matchLevel = 'high';
      else if (matchScore >= 50) matchLevel = 'moderate';

      // Create factors analysis
      const factorsAnalysis = {
        base_interview_score: internData.overall_match_score,
        category_alignment: categoryBonus,
        skill_match: internData.skill_score,
        experience_relevance: internData.experience_score,
        personality_fit: internData.personality_score,
        career_interest_match: internData.career_interests?.includes(internship.category.toLowerCase()) ? 10 : 0
      };

      personalizedScores.push({
        internship_id: internship.id,
        match_score: matchScore,
        match_level: matchLevel,
        factors_analysis: factorsAnalysis
      });
    }

    // Bulk upsert the scores
    const { error: upsertError } = await supabase
      .from('personalized_internship_scores')
      .upsert(
        personalizedScores.map(score => ({
          intern_id: user.id,
          ...score,
          calculated_at: new Date().toISOString()
        })),
        {
          onConflict: 'intern_id,internship_id'
        }
      );

    if (upsertError) {
      console.error('Error upserting scores:', upsertError);
      return NextResponse.json(
        { error: 'Failed to calculate scores' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Personalized scores calculated successfully',
      scores_calculated: personalizedScores.length
    });

  } catch (error) {
    console.error('Personalized scores error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateCategoryBonus(
  internshipCategory: string,
  internshipDescription: string,
  careerInterests: string[] | null,
  interviewTags: string[] | null
): number {
  let bonus = 0;

  // Check career interests alignment
  if (careerInterests) {
    const hasMatchingInterest = careerInterests.some(interest => 
      internshipCategory.toLowerCase().includes(interest.toLowerCase()) ||
      interest.toLowerCase().includes(internshipCategory.toLowerCase())
    );
    if (hasMatchingInterest) bonus += 15;
  }

  // Check interview tags alignment
  if (interviewTags) {
    const relevantTags = interviewTags.filter(tag => 
      internshipDescription.toLowerCase().includes(tag.toLowerCase()) ||
      internshipCategory.toLowerCase().includes(tag.toLowerCase())
    );
    bonus += Math.min(10, relevantTags.length * 2);
  }

  // Category-specific bonuses based on common keywords
  const categoryKeywords = {
    'technology': ['technical', 'programming', 'coding', 'computer'],
    'marketing': ['creative', 'communication', 'social', 'design'],
    'business': ['leadership', 'analytical', 'strategic', 'management'],
    'sales': ['communication', 'persuasive', 'relationship', 'goal-oriented'],
    'design': ['creative', 'visual', 'artistic', 'innovation'],
    'finance': ['analytical', 'detail-oriented', 'mathematical', 'precise']
  };

  const lowerCategory = internshipCategory.toLowerCase();
  const matchingKeywords = Object.entries(categoryKeywords).find(([key]) => 
    lowerCategory.includes(key)
  );

  if (matchingKeywords && interviewTags) {
    const keywordMatches = matchingKeywords[1].filter(keyword => 
      interviewTags.some(tag => tag.toLowerCase().includes(keyword))
    );
    bonus += keywordMatches.length * 3;
  }

  return Math.min(25, bonus); // Cap the bonus at 25 points
} 