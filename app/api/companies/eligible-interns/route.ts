import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const searchTerm = searchParams.get('search') || '';

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    console.log('API: Getting eligible interns for company:', { companyId, searchTerm });

    // Step 1: Get all internships for this company
    const { data: internships, error: internshipError } = await supabase
      .from('internships')
      .select('id')
      .eq('company_id', companyId);

    if (internshipError) {
      console.error('Error fetching internships:', internshipError);
      return NextResponse.json({ error: 'Failed to fetch internships' }, { status: 500 });
    }

    console.log('API: Found internships:', internships?.length, internships);

    if (!internships || internships.length === 0) {
      console.log('API: No internships found for company');
      return NextResponse.json({ interns: [] });
    }

    const internshipIds = internships.map(i => i.id);



    // Step 3: Get applications for this company's internships that have submitted form responses
    const { data: applications, error: appError } = await supabase
      .from('applications')
      .select(`
        intern_id,
        form_response_id,
        form_responses!inner(
          id,
          status,
          submitted_at
        )
      `)
      .in('internship_id', internshipIds)
      .not('form_response_id', 'is', null)
      .eq('form_responses.status', 'submitted')
      .not('form_responses.submitted_at', 'is', null);

    if (appError) {
      console.error('Error fetching applications:', appError);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    console.log('API: Found applications with submitted form responses:', applications?.length, applications);

    if (!applications || applications.length === 0) {
      console.log('API: No applications with submitted form responses found');
      return NextResponse.json({ interns: [] });
    }

    // Get unique intern IDs
    const internIds = Array.from(new Set(applications.map(a => a.intern_id)));
    console.log('API: Unique intern IDs:', internIds);

    // Step 4: Get intern details
    const { data: interns, error } = await supabase
      .from('interns')
      .select(`
        id,
        full_name,
        email,
        profile_photo_url,
        high_school,
        graduation_year
      `)
      .in('id', internIds)
      .order('full_name', { ascending: true });

    if (error) {
      console.error('Error fetching eligible interns:', error);
      return NextResponse.json({ error: 'Failed to fetch eligible interns' }, { status: 500 });
    }

    // Filter by search term if provided
    let filteredInterns = interns || [];
    if (searchTerm) {
      filteredInterns = filteredInterns.filter(intern => 
        intern.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intern.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log('API: Final eligible interns count:', filteredInterns.length);

    return NextResponse.json({ interns: filteredInterns });
  } catch (error) {
    console.error('Error in eligible interns API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 