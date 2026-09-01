import { NextResponse } from 'next/server';
import { testDatabaseConnection, DbConnectionParams } from '@/lib/db-test';
import rateLimit from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 50,
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimitResponse = NextResponse.next();
    try {
      await limiter.check(rateLimitResponse, 30, ip);
    } catch {
      return NextResponse.json({ error: 'Too many connection test requests. Please wait a moment.' }, { status: 429 });
    }

    const body = await req.json();
    const { provider, host, port, database, user, password, connectionString } = body;

    if (!provider || !['sqlite', 'postgresql', 'mysql'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid database provider. Supported: sqlite, postgresql, mysql' }, { status: 400 });
    }

    const params: DbConnectionParams = {
      provider,
      host: host ? String(host).trim() : undefined,
      port: port ? parseInt(String(port), 10) : undefined,
      database: database ? String(database).trim() : undefined,
      user: user ? String(user).trim() : undefined,
      password: password ? String(password) : undefined,
      connectionString: connectionString ? String(connectionString).trim() : undefined,
    };

    const result = await testDatabaseConnection(params);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: `เกิดข้อผิดพลาดในการทดสอบ: ${err?.message || 'Unknown error'}`
    }, { status: 500 });
  }
}
