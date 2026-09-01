import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth-guards';

export async function GET(req: Request) {
  try {
    const { user, error: authError } = await requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notification history' }, { status: 500 });
  }
}
