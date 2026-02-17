import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from './server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { supabase, res } = createMiddlewareClient(request)

  // Refresh the session
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup')
  const isDashboard = request.nextUrl.pathname.startsWith('/(dashboard)') ||
                     request.nextUrl.pathname === '/dashboard'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')

  // Skip middleware for API routes (except protected ones)
  if (isApiRoute && !request.nextUrl.pathname.startsWith('/api/dashboard')) {
    return response
  }

  // Handle authentication logic
  if (!user) {
    // User is not authenticated
    if (isDashboard) {
      // Redirect to login if trying to access dashboard
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
    // Allow access to public routes
    return res
  } else {
    // User is authenticated
    if (isAuthRoute) {
      // Redirect authenticated users away from auth pages
      const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }
    // Allow access to protected routes
    return res
  }
}

// Middleware to protect routes and refresh sessions
export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request)
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to proceed
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}