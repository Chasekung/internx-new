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
    // Get user's announcements
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(`*, company:companies(name, logo_url), intern:interns(first_name, last_name, profile_photo_url)`)
      .or(`company_id.eq.${user.id},intern_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }
    return NextResponse.json({ announcements });
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
    // Create new announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        sender_id: user.id,
        sender_type: recipient_type === 'intern' ? 'company' : 'intern',
        recipient_id,
        recipient_type
      })
      .select(`*, company:companies(name, logo_url), intern:interns(first_name, last_name, profile_photo_url)`)
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
    // Get user's announcements
    const { data: announcements, error } = await supabase
      .from('announcements')
      .select(`*, company:companies(name, logo_url), intern:interns(first_name, last_name, profile_photo_url)`)
      .or(`company_id.eq.${user.id},intern_id.eq.${user.id}`)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }
    return NextResponse.json({ announcements });
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
    // Create new announcement
    const { data: announcement, error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        sender_id: user.id,
        sender_type: recipient_type === 'intern' ? 'company' : 'intern',
        recipient_id,
        recipient_type
      })
      .select(`*, company:companies(name, logo_url), intern:interns(first_name, last_name, profile_photo_url)`)
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