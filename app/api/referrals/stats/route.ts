import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's referral code
    const { data: user, error: userError } = await supabase
      .from('interns')
      .select('referral_code')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all users who were referred by this user's code
    const { data: referredInterns, error: referredError } = await supabase
      .from('interns')
      .select('id, username, full_name, email, location, created_at')
      .eq('referred_by', userId);

    if (referredError) {
      console.error('Error fetching referred interns:', referredError);
      return NextResponse.json({ error: 'Failed to fetch referred users' }, { status: 500 });
    }

    // Get link click statistics (optional, keep if you want click analytics)
    const { data: clicks, error: clicksError } = await supabase
      .from('referral_link_clicks')
      .select('*')
      .eq('referrer_id', userId);

    if (clicksError) {
      console.error('Error fetching clicks:', clicksError);
      return NextResponse.json({ error: 'Failed to fetch clicks' }, { status: 500 });
    }

    // Calculate statistics
    const totalClicks = clicks?.length || 0;
    const totalReferrals = referredInterns?.length || 0;
    const completedReferrals = totalReferrals; // All are completed
    const conversionRate = totalClicks > 0 ? (completedReferrals / totalClicks * 100).toFixed(1) : '0';

    // Get recent referrals (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReferrals = referredInterns?.filter(r => 
      new Date(r.created_at) >= thirtyDaysAgo
    ).length || 0;

    return NextResponse.json({
      referralCode: user.referral_code,
      stats: {
        totalClicks,
        totalReferrals,
        completedReferrals,
        conversionRate: parseFloat(conversionRate),
        recentReferrals
      },
      referrals: referredInterns || [],
      clicks: clicks || []
    });
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 