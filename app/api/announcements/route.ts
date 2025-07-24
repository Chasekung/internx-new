import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine if user is a company or intern
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const { data: intern } = await supabase
      .from('interns')
      .select('id')
      .eq('id', user.id)
      .single();

    let query = supabase
      .from('announcements')
      .select(`
        *,
        company:companies(company_name, logo_url),
        intern:interns(full_name, profile_photo_url)
      `);

    // Filter based on user type
    if (company) {
      // User is a company - get announcements where they are the recipient
      query = query.eq('recipient_id', company.id).eq('recipient_type', 'company');
    } else if (intern) {
      // User is an intern - get announcements where they are the recipient
      query = query.eq('recipient_id', intern.id).eq('recipient_type', 'intern');
    } else {
      // User is neither company nor intern
      return NextResponse.json({ announcements: [] });
    }

    const { data: announcements, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    return NextResponse.json({ announcements: announcements || [] });
  } catch (error) {
    console.error('Error in announcements GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { title, content, recipient_id, recipient_type } = await request.json();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Determine sender type
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const sender_type = company ? 'company' : 'intern';
    const sender_id = company ? company.id : user.id;

    // Create new announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        sender_id,
        sender_type,
        recipient_id,
        recipient_type
      })
      .select(`
        *,
        company:companies(company_name, logo_url),
        intern:interns(full_name, profile_photo_url)
      `)
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    return NextResponse.json({ announcement });
  } catch (error) {
    console.error('Error in announcements POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 