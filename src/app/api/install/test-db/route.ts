import { NextResponse } from 'next/server';
import { testDatabaseConnection, DbConnectionParams, resolveAndValidateHost } from '@/lib/db-test';
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
  mysql:      [3306, 3307],
  sqlite:     [],
};

/**
 * Validate a connection string to reject local file references and obviously
 * private hosts in the URI.  Full DNS-based validation is done in db-test.ts
 * for field-based params; this is a lightweight guard for raw connection strings.
 */
function isSafeConnectionString(cs: string): boolean {
  const lower = cs.toLowerCase();
  if (lower.startsWith('file:'))                             return false;
  if (lower.includes('@localhost') || lower.includes('@::1')) return false;
  // Block RFC1918 literals in connection strings
  if (lower.includes('@127.') || lower.includes('@10.') ||
      lower.includes('@172.') || lower.includes('@192.168.') ||
      lower.includes('@169.254.'))                           return false;
  return true;
}

export async function POST(req: Request) {
  const response = NextResponse.next();

  // ── Rate limit ───────────────────────────────────────────────────────────────
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1';
  try {
    await limiter.check(response, 10, ip);
  } catch {
    return NextResponse.json(
      { error: 'Too many connection test requests. Please wait a moment.' },
      { status: 429, headers: response.headers }
    );
  }

  // ── Block after install ──────────────────────────────────────────────────────
  try {
    const installed = await prisma.systemSetting.findUnique({ where: { key: 'isInstalled' } });
    if (installed?.value === 'true') {
      return NextResponse.json(
        { error: 'System is already installed. This endpoint is disabled.' },
        { status: 403 }
      );
    }
  } catch {
    // DB not yet initialised — allow through
  }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  // ── Setup secret verification ────────────────────────────────────────────────
  const configuredSecret = process.env.ADMIN_SETUP_SECRET?.trim();
  if (configuredSecret && configuredSecret !== '') {
    const headerSecret = req.headers.get('x-setup-secret') || req.headers.get('x-admin-setup-secret');
    const bodySecret = typeof body.setupSecret === 'string' ? body.setupSecret.trim() : '';
    const providedSecret = (headerSecret || bodySecret || '').trim();
    if (!providedSecret || providedSecret !== configuredSecret) {
      return NextResponse.json({ error: 'รหัสลับการติดตั้งไม่ถูกต้อง (Invalid Setup Secret)' }, { status: 401 });
    }
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

  // Connection string — lightweight text guard
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

    // Port validation (done before async DNS so we fail-fast on bad ports)
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

    // DNS resolution + full CIDR-based IP validation (blocks decimal/hex IPs,
    // DNS rebinding, and domains that resolve to RFC1918 addresses)
    try {
      await resolveAndValidateHost(hostStr);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Host validation failed';
      return NextResponse.json(
        { error: `Connections to private/internal network addresses are not allowed. (${msg})` },
        { status: 400 }
      );
    }
  }

  // ── Execute test ─────────────────────────────────────────────────────────────
  try {
    const params: DbConnectionParams = {
      provider:         providerStr,
      host:             host             ? String(host).trim()             : undefined,
      port:             port             ? parseInt(String(port), 10)      : undefined,
      database:         database         ? String(database).trim()         : undefined,
      user:             user             ? String(user).trim()             : undefined,
      password:         password         ? String(password)                : undefined,
      connectionString: connectionString ? String(connectionString).trim() : undefined,
    };

    // testDatabaseConnection also calls resolveAndValidateHost internally,
    // so the TCP connect always uses the validated numeric IP.
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
