import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth-guards';
import { sendNotification } from '../lib/notification-sender';

function isGlobal(n: { personnelId: string }) {
  return n.personnelId === 'ALL' || n.personnelId === 'ADMIN';
}

export async function handleGetNotifications(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    const rawNotifications = await prisma.notification.findMany({
      where: {
        OR: [
          { personnelId: user.id },
          { personnelId: 'ALL' },
          ...(isAdmin ? [{ personnelId: 'ADMIN' }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        reads: {
          where: { personnelId: user.id },
          select: { id: true },
        },
      },
    });

    const notifications = rawNotifications.map(({ reads, ...n }) => ({
      ...n,
      isRead: isGlobal(n) ? reads.length > 0 : n.isRead,
    }));

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function handleMarkAllNotificationsRead(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    // 1. Mark personal notifications as read
    await prisma.notification.updateMany({
      where: { personnelId: user.id, isRead: false },
      data: { isRead: true },
    });

    // 2. For global notifications, upsert into NotificationRead
    const globalWhere = isAdmin
      ? { OR: [{ personnelId: 'ALL' }, { personnelId: 'ADMIN' }] }
      : { personnelId: 'ALL' };

    const globalNotifications = await prisma.notification.findMany({
      where: {
        ...globalWhere,
        reads: { none: { personnelId: user.id } },
      },
      select: { id: true },
    });

    if (globalNotifications.length > 0) {
      await Promise.all(
        globalNotifications.map((n) =>
          prisma.notificationRead.upsert({
            where: { notificationId_personnelId: { notificationId: n.id, personnelId: user.id } },
            update: {},
            create: { notificationId: n.id, personnelId: user.id },
          })
        )
      );
    }

    return NextResponse.json({ success: true, message: 'ทำเครื่องหมายอ่านแล้วทั้งหมด' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to mark notifications read' }, { status: 500 });
  }
}

export async function handleBroadcastNotification(req: Request) {
  try {
    const { user, error: authError } = await requirePermission(req, 'MANAGE_POSTS');
    if (authError || !user) {
      return authError || NextResponse.json({ error: 'Unauthorized: เฉพาะผู้มีสิทธิ์จัดการระบบเท่านั้น' }, { status: 401 });
    }

    const body = await req.json();
    const { title, message, type = 'info', targetType = 'ALL', targetPersonnelId, link, channels = ['in_app'] } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'กรุณากรอกหัวข้อและข้อความแจ้งเตือน' }, { status: 400 });
    }

    const results = await sendNotification({
      title,
      message,
      type,
      targetType,
      targetPersonnelId,
      link,
      channels,
      senderId: user.id,
    });

    return NextResponse.json({
      success: true,
      message: 'ส่งการแจ้งเตือนสำเร็จ',
      results,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to broadcast notification:', error);
    return NextResponse.json({ error: error.message || 'เกิดข้อผิดพลาดในการส่งแจ้งเตือน' }, { status: 500 });
  }
}
