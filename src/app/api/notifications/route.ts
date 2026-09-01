import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requireRole } from '@/lib/auth-guards';

// Fetch notifications for current user
export async function GET(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get personal notifications + global admin notifications (if user is admin)
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { personnelId: user.id },
          { personnelId: 'ALL' },
          ...( ['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? [{ personnelId: 'ADMIN' }] : [] )
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // limit to latest 50
    });

    return NextResponse.json(notifications);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

// Mark all as read for current user
export async function PUT(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.notification.updateMany({
      where: {
        OR: [
          { personnelId: user.id },
          { personnelId: 'ALL' },
          ...( ['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? [{ personnelId: 'ADMIN' }] : [] )
        ],
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update notifications' }, { status: 500 });
  }
}

// Broadcast / Send new notification (Admin only)
export async function POST(req: Request) {
  try {
    const { user, error: authError } = await requireRole(req, ['ADMIN', 'SUPER_ADMIN']);
    if (authError || !user) return authError || NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { target, title, message, type, link } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // target can be 'ALL', 'ADMIN', or specific 'userId'
    const targetId = target || 'ALL';

    const notification = await prisma.notification.create({
      data: {
        personnelId: targetId,
        title,
        message,
        type: type || 'info',
        link: link || null,
        isRead: false
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create notification' }, { status: 500 });
  }
}
