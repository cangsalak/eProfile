'use client';

import React, { useEffect, useRef, useState } from 'react';
import { format, isSameDay, isWithinInterval } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarEventItem, CALENDAR_CATEGORY_CONFIG } from '../types';
import { Clock, MapPin, AlignLeft, Calendar, Users } from 'lucide-react';

interface DayTimeGridProps {
  currentDate: Date;
  events: CalendarEventItem[];
  onSelectEvent: (event: CalendarEventItem) => void;
  onSlotClick: (date: Date, hour: number) => void;
}

const HOUR_ROW_HEIGHT = 60; // 60px per hour for day view (richer space)

export const DayTimeGrid: React.FC<DayTimeGridProps> = ({
  currentDate,
  events,
  onSelectEvent,
  onSlotClick,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const isToday = isSameDay(currentDate, new Date());

  // Update live clock every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll near current hour
  useEffect(() => {
    if (scrollContainerRef.current) {
      const currentHour = new Date().getHours();
      const targetScroll = Math.max(0, (currentHour - 2) * HOUR_ROW_HEIGHT);
      scrollContainerRef.current.scrollTop = targetScroll;
    }
  }, [currentDate]);

  const isEventAllDay = (ev: CalendarEventItem) => {
    if (ev.allDay || ev.type === 'leave') return true;
    const start = new Date(ev.startDate);
    const end = new Date(ev.endDate);
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return diffHours >= 23;
  };

  const dayStart = new Date(currentDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(currentDate);
  dayEnd.setHours(23, 59, 59, 999);

  const dayEvents = events.filter((ev) => {
    const s = new Date(ev.startDate);
    const e = new Date(ev.endDate);
    return (
      isWithinInterval(s, { start: dayStart, end: dayEnd }) ||
      isWithinInterval(e, { start: dayStart, end: dayEnd }) ||
      (s <= dayStart && e >= dayEnd)
    );
  });

  const allDayEvents = dayEvents.filter((e) => isEventAllDay(e));
  const timedEvents = dayEvents.filter((e) => !isEventAllDay(e));

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTimeTop = (currentMinutes / 60) * HOUR_ROW_HEIGHT;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* ── Top Header Banner ── */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-bold shadow-xs ${
              isToday
                ? 'bg-primary-600 text-white shadow-primary-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              {format(currentDate, 'EEE', { locale: th })}
            </span>
            <span className="text-lg leading-none mt-0.5">{format(currentDate, 'd')}</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{format(currentDate, 'EEEEที่ d MMMM yyyy', { locale: th })}</span>
              {isToday && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  วันนี้
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              มีกำหนดการทั้งหมด {dayEvents.length} รายการ (ตลอดวัน {allDayEvents.length} รายการ)
            </p>
          </div>
        </div>
      </div>

      {/* ── All Day Events Strip ── */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 p-2 gap-2 items-center">
          <div className="w-16 shrink-0 text-right pr-3 text-[11px] font-semibold text-slate-400">
            ตลอดวัน
          </div>
          <div className="flex-1 flex flex-wrap gap-2">
            {allDayEvents.map((ev) => {
              const cat = CALENDAR_CATEGORY_CONFIG[ev.type] || CALENDAR_CATEGORY_CONFIG.general;
              return (
                <button
                  key={`ad-${ev.id}`}
                  type="button"
                  onClick={() => onSelectEvent(ev)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md border flex items-center gap-1.5 shadow-2xs hover:opacity-85 transition-opacity ${cat.bgLight} ${cat.bgDark}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cat.dotColor}`} />
                  <span>{ev.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 24h Timeline Scroll Area ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto relative"
        style={{ height: 'calc(100vh - 280px)', minHeight: '480px' }}
      >
        <div className="flex relative" style={{ height: `${24 * HOUR_ROW_HEIGHT}px` }}>
          {/* Time axis gutter */}
          <div className="w-16 shrink-0 border-r border-slate-200 dark:border-slate-800 select-none bg-white dark:bg-slate-900 z-10">
            {hours.map((hour) => (
              <div
                key={`label-${hour}`}
                className="text-xs text-slate-400 font-mono text-right pr-3 -translate-y-2.5"
                style={{ height: `${HOUR_ROW_HEIGHT}px` }}
              >
                {hour === 0 ? '' : `${hour.toString().padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {/* Slots & Events column */}
          <div className="flex-1 relative">
            {/* Clickable slot rows */}
            {hours.map((hour) => (
              <div
                key={`slot-${hour}`}
                onClick={() => onSlotClick(currentDate, hour)}
                className="border-b border-slate-100 dark:border-slate-800/70 hover:bg-primary-50/20 dark:hover:bg-primary-950/20 cursor-pointer transition-colors"
                style={{ height: `${HOUR_ROW_HEIGHT}px` }}
                title={`คลิกเพื่อเพิ่มกิจกรรมเวลา ${hour}:00 น.`}
              />
            ))}

            {/* Red Live Time Indicator */}
            {isToday && (
              <div
                className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                style={{ top: `${currentTimeTop}px` }}
              >
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-xs -ml-1.5 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                <div className="flex-1 h-[2px] bg-rose-500 shadow-xs" />
                <span className="text-[10px] font-mono font-bold text-white bg-rose-500 px-1.5 py-0.5 rounded-sm mr-2 shadow-xs">
                  {format(currentTime, 'HH:mm')}
                </span>
              </div>
            )}

            {/* Timed Event Cards */}
            {timedEvents.map((ev) => {
              const s = new Date(ev.startDate);
              const e = new Date(ev.endDate);

              const startMin = s < dayStart ? 0 : s.getHours() * 60 + s.getMinutes();
              const endMin = e > dayEnd ? 24 * 60 : e.getHours() * 60 + e.getMinutes();
              const durationMin = Math.max(30, endMin - startMin);

              const topPos = (startMin / 60) * HOUR_ROW_HEIGHT;
              const heightPos = (durationMin / 60) * HOUR_ROW_HEIGHT;
              const cat = CALENDAR_CATEGORY_CONFIG[ev.type] || CALENDAR_CATEGORY_CONFIG.general;

              return (
                <button
                  key={`day-ev-${ev.id}`}
                  type="button"
                  onClick={(eClick) => {
                    eClick.stopPropagation();
                    onSelectEvent(ev);
                  }}
                  className={`absolute left-3 right-4 rounded-xl p-3 text-left border shadow-xs overflow-hidden transition-all hover:scale-[1.005] hover:shadow-md hover:z-30 cursor-pointer flex flex-col justify-between ${cat.bgLight} ${cat.bgDark}`}
                  style={{
                    top: `${topPos}px`,
                    height: `${heightPos}px`,
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm truncate flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                        {ev.title}
                      </h3>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30 font-medium">
                        {format(s, 'HH:mm')} - {format(e, 'HH:mm')} น.
                      </span>
                    </div>

                    {ev.assigneeName && durationMin >= 50 && (
                      <p className="text-xs opacity-90 font-medium flex items-center gap-1.5 mt-1 truncate">
                        <Users className="w-3.5 h-3.5 shrink-0 text-primary-500" />
                        <span>{ev.dutyRole ? `${ev.dutyRole}: ` : ''}{ev.assigneeName}</span>
                      </p>
                    )}

                    {ev.location && durationMin >= 70 && (
                      <p className="text-xs opacity-80 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {ev.location}
                      </p>
                    )}

                    {ev.description && durationMin >= 100 && (
                      <p className="text-xs opacity-70 line-clamp-2 mt-1 flex items-start gap-1">
                        <AlignLeft className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{ev.description}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-[10px] uppercase font-semibold tracking-wider opacity-75">
                    {cat.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
