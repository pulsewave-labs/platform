import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from './lib/supabase/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response to modify
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Create Supabase client for middleware
    const { supabase, res } = createMiddlewareClient(request)

    // Get current user session
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const pathname = url.pathname

    // Define route patterns
    const isAuthRoute = pathname.startsWith('/login') || 
                       pathname.startsWith('/signup') ||
                       pathname.startsWith('/forgot-password') ||
                       pathname.startsWith('/reset-password')
    
    const isDashboardRoute = pathname.startsWith('/dashboard') ||
                            pathname.match(/^\/\(dashboard\)/)
    
    const isApiRoute = pathname.startsWith('/api/')
    const isPublicRoute = pathname === '/' || 
                         pathname.startsWith('/api/waitlist') ||
                         pathname.startsWith('/_next') ||
                         pathname.startsWith('/favicon.ico') ||
                         pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

    // Skip authentication check for public routes and static assets
    if (isPublicRoute && !isDashboardRoute) {
      return res
    }

    // Skip authentication for certain API routes
    if (isApiRoute && !pathname.startsWith('/api/dashboard') && !pathname.startsWith('/api/protected')) {
      return res
    }

    // Handle authentication logic
    if (!user) {
      // User is not authenticated
      if (isDashboardRoute) {
        // Redirect to login if trying to access dashboard
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(loginUrl)
      }
      
      if (pathname.startsWith('/api/dashboard') || pathname.startsWith('/api/protected')) {
        // Return 401 for protected API routes
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      // Allow access to auth pages and other public routes
      return res
    } else {
      // User is authenticated
      if (isAuthRoute) {
        // Redirect authenticated users away from auth pages
        const redirectTo = url.searchParams.get('redirectTo') || '/dashboard'
        const redirectUrl = new URL(redirectTo, request.url)
        return NextResponse.redirect(redirectUrl)
      }
      
      // Allow access to protected routes
      return res
    }
  } catch (error) {
    console.error('Middleware error:', error)
    
    // On error, let the request proceed but log the error
    // This prevents the app from breaking if there's an issue with Supabase
    const response = NextResponse.next()
    response.headers.set('x-middleware-error', 'true')
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}