import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-super-secret-jwt-key-2026-change-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

// Define which routes to protect
const protectedApiRoutes = ['/api/personnel', '/api/settings', '/api/departments', '/api/vehicles'];
const publicPaths = ['/api/auth/login', '/api/auth/setup-admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes for now
  if (pathname.startsWith('/api/')) {
    // Allow public API paths
    if (publicPaths.some(path => pathname.startsWith(path))) {
      return NextResponse.next();
    }
    
    // Exception: Allow GET /api/settings for basic non-sensitive settings used by public verify page
    if (pathname === '/api/settings' && request.method === 'GET') {
       return NextResponse.next();
    }

    // Exception: Allow GET /api/personnel/[id] for the verify page
    const isPersonnelIdRoute = pathname.match(/^\/api\/personnel\/[^/]+$/);
    if (isPersonnelIdRoute && request.method === 'GET') {
       // We can allow this and let the verify page itself check allowPublicView via /api/settings
       return NextResponse.next();
    }

    // Verify JWT for all other protected API routes
    if (protectedApiRoutes.some(path => pathname.startsWith(path))) {
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
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
