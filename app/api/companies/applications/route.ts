import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only create client if environment variables are available
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const internshipId = searchParams.get('internshipId');

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    let query = supabase
      .from('applications')
      .select(`
        id,
        status,
        applied_at,
        internship_id,
        intern_id,
        form_response_id,
        internships!inner (
          id,
          title,
          position,
          category,
          company_id
        ),
        interns (
          id,
          name,
          email,
          school,
          graduation_year,
          profile_picture
        ),
        form_responses (
          id,
          status,
          submitted_at,
          forms (
            id,
            title,
            form_sections (
              id,
              title,
              order_index,
              form_questions (
                id,
                type,
                question_text,
                required,
                order_index,
                options,
                choice_1, choice_2, choice_3, choice_4, choice_5,
                choice_6, choice_7, choice_8, choice_9, choice_10,
                choice_11, choice_12, choice_13, choice_14, choice_15,
                dropdown_1, dropdown_2, dropdown_3, dropdown_4, dropdown_5,
                dropdown_6, dropdown_7, dropdown_8, dropdown_9, dropdown_10,
                dropdown_11, dropdown_12, dropdown_13, dropdown_14, dropdown_15,
                dropdown_16, dropdown_17, dropdown_18, dropdown_19, dropdown_20,
                dropdown_21, dropdown_22, dropdown_23, dropdown_24, dropdown_25,
                dropdown_26, dropdown_27, dropdown_28, dropdown_29, dropdown_30,
                dropdown_31, dropdown_32, dropdown_33, dropdown_34, dropdown_35,
                dropdown_36, dropdown_37, dropdown_38, dropdown_39, dropdown_40,
                dropdown_41, dropdown_42, dropdown_43, dropdown_44, dropdown_45,
                dropdown_46, dropdown_47, dropdown_48, dropdown_49, dropdown_50
              )
            )
          ),
          response_answers (
            id,
            question_id,
            answer_text,
            answer_data
          )
        )
      `)
      .eq('internships.company_id', companyId)
      .not('form_response_id', 'is', null);

    if (internshipId) {
      query = query.eq('internship_id', internshipId);
    }

    const { data: applications, error } = await query
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    // Transform the data to make it easier to work with
    const transformedApplications = applications?.map(app => {
      const formResponse = Array.isArray(app.form_responses) ? app.form_responses[0] : app.form_responses;
      const form = formResponse?.forms ? (Array.isArray(formResponse.forms) ? formResponse.forms[0] : formResponse.forms) : null;
      
      // Create a map of answers by question ID
      const answersMap = formResponse?.response_answers?.reduce((acc: any, answer: any) => {
        acc[answer.question_id] = {
          text: answer.answer_text,
          data: answer.answer_data
        };
        return acc;
      }, {}) || {};

      // Process form sections and questions
      const sections = form?.form_sections?.sort((a: any, b: any) => a.order_index - b.order_index)
        .map((section: any) => ({
          ...section,
          questions: section.form_questions?.sort((a: any, b: any) => a.order_index - b.order_index)
            .map((question: any) => {
              // Extract dropdown options
              const dropdownOptions = [];
              for (let i = 1; i <= 50; i++) {
                const option = question[`dropdown_${i}`];
                if (option) {
                  dropdownOptions.push(option);
                }
              }

              // Extract choice options
              const choiceOptions = [];
              for (let i = 1; i <= 15; i++) {
                const choice = question[`choice_${i}`];
                if (choice) {
                  choiceOptions.push(choice);
                }
              }

              return {
                ...question,
                options: question.type === 'dropdown' ? dropdownOptions : 
                        (question.type === 'multiple_choice' || question.type === 'checkboxes') ? choiceOptions :
                        question.options ? JSON.parse(question.options) : [],
                answer: answersMap[question.id] || null
              };
            }) || []
        })) || [];

      return {
        id: app.id,
        status: app.status,
        applied_at: app.applied_at,
        internship: app.internships,
        applicant: app.interns,
        form_response: {
          id: formResponse?.id,
          status: formResponse?.status,
          submitted_at: formResponse?.submitted_at,
          form: {
            id: form?.id,
            title: form?.title,
            sections
          }
        }
      };
    });

    return NextResponse.json({ applications: transformedApplications });
  } catch (error) {
    console.error('Error in applications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 