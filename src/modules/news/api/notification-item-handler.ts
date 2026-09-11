import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';

export async function handleUpdateSingleNotification(
  req: Request,
  context?: { params?: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = typeof context?.params?.id === 'string' ? context.params.id : '';
    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: 'รหัสการแจ้งเตือนไม่ถูกต้อง' }, { status: 400 });
    }

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบการแจ้งเตือน' }, { status: 404 });
    }

    const isGlobal = existing.personnelId === 'ALL' || existing.personnelId === 'ADMIN';
    const isAdminOnly = existing.personnelId === 'ADMIN';
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    if (!isGlobal && existing.personnelId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (isAdminOnly && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (isGlobal) {
      await prisma.notificationRead.upsert({
        where: { notificationId_personnelId: { notificationId: id, personnelId: user.id } },
        update: {},
        create: { notificationId: id, personnelId: user.id },
      });
      return NextResponse.json({ ...existing, isRead: true });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 });
  }
}

export async function handleDeleteSingleNotification(
  req: Request,
  context?: { params?: Record<string, string | string[]> | { id: string } }
) {
  try {
    const id = typeof context?.params?.id === 'string' ? context.params.id : '';
    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: 'รหัสการแจ้งเตือนไม่ถูกต้อง' }, { status: 400 });
    }

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบการแจ้งเตือน' }, { status: 404 });
    }

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
    if (existing.personnelId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.notification.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'ลบการแจ้งเตือนเรียบร้อยแล้ว' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete notification' }, { status: 500 });
  }
}
