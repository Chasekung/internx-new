import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if environment variables are available
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const { companyId, internId } = await request.json();

    if (!companyId || !internId) {
      return NextResponse.json({ 
        error: 'Company ID and Intern ID are required' 
      }, { status: 400 });
    }

    console.log('API: Validating conversation creation:', { companyId, internId });

    // Check if intern has submitted form responses for this company's internships
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        id,
        status,
        internship_id,
        form_response_id,
        internships!inner (
          id,
          company_id
        ),
        form_responses!inner (
          id,
          status,
          submitted_at
        )
      `)
      .eq('intern_id', internId)
      .eq('internships.company_id', companyId)
      .not('form_response_id', 'is', null)
      .eq('form_responses.status', 'submitted')
      .not('form_responses.submitted_at', 'is', null);

    if (error) {
      console.error('Error validating conversation:', error);
      return NextResponse.json({ 
        error: 'Failed to validate conversation' 
      }, { status: 500 });
    }

    const isValid = applications && applications.length > 0;

    console.log('API: Conversation validation result:', { 
      isValid, 
      applicationCount: applications?.length,
      applications: applications?.map(app => {
        const formResponse = Array.isArray(app.form_responses) ? app.form_responses[0] : app.form_responses;
        return {
          id: app.id,
          internshipId: app.internship_id,
          formResponseId: app.form_response_id,
          formResponseStatus: formResponse?.status,
          formResponseSubmittedAt: formResponse?.submitted_at
        };
      })
    });

    return NextResponse.json({ 
      isValid,
      applications: applications || []
    });
  } catch (error) {
    console.error('Error in conversation validation API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 