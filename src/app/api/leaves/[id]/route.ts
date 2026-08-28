import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();

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

    const leave = await prisma.leaveRecord.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(leave);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update leave record' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    await prisma.leaveRecord.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete leave record' }, { status: 500 });
  }
}
