import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Helper function to create admin client when needed
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
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
    const supabaseAdmin = getSupabaseAdmin();
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
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('❌ User not found:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Auth successful for user:', user.id);

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
    return NextResponse.json({ company });
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 API Debug - PUT /api/companies/profile called');
    
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
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

    // Prepare update data with all possible fields
    const updateData: any = {
      company_name: body.company_name,
      email: body.email,
      phone: body.phone,
      website: body.website,
      industry: body.industry,
      description: body.description,
      company_size: body.company_size,
      logo_url: body.logo_url,
      updated_at: new Date().toISOString()
    };

    // Add location fields if they exist
    for (let i = 1; i <= 10; i++) {
      if (body[`address_${i}`] !== undefined) {
        updateData[`address_${i}`] = body[`address_${i}`];
        updateData[`city_${i}`] = body[`city_${i}`];
        updateData[`state_${i}`] = body[`state_${i}`];
        updateData[`is_headquarters_${i}`] = body[`is_headquarters_${i}`];
      }
    }

    // Update company profile
    const supabaseAdmin = getSupabaseAdmin();
    const { data: updatedCompany, error: updateError } = await supabaseAdmin
      .from('companies')
      .update(updateData)
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
    return NextResponse.json({ company: updatedCompany });
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 