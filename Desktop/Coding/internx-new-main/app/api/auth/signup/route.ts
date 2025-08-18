import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
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
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
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
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
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
        const { error: deleteError } = await supabase.auth.admin.deleteUser(authData.user.id);
        if (deleteError) {
          console.error('Failed to cleanup auth user after profile creation failed:', deleteError);
        }
        
        return NextResponse.json(
          { error: `Failed to create company profile: ${profileError.message}` },
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
        return NextResponse.json(
          { error: `Failed to create intern profile: ${profileError.message}` },
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