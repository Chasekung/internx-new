import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * API endpoint to handle legacy user email confirmation
 * This endpoint will manually confirm emails for users who were created before email verification was enforced
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const body = await request.json();
    const { userId, email, userType } = body;

    if (!userId || !email || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, userType' },
        { status: 400 }
      );
    }

    // Verify the user exists in our database
    const tableName = userType === 'intern' ? 'interns' : 'companies';
    const { data: userData, error: userError } = await supabase
      .from(tableName)
      .select('id, email, created_at')
      .eq('id', userId)
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Check if user qualifies as legacy (created more than 1 hour ago)
    const createdAt = new Date(userData.created_at);
    const now = new Date();
    const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceCreation <= 1) {
      return NextResponse.json(
        { error: 'User does not qualify for legacy email confirmation bypass' },
        { status: 403 }
      );
    }

    // Use admin client to manually confirm the user's email
    // Note: This requires the service role key, not the anon key
    const adminSupabase = createRouteHandlerClient({ cookies });
    
    try {
      // Update the user's email_confirmed_at field
      const { data: updateData, error: updateError } = await adminSupabase.auth.admin.updateUserById(
        userId,
        { 
          email_confirm: true,
        }
      );

      if (updateError) {
        console.error('Failed to confirm user email:', updateError);
        return NextResponse.json(
          { error: 'Failed to confirm email address' },
          { status: 500 }
        );
      }

      console.log(`Successfully confirmed email for legacy user ${userId}`);

      return NextResponse.json({
        message: 'Email confirmed for legacy user',
        userId,
        confirmed: true
      });

    } catch (adminError) {
      console.error('Admin operation failed:', adminError);
      
      // Fallback: Try to sign in the user directly and let them through
      // This is less ideal but will work for legacy users
      return NextResponse.json({
        message: 'Legacy user verified, manual confirmation required',
        userId,
        requiresManualConfirmation: true,
        reason: 'Admin email confirmation failed, but user is verified as legacy'
      });
    }

  } catch (error) {
    console.error('Legacy confirm API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}