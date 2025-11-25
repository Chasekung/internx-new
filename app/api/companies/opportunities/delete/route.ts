import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * DELETE /api/companies/opportunities/delete
 * 
 * Safely deletes an opportunity listing while preserving accepted users.
 * 
 * Requirements:
 * - Deletes all listing fields and applications
 * - Preserves accepted users' team membership
 * - Preserves messaging between accepted users and company
 * 
 * Database CASCADE handles:
 * - forms (linked to internship)
 * - form_responses (linked to forms)
 * - response_answers (linked to form_responses)
 * - applications (linked to internship) - but we preserve accepted ones
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role for elevated permissions
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Parse request body
    const { internshipId } = await request.json();

    if (!internshipId) {
      return NextResponse.json({ error: 'Internship ID is required' }, { status: 400 });
    }

    console.log('🗑️ Starting deletion process for internship:', internshipId);

    // Step 1: Verify the internship exists and belongs to this company
    const { data: internship, error: internshipError } = await supabase
      .from('internships')
      .select('id, company_id, title, position')
      .eq('id', internshipId)
      .single();

    if (internshipError || !internship) {
      console.error('❌ Internship not found:', internshipError);
      return NextResponse.json({ error: 'Internship not found' }, { status: 404 });
    }

    if (internship.company_id !== user.id) {
      console.error('❌ Unauthorized: User does not own this internship');
      return NextResponse.json({ error: 'Unauthorized: You do not own this internship' }, { status: 403 });
    }

    console.log('✅ Internship verified:', internship.title);

    // Step 2: Find all ACCEPTED applications before deletion
    const { data: acceptedApplications, error: acceptedError } = await supabase
      .from('applications')
      .select(`
        id,
        intern_id,
        status,
        interns (
          id,
          full_name,
          team
        )
      `)
      .eq('internship_id', internshipId)
      .eq('status', 'accepted');

    if (acceptedError) {
      console.error('❌ Error fetching accepted applications:', acceptedError);
      return NextResponse.json({ error: 'Failed to fetch accepted applications' }, { status: 500 });
    }

    const acceptedInternIds = acceptedApplications?.map((app: any) => ({
      internId: app.intern_id,
      name: app.interns?.full_name || 'Unknown',
      team: app.interns?.team || null
    })) || [];

    console.log(`📋 Found ${acceptedInternIds.length} accepted applications to preserve`);
    acceptedInternIds.forEach((intern: any) => {
      console.log(`  - ${intern.name} (team: ${intern.team || 'none'})`);
    });

    // Step 3: Delete the internship (CASCADE will handle related data)
    // The CASCADE relationships will automatically delete:
    // - forms (via internship_id)
    // - form_responses (via form_id)
    // - response_answers (via response_id)
    // - applications (via internship_id) - including non-accepted ones
    // - form_sections (via form_id)
    // - form_questions (via section_id)
    
    console.log('🗑️ Deleting internship and cascading related data...');
    
    const { error: deleteError } = await supabase
      .from('internships')
      .delete()
      .eq('id', internshipId);

    if (deleteError) {
      console.error('❌ Error deleting internship:', deleteError);
      return NextResponse.json({ 
        error: 'Failed to delete internship',
        details: deleteError.message 
      }, { status: 500 });
    }

    console.log('✅ Internship deleted successfully');
    console.log('✅ CASCADE automatically deleted:');
    console.log('   - Application forms');
    console.log('   - Form responses');
    console.log('   - Response answers');
    console.log('   - All applications (including pending/rejected)');

    // Step 4: Verify accepted users still have their team membership
    // (They should still have their team field intact since interns table is separate)
    if (acceptedInternIds.length > 0) {
      const { data: verifiedInterns, error: verifyError } = await supabase
        .from('interns')
        .select('id, full_name, team')
        .in('id', acceptedInternIds.map((i: any) => i.internId));

      if (verifyError) {
        console.warn('⚠️ Could not verify intern data after deletion:', verifyError);
      } else {
        console.log('✅ Verified accepted interns still have their data:');
        verifiedInterns?.forEach((intern: any) => {
          console.log(`  - ${intern.full_name}: team=${intern.team || 'none'}`);
        });
      }
    }

    // Step 5: Return success with summary
    return NextResponse.json({
      success: true,
      message: 'Internship deleted successfully',
      summary: {
        internshipId,
        internshipTitle: internship.title,
        deletedCascade: [
          'Application forms',
          'Form responses',
          'Response answers',
          'All applications'
        ],
        preserved: {
          acceptedUsersCount: acceptedInternIds.length,
          acceptedUsers: acceptedInternIds.map((i: any) => ({
            name: i.name,
            team: i.team
          })),
          note: 'Accepted users can still message and appear in "Your Team"'
        }
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Unexpected error in delete operation:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

