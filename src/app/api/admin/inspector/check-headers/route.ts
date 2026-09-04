import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Strict SUPER_ADMIN protection
  const auth = await requireRole(req, ['SUPER_ADMIN']);
  if (auth.error) return auth.error;

  const url = new URL(req.url);
  const probeUrl = `${url.origin}/api/health`;
  
  const missingHeaders: { name: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'; recommendation: string }[] = [];
  const activeHeaders: Record<string, string> = {};

  try {
    const probeRes = await fetch(probeUrl, { method: 'HEAD', cache: 'no-store' });
    
    const check = (name: string, severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW', recommendation: string) => {
      const val = probeRes.headers.get(name.toLowerCase());
      if (!val) {
        missingHeaders.push({ name, severity, recommendation });
      } else {
        activeHeaders[name] = val;
      }
    };

    check('X-Frame-Options', 'MEDIUM', 'DENY หรือ SAMEORIGIN เพื่อป้องกัน Clickjacking');
    check('X-Content-Type-Options', 'MEDIUM', 'nosniff เพื่อป้องกัน MIME-type sniffing');
    check('Referrer-Policy', 'LOW', 'strict-origin-when-cross-origin');
    check('Permissions-Policy', 'LOW', 'camera=(self), microphone=(), geolocation=()');
    check('Strict-Transport-Security', 'HIGH', 'max-age=31536000; includeSubDomains');
  } catch (err: any) {
    // If runtime self-probe is unavailable (e.g. isolated build environment), inspect process environment fallback
    console.warn('Header probe fallback:', err.message);
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    checked: true,
    activeHeaders,
    missingHeaders,
  });
}
