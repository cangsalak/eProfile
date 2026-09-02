import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';
import { z } from 'zod';

// ── Authorization helpers ─────────────────────────────────────────────────────

/** Roles/permissions that are allowed to perform privileged leave operations */
async function isPrivilegedLeaveUser(
  req: Request,
  role: string
): Promise<boolean> {
  if (role === 'SUPER_ADMIN') return true;
  const { error: e1 } = await requirePermission(req, 'APPROVE_LEAVE');
  if (!e1) return true;
  const { error: e2 } = await requirePermission(req, 'MANAGE_PERSONNEL');
  return !e2;
}

// ── Update schema ─────────────────────────────────────────────────────────────

const VALID_STATUSES = ['รออนุมัติ', 'อนุมัติแล้ว', 'ไม่อนุมัติ', 'ยกเลิก'] as const;

const UpdateLeaveSchema = z.object({
  leaveType:            z.string().max(100).optional(),
  startDate:            z.string().optional(),
  endDate:              z.string().optional(),
  reason:               z.string().max(1000).optional(),
  writtenAt:            z.string().max(200).optional(),
  toPerson:             z.string().max(200).optional(),
  contactAddress:       z.string().max(500).optional(),
  contactTambon:        z.string().max(100).optional(),
  contactAmphoe:        z.string().max(100).optional(),
  contactProvince:      z.string().max(100).optional(),
  status:               z.enum(VALID_STATUSES).optional(),
  substitutePerson:     z.string().max(200).optional().nullable(),
  accumulatedLeaveDays: z.number().nonnegative().optional().nullable(),
  thisYearLeaveDays:    z.number().nonnegative().optional().nullable(),
}).strict(); // reject unknown fields

// ─── PUT /api/leaves/[id] ─────────────────────────────────────────────────────
/**
 * Authorization matrix:
 *
 * Case A — status change (body.status !== existing.status):
 *   Requires APPROVE_LEAVE or SUPER_ADMIN.
 *   The leave may be in any current status (approvers use a controlled workflow).
 *
 * Case B — detail edit (no status change):
 *   Owner: allowed ONLY when existing.status === 'รออนุมัติ'
 *   MANAGE_PERSONNEL / SUPER_ADMIN: allowed in any status.
 */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.leaveRecord.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
    }

    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const parsed = UpdateLeaveSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const body = parsed.data;

    const isStatusChange = body.status !== undefined && body.status !== existing.status;
    const isOwner        = existing.personnelId === authUser.id;
    const privileged     = await isPrivilegedLeaveUser(req, authUser.role);

    // ── Case A: status change ────────────────────────────────────────────────
    if (isStatusChange) {
      if (!privileged) {
        return NextResponse.json(
          { error: 'สิทธิ์ไม่เพียงพอ: ต้องมี APPROVE_LEAVE หรือ SUPER_ADMIN เพื่อเปลี่ยนสถานะใบลา' },
          { status: 403 }
        );
      }
      // Privileged users can approve/reject from any status — fall through to update
    }

    // ── Case B: detail edit ───────────────────────────────────────────────────
    if (!isStatusChange) {
      if (isOwner) {
        // Owner may only edit while still pending
        if (existing.status !== 'รออนุมัติ') {
          return NextResponse.json(
            {
              error: `ไม่สามารถแก้ไขใบลาที่มีสถานะ "${existing.status}" ได้ เฉพาะใบลาที่ยัง "รออนุมัติ" เท่านั้นที่แก้ไขได้`,
            },
            { status: 403 }
          );
        }
      } else if (!privileged) {
        return NextResponse.json(
          { error: 'สิทธิ์ไม่เพียงพอ: ต้องมี MANAGE_PERSONNEL เพื่อแก้ไขใบลาของผู้อื่น' },
          { status: 403 }
        );
      }
    }

    // ── Build update payload ──────────────────────────────────────────────────
    type UpdateData = Record<string, unknown>;
    const updateData: UpdateData = {};

    if (body.leaveType     !== undefined) updateData.leaveType     = body.leaveType;
    if (body.startDate     !== undefined) updateData.startDate     = new Date(body.startDate);
    if (body.endDate       !== undefined) updateData.endDate       = new Date(body.endDate);
    if (body.reason        !== undefined) updateData.reason        = body.reason;
    if (body.writtenAt     !== undefined) updateData.writtenAt     = body.writtenAt;
    if (body.toPerson      !== undefined) updateData.toPerson      = body.toPerson;
    if (body.contactAddress  !== undefined) updateData.contactAddress  = body.contactAddress;
    if (body.contactTambon   !== undefined) updateData.contactTambon   = body.contactTambon;
    if (body.contactAmphoe   !== undefined) updateData.contactAmphoe   = body.contactAmphoe;
    if (body.contactProvince !== undefined) updateData.contactProvince = body.contactProvince;
    if (body.substitutePerson     !== undefined) updateData.substitutePerson     = body.substitutePerson;
    if (body.accumulatedLeaveDays !== undefined) updateData.accumulatedLeaveDays = body.accumulatedLeaveDays;
    if (body.thisYearLeaveDays    !== undefined) updateData.thisYearLeaveDays    = body.thisYearLeaveDays;

    // Recalculate total leave days if either component was provided
    if (body.accumulatedLeaveDays !== undefined || body.thisYearLeaveDays !== undefined) {
      const acc  = body.accumulatedLeaveDays ?? existing.accumulatedLeaveDays ?? 0;
      const year = body.thisYearLeaveDays    ?? existing.thisYearLeaveDays    ?? 0;
      updateData.totalLeaveDays = acc !== null && year !== null ? acc + year : null;
    }

    // Status — only privileged path reaches here with isStatusChange === true
    if (body.status !== undefined) updateData.status = body.status;

    const leave = await prisma.leaveRecord.update({
      where: { id: params.id },
      data:  updateData,
    });

    // Notify leave owner on status change
    if (isStatusChange && body.status) {
      const notifType =
        body.status === 'อนุมัติแล้ว' ? 'success' :
        body.status === 'ไม่อนุมัติ'  ? 'error'   : 'info';
      await prisma.notification.create({
        data: {
          personnelId: leave.personnelId,
          title:       `สถานะการ${leave.leaveType}ถูกอัปเดต`,
          message:     `คำร้องขอ${leave.leaveType}ของคุณได้รับการอัปเดตเป็น: ${body.status}`,
          type:        notifType,
          link:        '/leave',
        },
      }).catch(() => {});
    }

    await prisma.auditLog.create({
      data: {
        personnelId: authUser.id,
        action:      isStatusChange ? 'LEAVE_STATUS_CHANGED' : 'LEAVE_UPDATED',
        entity:      'LeaveRecord',
        entityId:    leave.id,
        details:     JSON.stringify({ oldStatus: existing.status, newStatus: body.status }),
      },
    }).catch(() => {});

    return NextResponse.json(leave);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update leave record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── DELETE /api/leaves/[id] ──────────────────────────────────────────────────
/**
 * Authorization:
 * - Owner:       only allowed when existing.status === 'รออนุมัติ'
 * - MANAGE_PERSONNEL / SUPER_ADMIN: allowed in any status
 */
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.leaveRecord.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
    }

    const isOwner    = existing.personnelId === authUser.id;
    const privileged = await isPrivilegedLeaveUser(req, authUser.role);

    if (isOwner) {
      // Owner can only retract a pending leave
      if (existing.status !== 'รออนุมัติ') {
        return NextResponse.json(
          {
            error: `ไม่สามารถลบใบลาที่มีสถานะ "${existing.status}" ได้ เฉพาะใบลาที่ยัง "รออนุมัติ" เท่านั้นที่ลบได้`,
          },
          { status: 403 }
        );
      }
    } else if (!privileged) {
      return NextResponse.json(
        { error: 'สิทธิ์ไม่เพียงพอ: ต้องมี MANAGE_PERSONNEL เพื่อลบใบลาของผู้อื่น' },
        { status: 403 }
      );
    }

    await prisma.leaveRecord.delete({ where: { id: params.id } });

    await prisma.auditLog.create({
      data: {
        personnelId: authUser.id,
        action:      'LEAVE_DELETED',
        entity:      'LeaveRecord',
        entityId:    params.id,
        details:     JSON.stringify({ deletedStatus: existing.status }),
      },
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete leave record';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
