import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import { requirePermission } from '@/lib/auth-guards';
import { isValidId } from '@/lib/validate-utils';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.leaveRecord.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
    }

    const body = await req.json();

    // If changing status/approval, require APPROVE_LEAVE permission or SUPER_ADMIN
    if (body.status && body.status !== existing.status) {
      if (authUser.role !== 'SUPER_ADMIN') {
        const { error: permError } = await requirePermission(req, 'APPROVE_LEAVE');
        if (permError) return permError;
      }
    } else {
      // If editing details, allow if own record or has MANAGE_PERSONNEL permission
      if (existing.personnelId !== authUser.id && authUser.role !== 'SUPER_ADMIN') {
        const { error: permError } = await requirePermission(req, 'MANAGE_PERSONNEL');
        if (permError) return permError;
      }
    }

    const updateData: any = {};
    if (body.leaveType) updateData.leaveType = body.leaveType;
    if (body.startDate) updateData.startDate = new Date(body.startDate);
    if (body.endDate) updateData.endDate = new Date(body.endDate);
    if (body.reason !== undefined) updateData.reason = body.reason;
    if (body.writtenAt !== undefined) updateData.writtenAt = body.writtenAt;
    if (body.toPerson !== undefined) updateData.toPerson = body.toPerson;
    if (body.contactAddress !== undefined) updateData.contactAddress = body.contactAddress;
    if (body.contactTambon !== undefined) updateData.contactTambon = body.contactTambon;
    if (body.contactAmphoe !== undefined) updateData.contactAmphoe = body.contactAmphoe;
    if (body.contactProvince !== undefined) updateData.contactProvince = body.contactProvince;
    if (body.status) updateData.status = body.status;
    
    // Annual Leave
    if (body.substitutePerson !== undefined) updateData.substitutePerson = body.substitutePerson;
    if (body.accumulatedLeaveDays !== undefined) updateData.accumulatedLeaveDays = body.accumulatedLeaveDays ? parseFloat(body.accumulatedLeaveDays) : null;
    if (body.thisYearLeaveDays !== undefined) updateData.thisYearLeaveDays = body.thisYearLeaveDays ? parseFloat(body.thisYearLeaveDays) : null;
    if (body.totalLeaveDays !== undefined) updateData.totalLeaveDays = (body.accumulatedLeaveDays ? parseFloat(body.accumulatedLeaveDays) : 0) + (body.thisYearLeaveDays ? parseFloat(body.thisYearLeaveDays) : 0) || null;

    const leave = await prisma.leaveRecord.update({
      where: { id: params.id },
      data: updateData,
    });

    if (body.status && body.status !== existing.status) {
      const type = body.status === 'อนุมัติแล้ว' ? 'success' : body.status === 'ไม่อนุมัติ' ? 'error' : 'info';
      await prisma.notification.create({
        data: {
          personnelId: leave.personnelId,
          title: `สถานะการ${leave.leaveType}ถูกอัปเดต`,
          message: `คำร้องขอ${leave.leaveType}ของคุณได้รับการอัปเดตเป็น: ${body.status}`,
          type: type,
          link: '/leave',
        },
      }).catch(() => {});
    }

    await prisma.auditLog.create({
      data: {
        personnelId: authUser.id,
        action: body.status && body.status !== existing.status ? 'LEAVE_STATUS_CHANGED' : 'LEAVE_UPDATED',
        entity: 'LeaveRecord',
        entityId: leave.id,
        details: JSON.stringify({ oldStatus: existing.status, newStatus: body.status }),
      },
    }).catch(() => {});

    return NextResponse.json(leave);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update leave record' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const authUser = await verifyAuth(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await prisma.leaveRecord.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Leave record not found' }, { status: 404 });
    }

    // Must be own leave record (in pending status) or have MANAGE_PERSONNEL permission / SUPER_ADMIN
    if (existing.personnelId !== authUser.id && authUser.role !== 'SUPER_ADMIN') {
      const { error: permError } = await requirePermission(req, 'MANAGE_PERSONNEL');
      if (permError) return permError;
    }

    await prisma.leaveRecord.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete leave record' }, { status: 500 });
  }
}
