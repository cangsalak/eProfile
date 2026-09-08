'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  parseISO,
} from 'date-fns';
import { th } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Search,
  RefreshCw,
  Clock,
  Layers,
  Sparkles,
  ChevronDown,
  Printer,
  Radio,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

import {
  CalendarViewMode,
  CalendarEventItem,
  CalendarFilterState,
  CALENDAR_CATEGORY_CONFIG,
} from '../types';
import toast from 'react-hot-toast';
import { CalendarSidebar } from './CalendarSidebar';
import { WeekTimeGrid } from './WeekTimeGrid';
import { DayTimeGrid } from './DayTimeGrid';
import { AgendaView } from './AgendaView';
import { EventModal } from './EventModal';
import { DutyRosterPrintModal } from './DutyRosterPrintModal';
import { CalendarSubscribeModal } from './CalendarSubscribeModal';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Category filter state
  const [filterState, setFilterState] = useState<CalendarFilterState>({
    operation: true,
    leave: true,
    meeting: true,
    notification: true,
    google: true,
    general: true,
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSubscribeModalOpen, setIsSubscribeModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [slotDate, setSlotDate] = useState<Date | undefined>(undefined);
  const [slotHour, setSlotHour] = useState<number | undefined>(undefined);

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const start = startOfWeek(startOfMonth(subMonths(currentDate, 1)));
      const end = endOfWeek(endOfMonth(addMonths(currentDate, 1)));

      const res = await fetch(`/api/calendar?start=${start.toISOString()}&end=${end.toISOString()}`);
      if (res.ok) {
        const data: CalendarEventItem[] = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'month' || viewMode === 'agenda') {
      setCurrentDate((d) => subMonths(d, 1));
    } else if (viewMode === 'week') {
      setCurrentDate((d) => subWeeks(d, 1));
    } else if (viewMode === 'day') {
      setCurrentDate((d) => subDays(d, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month' || viewMode === 'agenda') {
      setCurrentDate((d) => addMonths(d, 1));
    } else if (viewMode === 'week') {
      setCurrentDate((d) => addWeeks(d, 1));
    } else if (viewMode === 'day') {
      setCurrentDate((d) => addDays(d, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleToggleFilter = (cat: keyof CalendarFilterState) => {
    setFilterState((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Filtered and searched events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Category filter check
      const typeKey = (ev.type in filterState ? ev.type : 'general') as keyof CalendarFilterState;
      if (!filterState[typeKey]) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = ev.title?.toLowerCase().includes(q);
        const matchDesc = ev.description?.toLowerCase().includes(q);
        const matchLoc = ev.location?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchLoc;
      }

      return true;
    });
  }, [events, filterState, searchQuery]);

  // Handle slot clicking (Quick Add)
  const handleSlotClick = (date: Date, hour: number) => {
    setSelectedEvent(null);
    setSlotDate(date);
    setSlotHour(hour);
    setIsModalOpen(true);
  };

  // Open Create Event
  const handleOpenCreateModal = () => {
    setSelectedEvent(null);
    setSlotDate(currentDate);
    setSlotHour(9);
    setIsModalOpen(true);
  };

  // Select existing event to view/edit
  const handleSelectEvent = (event: CalendarEventItem) => {
    setSelectedEvent(event);
    setSlotDate(undefined);
    setSlotHour(undefined);
    setIsModalOpen(true);
  };

  // Save event (Create or Update)
  const handleSaveEvent = async (eventData: Partial<CalendarEventItem>) => {
    try {
      if (eventData.id) {
        // Edit
        const res = await fetch(`/api/calendar/${eventData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (!res.ok) {
          const error = await res.json();
          toast.error(error.error || 'ไม่สามารถแก้ไขกิจกรรมได้');
          return;
        }
        toast.success('แก้ไขกิจกรรมเรียบร้อยแล้ว');
      } else {
        // Create
        const res = await fetch('/api/calendar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (!res.ok) {
          const error = await res.json();
          toast.error(error.error || 'ไม่สามารถสร้างกิจกรรมได้');
          return;
        }
        toast.success('สร้างกิจกรรมเรียบร้อยแล้ว');
      }
      await fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  // Delete event
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const res = await fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const error = await res.json();
        toast.error(error.error || 'ไม่สามารถลบกิจกรรมได้');
        return;
      }
      toast.success('ลบกิจกรรมเรียบร้อยแล้ว');
      await fetchEvents();
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการลบกิจกรรม');
    }
  };

  // Export to .ics format
  const handleExportIcal = () => {
    try {
      let icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//eProfile//Duty Calendar//TH',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
      ];

      filteredEvents.forEach((ev) => {
        const s = new Date(ev.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const e = new Date(ev.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        icsContent.push('BEGIN:VEVENT');
        icsContent.push(`UID:${ev.id}@eprofile.local`);
        icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
        icsContent.push(`DTSTART:${s}`);
        icsContent.push(`DTEND:${e}`);
        icsContent.push(`SUMMARY:${ev.title.replace(/,/g, '\\,')}`);
        if (ev.description) icsContent.push(`DESCRIPTION:${ev.description.replace(/,/g, '\\,')}`);
        if (ev.location) icsContent.push(`LOCATION:${ev.location.replace(/,/g, '\\,')}`);
        icsContent.push('END:VEVENT');
      });

      icsContent.push('END:VCALENDAR');
      const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', `eprofile-calendar-${format(new Date(), 'yyyy-MM-dd')}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('ส่งออกไฟล์ปฏิทิน (.ics) เรียบร้อยแล้ว');
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการส่งออกไฟล์ iCal');
    }
  };

  // Format Header Title based on view mode
  const headerTitle = useMemo(() => {
    if (viewMode === 'month' || viewMode === 'agenda') {
      return format(currentDate, 'MMMM yyyy', { locale: th });
    }
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'd MMM', { locale: th })} - ${format(end, 'd MMM yyyy', { locale: th })}`;
    }
    if (viewMode === 'day') {
      return format(currentDate, 'd MMMM yyyy', { locale: th });
    }
    return '';
  }, [currentDate, viewMode]);

  // Generate Month Grid Days
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days: Date[] = [];
    let day = startDate;
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  return (
    <div className="flex flex-col gap-5 max-w-full">
      {/* ── Top Google Calendar Navigation Bar ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xs">
        {/* Left: Today, Prev/Next, Month/Year Label */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleToday}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            วันนี้
          </button>

          <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="ก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="ถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white capitalize ml-1">
            {headerTitle}
          </h1>

          {isLoading && (
            <RefreshCw className="w-4 h-4 text-primary-500 animate-spin ml-1" />
          )}
        </div>

        {/* Center: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหากิจกรรม, กำลังพล, เวรปฏิบัติการ..."
            className="form-input text-xs w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-750"
          />
        </div>

        {/* Right: Print Button & View Mode Group */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="พิมพ์ตารางเวรประจำเดือน A4"
          >
            <Printer className="w-3.5 h-3.5 text-primary-500" />
            <span className="hidden sm:inline">พิมพ์ตารางเวร (A4)</span>
          </button>

          <Link
            href="/modules/calendar/settings"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
            title="ตั้งค่าปฏิทินและตำแหน่งหน้าที่"
          >
            <Settings className="w-4 h-4 text-slate-500 hover:text-primary-500 transition-colors" />
          </Link>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            {[
              { id: 'month', label: 'เดือน' },
              { id: 'week', label: 'สัปดาห์' },
              { id: 'day', label: 'วัน' },
              { id: 'agenda', label: 'กำหนดการ' },
            ].map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setViewMode(mode.id as CalendarViewMode)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  viewMode === mode.id
                    ? 'bg-white dark:bg-slate-900 text-primary-600 dark:text-primary-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Layout: Sidebar + Active View ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left Sidebar */}
        <CalendarSidebar
          currentDate={currentDate}
          onDateSelect={(d) => {
            setCurrentDate(d);
          }}
          onCreateEvent={handleOpenCreateModal}
          filterState={filterState}
          onToggleFilter={handleToggleFilter}
          onExportIcal={handleExportIcal}
          onSubscribeFeed={() => setIsSubscribeModalOpen(true)}
          onSyncGoogle={fetchEvents}
          isSyncing={isLoading}
        />

        {/* Right Calendar Viewport */}
        <div className="flex-1 w-full min-w-0">
          {/* 1. Month View */}
          {viewMode === 'month' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              {/* Day names header */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 divide-x divide-slate-200 dark:divide-slate-800 text-center py-2.5">
                {['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'].map(
                  (dayName, i) => (
                    <div
                      key={dayName}
                      className={`text-xs font-bold uppercase tracking-wider ${
                        i === 0
                          ? 'text-rose-500'
                          : i === 6
                          ? 'text-blue-500'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {dayName}
                    </div>
                  )
                )}
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/70 border-b border-slate-200 dark:border-slate-800">
                {monthDays.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const dayStr = format(day, 'yyyy-MM-dd');

                  // Filter events on this day
                  const dayEvents = filteredEvents.filter((ev) => {
                    const sStr = format(new Date(ev.startDate), 'yyyy-MM-dd');
                    const eStr = format(new Date(ev.endDate), 'yyyy-MM-dd');
                    return dayStr >= sStr && dayStr <= eStr;
                  });

                  return (
                    <div
                      key={day.toISOString()}
                      onClick={() => handleSlotClick(day, 9)}
                      className={`min-h-[110px] sm:min-h-[130px] p-1.5 transition-colors flex flex-col justify-between group cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/50 ${
                        !isCurrentMonth
                          ? 'bg-slate-50/30 dark:bg-slate-950/20 text-slate-300 dark:text-slate-600'
                          : 'bg-white dark:bg-slate-900'
                      } ${isToday ? 'ring-2 ring-primary-500/20 bg-primary-50/10' : ''}`}
                    >
                      {/* Top Day Number Row */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isToday
                              ? 'bg-primary-600 text-white shadow-xs'
                              : isCurrentMonth
                              ? 'text-slate-700 dark:text-slate-300'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {format(day, 'd')}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="text-[10px] font-semibold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {dayEvents.length} รายการ
                          </span>
                        )}
                      </div>

                      {/* Event Chips List */}
                      <div className="space-y-1 my-1 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((ev) => {
                          const cat =
                            CALENDAR_CATEGORY_CONFIG[ev.type] || CALENDAR_CATEGORY_CONFIG.general;
                          return (
                            <button
                              key={`month-ev-${ev.id}`}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectEvent(ev);
                              }}
                              className={`w-full text-left px-1.5 py-0.5 rounded-sm text-[11px] font-medium truncate border shadow-2xs transition-all hover:scale-[1.01] hover:opacity-90 block ${cat.bgLight} ${cat.bgDark}`}
                              title={ev.title}
                            >
                              <span className="truncate">{ev.title}</span>
                            </button>
                          );
                        })}

                        {dayEvents.length > 3 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentDate(day);
                              setViewMode('day');
                            }}
                            className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 hover:underline px-1 block"
                          >
                            +{dayEvents.length - 3} รายการเพิ่มเติม
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Week View */}
          {viewMode === 'week' && (
            <WeekTimeGrid
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={handleSelectEvent}
              onSlotClick={handleSlotClick}
            />
          )}

          {/* 3. Day View */}
          {viewMode === 'day' && (
            <DayTimeGrid
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={handleSelectEvent}
              onSlotClick={handleSlotClick}
            />
          )}

          {/* 4. Agenda View */}
          {viewMode === 'agenda' && (
            <AgendaView
              currentDate={currentDate}
              events={filteredEvents}
              onSelectEvent={handleSelectEvent}
              onSlotClick={handleSlotClick}
            />
          )}
        </div>
      </div>

      {/* ── Event Details / Create / Edit Modal ── */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={selectedEvent}
        initialDate={slotDate}
        initialHour={slotHour}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* ── Official A4 Duty Roster Print Modal ── */}
      <DutyRosterPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        currentDate={currentDate}
        events={filteredEvents}
      />

      {/* ── Live Webcal Subscription Modal ── */}
      <CalendarSubscribeModal
        isOpen={isSubscribeModalOpen}
        onClose={() => setIsSubscribeModalOpen(false)}
      />
    </div>
  );
}
