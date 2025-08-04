import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create Supabase client when needed
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Generate a new unique referral code
    const generateCode = () => {
      return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    let newCode: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      newCode = generateCode();
      attempts++;
      
      // Check if code already exists
      const { data: existing } = await supabase
        .from('interns')
        .select('id')
        .eq('referral_code', newCode)
        .single();

      if (!existing) {
        break;
      }
    } while (attempts < maxAttempts);

    if (attempts >= maxAttempts) {
      return NextResponse.json({ error: 'Unable to generate unique code' }, { status: 500 });
    }

    // Update the user's referral code
    const { error: updateError } = await supabase
      .from('interns')
      .update({ referral_code: newCode })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating referral code:', updateError);
      return NextResponse.json({ error: 'Failed to update referral code' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      referralCode: newCode 
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 