import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';

// ─── PUT /api/notifications/[id] — mark single notification as read ───────────
/**
 * For personal notifications: flips isRead = true on the Notification row.
 * For global notifications (ALL/ADMIN): upserts a NotificationRead row for this user.
 * This preserves read state independently per user.
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.notification.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    const isGlobal = existing.personnelId === 'ALL' || existing.personnelId === 'ADMIN';
    const isAdminOnly = existing.personnelId === 'ADMIN';
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);

    // Access control: personal → own only; ALL → any auth user; ADMIN → admins only
    if (!isGlobal && existing.personnelId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (isAdminOnly && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (isGlobal) {
      // Per-user read state via join table — does NOT affect other users
      await prisma.notificationRead.upsert({
        where:  { notificationId_personnelId: { notificationId: params.id, personnelId: user.id } },
        update: {},
        create: { notificationId: params.id, personnelId: user.id },
      });
      return NextResponse.json({ ...existing, isRead: true });
    }

    // Personal notification — update the column directly
    const updated = await prisma.notification.update({
      where: { id: params.id },
      data:  { isRead: true },
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE /api/notifications/[id] ──────────────────────────────────────────
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const { user, error: authError } = await requireAuth(req);
    if (authError || !user) return authError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await prisma.notification.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Only owner or admin can delete
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
    if (existing.personnelId !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.notification.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete notification';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
