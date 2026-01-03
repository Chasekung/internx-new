import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Global auth state management
let authCheckInProgress = false;
let lastAuthCheck = 0;
const AUTH_CHECK_COOLDOWN = 2000; // 2 seconds

export const authUtils = {
  // Debounced auth check to prevent rapid successive requests
  async checkAuthStatus() {
    const now = Date.now();
    
    // Prevent concurrent auth checks
    if (authCheckInProgress) {
      console.log('Auth check already in progress, skipping...');
      return null;
    }
    
    // Debounce auth checks
    if (now - lastAuthCheck < AUTH_CHECK_COOLDOWN) {
      console.log('Auth check too soon, skipping...');
      return null;
    }
    
    lastAuthCheck = now;
    authCheckInProgress = true;
    
    try {
      const supabase = createClientComponentClient();
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        return { isSignedIn: false, user: null };
      }

      const user = JSON.parse(userStr);
      
      // First try to get the current session - this is more reliable
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        // Update localStorage with fresh token if different
        if (session.access_token !== token) {
          localStorage.setItem('token', session.access_token);
        }
        return { isSignedIn: true, user: { ...user, authUser: session.user } };
      }
      
      // If no session, try to verify the stored token with timeout
      const authPromise = supabase.auth.getUser(token);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 5000)
      );
      
      try {
      const { data: { user: authUser }, error: authError } = await Promise.race([
        authPromise,
        timeoutPromise
      ]) as any;
      
        if (authError) {
          // Only clear tokens on definitive auth errors, not network issues
          if (authError.message?.includes('invalid') || 
              authError.message?.includes('expired') ||
              authError.status === 401) {
            console.log('Token invalid or expired, clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return { isSignedIn: false, user: null };
          }
          // For other errors (network, etc.), assume still logged in
          console.log('Auth verification failed, but keeping session:', authError.message);
          return { isSignedIn: true, user };
        }
        
        if (!authUser) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { isSignedIn: false, user: null };
      }

      return { isSignedIn: true, user: { ...user, authUser } };
      } catch (timeoutError) {
        // On timeout, don't clear tokens - just assume still logged in
        console.log('Auth check timed out, assuming still logged in');
        return { isSignedIn: true, user };
      }
    } catch (error) {
      // Don't clear tokens on general errors - could be network issues
      console.error('Auth check error (keeping session):', error);
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return { isSignedIn: true, user };
        } catch {
          return { isSignedIn: false, user: null };
        }
      }
      return { isSignedIn: false, user: null };
    } finally {
      authCheckInProgress = false;
    }
  },

  // Debounced event handlers
  createDebouncedHandler(callback: () => void, delay: number = 500) {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(callback, delay);
    };
  },

  // Clear auth data and optionally redirect
  clearAuthData(shouldRedirect: boolean = false, userType: 'INTERN' | 'COMPANY' = 'INTERN') {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('authStateChange'));
      
      if (shouldRedirect) {
        this.handleAuthFailure(userType);
      }
    }
  },

  // Set auth data
  setAuthData(token: string, user: any) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    window.dispatchEvent(new Event('authStateChange'));
  },

  // Auto-redirect helper for authentication failures
  handleAuthFailure(userType: 'INTERN' | 'COMPANY' = 'INTERN') {
    if (typeof window === 'undefined') return false;
    
    const currentPath = window.location.pathname;
    
    if (userType === 'COMPANY') {
      // Company user protection
      const isOnProtectedCompanyPage = currentPath.startsWith('/company') && 
        currentPath !== '/company' && // Exclude public landing page
        !currentPath.includes('/company-sign-in') && 
        !currentPath.includes('/company-get-started') &&
        !currentPath.includes('/company-forgot-password') &&
        !currentPath.includes('/company-reset-password');
      
      if (isOnProtectedCompanyPage) {
        console.log('🔄 Company auth failed, redirecting to sign in...');
        window.location.href = '/company-sign-in';
        return true;
      }
    } else {
      // Intern user protection
      const protectedInternPaths = ['/intern-dash', '/edit-profile', '/messaging', '/apply'];
      const isOnProtectedInternPage = protectedInternPaths.some(path => currentPath.startsWith(path));
      
      if (isOnProtectedInternPage) {
        console.log('🔄 Intern auth failed, redirecting to sign in...');
        window.location.href = '/intern-sign-in';
        return true;
      }
    }
    
    return false;
  }
}; 