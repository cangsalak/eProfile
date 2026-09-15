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

const ApproveSchema = z.object({
  note: z.string().max(500).optional().nullable(),
});

/**
 * POST /api/modules/leaves/:id/approve
 * 
 * Atomically approves a pending leave request within a database transaction.
 */
export async function handleApproveLeave(req: Request, { params }: { params: { id: string } }) {
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

    const parsed = ApproveSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { note } = parsed.data;

    // Execute atomic workflow inside a Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      return await executeLeaveApprovalWorkflow({
        prismaTx: tx,
        req,
        authUser: user,
        leaveId: params.id,
        action: 'approve',
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
    const message = err instanceof Error ? err.message : 'Failed to approve leave';
    console.error('Leave approval error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
