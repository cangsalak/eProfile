import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import { requirePermission } from '@/modules/core';
import { isValidId } from '@/modules/core';

export async function handleUpdateCalendarEvent(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    let auth = await requirePermission(req, 'MANAGE_CALENDAR');
    if (auth.error) {
      auth = await requirePermission(req, 'MANAGE_SYSTEM');
    }
    if (auth.error) return auth.error;

    const { id } = params;
    const body = await req.json();
    const { title, description, startDate, endDate, type } = body;

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(type && { type }),
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function handleDeleteCalendarEvent(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!isValidId(params.id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    let auth = await requirePermission(req, 'MANAGE_CALENDAR');
    if (auth.error) {
      auth = await requirePermission(req, 'MANAGE_SYSTEM');
    }
    if (auth.error) return auth.error;

    const { id } = params;
    await prisma.calendarEvent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete event' }, { status: 500 });
  }
}
