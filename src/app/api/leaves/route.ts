import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const personnelId = searchParams.get('personnelId');

    let leaves;
    if (personnelId) {
      leaves = await prisma.leaveRecord.findMany({
        where: { personnelId },
        orderBy: { startDate: 'desc' },
      });
    } else {
      leaves = await prisma.leaveRecord.findMany({
        orderBy: { startDate: 'desc' },
        include: {
          personnel: {
            select: { prefix: true, firstName: true, lastName: true, position: true, department: true }
          }
        }
      });
    }

    return NextResponse.json(leaves);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch leaves' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.personnelId || !body.leaveType || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const leave = await prisma.leaveRecord.create({
      data: {
        personnelId: body.personnelId,
        leaveType: body.leaveType,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        reason: body.reason || '',
        writtenAt: body.writtenAt || '',
        toPerson: body.toPerson || '',
        contactAddress: body.contactAddress || '',
        contactTambon: body.contactTambon || '',
        contactAmphoe: body.contactAmphoe || '',
        contactProvince: body.contactProvince || '',
        status: body.status || 'รออนุมัติ',
      },
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create leave record' }, { status: 500 });
  }
}
