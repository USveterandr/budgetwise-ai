import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes are protected
const protectedRoutes = [
  '/dashboard',
  '/budget',
  '/transactions',
  '/investments',
  '/subscription',
  '/consultation',
  '/admin'
];

// Define which routes are for unauthenticated users only
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get user session (in a real implementation, you would get this from cookies or headers)
  const isLoggedIn = false; // Mock value - in real implementation, check session/JWT
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Check if the route is for unauthenticated users only
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Redirect authenticated users away from auth routes
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Redirect unauthenticated users to login page
  if (!isLoggedIn && isProtectedRoute) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};