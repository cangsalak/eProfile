'use client';

import React from 'react';
import { Plus, Check, Download, RefreshCw, Layers, Radio } from 'lucide-react';
import { MiniCalendar } from './MiniCalendar';
import { CalendarFilterState, CALENDAR_CATEGORY_CONFIG } from '../types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CalendarSidebarProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
  onCreateEvent: () => void;
  filterState: CalendarFilterState;
  onToggleFilter: (category: keyof CalendarFilterState) => void;
  onExportIcal?: () => void;
  onSubscribeFeed?: () => void;
  onSyncGoogle?: () => void;
  isSyncing?: boolean;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  currentDate,
  onDateSelect,
  onCreateEvent,
  filterState,
  onToggleFilter,
  onExportIcal,
  onSubscribeFeed,
  onSyncGoogle,
  isSyncing = false,
}) => {
  const filterKeys: Array<keyof CalendarFilterState> = [
    'operation',
    'leave',
    'meeting',
    'notification',
    'google',
    'general',
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 flex flex-col gap-5 font-prompt">
      {/* ── Prominent Create Button ── */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={onCreateEvent}
        icon="fa-solid fa-plus"
        className="w-full justify-center shadow-md hover:shadow-lg py-3.5 rounded-2xl text-sm font-bold"
      >
        สร้างกิจกรรม / ลงเวร
      </Button>

      {/* ── Mini Interactive Datepicker Calendar ── */}
      <div className="hidden sm:block">
        <MiniCalendar
          currentDate={currentDate}
          selectedDate={currentDate}
          onSelectDate={onDateSelect}
        />
      </div>

      {/* ── My Calendars / Category Filters ── */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primary-500" />
            <span>หมวดหมู่ปฏิทิน</span>
          </h3>
          {onSyncGoogle && (
            <button
              type="button"
              onClick={onSyncGoogle}
              disabled={isSyncing}
              title="ซิงค์ Google Calendar"
              className="text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 p-1 rounded-md transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-primary-500' : ''}`} />
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {filterKeys.map((key) => {
            const config = CALENDAR_CATEGORY_CONFIG[key];
            if (!config) return null;
            const isChecked = filterState[key];

            return (
              <label
                key={key}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors select-none text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                <div
                  onClick={() => onToggleFilter(key)}
                  className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                    isChecked
                      ? `${config.dotColor} border-transparent text-white shadow-2xs`
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <span className="truncate flex-1">{config.label}</span>
              </label>
            );
          })}
        </div>
      </Card>

      {/* ── Export / Sync Options ── */}
      <div className="space-y-2">
        {onSubscribeFeed && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSubscribeFeed}
            icon="fa-solid fa-rss"
            className="w-full justify-center text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800/60 bg-primary-50/50 dark:bg-primary-950/30 hover:bg-primary-100"
          >
            สมัครรับปฏิทินสด (Live Sync)
          </Button>
        )}

        {onExportIcal && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onExportIcal}
            icon="fa-solid fa-download"
            className="w-full justify-center"
          >
            ส่งออกไฟล์ iCal (.ics)
          </Button>
        )}
      </div>
    </aside>
  );
};
