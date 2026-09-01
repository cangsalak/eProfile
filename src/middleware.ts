import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not configured');
}
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

// Define which routes to allow without auth
const publicPaths = ['/api/auth/login', '/api/auth/setup-admin', '/api/install', '/api/health', '/api/auth/forgot-password'];
const publicPrefixes = ['/api/verify/'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes
  if (pathname.startsWith('/api/')) {
    // Allow exact public API paths
    if (publicPaths.includes(pathname)) {
      return NextResponse.next();
    }
    
    // Allow public API prefixes
    if (publicPrefixes.some(prefix => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }
    
    // Exception: Allow GET /api/settings for basic non-sensitive settings used by public verify page
    if (pathname === '/api/settings' && request.method === 'GET') {
       return NextResponse.next();
    }

    // Verify JWT for all other API routes
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
      await jwtVerify(token, encodedSecret);
      return NextResponse.next();
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
