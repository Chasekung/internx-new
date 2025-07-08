import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function GET(request: NextRequest) {
  try {
    // Test 1: Check if we can connect to the database
    const { data: testData, error: testError } = await supabase
      .from('interns')
      .select('id, full_name, email')
      .limit(1);

    if (testError) {
      console.error('Database connection test failed:', testError);
      return NextResponse.json({ 
        error: 'Database connection failed', 
        details: testError.message 
      }, { status: 500 });
    }

    // Test 2: Check if referral_code and referred_by columns exist
    const { data: referralData, error: referralError } = await supabase
      .from('interns')
      .select('id, referral_code, referred_by')
      .limit(1);

    if (referralError) {
      console.error('Referral columns test failed:', referralError);
      return NextResponse.json({ 
        error: 'Referral columns test failed', 
        details: referralError.message,
        columns_exist: false
      }, { status: 500 });
    }

    // Test 3: Get a sample user with all fields
    const { data: sampleUser, error: sampleError } = await supabase
      .from('interns')
      .select('*')
      .limit(1)
      .single();

    if (sampleError) {
      console.error('Sample user fetch failed:', sampleError);
      return NextResponse.json({ 
        error: 'Sample user fetch failed', 
        details: sampleError.message
      }, { status: 500 });
    }

    // Test 4: Check column types
    const columnInfo = {
      referral_code: {
        exists: 'referral_code' in sampleUser,
        type: typeof sampleUser.referral_code,
        value: sampleUser.referral_code
      },
      referred_by: {
        exists: 'referred_by' in sampleUser,
        type: typeof sampleUser.referred_by,
        value: sampleUser.referred_by
      }
    };

    return NextResponse.json({
      success: true,
      database_connected: true,
      columns_exist: true,
      column_info: columnInfo,
      sample_user_keys: Object.keys(sampleUser),
      environment: {
        supabase_url: supabaseUrl ? 'Set' : 'Missing',
        service_key: supabaseServiceKey ? 'Set' : 'Missing'
      }
    });

  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ 
      error: 'Test API failed', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 