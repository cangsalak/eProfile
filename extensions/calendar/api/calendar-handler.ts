import { NextResponse } from 'next/server';
import { prisma } from '@/modules/core';
import ical from 'node-ical';
import { requirePermission } from '@/modules/core';

export async function handleGetCalendarEvents(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    let dateFilter = {};
    if (startParam && endParam) {
      dateFilter = {
        gte: new Date(startParam),
        lte: new Date(endParam),
      };
    }

    // 1. Fetch CalendarEvents
    const events = await prisma.calendarEvent.findMany({
      where: Object.keys(dateFilter).length > 0 ? {
        OR: [
          { startDate: dateFilter },
          { endDate: dateFilter }
        ]
      } : undefined,
    });

    const calendarEvents = events.map(e => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startDate: e.startDate,
      endDate: e.endDate,
      type: e.type,
      status: 'approved',
      originalData: e,
    }));

    // 2. Fetch Google Calendar
    let googleEvents: any[] = [];
    try {
      const googleUrlsSetting = await prisma.systemSetting.findUnique({
        where: { key: 'googleCalendarUrls' }
      });
      
      let urls: any[] = [];
      if (googleUrlsSetting && googleUrlsSetting.value) {
        try {
          urls = JSON.parse(googleUrlsSetting.value);
        } catch {
          // ignore parse error
        }
      }

      // Backward compatibility for the single URL if needed
      const googleUrlSetting = await prisma.systemSetting.findUnique({
        where: { key: 'googleCalendarUrl' }
      });
      // SSRF protection: only allow HTTPS Google Calendar domains
      const ALLOWED_CAL_DOMAINS = ['calendar.google.com', 'www.googleapis.com'];
      function isAllowedCalUrl(url: string): boolean {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'https:' && ALLOWED_CAL_DOMAINS.some(d => parsed.hostname === d || parsed.hostname.endsWith('.' + d));
        } catch { return false; }
      }

      if (googleUrlSetting && googleUrlSetting.value && isAllowedCalUrl(googleUrlSetting.value)) {
        urls.push({ name: 'Google Calendar', url: googleUrlSetting.value });
      }

      for (const cal of urls) {
        if (!cal.url || !isAllowedCalUrl(cal.url)) continue;
        
        try {
          const webEvents = await ical.async.fromURL(cal.url);
          for (const k in webEvents) {
            if (webEvents.hasOwnProperty(k)) {
              const ev = webEvents[k] as any;
              if (ev.type === 'VEVENT') {
                const start = ev.start;
                const end = ev.end;
                
                if (start && end) {
                  googleEvents.push({
                    id: `google-${ev.uid}-${cal.name || 'cal'}`,
                    title: cal.name ? `[${cal.name}] ${ev.summary}` : ev.summary,
                    description: ev.description || '',
                    startDate: start.toISOString(),
                    endDate: end.toISOString(),
                    type: 'google',
                    status: 'approved',
                    originalData: null
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error(`Failed to parse Google Calendar (${cal.url}):`, err);
        }
      }
    } catch (gErr) {
      console.error('Failed to fetch Google Calendars:', gErr);
    }

    return NextResponse.json([...calendarEvents, ...googleEvents]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch calendar data' }, { status: 500 });
  }
}

export async function handleCreateCalendarEvent(req: Request) {
  try {
    let auth = await requirePermission(req, 'MANAGE_CALENDAR');
    if (auth.error) {
      auth = await requirePermission(req, 'MANAGE_SYSTEM');
    }
    if (auth.error) return auth.error;

    const body = await req.json();
    const { title, description, startDate, endDate, type } = body;

    if (!title || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        type: type || 'general',
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
  }
}
