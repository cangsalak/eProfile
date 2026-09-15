import { NextResponse } from 'next/server';
import { requireRole } from '@/modules/core';
import { scanAllApiRoutes } from '../lib/scanner';

export async function handleGetApiDocs(req: Request) {
  // Allow SUPER_ADMIN strictly to access API Documentation Reference
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
