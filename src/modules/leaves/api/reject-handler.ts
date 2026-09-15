import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requirePermission } from '@/modules/core';
import { isValidId } from '@/modules/core';
import {
  executeLeaveApprovalWorkflow,
  ConflictError,
  ScopeError,
  ForbiddenActionError,
  NotFoundError,
} from '../lib/leave-approvals';
import { z } from 'zod';

const RejectSchema = z.object({
  reason: z.string()
    .min(2, 'กรุณาระบุเหตุผลการไม่อนุมัติอย่างน้อย 2 ตัวอักษร')
    .max(1000, 'เหตุผลมีความยาวเกิน 1000 ตัวอักษร'),
  note: z.string().max(500).optional().nullable(),
});

/**
 * POST /api/modules/leaves/:id/reject
 * 
 * Atomically rejects a pending leave request within a database transaction.
 */
export async function handleRejectLeave(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'รหัสใบลาไม่ถูกต้อง' }, { status: 400 });
    }

    const { user, error: permError } = await requirePermission(req, 'APPROVE_LEAVE');
    if (permError || !user) {
      return permError ?? NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let rawBody: unknown = {};
    try {
      const text = await req.text();
      if (text) {
        rawBody = JSON.parse(text);
      }
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = RejectSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { reason, note } = parsed.data;

    // Execute atomic workflow inside a Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      return await executeLeaveApprovalWorkflow({
        prismaTx: tx,
        req,
        authUser: user,
        leaveId: params.id,
        action: 'reject',
        reason,
        note: note || undefined,
      });
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    if (err instanceof NotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    if (err instanceof ConflictError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    if (err instanceof ScopeError || err instanceof ForbiddenActionError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : 'Failed to reject leave';
    console.error('Leave rejection error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
