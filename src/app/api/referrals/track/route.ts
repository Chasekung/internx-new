import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRequestLocation, formatLocation } from '@/lib/locationUtils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, visitorIp, visitorUserAgent, visitorLocation } = body;

    if (!referralCode) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 });
    }

    // Find the referrer by referral code
    const { data: referrer, error: referrerError } = await supabase
      .from('interns')
      .select('id')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
    }

    // Get location from IP if not provided
    let finalLocation = visitorLocation;
    if (!finalLocation) {
      const locationData = await getRequestLocation(request);
      if (locationData) {
        finalLocation = formatLocation(locationData);
      }
    }

    // Record the click
    const { error: clickError } = await supabase
      .from('referral_link_clicks')
      .insert({
        referral_code: referralCode,
        referrer_id: referrer.id,
        visitor_ip: visitorIp || null,
        visitor_user_agent: visitorUserAgent || null,
        visitor_location: finalLocation || null
      });

    if (clickError) {
      console.error('Error recording referral click:', clickError);
      return NextResponse.json({ error: 'Failed to record click' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking referral:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 