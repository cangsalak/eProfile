'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, Badge, Button, Modal } from '@/components/ui';
import {
  CalendarDays,
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  Loader2,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Radio,
  Plus,
  Tag,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  isToday,
  eachDayOfInterval,
  isWithinInterval,
  startOfDay,
  endOfDay,
  addDays,
} from 'date-fns';
import { th } from 'date-fns/locale';
import toast from 'react-hot-toast';

interface CalendarEventItem {
  id: string;
  title: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  type: string; // 'operation' | 'meeting' | 'notification' | 'google' | 'general'
  allDay?: boolean;
}

type TabType = 'calendar' | 'agenda' | 'sync';

export default function DutyCalendarWidget() {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
  const [copiedFeed, setCopiedFeed] = useState(false);

  // Fetch events
  const fetchEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch('/api/calendar');
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching calendar in widget:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Key Metrics
  const metrics = useMemo(() => {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    let todayCount = 0;
    let weekCount = 0;
    let operationCount = 0;
    let meetingCount = 0;

    events.forEach((ev) => {
      const s = new Date(ev.startDate);
      const e = new Date(ev.endDate);

      // Today
      if (
        isSameDay(s, today) ||
        isSameDay(e, today) ||
        (s <= todayEnd && e >= todayStart)
      ) {
        todayCount++;
      }

      // This week
      if (
        isWithinInterval(s, { start: weekStart, end: weekEnd }) ||
        isWithinInterval(e, { start: weekStart, end: weekEnd }) ||
        (s <= weekEnd && e >= weekStart)
      ) {
        weekCount++;
      }

      if (ev.type === 'operation') operationCount++;
      if (ev.type === 'meeting') meetingCount++;
    });

    return { todayCount, weekCount, operationCount, meetingCount };
  }, [events]);

  // Calendar Grid Days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentMonth]);

  // Events on selected day
  const selectedDayEvents = useMemo(() => {
    const dayStart = startOfDay(selectedDate);
    const dayEnd = endOfDay(selectedDate);

    return events.filter((ev) => {
      const s = new Date(ev.startDate);
      const e = new Date(ev.endDate);
      return (
        isSameDay(s, selectedDate) ||
        isSameDay(e, selectedDate) ||
        (s <= dayEnd && e >= dayStart)
      );
    });
  }, [events, selectedDate]);

  // Upcoming 7 days agenda
  const upcomingEvents = useMemo(() => {
    const now = startOfDay(new Date());
    const upcomingLimit = addDays(now, 7);

    return events
      .filter((ev) => {
        const s = new Date(ev.startDate);
        const e = new Date(ev.endDate);
        return e >= now && s <= upcomingLimit;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events]);

  // Check if a date has events
  const hasEventsOnDate = useCallback(
    (day: Date) => {
      const dStart = startOfDay(day);
      const dEnd = endOfDay(day);
      return events.some((ev) => {
        const s = new Date(ev.startDate);
        const e = new Date(ev.endDate);
        return isSameDay(s, day) || isSameDay(e, day) || (s <= dEnd && e >= dStart);
      });
    },
    [events]
  );

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'operation':
        return (
          <Badge variant="primary" size="sm" className="text-[10px]">
            ปฏิบัติการ/เวร
          </Badge>
        );
      case 'meeting':
        return (
          <Badge variant="warning" size="sm" className="text-[10px]">
            การประชุม
          </Badge>
        );
      case 'notification':
        return (
          <Badge variant="info" size="sm" className="text-[10px]">
            แจ้งเตือน/นัดหมาย
          </Badge>
        );
      case 'google':
        return (
          <Badge variant="candy" size="sm" className="text-[10px]">
            Google Calendar
          </Badge>
        );
      default:
        return (
          <Badge variant="success" size="sm" className="text-[10px]">
            ทั่วไป
          </Badge>
        );
    }
  };

  const copyFeedUrl = () => {
    if (typeof window !== 'undefined') {
      const feedUrl = `${window.location.origin}/api/calendar/feed`;
      navigator.clipboard.writeText(feedUrl);
      setCopiedFeed(true);
      toast.success('คัดลอกลิงก์ฟีดปฏิทิน iCal เรียบร้อย');
      setTimeout(() => setCopiedFeed(false), 2000);
    }
  };

  const todayFormatted = useMemo(() => {
    return format(new Date(), 'EEEEที่ d MMMM yyyy', { locale: th });
  }, []);

  return (
    <Card variant="convex" className="h-full flex flex-col min-h-[420px] font-prompt">
      {/* Header */}
      <CardHeader
        title="ปฏิทินและภารกิจปฏิบัติงาน"
        subtitle={todayFormatted}
        icon={<CalendarDays className="w-5 h-5 text-white" />}
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const today = new Date();
                setCurrentMonth(today);
                setSelectedDate(today);
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 hover:bg-primary-100 transition-colors"
            >
              วันนี้
            </button>
            <button
              onClick={() => fetchEvents(true)}
              disabled={refreshing || loading}
              title="รีเฟรชข้อมูล"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
            <Link
              href="/modules/calendar"
              title="เปิดปฏิทินเต็มจอ"
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col space-y-4">
        {/* KPI Metrics Row */}
        <div className="grid grid-cols-4 gap-2">
          {/* Today */}
          <div className="p-2.5 rounded-xl bg-primary-50/70 dark:bg-primary-950/30 border border-primary-200/60 dark:border-primary-900/50 text-center">
            <span className="block text-[10px] font-bold text-primary-700 dark:text-primary-300">
              ภารกิจวันนี้
            </span>
            <span className="text-base sm:text-lg font-black text-primary-700 dark:text-primary-300 font-mono">
              {loading ? '...' : metrics.todayCount}
            </span>
          </div>

          {/* This Week */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
            <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
              สัปดาห์นี้
            </span>
            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white font-mono">
              {loading ? '...' : metrics.weekCount}
            </span>
          </div>

          {/* Operation/Duty */}
          <div className="p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/50 text-center">
            <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400">
              เวร/ปฏิบัติการ
            </span>
            <span className="text-base sm:text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
              {loading ? '...' : metrics.operationCount}
            </span>
          </div>

          {/* Meetings */}
          <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-center">
            <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-400">
              การประชุม
            </span>
            <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-mono">
              {loading ? '...' : metrics.meetingCount}
            </span>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>มินิปฏิทิน &amp; ภารกิจ</span>
          </button>
          <button
            onClick={() => setActiveTab('agenda')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'agenda'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>วาระ 7 วันข้างหน้า</span>
            {upcomingEvents.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-primary-500 text-white font-bold">
                {upcomingEvents.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>ซิงค์ปฏิทิน iCal</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col justify-between">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              <span className="text-xs">กำลังโหลดปฏิทินปฏิบัติงาน...</span>
            </div>
          ) : (
            <>
              {/* TAB 1: MINI-CALENDAR & SCHEDULE */}
              {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-start">
                  {/* Left: Mini-Calendar (5 cols) */}
                  <div className="md:col-span-5 p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
                    {/* Month Navigator */}
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {format(currentMonth, 'MMMM yyyy', { locale: th })}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentMonth((d) => subMonths(d, 1))}
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
                          className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Day Names */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-1">
                      {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarDays.map((day, idx) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isSelected = isSameDay(day, selectedDate);
                        const isDayToday = isToday(day);
                        const hasEvents = hasEventsOnDate(day);

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedDate(day)}
                            className={`h-7 w-full rounded-lg text-xs font-semibold flex flex-col items-center justify-center relative transition-all ${
                              isSelected
                                ? 'bg-primary-600 text-white shadow-xs font-bold'
                                : isDayToday
                                ? 'bg-primary-100 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 font-bold'
                                : isCurrentMonth
                                ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/50'
                                : 'text-slate-300 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>{format(day, 'd')}</span>
                            {hasEvents && (
                              <span
                                className={`w-1 h-1 rounded-full absolute bottom-0.5 ${
                                  isSelected
                                    ? 'bg-white'
                                    : isDayToday
                                    ? 'bg-primary-600'
                                    : 'bg-primary-500'
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right: Selected Date Schedule (7 cols) */}
                  <div className="md:col-span-7 flex flex-col space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800 text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {format(selectedDate, 'd MMMM yyyy', { locale: th })}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {selectedDayEvents.length} รายการ
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                      {selectedDayEvents.length === 0 ? (
                        <div className="py-7 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
                          <CalendarIcon className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            ไม่มีภารกิจหรือเวรในวันนี้
                          </p>
                          <Link href="/modules/calendar">
                            <span className="text-[11px] text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-block mt-1">
                              + เพิ่มกิจกรรมในปฏิทิน
                            </span>
                          </Link>
                        </div>
                      ) : (
                        selectedDayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={() => setSelectedEvent(ev)}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all cursor-pointer flex items-start justify-between gap-2 group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-1">
                                {getEventTypeBadge(ev.type)}
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {ev.allDay
                                    ? 'ตลอดวัน'
                                    : `${format(new Date(ev.startDate), 'HH:mm')} - ${format(
                                        new Date(ev.endDate),
                                        'HH:mm'
                                      )}`}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {ev.title}
                              </p>
                              {ev.description && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  {ev.description}
                                </p>
                              )}
                            </div>
                            <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-500 transition-colors shrink-0 mt-1" />
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UPCOMING 7 DAYS */}
              {activeTab === 'agenda' && (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {upcomingEvents.length === 0 ? (
                    <div className="py-8 text-center rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800">
                      <Clock className="w-7 h-7 text-slate-300 dark:text-slate-600 mx-auto mb-1.5" />
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        ไม่มีวาระภารกิจที่กำลังจะมาถึงใน 7 วันนี้
                      </p>
                    </div>
                  ) : (
                    upcomingEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Date Block */}
                          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-center flex flex-col justify-center shrink-0 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="text-[9px] font-bold text-slate-500 uppercase leading-none">
                              {format(new Date(ev.startDate), 'EEE', { locale: th })}
                            </span>
                            <span className="text-sm font-black text-slate-900 dark:text-white leading-none mt-0.5">
                              {format(new Date(ev.startDate), 'd')}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              {getEventTypeBadge(ev.type)}
                              <span className="text-[10px] text-slate-400">
                                {ev.allDay
                                  ? 'ทั้งวัน'
                                  : `${format(new Date(ev.startDate), 'HH:mm')} น.`}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {ev.title}
                            </p>
                          </div>
                        </div>

                        <Eye className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-500 transition-colors shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 3: CALENDAR SYNC & FEEDS */}
              {activeTab === 'sync' && (
                <div className="space-y-3">
                  {/* iCal Feed URL */}
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-primary-500" />
                        ลิงก์เชื่อมต่อปฏิทิน iCalendar (RFC 5545)
                      </span>
                      <button
                        onClick={copyFeedUrl}
                        className="text-[11px] font-medium text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                      >
                        {copiedFeed ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>คัดลอกแล้ว</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>คัดลอก URL</span>
                          </>
                        )}
                      </button>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all">
                      /api/calendar/feed
                    </div>
                  </div>

                  {/* Sync Guide */}
                  <div className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="font-bold text-slate-700 dark:text-slate-300">
                      📱 วิธีนำเข้าสู่แอปพลิเคชันปฏิทินส่วนตัว:
                    </div>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Apple Calendar (iOS / macOS):</strong> เลือก File &gt; New Calendar Subscription แล้ววาง URL</li>
                      <li><strong>Google Calendar:</strong> เลือกเครื่องหมาย + ถัดจาก Other Calendars &gt; From URL</li>
                      <li><strong>Microsoft Outlook:</strong> เลือก Add Calendar &gt; Subscribe from web</li>
                    </ul>
                  </div>

                  {/* Security Badge */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>ฟีดปฏิทินปฏิบัติการได้รับการป้องกันผ่านระบบยืนยันสิทธิ์ตามนโยบาย AGENTS.md</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-auto">
            <Link href="/modules/calendar" className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs">
                <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
                ดูปฏิทินปฏิบัติงานฉบับเต็ม
              </Button>
            </Link>
            <Link href="/modules/calendar/settings" className="shrink-0">
              <Button variant="outline" size="sm" className="text-xs">
                <Sliders className="w-3.5 h-3.5 mr-1.5" />
                ตั้งค่าปฏิทินและเวร
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Event Detail Modal */}
      {selectedEvent && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEvent(null)}
          title="รายละเอียดกิจกรรม / ภารกิจ"
          size="md"
        >
          <div className="space-y-4 font-prompt text-xs sm:text-sm">
            {/* Title & Type */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedEvent.title}
                </span>
                {getEventTypeBadge(selectedEvent.type)}
              </div>
              <div className="flex items-center gap-2 text-slate-500 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {format(new Date(selectedEvent.startDate), 'd MMMM yyyy HH:mm', {
                    locale: th,
                  })}{' '}
                  -{' '}
                  {format(new Date(selectedEvent.endDate), 'd MMMM yyyy HH:mm', {
                    locale: th,
                  })}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                รายละเอียด:
              </label>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed min-h-[80px]">
                {selectedEvent.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button variant="secondary" size="sm" onClick={() => setSelectedEvent(null)}>
                ปิด
              </Button>
              <Link href="/modules/calendar">
                <Button variant="primary" size="sm">
                  เปิดในปฏิทิน
                </Button>
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
