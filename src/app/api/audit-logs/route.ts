import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await requirePermission(req, 'VIEW_AUDIT_LOGS');
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const take = parseInt(searchParams.get('take') || '100');

    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: take,
      include: {
        personnel: {
          select: { firstName: true, lastName: true, username: true }
        }
      }
    });

    return NextResponse.json(logs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
