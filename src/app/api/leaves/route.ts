import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth-guards';

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
    const { error: authError } = await requireAuth(req);
    if (authError) return authError;

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
        substitutePerson: body.substitutePerson || null,
        accumulatedLeaveDays: body.accumulatedLeaveDays ? parseFloat(body.accumulatedLeaveDays) : null,
        thisYearLeaveDays: body.thisYearLeaveDays ? parseFloat(body.thisYearLeaveDays) : null,
        totalLeaveDays: (body.accumulatedLeaveDays ? parseFloat(body.accumulatedLeaveDays) : 0) + (body.thisYearLeaveDays ? parseFloat(body.thisYearLeaveDays) : 0) || null,
        ordainedBefore: body.ordainedBefore ?? false,
        ordainTempleName: body.ordainTempleName || null,
        ordainTempleLocation: body.ordainTempleLocation || null,
        ordainDate: body.ordainDate ? new Date(body.ordainDate) : null,
        stayTempleName: body.stayTempleName || null,
        stayTempleLocation: body.stayTempleLocation || null,
        maternityLeaveTimes: body.maternityLeaveTimes ? parseInt(body.maternityLeaveTimes) : null,
        maternityLeaveDays: body.maternityLeaveDays ? parseInt(body.maternityLeaveDays) : null,
      },
    });

    // Fetch the personnel to get their name for the notification
    const personnel = await prisma.personnel.findUnique({
      where: { id: body.personnelId },
      select: { firstName: true, lastName: true }
    });

    if (personnel) {
      // Send notification to ADMIN
      await prisma.notification.create({
        data: {
          personnelId: 'ADMIN',
          title: `มีคำร้องขอ${body.leaveType}ใหม่`,
          message: `${personnel.firstName} ${personnel.lastName} ได้ส่งคำร้องขอ${body.leaveType}`,
          type: 'info',
          link: '/leave'
        }
      });
    }

    return NextResponse.json(leave, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create leave record' }, { status: 500 });
  }
}
