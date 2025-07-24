import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { internshipId, userId } = await request.json();

    if (!internshipId || !userId) {
      return NextResponse.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    console.log('API: Checking application status for:', { internshipId, userId });

    // Use service role to bypass RLS
    const { data: application, error } = await supabase
      .from('applications')
      .select(`
        id, 
        status,
        form_response_id,
        form_responses (
          id,
          status,
          submitted_at
        )
      `)
      .eq('internship_id', internshipId)
      .eq('intern_id', userId)
      .maybeSingle();

    if (error) {
      console.error('API: Error fetching application:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch application status' 
      }, { status: 500 });
    }

    console.log('API: Application query result:', { application, error: null });

    if (application) {
      // Check if either the application OR form response is submitted
      const appSubmitted = application.status === 'submitted';
      const formResponse = Array.isArray(application.form_responses) ? application.form_responses[0] : application.form_responses;
      const formSubmitted = formResponse?.status === 'submitted' && formResponse?.submitted_at;
      
      // If either is submitted, consider the whole application submitted
      const isActuallySubmitted = appSubmitted || formSubmitted;
      
      console.log('API: Application status check:', {
        applicationId: application.id,
        appStatus: application.status,
        formStatus: formResponse?.status,
        formSubmittedAt: formResponse?.submitted_at,
        isActuallySubmitted
      });

      // If there's a mismatch, fix it by updating both to be consistent
      if (isActuallySubmitted && (!appSubmitted || !formSubmitted)) {
        console.log('API: Status mismatch detected, fixing...');
        
        // Update application status to submitted if it's not
        if (!appSubmitted) {
          const { error: updateError } = await supabase
            .from('applications')
            .update({ status: 'submitted' })
            .eq('id', application.id);
          
          if (updateError) {
            console.error('API: Error updating application status:', updateError);
          }
        }
        
        // Update form response status to submitted if it exists and isn't submitted
        if (application.form_response_id && !formSubmitted) {
          const { error: formUpdateError } = await supabase
            .from('form_responses')
            .update({ 
              status: 'submitted',
              submitted_at: new Date().toISOString()
            })
            .eq('id', application.form_response_id);
          
          if (formUpdateError) {
            console.error('API: Error updating form response status:', formUpdateError);
          }
        }
      }

      const finalStatus = isActuallySubmitted ? 'submitted' : application.status;
      
      return NextResponse.json({
        application: {
          id: application.id,
          status: finalStatus
        }
      });
    } else {
      console.log('API: No existing application found');
      return NextResponse.json({ application: null });
    }

  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 