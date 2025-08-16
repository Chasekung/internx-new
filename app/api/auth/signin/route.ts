import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    const body = await request.json();
    const { identifier, password, companyName, email, role } = body;

    console.log('Sign-in request received');
    console.log('Request body:', { identifier, companyName, email, role });

    // Handle company sign-in
    if (role === 'COMPANY') {
      if (!companyName || !email || !password) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Company auth error:', authError);
        const debug = process.env.NODE_ENV !== 'production' ? { authError } : undefined;
        return NextResponse.json(
          { error: 'Invalid credentials', debug },
          { status: 401 }
        );
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }

      // Verify company exists and matches
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', authData.user.id)
        .eq('company_name', companyName)
        .single();

      if (companyError || !companyData) {
        return NextResponse.json(
          { error: 'Company not found or invalid credentials' },
          { status: 401 }
        );
      }

      return NextResponse.json({
        message: 'Company signed in successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: companyData.contact_name,
          companyName: companyData.company_name,
          role: 'COMPANY',
        },
        token: authData.session?.access_token,
        session: authData.session,
      });

    } else {
      // Handle intern sign-in (by email or username)
      if (!identifier || !password) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      console.log('Processing intern sign-in with identifier:', identifier);
      
      // First, try to find the user by email or username
      let userEmail = identifier;
      
      // If identifier is not an email, assume it's a username and look it up
      if (!identifier.includes('@')) {
        console.log('Identifier is not an email, looking up username in interns table...');
        const { data: internData, error: internError } = await supabase
          .from('interns')
          .select('email')
          .eq('username', identifier)
          .single();

        if (internError || !internData) {
          console.log('Username lookup failed:', internError);
          return NextResponse.json(
            { error: 'User not found' },
            { status: 401 }
          );
        }

        userEmail = internData.email;
        console.log('Found email for username:', userEmail);
      } else {
        console.log('Identifier is an email, using directly:', userEmail);
      }

      console.log('Attempting Supabase Auth signin with email:', userEmail);
      
      // Sign in with email and password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password,
      });

      if (authError) {
        console.error('Intern auth error:', authError);
        
        // Provide specific error messages
        if (authError.message.includes('Email not confirmed')) {
          return NextResponse.json(
            { error: 'Please check your email and confirm your account before signing in' },
            { status: 401 }
          );
        }
        
        const debug = process.env.NODE_ENV !== 'production' ? { authError } : undefined;
        return NextResponse.json(
          { error: 'Invalid credentials', debug },
          { status: 401 }
        );
      }

      if (!authData.user) {
        console.log('No user data returned from auth');
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }

      console.log('Auth successful, user ID:', authData.user.id);

      // Get intern profile data
      const { data: internData, error: internError } = await supabase
        .from('interns')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (internError || !internData) {
        console.log('Intern profile lookup failed:', internError);
        return NextResponse.json(
          { error: 'Intern profile not found' },
          { status: 401 }
        );
      }

      console.log('Intern profile found:', internData.full_name);

      return NextResponse.json({
        message: 'Intern signed in successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: internData.full_name,
          username: internData.username,
          role: 'INTERN',
        },
        session: authData.session,
      });
    }

  } catch (error) {
    console.error('Sign-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 