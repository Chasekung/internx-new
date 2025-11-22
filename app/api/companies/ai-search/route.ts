import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const openaiApiKey = process.env.OPENAI_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
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

    const { query, conversationHistory, currentCandidates, isFollowUp } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Check if this is a "show all" or "reset" request
    const resetKeywords = ['show all', 'see all', 'all interns', 'all students', 'all candidates', 'reset', 'start over', 'clear filter'];
    const isResetRequest = resetKeywords.some(keyword => 
      query.toLowerCase().includes(keyword)
    );

    if (isResetRequest) {
      return NextResponse.json({
        response: "I've reset the filter. You can now see all available candidates.",
        candidates: [],
        resetFilter: true
      });
    }

    // Determine which student pool to work with
    let students;
    
    if (isFollowUp && currentCandidates && currentCandidates.length > 0) {
      // Working with previously filtered results (cumulative filtering)
      students = currentCandidates;
    } else {
      // Fetch all students from database
      const { data: fetchedStudents, error: fetchError } = await supabase
        .from('interns')
        .select(`
          id,
          full_name,
          username,
          high_school,
          grade_level,
          profile_photo_url,
          bio,
          location,
          state,
          skills,
          career_interests,
          headline
        `)
        .limit(1000);

      if (fetchError) {
        console.error('Error fetching students:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch student profiles' },
          { status: 500 }
        );
      }

      students = fetchedStudents || [];
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        response: isFollowUp 
          ? "No candidates match your criteria from the previous filter."
          : "I couldn't find any student profiles in the database at the moment.",
        candidates: []
      });
    }

    // Prepare student data for AI analysis
    const studentSummaries = students.map((student: any, index: number) => ({
      index,
      name: student.full_name || student.fullName || 'Unknown',
      bio: student.bio || '',
      skills: student.skills || '',
      interests: student.career_interests || student.careerInterests || '',
      headline: student.headline || '',
      school: student.high_school || student.highSchool || '',
      grade: student.grade_level || student.gradeLevel || '',
      location: student.state || student.location || ''
    }));

    // Build conversation context
    const conversationContext = conversationHistory
      ?.slice(-4) // Keep last 4 messages for better context
      .map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })) || [];

    // Create enhanced AI prompt
    const systemPrompt = `You are an intelligent recruitment assistant helping companies find the perfect high school student candidates for internships and volunteering opportunities.

${isFollowUp ? `IMPORTANT: This is a FOLLOW-UP query. You are filtering from ${students.length} candidates that were already filtered. Apply additional criteria to further narrow down this set.` : `You have access to ${students.length} student profiles.`}

Your job is to:
1. Analyze the user's query to understand what type of candidate they're looking for
2. Intelligently match students based on their skills, interests, bio, experience, location, and grade
3. Return the indices of the best matching students (up to 50 matches)
4. For EACH matched student, provide 2-3 specific reasons WHY they match the criteria
5. Provide a brief, friendly response explaining the results

Student Data:
${JSON.stringify(studentSummaries, null, 2)}

Important Matching Rules:
- Match based on skills, interests, keywords, role fit, location, grade level, and overall profile strength
- Consider partial matches and related skills/interests
- Be intelligent about synonyms (e.g., "coding" matches "programming", "SF" matches "San Francisco")
- For location queries, match city, state, or region (e.g., "Bay Area" includes SF, Oakland, San Jose, etc.)
- For grade queries, understand "11th grade or higher" means grades 11 and 12
- Return ONLY valid student indices that exist in the data
- If no good matches, suggest broadening the search

For Match Reasons:
- Be specific and reference actual data from the profile
- Use these icon codes: "•" (general match), "→" (skills), "→" (interests), "→" (location), "→" (grade/school), "→" (standout quality)
- NO EMOJIS - use only simple text symbols like • and →
- Keep reasons concise (max 60 characters each)
- Prioritize most relevant reasons

Respond in JSON format:
{
  "response": "Your friendly explanation here (mention how many matches and key criteria)",
  "matchedIndices": [0, 5, 12, ...],
  "matchReasons": {
    "0": [
      {"icon": "→", "reason": "Skilled in Python and React"},
      {"icon": "→", "reason": "Passionate about web development"},
      {"icon": "→", "reason": "Located in San Francisco"}
    ],
    "5": [
      {"icon": "→", "reason": "Marketing and social media experience"},
      {"icon": "→", "reason": "Led school marketing club"}
    ]
  }
}`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationContext,
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const aiResponse = completion.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    const parsed = JSON.parse(aiResponse);
    const matchedIndices = parsed.matchedIndices || [];
    const matchReasons = parsed.matchReasons || {};
    const responseText = parsed.response || 'I found some candidates for you!';

    // Get the matched students with their match reasons
    const matchedStudents = matchedIndices
      .filter((index: number) => index >= 0 && index < students.length)
      .map((index: number) => {
        const student = students[index];
        const reasons = matchReasons[index.toString()] || [];
        
        return {
          id: student.id,
          fullName: student.full_name || student.fullName,
          username: student.username,
          highSchool: student.high_school || student.highSchool,
          gradeLevel: student.grade_level || student.gradeLevel,
          profilePhotoUrl: student.profile_photo_url || student.profilePhotoUrl,
          bio: student.bio,
          location: student.location,
          state: student.state,
          skills: student.skills,
          careerInterests: student.career_interests || student.careerInterests,
          headline: student.headline,
          matchReasons: reasons
        };
      });

    return NextResponse.json({
      response: responseText,
      candidates: matchedStudents,
      totalCandidates: matchedStudents.length,
      isFollowUp: isFollowUp,
      resetFilter: false
    });

  } catch (error) {
    console.error('AI search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process AI search',
        response: 'Sorry, I encountered an error. Please try rephrasing your query.',
        candidates: []
      },
      { status: 500 }
    );
  }
}
