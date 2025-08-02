import { NextRequest, NextResponse } from 'next/server';
import supabase from '@/lib/supabaseClient';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

// GET - Fetch all locations for a company
export async function GET(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    console.log('🔍 API Debug - GET /api/companies/locations called');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token extracted, length:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Auth successful for company:', user.id);

    // Get all locations for the company
    const { data: locations, error: locationsError } = await supabase
      .from('company_locations')
      .select('*')
      .eq('company_id', user.id)
      .order('created_at', { ascending: true });

    console.log('📊 Database query result - locations:', locations ? `Found ${locations.length} locations` : 'null');
    console.log('📊 Database query result - error:', locationsError);

    if (locationsError) {
      console.error('❌ Location fetch error:', locationsError);
      return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }

    console.log('✅ Locations fetched successfully');
    return NextResponse.json(locations);
  } catch (error) {
    console.error('💥 Error in GET /api/companies/locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Add a new location
export async function POST(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    console.log('�� API Debug - POST /api/companies/locations called');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token extracted, length:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Auth successful for company:', user.id);

    const body = await request.json();
    const { address, city, state, is_headquarters } = body;
    console.log('📝 Request body:', { address, city, state, is_headquarters });

    // Validate required fields
    if (!address || !city || !state) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if company already has 10 locations
    const { count, error: countError } = await supabase
      .from('company_locations')
      .select('*', { count: 'exact' })
      .eq('company_id', user.id);

    console.log('📊 Current location count:', count);
    
    if (countError) {
      console.error('❌ Count check error:', countError);
      return NextResponse.json({ error: 'Failed to check location count' }, { status: 500 });
    }

    if (count && count >= 10) {
      console.log('❌ Maximum location limit reached');
      return NextResponse.json({ error: 'Maximum number of locations (10) reached' }, { status: 400 });
    }

    // If this is marked as headquarters, update any existing headquarters
    if (is_headquarters) {
      console.log('🏢 Updating existing headquarters');
      await supabase
        .from('company_locations')
        .update({ is_headquarters: false })
        .eq('company_id', user.id)
        .eq('is_headquarters', true);
    }

    // Insert new location
    const { data: location, error: insertError } = await supabase
      .from('company_locations')
      .insert({
        company_id: user.id,
        address,
        city,
        state,
        is_headquarters: is_headquarters || false
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Location insert error:', insertError);
      return NextResponse.json({ error: 'Failed to add location' }, { status: 500 });
    }

    console.log('✅ Location added successfully:', location);
    return NextResponse.json(location);
  } catch (error) {
    console.error('💥 Error in POST /api/companies/locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update locations
export async function PUT(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    console.log('🔍 API Debug - PUT /api/companies/locations called');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token extracted, length:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Auth successful for company:', user.id);

    const body = await request.json();
    const { locations } = body;
    console.log('📝 Request body:', { locations });

    if (!Array.isArray(locations)) {
      console.log('❌ Invalid locations data - not an array');
      return NextResponse.json({ error: 'Invalid locations data' }, { status: 400 });
    }

    // First, ensure the table exists with proper RLS policies
    console.log('🔍 Checking and creating table if needed...');
    try {
      const { error: createTableError } = await supabaseAdmin.rpc('create_company_locations_table', {
        sql_commands: `
          CREATE TABLE IF NOT EXISTS company_locations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
            address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            state VARCHAR(50) NOT NULL,
            is_headquarters BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Enable RLS
          ALTER TABLE company_locations ENABLE ROW LEVEL SECURITY;

          -- Drop existing policies if they exist
          DROP POLICY IF EXISTS "Companies can view their own locations" ON company_locations;
          DROP POLICY IF EXISTS "Companies can insert their own locations" ON company_locations;
          DROP POLICY IF EXISTS "Companies can update their own locations" ON company_locations;
          DROP POLICY IF EXISTS "Companies can delete their own locations" ON company_locations;

          -- Create separate policies for each operation
          CREATE POLICY "Companies can view their own locations" 
            ON company_locations FOR SELECT 
            USING (auth.uid() = company_id);

          CREATE POLICY "Companies can insert their own locations" 
            ON company_locations FOR INSERT 
            WITH CHECK (auth.uid() = company_id);

          CREATE POLICY "Companies can update their own locations" 
            ON company_locations FOR UPDATE 
            USING (auth.uid() = company_id)
            WITH CHECK (auth.uid() = company_id);

          CREATE POLICY "Companies can delete their own locations" 
            ON company_locations FOR DELETE 
            USING (auth.uid() = company_id);

          -- Create indexes
          CREATE INDEX IF NOT EXISTS idx_company_locations_company_id ON company_locations(company_id);
        `
      });

      if (createTableError) {
        console.error('❌ Error in table setup:', createTableError);
        // Don't return error here, try to proceed with the operation
      } else {
        console.log('✅ Table and policies set up successfully');
      }
    } catch (setupError) {
      console.error('❌ Error in table setup:', setupError);
      // Don't return error here, try to proceed with the operation
    }

    // Validate each location
    console.log('🔍 Validating locations...');
    for (const location of locations) {
      const { address, city, state } = location;
      if (!address?.trim() || !city?.trim() || !state?.trim()) {
        console.log('❌ Missing required fields in location:', location);
        return NextResponse.json({ 
          error: 'Missing required fields. Address, city, and state are required for each location.',
          location 
        }, { status: 400 });
      }
    }

    // Get existing locations for this company
    console.log('🔍 Fetching existing locations...');
    const { data: existingLocations, error: fetchError } = await supabase
      .from('company_locations')
      .select('id')
      .eq('company_id', user.id);

    if (fetchError) {
      console.error('❌ Error fetching existing locations:', fetchError);
      return NextResponse.json({ 
        error: 'Failed to fetch existing locations', 
        details: fetchError 
      }, { status: 500 });
    }

    const existingIds = new Set(existingLocations?.map(loc => loc.id) || []);
    const newLocations = locations.filter(loc => !loc.id);
    const updatedLocations = locations.filter(loc => loc.id && existingIds.has(loc.id));
    const deletedIds = Array.from(existingIds).filter(id => !locations.some(loc => loc.id === id));

    console.log('📊 Locations to process:', {
      new: newLocations.length,
      updated: updatedLocations.length,
      deleted: deletedIds.length,
      existing: existingIds.size
    });

    // Delete removed locations
    if (deletedIds.length > 0) {
      console.log('🗑️ Deleting locations:', deletedIds);
      const { error: deleteError } = await supabase
        .from('company_locations')
        .delete()
        .in('id', deletedIds)
        .eq('company_id', user.id);

      if (deleteError) {
        console.error('❌ Error deleting locations:', deleteError);
        return NextResponse.json({ 
          error: 'Failed to delete locations', 
          details: deleteError 
        }, { status: 500 });
      }
      console.log('✅ Deleted locations:', deletedIds);
    }

    // Update existing locations
    for (const location of updatedLocations) {
      console.log('📝 Updating location:', location);
      const { error: updateError } = await supabase
        .from('company_locations')
        .update({
          address: location.address.trim(),
          city: location.city.trim(),
          state: location.state.trim(),
          is_headquarters: location.is_headquarters || false,
          updated_at: new Date().toISOString()
        })
        .eq('id', location.id)
        .eq('company_id', user.id);

      if (updateError) {
        console.error('❌ Error updating location:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update locations', 
          details: updateError 
        }, { status: 500 });
      }
    }
    console.log('✅ Updated locations:', updatedLocations.map(loc => loc.id));

    // Insert new locations
    if (newLocations.length > 0) {
      console.log('📝 Inserting new locations:', newLocations);
      const { error: insertError } = await supabase
        .from('company_locations')
        .insert(
          newLocations.map(loc => ({
            company_id: user.id,
            address: loc.address.trim(),
            city: loc.city.trim(),
            state: loc.state.trim(),
            is_headquarters: loc.is_headquarters || false
          }))
        );

      if (insertError) {
        console.error('❌ Error inserting locations:', insertError);
        return NextResponse.json({ 
          error: 'Failed to add new locations', 
          details: insertError 
        }, { status: 500 });
      }
      console.log('✅ Inserted new locations:', newLocations.length);
    }

    // Fetch and return updated locations
    console.log('🔍 Fetching final locations list...');
    const { data: updatedLocationsList, error: fetchFinalError } = await supabase
      .from('company_locations')
      .select('*')
      .eq('company_id', user.id)
      .order('created_at', { ascending: true });

    if (fetchFinalError) {
      console.error('❌ Error fetching updated locations:', fetchFinalError);
      return NextResponse.json({ 
        error: 'Failed to fetch updated locations', 
        details: fetchFinalError 
      }, { status: 500 });
    }

    console.log('✅ Final locations list:', updatedLocationsList);
    return NextResponse.json(updatedLocationsList);
  } catch (error) {
    console.error('💥 Error in PUT /api/companies/locations:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : error 
    }, { status: 500 });
  }
}

// DELETE - Remove a location
export async function DELETE(request: NextRequest) {
  try {
    // Check if Supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized - missing environment variables');
      return NextResponse.json({ 
        error: 'Database connection not available' 
      }, { status: 500 });
    }

    console.log('🔍 API Debug - DELETE /api/companies/locations called');
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('🔑 Token extracted, length:', token.length);
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('❌ Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    console.log('✅ Auth successful for company:', user.id);

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('id');

    if (!locationId) {
      console.log('❌ No location ID provided');
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    // Verify the location belongs to the company
    const { data: existingLocation, error: checkError } = await supabase
      .from('company_locations')
      .select('*')
      .eq('id', locationId)
      .eq('company_id', user.id)
      .single();

    if (checkError || !existingLocation) {
      console.log('❌ Location not found or unauthorized');
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Delete the location
    const { error: deleteError } = await supabase
      .from('company_locations')
      .delete()
      .eq('id', locationId)
      .eq('company_id', user.id);

    if (deleteError) {
      console.error('❌ Error deleting location:', deleteError);
      return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }

    console.log('✅ Location deleted successfully');
    return NextResponse.json({ message: 'Location deleted successfully' });
  } catch (error) {
    console.error('💥 Error in DELETE /api/companies/locations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 