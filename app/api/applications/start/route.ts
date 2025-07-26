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

    console.log('API: Starting application for:', { internshipId, userId });

    // First check if application already exists
    const { data: existingApp, error: checkError } = await supabase
      .from('applications')
      .select(`
        id, 
        status,
        form_response_id,
        form_responses (
          status,
          submitted_at
        )
      `)
      .eq('internship_id', internshipId)
      .eq('intern_id', userId)
      .maybeSingle();

    if (checkError) {
      console.error('API: Error checking existing application:', checkError);
      return NextResponse.json({ 
        error: 'Failed to check existing application' 
      }, { status: 500 });
    }

    if (existingApp) {
      const appSubmitted = existingApp.status === 'submitted';
      const formResponse = Array.isArray(existingApp.form_responses) ? existingApp.form_responses[0] : existingApp.form_responses;
      const formSubmitted = formResponse?.status === 'submitted' && formResponse?.submitted_at;
      
      if (appSubmitted || formSubmitted) {
        return NextResponse.json({ 
          error: 'Application already submitted' 
        }, { status: 400 });
      }
    }

    // Get internship details to find the form template
    const { data: internship, error: internshipError } = await supabase
      .from('internships')
      .select(`
        id,
        title,
        position
      `)
      .eq('id', internshipId)
      .single();

    if (internshipError) {
      console.error('API: Error fetching internship:', internshipError);
      return NextResponse.json({ 
        error: 'Failed to fetch internship details' 
      }, { status: 500 });
    }

    // Look for existing form template for this internship
    const { data: existingForm, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('internship_id', internshipId)
      .maybeSingle();

    let formTemplate;
    if (existingForm && !formError) {
      // Use existing form template
      formTemplate = existingForm;
    } else {
      // Create a new form template for this internship
      const { data: newForm, error: createFormError } = await supabase
        .from('forms')
        .insert({
          title: `${internship.title} Application Form`,
          description: `Application form for ${internship.position} position`,
          internship_id: internshipId
        })
        .select()
        .single();

      if (createFormError) {
        console.error('API: Error creating form template:', createFormError);
        return NextResponse.json({ 
          error: 'Failed to create form template' 
        }, { status: 500 });
      }

      formTemplate = newForm;
    }

    // Create the application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        internship_id: internshipId,
        intern_id: userId,
        status: 'in_progress',
      })
      .select()
      .single();

    if (appError) {
      console.error('API: Error creating application:', appError);
      return NextResponse.json({ 
        error: 'Failed to create application' 
      }, { status: 500 });
    }

    // Create the form response
    const { data: formResponse, error: responseError } = await supabase
      .from('form_responses')
      .insert({
        form_id: formTemplate.id,
        applicant_id: userId,
        status: 'in_progress'
      })
      .select()
      .single();

    if (responseError) {
      console.error('API: Error creating form response:', responseError);
      return NextResponse.json({ 
        error: 'Failed to create form response' 
      }, { status: 500 });
    }

    // Update the application with the form response ID
    const { error: updateError } = await supabase
      .from('applications')
      .update({ form_response_id: formResponse.id })
      .eq('id', application.id);

    if (updateError) {
      console.error('API: Error updating application with form response:', updateError);
      return NextResponse.json({ 
        error: 'Failed to link application to form response' 
      }, { status: 500 });
    }

    console.log('API: Successfully created application:', {
      applicationId: application.id,
      formResponseId: formResponse.id
    });

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status
      },
      formResponse: {
        id: formResponse.id,
        status: formResponse.status
      }
    });

  } catch (error) {
    console.error('API: Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 