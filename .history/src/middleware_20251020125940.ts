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

// Mock function to check if user is authenticated
// In a real implementation, you would check the session/token from cookies
function isAuthenticated(request: NextRequest): boolean {
  // Check for auth token in cookies (mock implementation)
  const token = request.cookies.get('auth-token');
  return !!token; // Return true if token exists
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if user is authenticated
  const isLoggedIn = isAuthenticated(request);
  
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