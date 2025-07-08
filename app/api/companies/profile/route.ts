import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import supabase from '@/lib/supabaseClient';

// Initialize Supabase client with admin privileges
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get the user's session (assume JWT in Authorization header)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    const body = await request.json();
    const { company_name, contact_name } = body;
    if (!company_name || !contact_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    // Check if company profile already exists
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('id', userId)
      .single();
    if (existing) {
      return NextResponse.json({ error: 'Company profile already exists for this user.' }, { status: 400 });
    }
    // Insert company profile
    const { error: insertError } = await supabaseAdmin
      .from('companies')
      .insert({
        id: userId,
        company_name,
        contact_name,
        email: user.email,
        created_at: new Date().toISOString(),
      });
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json({ message: 'Company profile created successfully.' });
  } catch (err) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Debug - GET /api/companies/profile called');
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted');

    // Get user from Supabase session
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.log('❌ User not found:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get company profile
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', user.id)
      .single();

    if (companyError) {
      console.log('❌ Error fetching company:', companyError);
      return NextResponse.json({ error: 'Failed to fetch company data' }, { status: 500 });
    }

    if (!company) {
      console.log('❌ Company not found');
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    console.log('✅ Company data fetched successfully');
    return NextResponse.json(company);
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 API Debug - PUT /api/companies/profile called');
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 Token extracted');

    // Get user from Supabase session
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.log('❌ User not found:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('📦 Request body:', body);

    // Validate required fields
    if (!body.company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    // First check if the company exists
    const { data: existingCompany, error: checkError } = await supabase
      .from('companies')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (checkError) {
      console.log('❌ Error checking company:', checkError);
      return NextResponse.json({ error: 'Failed to verify company' }, { status: 500 });
    }

    if (!existingCompany) {
      console.log('❌ Company not found');
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Update company profile
    const { data: updatedCompany, error: updateError } = await supabaseAdmin
      .from('companies')
      .update({
        company_name: body.company_name,
        email: body.email,
        phone: body.phone,
        website: body.website,
        industry: body.industry,
        description: body.description,
        company_size: body.company_size,
        company_logo: body.company_logo,
        // Location fields
        address_1: body.address_1,
        city_1: body.city_1,
        state_1: body.state_1,
        is_headquarters_1: body.is_headquarters_1,
        address_2: body.address_2,
        city_2: body.city_2,
        state_2: body.state_2,
        is_headquarters_2: body.is_headquarters_2,
        address_3: body.address_3,
        city_3: body.city_3,
        state_3: body.state_3,
        is_headquarters_3: body.is_headquarters_3,
        address_4: body.address_4,
        city_4: body.city_4,
        state_4: body.state_4,
        is_headquarters_4: body.is_headquarters_4,
        address_5: body.address_5,
        city_5: body.city_5,
        state_5: body.state_5,
        is_headquarters_5: body.is_headquarters_5,
        address_6: body.address_6,
        city_6: body.city_6,
        state_6: body.state_6,
        is_headquarters_6: body.is_headquarters_6,
        address_7: body.address_7,
        city_7: body.city_7,
        state_7: body.state_7,
        is_headquarters_7: body.is_headquarters_7,
        address_8: body.address_8,
        city_8: body.city_8,
        state_8: body.state_8,
        is_headquarters_8: body.is_headquarters_8,
        address_9: body.address_9,
        city_9: body.city_9,
        state_9: body.state_9,
        is_headquarters_9: body.is_headquarters_9,
        address_10: body.address_10,
        city_10: body.city_10,
        state_10: body.state_10,
        is_headquarters_10: body.is_headquarters_10,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .maybeSingle();

    if (updateError) {
      console.log('❌ Error updating company:', updateError);
      return NextResponse.json({ error: 'Failed to update company', details: updateError.message }, { status: 500 });
    }

    if (!updatedCompany) {
      console.log('❌ No company was updated');
      return NextResponse.json({ error: 'No company was updated' }, { status: 404 });
    }

    console.log('✅ Company updated successfully:', updatedCompany);
    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 