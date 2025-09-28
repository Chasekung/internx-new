import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const syncAuthState = async () => {
  try {
    const supabase = createClientComponentClient();
    
    // Get current Supabase session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return false;
    }

    if (!session) {
      // No session exists, clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    // Session exists, check if localStorage is in sync
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr || token !== session.access_token) {
      console.log('🔄 Syncing auth state - localStorage out of sync with Supabase session');
      
      // Get user data from Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('User error:', userError);
        return false;
      }

      // Determine user type and get profile data
      let userRole = 'INTERN';
      let profileData: any = null;

      // Check if user is a company
      const { data: companyData, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.id)
        .single();

      if (companyData && !companyError) {
        userRole = 'COMPANY';
        profileData = {
          id: user.id,
          email: user.email,
          role: 'COMPANY',
          companyName: companyData.company_name,
          contactName: companyData.contact_name
        };
      } else {
        // Check if user is an intern
        const { data: internData, error: internError } = await supabase
          .from('interns')
          .select('id, full_name')
          .eq('id', user.id)
          .single();

        if (internData && !internError) {
          userRole = 'INTERN';
          profileData = {
            ...user,
            role: 'INTERN',
            id: internData.id,
            full_name: internData.full_name
          };
        }
      }

      if (profileData) {
        // Update localStorage with synced data
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(profileData));
        
        // Trigger auth state change events
        window.dispatchEvent(new Event('authStateChange'));
        window.dispatchEvent(new Event('storage'));
        
        console.log('✅ Auth state synchronized successfully');
        return true;
      }
    }

    return true;
  } catch (error) {
    console.error('Auth sync error:', error);
    return false;
  }
};

// Auto-sync on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(syncAuthState, 1000); // Delay to ensure components are mounted
  });
}