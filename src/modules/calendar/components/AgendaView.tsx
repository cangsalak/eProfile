'use client';

import React from 'react';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarEventItem, CALENDAR_CATEGORY_CONFIG } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, AlignLeft, ChevronRight, Users } from 'lucide-react';

interface AgendaViewProps {
  currentDate: Date;
  events: CalendarEventItem[];
  onSelectEvent: (event: CalendarEventItem) => void;
  onSlotClick?: (date: Date, hour: number) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  currentDate,
  events,
  onSelectEvent,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Filter events in the current active month and sort chronologically
  const monthEvents = events
    .filter((ev) => {
      const s = new Date(ev.startDate);
      const e = new Date(ev.endDate);
      return (
        isWithinInterval(s, { start: monthStart, end: monthEnd }) ||
        isWithinInterval(e, { start: monthStart, end: monthEnd }) ||
        (s <= monthStart && e >= monthEnd)
      );
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  // Group events by day key (yyyy-MM-dd)
  const groupedEvents: { [dateStr: string]: { date: Date; items: CalendarEventItem[] } } = {};

  monthEvents.forEach((ev) => {
    const s = new Date(ev.startDate);
    const dateStr = format(s, 'yyyy-MM-dd');
    if (!groupedEvents[dateStr]) {
      groupedEvents[dateStr] = {
        date: s,
        items: [],
      };
    }
    groupedEvents[dateStr].items.push(ev);
  });

  const groupKeys = Object.keys(groupedEvents).sort();

  if (groupKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
          <CalendarIcon className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          ไม่มีกำหนดการในเดือน {format(currentDate, 'MMMM yyyy', { locale: th })}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          คุณสามารถกดปุ่ม "+ สร้างกิจกรรม" ด้านซ้ายเพื่อเพิ่มกิจกรรมหรือเวรปฏิบัติการใหม่ได้ทันที
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs divide-y divide-slate-200 dark:divide-slate-800">
      <div className="p-4 bg-slate-50/80 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            กำหนดการทั้งหมดในเดือน {format(currentDate, 'MMMM yyyy', { locale: th })}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            พบทั้งหมด {monthEvents.length} รายการ แยกตามวัน
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {groupKeys.map((key) => {
          const group = groupedEvents[key];
          const isToday = isSameDay(group.date, new Date());

          return (
            <div key={key} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-start gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-850/40 transition-colors">
              {/* Date Column Badge */}
              <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1 md:w-36 shrink-0">
                <div
                  className={`flex items-center md:flex-col justify-center px-3 py-1.5 md:py-2 md:w-20 rounded-xl text-center font-bold shadow-2xs border ${
                    isToday
                      ? 'bg-primary-600 text-white border-primary-600 shadow-primary-500/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-xs md:text-[11px] uppercase tracking-wider font-semibold mr-1.5 md:mr-0">
                    {format(group.date, 'EEE', { locale: th })}
                  </span>
                  <span className="text-base md:text-xl leading-none">
                    {format(group.date, 'd')}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {format(group.date, 'MMMM yyyy', { locale: th })}
                  </div>
                  {isToday && (
                    <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300">
                      วันนี้
                    </span>
                  )}
                </div>
              </div>

              {/* Event Cards List */}
              <div className="flex-1 space-y-2.5">
                {group.items.map((ev) => {
                  const s = new Date(ev.startDate);
                  const e = new Date(ev.endDate);
                  const cat = CALENDAR_CATEGORY_CONFIG[ev.type] || CALENDAR_CATEGORY_CONFIG.general;
                  const isAllDay = ev.allDay || ev.type === 'leave';

                  return (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      className={`group p-3.5 rounded-xl border transition-all hover:shadow-md hover:scale-[1.005] cursor-pointer flex items-center justify-between gap-3 ${cat.bgLight} ${cat.bgDark}`}
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${cat.dotColor}`} />
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {ev.title}
                          </h3>
                          <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/40 border border-black/5 dark:border-white/5">
                            {cat.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs opacity-80 pt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            {isAllDay ? 'ตลอดวัน' : `${format(s, 'HH:mm')} - ${format(e, 'HH:mm')} น.`}
                          </span>

                          {ev.assigneeName && (
                            <span className="flex items-center gap-1 font-medium text-primary-700 dark:text-primary-300">
                              <Users className="w-3.5 h-3.5 shrink-0 text-primary-500" />
                              <span>{ev.dutyRole ? `${ev.dutyRole}: ` : ''}{ev.assigneeName}</span>
                            </span>
                          )}

                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{ev.location}</span>
                            </span>
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-xs opacity-75 line-clamp-1 pt-0.5 flex items-start gap-1">
                            <AlignLeft className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{ev.description}</span>
                          </p>
                        )}
                      </div>

                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
