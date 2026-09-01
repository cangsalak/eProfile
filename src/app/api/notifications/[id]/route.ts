import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    const existing = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Verify ownership or admin
    if (existing.personnelId !== user.id && existing.personnelId !== 'ALL' && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    return NextResponse.json(notification);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = params;

    const existing = await prisma.notification.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Verify ownership or admin
    if (existing.personnelId !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.notification.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete notification' }, { status: 500 });
  }
}
