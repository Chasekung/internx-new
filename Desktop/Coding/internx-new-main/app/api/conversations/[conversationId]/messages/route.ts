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

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('company_id, intern_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if user is part of this conversation
    if (conversation.company_id !== user.id && conversation.intern_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get messages for this conversation
    const { data: messages, error } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Enrich messages with sender information
    const enrichedMessages = await Promise.all(
      (messages || []).map(async (message) => {
        let senderInfo = null;
        
        if (message.sender_type === 'intern') {
          const { data: intern } = await supabaseAdmin
            .from('interns')
            .select('full_name, profile_photo_url')
            .eq('id', message.sender_id)
            .single();
          senderInfo = intern;
        } else if (message.sender_type === 'company') {
          const { data: company } = await supabaseAdmin
            .from('companies')
            .select('company_name, logo_url')
            .eq('id', message.sender_id)
            .single();
          senderInfo = company;
        }

        return {
          ...message,
          sender: senderInfo
        };
      })
    );

    return NextResponse.json({ messages: enrichedMessages });
  } catch (error) {
    console.error('Error in messages GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  try {
    const { conversationId } = params;
    const { content } = await request.json();

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

    // Verify user has access to this conversation
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('company_id, intern_id')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Check if user is part of this conversation
    if (conversation.company_id !== user.id && conversation.intern_id !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Determine sender type
    const isCompany = conversation.company_id === user.id;
    const sender_id = user.id;
    const sender_type = isCompany ? 'company' : 'intern';

    // Create new message using admin client
    const { data: message, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        content,
        sender_id,
        sender_type
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // Update conversation's updated_at timestamp for proper ordering
    await supabaseAdmin
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in messages POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 