import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  try {
    // Create the client inside the try/catch so missing envs never crash middleware
    const supabase = createMiddlewareClient({ req, res })

    // Only refresh session if it exists and is close to expiring
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Check if token is close to expiring (within 5 minutes)
      const expiresAt = session.expires_at
      const now = Math.floor(Date.now() / 1000)
      const fiveMinutes = 5 * 60
      
      if (expiresAt && (expiresAt - now) < fiveMinutes) {
        // Only refresh if token is close to expiring
        await supabase.auth.refreshSession()
      }
    }
  } catch (error) {
    // Silently handle auth errors in middleware to prevent hard failures
    console.log('Middleware auth check failed:', error)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     * - api routes (to prevent middleware from running on API calls)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 