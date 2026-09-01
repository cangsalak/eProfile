import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { scanAllApiRoutes } from '@/lib/api-docs/scanner';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // STRICT RULE: Only SUPER_ADMIN can access API Documentation Reference
  const auth = await requireRole(req, ['SUPER_ADMIN']);
  if (auth.error) return auth.error;

  try {
    const report = scanAllApiRoutes();
    return NextResponse.json({ success: true, data: report });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to scan API routes' },
      { status: 500 }
    );
  }
}
