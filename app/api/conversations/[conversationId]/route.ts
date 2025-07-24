import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;

    // Create Supabase client for client-side authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get auth token from cookies
    const cookieStore = request.headers.get('cookie') || '';
    const authTokenMatch = cookieStore.match(/sb-.*-auth-token=([^;]+)/);

    if (!authTokenMatch) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const authToken = decodeURIComponent(authTokenMatch[1]);
    let authArray;
    try {
      authArray = JSON.parse(authToken);
    } catch {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
    }

    // Extract the actual JWT token (first element of the array)
    const actualToken = Array.isArray(authArray) ? authArray[0] : authArray.access_token || authArray;
    
    if (!actualToken) {
      return NextResponse.json({ error: 'No access token found' }, { status: 401 });
    }

    // Set the session
    const { data: { user }, error: authError } = await supabase.auth.getUser(actualToken);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Fetch conversation with expanded info
    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        company:companies(company_name, logo_url),
        intern:interns(full_name, profile_photo_url)
      `)
      .eq('id', conversationId)
      .single();

    if (error || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if user is part of this conversation
    if (conversation.company_id !== user.id && conversation.intern_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ conversation });
  } catch (error) {
    console.error('Error in conversation GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 