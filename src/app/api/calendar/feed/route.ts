import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(req: Request) {
  try {
    // 1. Fetch CalendarEvents
    const events = await prisma.calendarEvent.findMany({
      orderBy: { startDate: 'asc' },
    });

    // 2. Fetch Approved LeaveRecords
    const leaves = await prisma.leaveRecord.findMany({
      where: { status: 'อนุมัติแล้ว' },
      include: {
        personnel: {
          select: {
            prefix: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          },
        },
      },
    });

    // 3. Format into RFC 5545 iCalendar stream
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//eProfile//Duty Calendar Feed//TH',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:eProfile Duty & Operations Calendar',
      'X-WR-TIMEZONE:Asia/Bangkok',
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      'X-PUBLISHED-TTL:PT1H',
    ];

    // Helper for formatting RFC 5545 date-time
    const formatIcalDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Calendar events
    events.forEach((ev) => {
      const s = formatIcalDate(new Date(ev.startDate));
      const e = formatIcalDate(new Date(ev.endDate));
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:evt-${ev.id}@eprofile.local`);
      lines.push(`DTSTAMP:${formatIcalDate(new Date(ev.createdAt || new Date()))}`);
      lines.push(`DTSTART:${s}`);
      lines.push(`DTEND:${e}`);
      lines.push(`SUMMARY:${(ev.title || 'กิจกรรม').replace(/,/g, '\\,')}`);
      if (ev.description) {
        lines.push(`DESCRIPTION:${ev.description.replace(/\n/g, '\\n').replace(/,/g, '\\,')}`);
      }
      lines.push(`CATEGORIES:${ev.type.toUpperCase()}`);
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    });

    // Leave records
    leaves.forEach((leave) => {
      const s = formatIcalDate(new Date(leave.startDate));
      const e = formatIcalDate(new Date(leave.endDate));
      const name = `${leave.personnel.prefix || ''}${leave.personnel.firstName} ${leave.personnel.lastName}`.trim();
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:leave-${leave.id}@eprofile.local`);
      lines.push(`DTSTAMP:${formatIcalDate(new Date(leave.createdAt || new Date()))}`);
      lines.push(`DTSTART:${s}`);
      lines.push(`DTEND:${e}`);
      lines.push(`SUMMARY:[การลา] ${name} - ${leave.leaveType}`.replace(/,/g, '\\,'));
      lines.push(`DESCRIPTION:${(leave.reason || leave.leaveType).replace(/\n/g, '\\n').replace(/,/g, '\\,')}`);
      lines.push('CATEGORIES:LEAVE');
      lines.push('STATUS:CONFIRMED');
      lines.push('END:VEVENT');
    });

    lines.push('END:VCALENDAR');

    const icsContent = lines.join('\r\n');

    return new Response(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'inline; filename="eprofile-duty-feed.ics"',
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error: any) {
    console.error('Error generating calendar feed', error);
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}
