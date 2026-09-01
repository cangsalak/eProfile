import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth-guards';
import { scanProjectPageRoutes } from '@/lib/inspector/route-scanner';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // STRICT RULE: Only SUPER_ADMIN can discover system routes for diagnostic inspection
  const auth = await requireRole(req, ['SUPER_ADMIN']);
  if (auth.error) return auth.error;

  try {
    const routes = scanProjectPageRoutes();
    return NextResponse.json({
      success: true,
      total: routes.length,
      routes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to dynamically discover project routes' },
      { status: 500 }
    );
  }
}
