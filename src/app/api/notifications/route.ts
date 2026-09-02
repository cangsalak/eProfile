import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth-guards';

/**
 * Determines whether a global notification (ALL / ADMIN) has been read
 * by a specific user, using the NotificationRead join table.
 *
 * Personal notifications (personnelId = real user ID) still rely on
 * Notification.isRead for backwards compatibility.
 */
function isGlobal(n: { personnelId: string }) {
  return n.personnelId === 'ALL' || n.personnelId === 'ADMIN';
}

// ─── GET /api/notifications ───────────────────────────────────────────────────
/**
 * Returns notifications relevant to the current user.
 * For global (ALL/ADMIN) notifications, the `isRead` field is computed
 * from the NotificationRead join table, so one user marking it read
 * does NOT affect other users.
 */
export async function GET(req: Request) {
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

    // Normalise: for global notifications derive isRead from the join table
    const notifications = rawNotifications.map(({ reads, ...n }) => ({
      ...n,
      isRead: isGlobal(n)
        ? reads.length > 0        // has a NotificationRead row for this user
        : n.isRead,               // personal notifications use the column directly
    }));

    return NextResponse.json(notifications);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── PUT /api/notifications — mark all as read ────────────────────────────────
/**
 * Marks all visible notifications as read for the current user.
 *
 * - Personal notifications: flips Notification.isRead = true.
 * - Global (ALL/ADMIN) notifications: upserts into NotificationRead join table.
 *   This does NOT touch other users' read state.
 */
export async function PUT(req: Request) {
  try {
    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    // 1. Mark personal notifications as read (isRead column is safe here)
    await prisma.notification.updateMany({
      where: { personnelId: user.id, isRead: false },
      data:  { isRead: true },
    });

    // 2. For global notifications, upsert into NotificationRead (per-user)
    const globalWhere = isAdmin
      ? { OR: [{ personnelId: 'ALL' }, { personnelId: 'ADMIN' }] }
      : { personnelId: 'ALL' };

    const globalNotifications = await prisma.notification.findMany({
      where: {
        ...globalWhere,
        reads: { none: { personnelId: user.id } }, // not yet read by this user
      },
      select: { id: true },
    });

    if (globalNotifications.length > 0) {
      // SQLite does not support createMany.skipDuplicates — use individual upserts
      await Promise.all(
        globalNotifications.map(n =>
          prisma.notificationRead.upsert({
            where:  { notificationId_personnelId: { notificationId: n.id, personnelId: user.id } },
            update: {},
            create: { notificationId: n.id, personnelId: user.id },
          })
        )
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update notifications';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── POST /api/notifications — broadcast (admin only) ────────────────────────
export async function POST(req: Request) {
  try {
    const { error: permErr, user } = await requirePermission(req, 'MANAGE_SYSTEM');
    if (permErr || !user) return permErr ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { target, title, message, type, link } = body as Record<string, string>;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // target can be 'ALL', 'ADMIN', or specific userId
    const targetId = target || 'ALL';

    const notification = await prisma.notification.create({
      data: {
        personnelId: targetId,
        title,
        message,
        type:    type || 'info',
        link:    link || null,
        isRead:  false, // deprecated for global, but kept for schema compat
      },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
