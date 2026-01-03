import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Helper to check if user is admin (chasekung)
async function isAdmin(userId: string): Promise<boolean> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data, error } = await supabase
    .from('interns')
    .select('username')
    .eq('id', userId)
    .eq('username', 'chasekung')
    .single();
  
  return !error && !!data;
}

// GET - Fetch all news articles (public)
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('hs_news')
      .select('*')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }

    return NextResponse.json({ articles: data || [] });
  } catch (error) {
    console.error('Error in GET /api/hs-news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create new article (admin only)
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminCheck = await isAdmin(user.id);
    if (!adminCheck) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, subtitle, headline_image_url, body: articleBody, author, tags } = body;

    // Validate required fields
    if (!title || !articleBody || !author) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate tags (max 2)
    if (tags && Array.isArray(tags) && tags.length > 2) {
      return NextResponse.json({ error: 'Maximum 2 tags allowed' }, { status: 400 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const { data, error } = await supabaseAdmin
      .from('hs_news')
      .insert({
        title,
        subtitle,
        headline_image_url,
        body: articleBody,
        author,
        tags: tags || [],
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating article:', error);
      return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
    }

    return NextResponse.json({ article: data });
  } catch (error) {
    console.error('Error in POST /api/hs-news:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

