import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Email verification error:', error)
        return NextResponse.redirect(new URL('/auth/error?message=Email verification failed', requestUrl.origin))
      }

      // Get the user to check their role
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && user.user_metadata) {
        const role = user.user_metadata.role
        
        // Redirect based on role
        if (role === 'COMPANY') {
          return NextResponse.redirect(new URL('/company-sign-in?verified=true', requestUrl.origin))
        } else if (role === 'INTERN') {
          return NextResponse.redirect(new URL('/intern-sign-in?verified=true', requestUrl.origin))
        }
      }
      
      // Default redirect
      return NextResponse.redirect(new URL('/intern-sign-in?verified=true', requestUrl.origin))
      
    } catch (error) {
      console.error('Email verification callback error:', error)
      return NextResponse.redirect(new URL('/auth/error?message=Email verification failed', requestUrl.origin))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/error?message=Invalid verification link', requestUrl.origin))
}