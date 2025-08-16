import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getRequestLocation, formatLocation } from '@/lib/locationUtils';

export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    console.log('=== Starting signup API route ===');
    const envInfo = {
      // Only include non-sensitive debug values
      urlHost: (() => {
        try {
          const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
          return url ? new URL(url).host : 'undefined';
        } catch {
          return 'invalid-url';
        }
      })(),
      anonKeyPresent: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceKeyPresent: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)
    };
    console.log('Env debug:', envInfo);
    
    const body = await request.json();
    console.log('Request body received:', { ...body, password: '[REDACTED]' });
    
    const { 
      email, 
      password, 
      name, 
      username, 
      companyName, 
      role,
      // Company fields
      phone,
      website,
      industry,
      companySize,
      location,
      description,
      // Intern fields (updated for high school students)
      highSchool,
      gradeLevel,
      age,
      extracurriculars,
      achievements,
      careerInterests,
      skills,
      experience,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      bio,
      state,
      // Referral fields
      referralCode,
    } = body;

    // Validate required fields
    if (!email || !password || !name) {
      console.log('Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === 'COMPANY' && !companyName) {
      console.log('Company name missing');
      return NextResponse.json(
        { error: 'Company name is required for company registration' },
        { status: 400 }
      );
    }

    if (role === 'INTERN' && !username) {
      console.log('Username missing');
      return NextResponse.json(
        { error: 'Username is required for intern registration' },
        { status: 400 }
      );
    }

    console.log('Creating user in Supabase Auth...');
    
    // Create user in Supabase Auth (client/anon path)
    let { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          ...(role === 'COMPANY' && { company_name: companyName }),
          ...(role === 'INTERN' && { username }),
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      // Fallback: try admin createUser to surface clearer errors and bypass edge cases
      const isDatabaseSaveError = (authError.message || '').toLowerCase().includes('database error saving new user');
      let adminAttempted = false;
      let adminErrorMessage: string | null = null;
      if (isDatabaseSaveError && supabaseAdmin) {
        try {
          console.log('Attempting admin.createUser fallback...');
          const { data: adminUser, error: adminErr } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              name,
              role,
              ...(role === 'COMPANY' && { company_name: companyName }),
              ...(role === 'INTERN' && { username }),
            },
          });
          if (adminErr) {
            console.error('Admin createUser error:', adminErr);
            adminErrorMessage = adminErr.message || String(adminErr);
          } else if (adminUser?.user) {
            // Mimic authData for downstream logic
            authData = { user: adminUser.user, session: null } as any;
            console.log('Admin createUser succeeded, user id:', adminUser.user.id);
          }
          adminAttempted = true;
        } catch (e) {
          console.error('Admin createUser threw:', e);
          adminAttempted = true;
          adminErrorMessage = e instanceof Error ? e.message : String(e);
        }
      }

      // If we still have no user, return detailed error
      if (!authData?.user) {
        const debug = process.env.NODE_ENV !== 'production' ? {
          status: (authError as any).status ?? null,
          message: authError.message,
          supabaseUrlHost: envInfo.urlHost,
          provider: 'email',
          triedAdminCreateUser: adminAttempted,
          adminError: adminErrorMessage,
        } : undefined;
        return NextResponse.json(
          { error: authError.message, debug },
          { status: 400 }
        );
      }
    }

    if (!authData.user) {
      console.error('No user data returned from Supabase Auth');
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    console.log('User created in Auth, creating profile...');

    // Insert user data into the appropriate table
    if (role === 'COMPANY') {
      console.log('Creating company profile...');
      const { error: profileError } = await supabase
        .from('companies')
        .insert({
          id: authData.user.id,
          company_name: companyName,
          contact_name: name,
          email: email,
          phone: phone || null,
          website: website || null,
          industry: industry || null,
          company_size: companySize || null,
          description: description || null,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Company profile creation error:', profileError);
        // If profile creation fails, delete the auth user
        try {
          const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
          if (deleteError) {
            console.error('Failed to cleanup auth user after profile creation failed:', deleteError);
          }
        } catch (cleanupErr) {
          console.error('Cleanup error after company profile failure:', cleanupErr);
        }
        const debug = process.env.NODE_ENV !== 'production' ? { profileError } : undefined;
        return NextResponse.json(
          { error: `Failed to create company profile: ${profileError.message}`, debug },
          { status: 500 }
        );
      }
    } else if (role === 'INTERN') {
      console.log('Creating intern profile...');

      // Generate a unique referral_code
      let newReferralCode: string;
      let attempts = 0;
      const maxAttempts = 10;
      do {
        newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        attempts++;
        const { data: existing } = await supabase
          .from('interns')
          .select('id')
          .eq('referral_code', newReferralCode)
          .single();
        if (!existing) break;
      } while (attempts < maxAttempts);
      if (attempts >= maxAttempts) {
        return NextResponse.json({ error: 'Unable to generate unique referral code' }, { status: 500 });
      }

      // Look up referrer ID if referral code is provided
      // TODO: Re-enable after fixing database schema (referred_by column needs to be UUID type)
      let referrerUserId = null;
      if (referralCode) {
        console.log('Looking up referrer for code:', referralCode);
        const { data: referrer, error: referrerError } = await supabase
          .from('interns')
          .select('id')
          .eq('referral_code', referralCode)
          .single();
        
        if (referrerError) {
          console.log('Referrer lookup error:', referrerError);
          // Continue with signup even if referral code is invalid
        } else if (referrer) {
          referrerUserId = referrer.id;
          console.log('Found valid referrer UUID:', referrerUserId);
        } else {
          console.log('No referrer found for code:', referralCode);
        }
      }

      const { error: profileError } = await supabase
        .from('interns')
        .insert({
          id: authData.user.id,
          full_name: name,
          username: username,
          email: email,
          phone: phone || null,
          location: location || null,
          signup_location: location || null,
          signup_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
          signup_user_agent: request.headers.get('user-agent') || null,
          referral_code: newReferralCode,
          referred_by: referrerUserId,
          high_school: highSchool || null,
          grade_level: gradeLevel || null,
          age: age || null,
          extracurriculars: extracurriculars || [],
          achievements: achievements || [],
          career_interests: careerInterests || [],
          skills: skills || [],
          experience: experience || null,
          linkedin_url: linkedinUrl || null,
          github_url: githubUrl || null,
          portfolio_url: portfolioUrl || null,
          bio: bio || null,
          state: state || null,
          created_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Intern profile creation error:', profileError);
        const debug = process.env.NODE_ENV !== 'production' ? { profileError } : undefined;
        return NextResponse.json(
          { error: `Failed to create intern profile: ${profileError.message}`, debug },
          { status: 500 }
        );
      }
    }

    console.log('Profile created successfully');

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role,
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 