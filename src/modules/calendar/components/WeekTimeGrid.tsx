'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarEventItem, CALENDAR_CATEGORY_CONFIG } from '../types';
import { Clock, MapPin, Users } from 'lucide-react';

interface WeekTimeGridProps {
  currentDate: Date;
  events: CalendarEventItem[];
  onSelectEvent: (event: CalendarEventItem) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

const HOUR_ROW_HEIGHT = 48; // px per hour

export const WeekTimeGrid: React.FC<WeekTimeGridProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onSlotClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Update live clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto scroll to current hour or 8:00 AM on initial mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      const targetScroll = Math.max(0, (currentHour - 2) * HOUR_ROW_HEIGHT);
      scrollContainerRef.current.scrollTop = targetScroll;
    }
  }, []);

  // Filter all-day events vs timed events
  const isEventAllDay = (ev: CalendarEventItem) => {
    if (ev.allDay || ev.type === 'leave') return true;
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diffHours >= 23;
  };

  const allDayEvents = events.filter((e) => isEventAllDay(e));
  const timedEvents = events.filter((e) => !isEventAllDay(e));

  // Current time marker position
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * HOUR_ROW_HEIGHT;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* ── Sticky Top Header with 7 Days ── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-xs z-20">
        {/* Time gutter space (Left) */}
        <div className="w-14 sm:w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center text-[11px] text-slate-400 font-medium">
          เวลา
        </div>

        {/* 7 Days Headers */}
        <div className="flex-1 grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800">
          {weekDays.map((day, idx) => {
            const isToday = isSameDay(day, new Date());
            return (
              <div
                key={day.toISOString()}
                className={`py-2 text-center transition-colors ${
                  isToday ? 'bg-primary-50/60 dark:bg-primary-950/30' : ''
                }`}
              >
                <div
                  className={`text-[11px] font-semibold uppercase tracking-wider ${
                    idx === 0
                      ? 'text-rose-500'
                      : idx === 6
                      ? 'text-blue-500'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {format(day, 'EEE', { locale: th })}
                </div>
                <div
                  className={`inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full mt-0.5 ${
                    isToday
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── All-Day Events Strip ── */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-xs">
          <div className="w-14 sm:w-16 shrink-0 p-1.5 text-[10px] text-slate-400 font-medium border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
            ตลอดวัน
          </div>
          <div className="flex-1 grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800 p-1">
            {weekDays.map((day) => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const dayAllEvents = allDayEvents.filter((ev) => {
                const sStr = format(new Date(ev.startDate), 'yyyy-MM-dd');
                const eStr = format(new Date(ev.endDate), 'yyyy-MM-dd');
                return dayStr >= sStr && dayStr <= eStr;
              });

              return (
                <div key={`allday-${day.toISOString()}`} className="space-y-1 min-h-[28px] px-0.5">
                  {dayAllEvents.map((ev) => {
                    const cat = CALENDAR_CATEGORY_CONFIG[ev.type] || CALENDAR_CATEGORY_CONFIG.general;
                    return (
                      <button
                        key={`ad-${ev.id}`}
                        type="button"
                        onClick={() => onSelectEvent(ev)}
                        className={`w-full text-left text-[11px] font-medium px-1.5 py-0.5 rounded-sm truncate border transition-opacity hover:opacity-85 shadow-2xs ${cat.bgLight} ${cat.bgDark}`}
                        title={ev.title}
                      >
                        {ev.title}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 24-Hour Timeline Grid Container ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative divide-y divide-slate-100 dark:divide-slate-800/60"
        style={{ height: 'calc(100vh - 280px)', minHeight: '480px' }}
      >
        <div className="flex relative" style={{ height: `${24 * HOUR_ROW_HEIGHT}px` }}>
          {/* Left Time Axis Labels */}
          <div className="w-14 sm:w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 select-none bg-white dark:bg-slate-900 z-10">
            {hours.map((hour) => (
              <div
                key={`label-${hour}`}
                className="text-[10px] text-slate-400 font-mono text-right pr-2 -translate-y-2"
                style={{ height: `${HOUR_ROW_HEIGHT}px` }}
              >
                {hour === 0 ? '' : `${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* 7 Columns for the Week */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-slate-200 dark:divide-slate-800 relative">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, new Date());
              const dayStart = new Date(day);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(day);
              dayEnd.setHours(23, 59, 59, 999);

              // Find timed events occurring on this day
              const dayEvents = timedEvents.filter((ev) => {
                const s = new Date(ev.startDate);
                const e = new Date(ev.endDate);
                return (
                  isWithinInterval(s, { start: dayStart, end: dayEnd }) ||
                  isWithinInterval(e, { start: dayStart, end: dayEnd }) ||
                  (s <= dayStart && e >= dayEnd)
                );
              });

              return (
                <div
                  key={`grid-${day.toISOString()}`}
                  className={`relative h-full transition-colors ${
                    isToday ? 'bg-primary-50/20 dark:bg-primary-950/10' : ''
                  }`}
                >
                  {/* Horizontal Hour Lines & Clickable Slots */}
                  {hours.map((hour) => (
                    <div
                      key={`slot-${day.toISOString()}-${hour}`}
                      onClick={() => onSlotClick(day, hour)}
                      className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      style={{ height: `${HOUR_ROW_HEIGHT}px` }}
                      title={`คลิกเพื่อสร้างกิจกรรมเวลา ${hour}:00 น.`}
                    />
                  ))}

                  {/* Red Current Time Marker Line */}
                  {isToday && (
                    <div
                      className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                      style={{ top: `${currentTimeTop}px` }}
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-xs -ml-1.5 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                      <div className="flex-1 h-[2px] bg-rose-500 shadow-xs" />
                    </div>
                  )}

                  {/* Timed Event Blocks */}
                  {dayEvents.map((ev) => {
                    const s = new Date(ev.startDate);
                    const e = new Date(ev.endDate);

                    // If event started before today, start from 00:00
                    const startMin = s < dayStart ? 0 : s.getHours() * 60 + s.getMinutes();
                    // If event ends after today, end at 24:00
                    const endMin = e > dayEnd ? 24 * 60 : e.getHours() * 60 + e.getMinutes();
                    const durationMin = Math.max(25, endMin - startMin);

                    const topPos = (startMin / 60) * HOUR_ROW_HEIGHT;
                    const heightPos = (durationMin / 60) * HOUR_ROW_HEIGHT;
                    const cat = CALENDAR_CATEGORY_CONFIG[ev.type] || CALENDAR_CATEGORY_CONFIG.general;

                    return (
                      <button
                        key={`ev-${ev.id}`}
                        type="button"
                        onClick={(eClick) => {
                          eClick.stopPropagation();
                          onSelectEvent(ev);
                        }}
                        className={`absolute left-1 right-1 rounded-md p-1 text-left border shadow-xs overflow-hidden transition-all hover:scale-[1.01] hover:z-30 cursor-pointer ${cat.bgLight} ${cat.bgDark}`}
                        style={{
                          top: `${topPos}px`,
                          height: `${heightPos}px`,
                        }}
                      >
                        <div className="font-semibold text-xs truncate leading-tight flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.dotColor}`} />
                          {ev.title}
                        </div>
                        {durationMin >= 40 && (
                          <div className="text-[10px] opacity-80 flex items-center gap-1 mt-0.5 truncate font-mono">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            {format(s, 'HH:mm')} - {format(e, 'HH:mm')}
                          </div>
                        )}
                        {durationMin >= 60 && ev.assigneeName && (
                          <div className="text-[10px] opacity-85 flex items-center gap-1 mt-0.5 truncate font-medium">
                            <Users className="w-2.5 h-2.5 shrink-0 text-primary-500" />
                            {ev.dutyRole ? `${ev.dutyRole}: ` : ''}{ev.assigneeName}
                          </div>
                        )}
                        {durationMin >= 80 && ev.location && (
                          <div className="text-[10px] opacity-75 flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            {ev.location}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
