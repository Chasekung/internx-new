import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

/**
 * Utility functions for handling legacy users who were logged in before email verification was enforced
 */

export interface LegacyUserCheck {
  isLegacyUser: boolean;
  shouldBypassEmailVerification: boolean;
  reason?: string;
}

/**
 * Check if a user should bypass email verification
 * This applies to users who:
 * 1. Already have valid sessions stored in localStorage
 * 2. Were created before email verification was enforced
 * 3. Are currently authenticated with valid tokens
 */
export async function checkLegacyUserStatus(userId: string): Promise<LegacyUserCheck> {
  try {
    // Check if user data exists in localStorage (indicates they were previously logged in)
    // Only check localStorage if we're in a browser environment
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      if (storedUser && storedToken) {
        try {
          const userData = JSON.parse(storedUser);
          if (userData.id === userId) {
            return {
              isLegacyUser: true,
              shouldBypassEmailVerification: true,
              reason: 'User has existing valid session in localStorage'
            };
          }
        } catch (e) {
          console.warn('Failed to parse stored user data:', e);
        }
      }
    }

    // Check if user has a valid current session
    const supabase = createClientComponentClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (!error && session && session.user.id === userId) {
      return {
        isLegacyUser: true,
        shouldBypassEmailVerification: true,
        reason: 'User has valid current session'
      };
    }

    // Check if user exists in our database (indicates they were created before)
    // We'll check both interns and companies tables
    const { data: internData } = await supabase
      .from('interns')
      .select('id, created_at')
      .eq('id', userId)
      .single();

    const { data: companyData } = await supabase
      .from('companies')
      .select('id, created_at')
      .eq('id', userId)
      .single();

    if (internData || companyData) {
      const userData = internData || companyData;
      const createdAt = new Date(userData.created_at);
      const now = new Date();
      
      // If user was created more than 1 hour ago, consider them legacy
      // This gives a buffer for the email verification enforcement
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceCreation > 1) {
        return {
          isLegacyUser: true,
          shouldBypassEmailVerification: true,
          reason: `User account created ${Math.round(hoursSinceCreation)} hours ago, before email verification enforcement`
        };
      }
    }

    return {
      isLegacyUser: false,
      shouldBypassEmailVerification: false,
      reason: 'New user, email verification required'
    };

  } catch (error) {
    console.error('Error checking legacy user status:', error);
    // In case of error, default to requiring email verification for safety
    return {
      isLegacyUser: false,
      shouldBypassEmailVerification: false,
      reason: 'Error checking user status, defaulting to email verification required'
    };
  }
}

/**
 * Enhanced authentication check that handles legacy users
 */
export async function authenticateWithLegacySupport(
  email: string, 
  password: string,
  userType: 'intern' | 'company' = 'intern'
) {
  const supabase = createClientComponentClient();
  
  try {
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // If it's an email verification error, check if user is legacy
      if (error.message?.includes('email not confirmed') || error.message?.includes('Email not confirmed')) {
        console.log('Email verification error detected, checking legacy status...');
        
        // Try to get user info even without confirmed email
        // This is a bit tricky since Supabase won't return user data for unconfirmed emails
        // We'll need to check our database directly
        
        const { data: userData } = await supabase
          .from(userType === 'intern' ? 'interns' : 'companies')
          .select('id, email, created_at')
          .eq('email', email)
          .single();

        if (userData) {
          const legacyCheck = await checkLegacyUserStatus(userData.id);
          
          if (legacyCheck.shouldBypassEmailVerification) {
            console.log(`Bypassing email verification for legacy user: ${legacyCheck.reason}`);
            
            // For legacy users, we'll manually confirm their email and then sign them in
            // Note: This requires admin privileges, so we'll need to handle this server-side
            return {
              data: null,
              error: null,
              isLegacyUser: true,
              legacyCheck,
              userId: userData.id,
              email: userData.email
            };
          }
        }
      }
      
      return { data: null, error, isLegacyUser: false };
    }

    // Normal successful authentication
    if (data.user && !data.user.email_confirmed_at) {
      const legacyCheck = await checkLegacyUserStatus(data.user.id);
      
      if (legacyCheck.shouldBypassEmailVerification) {
        console.log(`Legacy user detected, allowing login: ${legacyCheck.reason}`);
        return { 
          data, 
          error: null, 
          isLegacyUser: true, 
          legacyCheck,
          bypassEmailVerification: true 
        };
      }
    }

    return { data, error: null, isLegacyUser: false };

  } catch (error) {
    console.error('Authentication error:', error);
    return { data: null, error, isLegacyUser: false };
  }
}