import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create Supabase client when needed
function getSupabaseClient() {
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Profile photo API - Environment check:');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function POST(request: NextRequest) {
  console.log('Profile photo upload request received');
  
  try {
    const supabase = getSupabaseClient();

    const authHeader = request.headers.get('authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    console.log('Token extracted, length:', token.length);
    
    // Verify the token and get user
    console.log('Verifying token with Supabase...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.log('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    
    console.log('User authenticated:', user.id);

    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    console.log('File received:', { name: file.name, size: file.size, type: file.type });

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Create a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${user.id}_${timestamp}.${fileExtension}`;
    const filePath = `profile-photos/${fileName}`;
    
    console.log('Uploading to path:', filePath);

    // First, try to create the bucket if it doesn't exist
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('uploads', {
        public: true,
        allowedMimeTypes: ['image/*'],
        fileSizeLimit: 5242880 // 5MB
      });
      
      if (bucketError && bucketError.message !== 'Bucket already exists') {
        console.log('Bucket creation error:', bucketError);
      } else {
        console.log('Bucket created or already exists');
      }
    } catch (bucketError) {
      console.log('Bucket creation failed:', bucketError);
    }

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) {
      console.log('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    console.log('File uploaded successfully:', uploadData);

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    console.log('Public URL generated:', publicUrl);

    // Update the user's profile with the new photo URL
    const { error: updateError } = await supabase
      .from('interns')
      .update({ profile_photo_url: publicUrl })
      .eq('id', user.id);

    if (updateError) {
      console.log('Database update error:', updateError);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    console.log('Profile updated successfully');

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      message: 'Profile photo uploaded successfully' 
    });

  } catch (error) {
    console.error('Profile photo upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 