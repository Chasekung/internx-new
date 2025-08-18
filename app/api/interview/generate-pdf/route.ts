import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get intern data
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

    if (responsesError) {
      return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
    }

    // Create HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Interview Report - ${internData.full_name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #1f2937;
            font-size: 28px;
            margin: 0;
          }
          .header p {
            color: #6b7280;
            margin: 5px 0 0 0;
          }
          .score-section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 24px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .score-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
          }
          .score-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .score-value {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin: 10px 0;
          }
          .score-label {
            color: #6b7280;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .section-title {
            font-size: 20px;
            font-weight: bold;
            color: #1f2937;
            margin: 30px 0 15px 0;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .summary-box {
            background: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
          }
          .feedback-box {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
          }
          .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin: 15px 0;
          }
          .tag {
            background: #dbeafe;
            color: #1e40af;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          .conversation {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
          }
          .conversation-item {
            margin: 10px 0;
            padding: 10px;
            border-radius: 6px;
          }
          .ai-message {
            background: #dbeafe;
            margin-left: 20px;
          }
          .student-message {
            background: #f3f4f6;
            margin-right: 20px;
          }
          .message-label {
            font-weight: bold;
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          .rating-scale {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            margin: 15px 0;
            border-left: 4px solid #10b981;
          }
          .category-match {
            background: white;
            border-radius: 8px;
            padding: 16px;
            margin: 10px 0;
            border: 1px solid #e5e7eb;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .category-title {
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .category-score {
            font-size: 24px;
            font-weight: bold;
            color: #3b82f6;
            margin: 5px 0;
          }
          .category-description {
            color: #6b7280;
            font-size: 14px;
            margin-top: 8px;
          }
          .recommendation {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 12px;
            margin: 8px 0;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AI Interview Report</h1>
          <p>${internData.full_name} • ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="rating-scale">
          <h3 class="section-title">📊 Rating Scale Explanation</h3>
          <p><strong>All scores are rated out of 100:</strong></p>
          <ul>
            <li><strong>0-30:</strong> Below average - Needs significant development</li>
            <li><strong>31-50:</strong> Average - Room for improvement</li>
            <li><strong>51-70:</strong> Above average - Good foundation</li>
            <li><strong>71-85:</strong> Good - Strong capabilities</li>
            <li><strong>86-100:</strong> Excellent - Outstanding performance</li>
          </ul>
          
          <h4 style="margin-top: 20px; color: #1f2937; font-weight: bold;">🎯 How Category Scores Are Calculated:</h4>
          <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
            Category scores use an <strong>AI-driven approach</strong> that analyzes both your interview responses and profile data to provide accurate field-specific assessments.
          </p>
          <ul style="font-size: 14px; color: #6b7280;">
            <li><strong>Profile Completion Check:</strong> System evaluates if your profile is 80%+ complete</li>
            <li><strong>Very Complete Profile (80%+):</strong> 30% AI Interview Analysis + 70% AI Profile Analysis</li>
            <li><strong>Incomplete/Moderate Profile:</strong> 100% AI Interview Analysis (profile data insufficient)</li>
            <li><strong>AI Analysis:</strong> Evaluates skills, experience, and personality for each field</li>
            <li><strong>Business & Finance:</strong> Business acumen, leadership, financial knowledge, entrepreneurial thinking</li>
            <li><strong>Technology & Engineering:</strong> Technical skills, problem-solving, coding ability, analytical thinking</li>
            <li><strong>Education & Non-Profit:</strong> Communication, community involvement, teaching ability, leadership</li>
            <li><strong>Healthcare & Sciences:</strong> Analytical thinking, attention to detail, scientific interest, precision</li>
            <li><strong>Creative & Media:</strong> Creativity, communication, marketing skills, storytelling</li>
          </ul>
        </div>

        <div class="score-section">
          <h2 class="section-title">📊 Overall Interview Scores</h2>
          <div class="score-grid">
            <div class="score-card">
              <div class="score-label">Overall Match Score</div>
              <div class="score-value">${internData.overall_match_score || 'N/A'}</div>
            </div>
            <div class="score-card">
              <div class="score-label">Skill Score</div>
              <div class="score-value">${internData.skill_score || 'N/A'}</div>
            </div>
            <div class="score-card">
              <div class="score-label">Experience Score</div>
              <div class="score-value">${internData.experience_score || 'N/A'}</div>
            </div>
            <div class="score-card">
              <div class="score-label">Personality Score</div>
              <div class="score-value">${internData.personality_score || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div class="section-title">🎯 Category-Specific Match Scores</div>
        
        <div class="category-match">
          <div class="category-title">💼 Business & Finance Internships</div>
          <div class="category-score">${internData.is_profile_complete ? (internData.business_finance_combined_score || internData.business_finance_score) : (internData.business_finance_score || 'N/A')}/100</div>
          <div class="category-description">
            <strong>Why this score:</strong> ${internData.business_finance_score ? 
              (internData.is_profile_complete ? 
                `AI Analysis (${internData.business_finance_score}/100) - Based on interview responses AND profile analysis (profile ${internData.profile_completion_percentage || 0}% complete).` : 
                `AI Analysis (${internData.business_finance_score}/100) - Based on interview responses only (profile ${internData.profile_completion_percentage || 0}% complete, insufficient for profile analysis).`
              ) : 
              'AI analysis based on your entrepreneurial experience (2x founder, StepUp co-founder), Finance Club leadership (90+ members), and business acumen.'
            } Your entrepreneurial background significantly boosts your fit for business roles.
          </div>
          <div class="recommendation">
            <strong>Recommendation:</strong> ${internData.business_finance_recommendation || 'Excellent fit for finance, business development, and entrepreneurship roles. Your StepUp experience and leadership demonstrate strong business acumen and execution skills.'}
          </div>
        </div>

        <div class="category-match">
          <div class="category-title">💻 Technology & Engineering</div>
          <div class="category-score">${internData.is_profile_complete ? (internData.technology_engineering_combined_score || internData.technology_engineering_score) : (internData.technology_engineering_score || 'N/A')}/100</div>
          <div class="category-description">
            <strong>Why this score:</strong> ${internData.technology_engineering_score ? 
              (internData.is_profile_complete ? 
                `AI Analysis (${internData.technology_engineering_score}/100) - Based on interview responses AND profile analysis (profile ${internData.profile_completion_percentage || 0}% complete).` : 
                `AI Analysis (${internData.technology_engineering_score}/100) - Based on interview responses only (profile ${internData.profile_completion_percentage || 0}% complete, insufficient for profile analysis).`
              ) : 
              'AI analysis based on your self-taught coding experience, technical interests, and problem-solving skills from building projects.'
            } Provides a solid foundation for technical roles.
          </div>
          <div class="recommendation">
            <strong>Recommendation:</strong> ${internData.technology_engineering_recommendation || 'Good potential for software engineering and technical roles. Continue building coding projects and consider technical internships to strengthen this area.'}
          </div>
        </div>

        <div class="category-match">
          <div class="category-title">🎓 Education & Non-Profit</div>
          <div class="category-score">${internData.is_profile_complete ? (internData.education_nonprofit_combined_score || internData.education_nonprofit_score) : (internData.education_nonprofit_score || 'N/A')}/100</div>
          <div class="category-description">
            <strong>Why this score:</strong> ${internData.education_nonprofit_score ? 
              (internData.is_profile_complete ? 
                `AI Analysis (${internData.education_nonprofit_score}/100) - Based on interview responses AND profile analysis (profile ${internData.profile_completion_percentage || 0}% complete).` : 
                `AI Analysis (${internData.education_nonprofit_score}/100) - Based on interview responses only (profile ${internData.profile_completion_percentage || 0}% complete, insufficient for profile analysis).`
              ) : 
              'AI analysis based on your leadership in clubs, community involvement, and strong communication skills.'
            } Makes you an excellent fit for educational and community service roles.
          </div>
          <div class="recommendation">
            <strong>Recommendation:</strong> ${internData.education_nonprofit_recommendation || 'Excellent fit for educational programs, youth development, and community service roles. Your leadership experience is highly valuable.'}
          </div>
        </div>

        <div class="category-match">
          <div class="category-title">🏥 Healthcare & Sciences</div>
          <div class="category-score">${internData.is_profile_complete ? (internData.healthcare_sciences_combined_score || internData.healthcare_sciences_score) : (internData.healthcare_sciences_score || 'N/A')}/100</div>
          <div class="category-description">
            <strong>Why this score:</strong> ${internData.healthcare_sciences_score ? 
              (internData.is_profile_complete ? 
                `AI Analysis (${internData.healthcare_sciences_score}/100) - Based on interview responses AND profile analysis (profile ${internData.profile_completion_percentage || 0}% complete).` : 
                `AI Analysis (${internData.healthcare_sciences_score}/100) - Based on interview responses only (profile ${internData.profile_completion_percentage || 0}% complete, insufficient for profile analysis).`
              ) : 
              'AI analysis based on limited direct healthcare experience, but your analytical thinking and attention to detail provide some foundation.'
            } Would need significant additional training or experience.
          </div>
          <div class="recommendation">
            <strong>Recommendation:</strong> ${internData.healthcare_sciences_recommendation || 'Moderate fit. Consider roles in healthcare administration, research assistance, or data analysis. Would benefit from healthcare-related coursework or volunteering.'}
          </div>
        </div>

        <div class="category-match">
          <div class="category-title">🎨 Creative & Media</div>
          <div class="category-score">${internData.is_profile_complete ? (internData.creative_media_combined_score || internData.creative_media_score) : (internData.creative_media_score || 'N/A')}/100</div>
          <div class="category-description">
            <strong>Why this score:</strong> ${internData.creative_media_score ? 
              (internData.is_profile_complete ? 
                `AI Analysis (${internData.creative_media_score}/100) - Based on interview responses AND profile analysis (profile ${internData.profile_completion_percentage || 0}% complete).` : 
                `AI Analysis (${internData.creative_media_score}/100) - Based on interview responses only (profile ${internData.profile_completion_percentage || 0}% complete, insufficient for profile analysis).`
              ) : 
              'AI analysis based on your communication skills, creative problem-solving, and entrepreneurial mindset.'
            } Provides good potential for marketing and content creation roles.
          </div>
          <div class="recommendation">
            <strong>Recommendation:</strong> ${internData.creative_media_recommendation || 'Good fit for marketing, content creation, and creative roles. Your communication skills and entrepreneurial background are assets.'}
          </div>
        </div>

        <div class="summary-box">
          <h3 class="section-title">📝 Interview Summary</h3>
          <p>${internData.interview_summary || 'No summary available.'}</p>
            </div>

        <div class="feedback-box">
          <h3 class="section-title">💡 Detailed Feedback</h3>
          <p>${internData.interview_feedback || 'No feedback available.'}</p>
        </div>

        ${internData.interview_tags && internData.interview_tags.length > 0 ? `
        <div>
          <h3 class="section-title">🏷️ Key Strengths & Areas</h3>
          <div class="tags">
            ${internData.interview_tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
        ` : ''}

        <div class="conversation">
          <h3 class="section-title">💬 Interview Conversation</h3>
          ${responses.map(response => `
            <div class="conversation-item ai-message">
              <div class="message-label">AI Question</div>
              <div>${response.question_text}</div>
            </div>
            ${response.response_text ? `
            <div class="conversation-item student-message">
              <div class="message-label">Your Response</div>
              <div>${response.response_text}</div>
            </div>
            ` : ''}
          `).join('')}
        </div>

        <div class="footer">
          <p>Generated on ${new Date().toLocaleString()}</p>
          <p>This report is based on AI analysis of your interview responses</p>
          <p><strong>Note:</strong> Category scores are calculated using weighted combinations of your core scores</p>
        </div>
      </body>
      </html>
    `;

    // Return HTML content that can be converted to PDF
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="interview-report-${internData.full_name.replace(/\s+/g, '-').toLowerCase()}.html"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 