import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    // Create Supabase client for client-side authentication
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Determine if user is a company or intern
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', user.id)
      .single();

    const { data: intern } = await supabaseAdmin
      .from('interns')
      .select('id')
      .eq('id', user.id)
      .single();

    let query = supabaseAdmin
      .from('conversations')
      .select(`
        *,
        company:companies(company_name, logo_url),
        intern:interns(full_name, profile_photo_url)
      `);

    // Filter based on user type
    if (company) {
      // User is a company - get conversations where they are the company
      query = query.eq('company_id', company.id);
    } else if (intern) {
      // User is an intern - get conversations where they are the intern
      query = query.eq('intern_id', intern.id);
    } else {
      // User is neither company nor intern
      return NextResponse.json({ conversations: [] });
    }

    const { data: conversations, error } = await query.order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    // Enrich conversations with latest message
    const enrichedConversations = await Promise.all(
      (conversations || []).map(async (conversation) => {
        const { data: latestMessage } = await supabaseAdmin
          .from('messages')
          .select('content, created_at, sender_type')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...conversation,
          latest_message: latestMessage
        };
      })
    );

    return NextResponse.json({ conversations: enrichedConversations });
  } catch (error) {
    console.error('Error in conversations GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const { company_id, intern_id } = await request.json();

    // Create Supabase client for client-side authentication
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
      console.log('Auth error or no user:', authError, user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('POST /api/conversations:', { company_id, intern_id, user });

    // Create admin client for database operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Determine if the current user is a company or intern
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', user.id)
      .single();

    const { data: intern } = await supabaseAdmin
      .from('interns')
      .select('id')
      .eq('id', user.id)
      .single();

    // Validate user can create this conversation
    if (company && company.id !== company_id) {
      return NextResponse.json({ error: 'Unauthorized to create this conversation' }, { status: 403 });
    }
    if (intern && intern.id !== intern_id) {
      return NextResponse.json({ error: 'Unauthorized to create this conversation' }, { status: 403 });
    }

    // Check if conversation already exists
    const { data: existingConversation } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('company_id', company_id)
      .eq('intern_id', intern_id)
      .single();

    if (existingConversation) {
      return NextResponse.json({ 
        conversation: existingConversation,
        message: 'Conversation already exists'
      });
    }

    // Create new conversation
    const { data: newConversation, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        company_id,
        intern_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }

    console.log('Conversation created successfully:', newConversation);
    return NextResponse.json({ conversation: newConversation });
  } catch (error) {
    console.error('Error in conversation POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 