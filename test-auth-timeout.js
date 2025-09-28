// Quick test to check Supabase auth timeout
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bhoudamowgpsbwwmmuay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJob3VkYW1vd2dwc2J3d21tdWF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNDY3MzUsImV4cCI6MjA2NTkyMjczNX0.erHJkM5uq0om5ZxM-dy8XH5mSAr6q_nFUtfuIIaVfyw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Supabase auth connection...');
  
  const startTime = Date.now();
  
  try {
    // Test with a fake email/password to see response time
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrongpassword123'
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Auth request took: ${duration}ms`);
    console.log('Error (expected):', error?.message || 'No error');
    
  } catch (err) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`Auth request failed after: ${duration}ms`);
    console.log('Error:', err.message);
  }
}

testAuth();