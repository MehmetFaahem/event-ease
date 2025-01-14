import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';
import { env } from '@/lib/config/env';

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/events/create',
  '/events/edit',
  '/profile',
];

// Routes that are only accessible to non-authenticated users
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the route is auth-only (login/register)
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  try {
    if (token) {
      // Verify token
      const decoded = verify(token, env.JWT_SECRET);

      // If token is valid and trying to access auth routes, redirect to dashboard
      if (isAuthRoute) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // Add user info to headers for API routes
      if (pathname.startsWith('/api/')) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('user', JSON.stringify(decoded));
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

      return NextResponse.next();
    }

    // No token but trying to access protected route
    if (isProtectedRoute) {
      const searchParams = new URLSearchParams({
        callbackUrl: pathname,
      });
      return NextResponse.redirect(
        new URL(`/login?${searchParams}`, request.url)
      );
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};