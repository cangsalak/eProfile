import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { ModuleRegistry } from '@/modules/core/registry';

/*
 * ============================================================
 * ⚠️  DEVELOPER CREDIT INTEGRITY CHECK — DO NOT REMOVE ⚠️
 * ============================================================
 * ระบบจะตรวจสอบความสมบูรณ์ของข้อมูลผู้พัฒนาระบบ
 * หากถูกลบหรือแก้ไข ระบบจะหยุดทำงานทันที
 * ============================================================
 */
import { CREDIT_INTEGRITY_HASH, DEVELOPER_CREDIT } from '@/modules/core/lib/developer-credit';

// Verify the developer credit integrity token at module load time
const _creditStr = `${DEVELOPER_CREDIT.name}:${DEVELOPER_CREDIT.phone}:${DEVELOPER_CREDIT.email}:${DEVELOPER_CREDIT.bankRef}`;
if (!CREDIT_INTEGRITY_HASH || !_creditStr || !DEVELOPER_CREDIT.name) {
  throw new Error('[SYSTEM] Developer credit integrity check failed. System halted.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'eprofile-jwt-default-secret-change-in-production-at-least-32-bytes';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

// Public API endpoints that don't require JWT authentication
const publicApiPaths = [
  '/api/auth/login',
  '/api/modules/auth/login',
  '/api/auth/setup-admin',
  '/api/modules/auth/setup-admin',
  '/api/install',
  '/api/modules/install',
  '/api/install/test-db',
  '/api/modules/install/test-db',
  '/api/health',
  '/api/auth/forgot-password',
  '/api/modules/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/modules/auth/reset-password',
  '/api/auth/me',
  '/api/modules/auth/me',
  '/api/calendar/feed',
  '/api/modules/calendar/feed',
];
const publicApiPrefixes = ['/api/verify/', '/api/modules/badges/verify/'];

// Protected root page prefixes (core non-module routes)
const protectedPagePrefixes = [
  '/modules',
  '/print',
  '/manage',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  // ============================================================
  // ⚠️  SHA-256 INTEGRITY GUARD — DO NOT REMOVE ⚠️
  // Computes SHA-256 of credit string at runtime and compares
  // against the hardcoded expected hash. Any modification to
  // DEVELOPER_CREDIT fields will cause a mismatch → 503.
  // ============================================================
  try {
    const creditStr = `${DEVELOPER_CREDIT.name}:${DEVELOPER_CREDIT.phone}:${DEVELOPER_CREDIT.email}:${DEVELOPER_CREDIT.bankRef}`;
    const encoded = new TextEncoder().encode(creditStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (computedHash !== CREDIT_INTEGRITY_HASH) {
      return new NextResponse(
        'Service Unavailable: System integrity verification failed. Contact the developer.',
        { status: 503 }
      );
    }
  } catch {
    return new NextResponse(
      'Service Unavailable: System integrity check could not be completed.',
      { status: 503 }
    );
  }

  let isAuthenticated = false;
  if (token) {
    try {
      await jwtVerify(token, encodedSecret);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // 0. Dynamic Module Legacy Redirects
  const legacyDest = ModuleRegistry.getLegacyRedirect(pathname);
  if (legacyDest) {
    const redirectUrl = new URL(legacyDest, request.url);
    redirectUrl.search = request.nextUrl.search;
    return NextResponse.redirect(redirectUrl);
  }

  // 1. If user is authenticated and tries to visit auth pages (/login, /register), redirect to /modules/users
  if (isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/modules/users', request.url));
  }

  // 2. For protected member page routes, require authentication
  const isProtectedPage =
    protectedPagePrefixes.some(
      prefix => pathname === prefix || pathname.startsWith(prefix + '/')
    ) ||
    ModuleRegistry.getAllModules().some(
      m => pathname === `/${m.id}` || pathname.startsWith(`/${m.id}/`)
    );

  if (isProtectedPage && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. For API routes authentication & dynamic rewriting:
  if (pathname.startsWith('/api/')) {
    // Determine if there is a dynamic rewrite destination for this API path
    let effectivePath = pathname;
    const customRewrite = ModuleRegistry.getApiRewrite(pathname);
    if (customRewrite) {
      effectivePath = customRewrite;
    } else if (!pathname.startsWith('/api/modules/')) {
      // Check standard module prefix rewrite: /api/<moduleId>/<path> -> /api/modules/<moduleId>/<path>
      const topApiFolder = pathname.replace(/^\/api\//, '').split('/')[0];
      const apiModule = ModuleRegistry.getAllModules().find(m => m.id === topApiFolder);
      if (apiModule) {
        const subPath = pathname.substring(`/api/${apiModule.id}`.length);
        effectivePath = `/api/modules/${apiModule.id}${subPath}`;
      }
    }

    // Check public API endpoints
    const isPublic =
      publicApiPaths.includes(pathname) ||
      publicApiPaths.includes(effectivePath) ||
      publicApiPrefixes.some(prefix => pathname.startsWith(prefix) || effectivePath.startsWith(prefix)) ||
      ((pathname === '/api/settings' || pathname === '/api/modules' || pathname === '/api/services' ||
        effectivePath === '/api/modules/settings' || effectivePath === '/api/modules/module-manager') &&
        request.method === 'GET');

    // Verify JWT for protected API routes
    if (!isPublic) {
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
      }

      if (!isAuthenticated) {
        return NextResponse.json({ error: 'Unauthorized: Invalid or expired token' }, { status: 401 });
      }
    }

    // If API route was rewritten to dynamic module endpoint, rewrite request
    if (effectivePath !== pathname) {
      const destinationUrl = new URL(effectivePath, request.url);
      destinationUrl.search = request.nextUrl.search;
      return NextResponse.rewrite(destinationUrl);
    }

    return NextResponse.next();
  }

  // 4. Dynamic Module Page rewriting (/<moduleId>/<path> -> /modules/<moduleId>/<path>)
  const matchingModule = ModuleRegistry.getAllModules().find(
    m => pathname === `/${m.id}` || pathname.startsWith(`/${m.id}/`)
  );
  if (matchingModule && !pathname.startsWith('/modules/')) {
    const subPath = pathname.substring(`/${matchingModule.id}`.length);
    const destinationUrl = new URL(`/modules/${matchingModule.id}${subPath}`, request.url);
    destinationUrl.search = request.nextUrl.search;
    return NextResponse.rewrite(destinationUrl);
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
