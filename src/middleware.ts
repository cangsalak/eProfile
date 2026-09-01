import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

// Public API endpoints that don't require JWT authentication
const publicApiPaths = [
  '/api/auth/login',
  '/api/auth/setup-admin',
  '/api/install',
  '/api/health',
  '/api/auth/forgot-password',
  '/api/auth/me',
];
const publicApiPrefixes = ['/api/verify/'];

// Protected member page prefixes
const protectedPagePrefixes = [
  '/dashboard',
  '/manage',
  '/directory',
  '/calendar',
  '/leave',
  '/settings',
  '/profile',
  '/notifications',
  '/setup',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, encodedSecret);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // 1. If user is authenticated and tries to visit auth pages (/login, /register), redirect to /dashboard
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. For protected member page routes, require authentication
  const isProtectedPage = protectedPagePrefixes.some(
    prefix => pathname === prefix || pathname.startsWith(prefix + '/')
  );

  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. For API routes:
  if (pathname.startsWith('/api/')) {
    // Allow exact public API paths
    if (publicApiPaths.includes(pathname)) {
      return NextResponse.next();
    }

    // Allow public API prefixes
    if (publicApiPrefixes.some(prefix => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }

    // Exception: Allow GET /api/settings for basic non-sensitive settings used by public verify page
    if (pathname === '/api/settings' && request.method === 'GET') {
      return NextResponse.next();
    }

    // Verify JWT for all other API routes
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, images, fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
