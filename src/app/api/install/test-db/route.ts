import { NextResponse } from 'next/server';
import { testDatabaseConnection, DbConnectionParams } from '@/lib/db-test';
import rateLimit from '@/lib/rate-limit';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 50,
});

// Allowed database ports only
const ALLOWED_DB_PORTS: Record<string, number[]> = {
  postgresql: [5432, 5433],
  mysql: [3306, 3307],
  sqlite: [],
};

/**
 * SSRF blocklist — private/internal IP ranges that must never be reachable
 * from a public-facing connection test endpoint.
 */
function isPrivateHost(host: string): boolean {
  const h = host.toLowerCase().trim();

  // Localhost variants
  if (['localhost', '::1', '[::1]'].includes(h)) return true;

  // IPv4 private ranges (RFC 1918 + loopback + link-local + APIPA)
  const privateRanges = [
    /^127\./,                          // 127.0.0.0/8  loopback
    /^10\./,                           // 10.0.0.0/8   RFC1918
    /^172\.(1[6-9]|2\d|3[01])\./,     // 172.16-31/12 RFC1918
    /^192\.168\./,                     // 192.168.0.0/16 RFC1918
    /^169\.254\./,                     // 169.254.0.0/16 link-local
    /^0\./,                            // 0.0.0.0/8
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // 100.64-127/10 CGNAT
    /^198\.(1[89])\./,                 // 198.18-19/15 benchmarking
    /^203\.0\.113\./,                  // TEST-NET-3
    /^240\./,                          // 240.0.0.0/4 reserved
    /^255\.255\.255\.255$/,            // broadcast
  ];

  // IPv6 private ranges
  const privateV6 = [
    /^::$/,           // unspecified
    /^fe80:/i,        // link-local
    /^fc00:/i,        // unique local
    /^fd[0-9a-f]{2}:/i, // unique local
  ];

  return privateRanges.some(r => r.test(h)) || privateV6.some(r => r.test(h));
}

/**
 * Validate connection string: reject local file references and private addresses.
 */
function isSafeConnectionString(cs: string): boolean {
  const lower = cs.toLowerCase();
  // Block file:// protocol and internal host references
  if (lower.startsWith('file:')) return false;
  if (lower.includes('@localhost') || lower.includes('@127.') || lower.includes('@::1')) return false;
  if (lower.includes('@10.') || lower.includes('@172.') || lower.includes('@192.168.')) return false;
  return true;
}

export async function POST(req: Request) {
  const response = NextResponse.next();

  // ── Rate limit ──────────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  try {
    await limiter.check(response, 10, ip);
  } catch {
    return NextResponse.json(
      { error: 'Too many connection test requests. Please wait a moment.' },
      { status: 429, headers: response.headers }
    );
  }

  // ── Block after install ─────────────────────────────────────────────────────
  try {
    const installed = await prisma.systemSetting.findUnique({ where: { key: 'isInstalled' } });
    if (installed?.value === 'true') {
      return NextResponse.json(
        { error: 'System is already installed. This endpoint is disabled.' },
        { status: 403 }
      );
    }
  } catch {
    // If DB is not yet set up (first install), allow through
  }

  // ── Setup secret header ────────────────────────────────────────────────────
  const setupSecret = process.env.ADMIN_SETUP_SECRET;
  if (setupSecret) {
    const providedSecret = req.headers.get('x-setup-secret');
    if (providedSecret !== setupSecret) {
      return NextResponse.json({ error: 'Unauthorized: Invalid setup secret.' }, { status: 401 });
    }
  }

  // ── Parse + validate body ──────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const { provider, host, port, database, user, password, connectionString } = body as Record<string, unknown>;

  // Provider allowlist
  if (!provider || !['sqlite', 'postgresql', 'mysql'].includes(String(provider))) {
    return NextResponse.json(
      { error: 'Invalid database provider. Supported: sqlite, postgresql, mysql' },
      { status: 400 }
    );
  }

  const providerStr = String(provider) as 'sqlite' | 'postgresql' | 'mysql';

  // Connection string validation
  if (connectionString) {
    const cs = String(connectionString).trim();
    if (!isSafeConnectionString(cs)) {
      return NextResponse.json(
        { error: 'Connection string references a private/local address and is not allowed.' },
        { status: 400 }
      );
    }
  }

  // Host validation (skip for sqlite)
  if (providerStr !== 'sqlite') {
    if (!host || typeof host !== 'string' || host.trim() === '') {
      return NextResponse.json({ error: 'Host is required for PostgreSQL/MySQL.' }, { status: 400 });
    }

    const hostStr = String(host).trim();
    if (isPrivateHost(hostStr)) {
      return NextResponse.json(
        { error: 'Connections to private/internal network addresses are not allowed.' },
        { status: 400 }
      );
    }

    // Port validation
    if (port !== undefined) {
      const portNum = parseInt(String(port), 10);
      if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
        return NextResponse.json({ error: 'Port must be a number between 1 and 65535.' }, { status: 400 });
      }
      const allowedPorts = ALLOWED_DB_PORTS[providerStr];
      if (!allowedPorts.includes(portNum)) {
        return NextResponse.json(
          { error: `Port ${portNum} is not allowed for ${providerStr}. Use: ${allowedPorts.join(', ')}` },
          { status: 400 }
        );
      }
    }
  }

  // ── Execute test ───────────────────────────────────────────────────────────
  try {
    const params: DbConnectionParams = {
      provider: providerStr,
      host:             host             ? String(host).trim()                    : undefined,
      port:             port             ? parseInt(String(port), 10)             : undefined,
      database:         database         ? String(database).trim()                : undefined,
      user:             user             ? String(user).trim()                    : undefined,
      password:         password         ? String(password)                       : undefined,
      connectionString: connectionString ? String(connectionString).trim()        : undefined,
    };

    const result = await testDatabaseConnection(params);
    return NextResponse.json(result, { headers: response.headers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: `เกิดข้อผิดพลาดในการทดสอบ: ${message}` },
      { status: 500 }
    );
  }
}
