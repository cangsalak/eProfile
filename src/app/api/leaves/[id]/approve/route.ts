import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';
import { createAuditLog } from '@/lib/audit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const ApproveSchema = z.object({
  note: z.string().max(500).optional().nullable(),
});

/**
 * POST /api/leaves/[id]/approve
 * 
 * Atomically approves a pending leave request with strict role-scoping,
 * self-approval prevention, audit logging, and notification creation.
 */
export async function POST(req: Request, { params }: { params: { id: string } }) {
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

    // ── 1. Fetch Target Leave Record ──────────────────────────────────────────
    const leave = await prisma.leaveRecord.findUnique({
      where: { id: params.id },
      include: {
        personnel: {
          select: {
            id: true,
            prefix: true,
            firstName: true,
            lastName: true,
            department: true,
            subDepartment: true,
            position: true,
          },
        },
      },
    });

    if (!leave) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลใบลา' }, { status: 404 });
    }

    // ── 2. Concurrency / Status Check ─────────────────────────────────────────
    if (leave.status !== 'รออนุมัติ') {
      return NextResponse.json(
        { error: `ใบลาได้รับการดำเนินการหรือเปลี่ยนสถานะไปแล้ว (สถานะปัจจุบัน: ${leave.status})` },
        { status: 409 }
      );
    }

    // ── 3. Scope Verification ────────────────────────────────────────────────
    const userProfile = await prisma.personnel.findUnique({
      where: { id: user.id },
      select: { department: true, subDepartment: true, role: true },
    });
    const userDept = userProfile?.department || '';
    const userSubDept = userProfile?.subDepartment || '';

    const isGlobalViewer = ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'].includes(user.role) || !userDept;

    if (!isGlobalViewer) {
      if (user.role === 'DEPARTMENT_COMMANDER') {
        if (leave.personnel.department !== userDept) {
          return NextResponse.json(
            { error: 'ไม่มีสิทธิ์อนุมัติใบลาของกำลังพลนอกหน่วยงานที่รับผิดชอบ' },
            { status: 403 }
          );
        }
      } else {
        // COMMANDER
        const activeSubDept = userSubDept && userSubDept !== '-' ? userSubDept : null;
        if (
          leave.personnel.department !== userDept ||
          (activeSubDept && leave.personnel.subDepartment !== activeSubDept)
        ) {
          return NextResponse.json(
            { error: 'ไม่มีสิทธิ์อนุมัติใบลาของกำลังพลนอกหน่วยย่อยที่รับผิดชอบ' },
            { status: 403 }
          );
        }
      }
    }

    // ── 4. Self-Approval Check ────────────────────────────────────────────────
    const isSelfApproval = leave.personnelId === user.id;
    if (isSelfApproval && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'ไม่อนุญาตให้อนุมัติใบลาของตนเอง กรุณาให้ผู้บังคับบัญชาหรือผู้มีอำนาจเป็นผู้พิจารณา' },
        { status: 403 }
      );
    }

    // ── 5. Atomic Update ──────────────────────────────────────────────────────
    const updateResult = await prisma.leaveRecord.updateMany({
      where: {
        id: params.id,
        status: 'รออนุมัติ',
      },
      data: {
        status: 'อนุมัติแล้ว',
        approvedById: user.id,
        approvedAt: new Date(),
        approvalNote: note || null,
      },
    });

    if (updateResult.count === 0) {
      return NextResponse.json(
        { error: 'ใบลาได้รับการดำเนินการหรือเปลี่ยนสถานะโดยผู้อื่นแล้ว' },
        { status: 409 }
      );
    }

    // ── 6. In-App Notification ────────────────────────────────────────────────
    const applicantName = `${leave.personnel.prefix || ''}${leave.personnel.firstName} ${leave.personnel.lastName}`.trim();
    const formattedStartDate = new Date(leave.startDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const formattedEndDate = new Date(leave.endDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    try {
      await prisma.notification.create({
        data: {
          personnelId: leave.personnelId,
          title: `ใบลาได้รับการอนุมัติแล้ว (${leave.leaveType})`,
          message: `ใบลาประเภท "${leave.leaveType}" ช่วงวันที่ ${formattedStartDate} ถึง ${formattedEndDate} ได้รับการอนุมัติเรียบร้อยแล้ว`,
          type: 'success',
          link: '/leave',
          isRead: false,
        },
      });
    } catch (notifErr) {
      console.error('Failed to create leave approval notification:', notifErr);
    }

    // ── 7. Audit Logging ──────────────────────────────────────────────────────
    await createAuditLog({
      req,
      personnelId: user.id,
      action: 'LEAVE_APPROVED',
      entity: 'LeaveRecord',
      entityId: params.id,
      details: {
        leaveId: params.id,
        leaveType: leave.leaveType,
        applicantId: leave.personnelId,
        applicantName,
        applicantDepartment: leave.personnel.department,
        applicantSubDepartment: leave.personnel.subDepartment,
        previousStatus: 'รออนุมัติ',
        newStatus: 'อนุมัติแล้ว',
        approvalNote: note || null,
        selfApproval: isSelfApproval,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'อนุมัติใบลาเรียบร้อยแล้ว',
      data: {
        id: params.id,
        status: 'อนุมัติแล้ว',
        approvedAt: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve leave';
    console.error('Leave approval error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
